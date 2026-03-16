<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use App\Models\Event;
use App\Models\Position;
use App\Models\Vote;
use App\Models\Voter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class VoterAuthController extends Controller
{
    public function create(Request $request)
    {
        return Inertia::render('VoterAuth/login');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $voter = Voter::query()
            ->where('username', $validated['username'])
            ->where('is_active', true)
            ->first();

        if (! $voter || ! Hash::check($validated['password'], (string) $voter->password)) {
            return back()->withErrors([
                'username' => 'Invalid credentials.',
            ]);
        }

        if ($voter->has_voted) {
            return back()->withErrors([
                'username' => 'You already voted.',
            ]);
        }

        if (! Event::query()->active()->whereKey($voter->event_id)->exists()) {
            return back()->withErrors([
                'username' => 'Event is not active.',
            ]);
        }

        Auth::guard('voter')->login($voter, $request->boolean('remember'));
        $request->session()->regenerate();

        return redirect()->route('voter.dashboard');
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('voter')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('voter.login');
    }

    public function dashboard(Request $request)
    {
        $voter = $request->user('voter');

        $event = Event::query()
            ->select(['id', 'name', 'start_at', 'end_at', 'is_active'])
            ->find($voter->event_id);

        if (! $event || ! $event->is_active) {
            return Inertia::render('VoterAuth/dashboard', [
                'voter' => $voter,
                'event' => $event,
                'positions' => [],
                'selectedVotes' => [],
            ]);
        }

        $positions = Position::query()
            ->select(['id', 'event_id', 'name', 'max_vote', 'sort_order'])
            ->where('event_id', $voter->event_id)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $candidates = Candidate::query()
            ->select(['id', 'event_id', 'position_id', 'name', 'photo_path'])
            ->where('event_id', $voter->event_id)
            ->orderBy('id')
            ->get()
            ->map(function (Candidate $candidate) {
                return [
                    'id' => $candidate->id,
                    'position_id' => $candidate->position_id,
                    'name' => $candidate->name,
                    'photo_url' => $candidate->photo_path
                        ? asset('storage/'.$candidate->photo_path)
                        : null,
                ];
            })
            ->groupBy('position_id');

        $positionsWithCandidates = $positions->map(function (Position $position) use ($candidates) {
            return [
                'id' => $position->id,
                'name' => $position->name,
                'max_vote' => $position->max_vote,
                'candidates' => ($candidates[$position->id] ?? collect())->values(),
            ];
        })->values();

        $selectedVotes = Vote::query()
            ->where('voter_id', $voter->id)
            ->get(['position_id', 'candidate_id'])
            ->groupBy('position_id')
            ->map(fn ($group) => $group->pluck('candidate_id')->values())
            ->toArray();

        return Inertia::render('VoterAuth/dashboard', [
            'voter' => $voter,
            'event' => $event,
            'positions' => $positionsWithCandidates,
            'selectedVotes' => $selectedVotes,
        ]);
    }

    public function vote(Request $request): RedirectResponse
    {
        $voter = $request->user('voter');

        $event = Event::query()
            ->select(['id', 'start_at', 'end_at', 'is_active'])
            ->findOrFail($voter->event_id);

        if (! $event->is_active) {
            return back()->withErrors([
                'votes' => 'Voting is not open.',
            ]);
        }

        $now = now();

        if ($now->lt($event->start_at) || $now->gt($event->end_at)) {
            return back()->withErrors([
                'votes' => 'Voting is not open.',
            ]);
        }

        $validated = $request->validate([
            'votes' => ['nullable', 'array'],
        ]);

        $votes = $validated['votes'] ?? [];

        $positions = Position::query()
            ->select(['id', 'max_vote'])
            ->where('event_id', $voter->event_id)
            ->get()
            ->keyBy('id');

        $cleanVotes = [];
        $allCandidateIds = [];

        $rows = [];

        foreach ($votes as $positionIdRaw => $candidateIdsRaw) {
            $positionId = (int) $positionIdRaw;
            $position = $positions->get($positionId);

            if (! $position) {
                return back()->withErrors([
                    'votes' => 'Invalid position selection.',
                ]);
            }

            if (! is_array($candidateIdsRaw)) {
                return back()->withErrors([
                    'votes' => 'Invalid vote payload.',
                ]);
            }

            $candidateIds = array_values(array_unique(array_map('intval', $candidateIdsRaw)));
            $candidateIds = array_values(array_filter($candidateIds, fn ($id) => $id > 0));

            if (count($candidateIds) > (int) $position->max_vote) {
                return back()->withErrors([
                    'votes' => 'You selected too many candidates for a position.',
                ]);
            }

            if (count($candidateIds) === 0) {
                continue;
            }

            $cleanVotes[$positionId] = $candidateIds;
            $allCandidateIds = array_merge($allCandidateIds, $candidateIds);
        }

        $allCandidateIds = array_values(array_unique($allCandidateIds));

        if (count($cleanVotes) === 0) {
            return back()->withErrors([
                'votes' => 'Please select at least one candidate.',
            ]);
        }

        $validCandidatesByPosition = Candidate::query()
            ->select(['id', 'position_id'])
            ->where('event_id', $voter->event_id)
            ->whereIn('id', $allCandidateIds)
            ->get()
            ->groupBy('position_id')
            ->map(fn ($group) => $group->pluck('id')->flip())
            ->all();

        foreach ($cleanVotes as $positionId => $candidateIds) {
            $validSet = $validCandidatesByPosition[$positionId] ?? [];

            foreach ($candidateIds as $candidateId) {
                if (! isset($validSet[$candidateId])) {
                    return back()->withErrors([
                        'votes' => 'Invalid candidate selection.',
                    ]);
                }
            }

            foreach ($candidateIds as $candidateId) {
                $rows[] = [
                    'event_id' => $voter->event_id,
                    'voter_id' => $voter->id,
                    'position_id' => $positionId,
                    'candidate_id' => $candidateId,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        DB::transaction(function () use ($event, $now, $voter, $rows) {
            $lockedVoter = Voter::query()
                ->whereKey($voter->id)
                ->lockForUpdate()
                ->firstOrFail();

            if (! $lockedVoter->is_active) {
                throw ValidationException::withMessages([
                    'votes' => 'Voter account is inactive.',
                ]);
            }

            if ($lockedVoter->has_voted) {
                throw ValidationException::withMessages([
                    'votes' => 'You already voted.',
                ]);
            }

            if (! $event->is_active || $now->lt($event->start_at) || $now->gt($event->end_at)) {
                throw ValidationException::withMessages([
                    'votes' => 'Voting is not open.',
                ]);
            }

            Vote::query()
                ->where('voter_id', $voter->id)
                ->delete();

            Vote::query()->insert($rows);

            $lockedVoter->has_voted = true;
            $lockedVoter->save();
        });

        Auth::guard('voter')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()
            ->route('voter.login')
            ->with('success', 'Votes submitted successfully.');
    }
}
