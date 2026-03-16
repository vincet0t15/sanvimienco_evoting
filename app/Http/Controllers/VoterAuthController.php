<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use App\Models\Event;
use App\Models\Position;
use App\Models\Vote;
use App\Models\Voter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

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

        $alreadyVoted = (bool) $voter->has_voted || Vote::query()
            ->where('voter_id', $voter->id)
            ->exists();

        if ($alreadyVoted) {
            if (! $voter->has_voted) {
                $voter->forceFill(['has_voted' => true])->save();
            }

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

        $sessionToken = Str::random(40);
        $request->session()->put('voter_session_token', $sessionToken);
        $voter->forceFill([
            'last_seen_at' => now(),
            'current_session_token' => $sessionToken,
        ])->save();

        return redirect()->route('voter.dashboard');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $voter = $request->user('voter');

        if ($voter) {
            $voter->forceFill(['current_session_token' => null])->save();
        }

        Auth::guard('voter')->logout();
        $request->session()->forget('voter_session_token');
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
                        ? asset('storage/' . $candidate->photo_path)
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
            ->map(fn($group) => $group->pluck('candidate_id')->values())
            ->toArray();

        return Inertia::render('VoterAuth/dashboard', [
            'voter' => $voter,
            'event' => $event,
            'positions' => $positionsWithCandidates,
            'selectedVotes' => $selectedVotes,
        ]);
    }

    public function vote(Request $request): SymfonyResponse
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
            'votes' => ['required', 'array'],
            'votes.*' => ['array'],
            'votes.*.*' => ['integer', Rule::exists('candidates', 'id')],
        ]);

        $votes = $validated['votes'];
        $positionIds = array_values(array_unique(array_map('intval', array_keys($votes))));
        $candidateIds = array_values(array_unique(array_map('intval', Arr::flatten($votes))));
        $candidateIds = array_values(array_filter($candidateIds, fn($id) => $id > 0));

        $positions = Position::query()
            ->select(['id', 'event_id', 'name', 'max_vote'])
            ->whereIn('id', $positionIds)
            ->get()
            ->keyBy('id');

        $candidates = Candidate::query()
            ->select(['id', 'event_id', 'position_id', 'name'])
            ->whereIn('id', $candidateIds)
            ->get()
            ->keyBy('id');

        DB::transaction(function () use ($candidates, $event, $now, $positionIds, $positions, $voter, $votes) {
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

            $rows = [];

            foreach ($votes as $positionIdRaw => $candidateIdsRaw) {
                $positionId = (int) $positionIdRaw;

                $candidateIdsForPosition = is_array($candidateIdsRaw) ? $candidateIdsRaw : [];
                $candidateIdsForPosition = array_values(array_unique(array_map('intval', $candidateIdsForPosition)));
                $candidateIdsForPosition = array_values(array_filter($candidateIdsForPosition, fn($id) => $id > 0));

                if (count($candidateIdsForPosition) === 0) {
                    continue;
                }

                $position = $positions->get($positionId);
                if (! $position) {
                    throw ValidationException::withMessages([
                        'votes' => "Position ID {$positionId} not found.",
                    ]);
                }

                if ((int) $position->event_id !== (int) $lockedVoter->event_id) {
                    throw ValidationException::withMessages([
                        'votes' => 'You are not authorized to vote for this position.',
                    ]);
                }

                if (count($candidateIdsForPosition) > (int) $position->max_vote) {
                    throw ValidationException::withMessages([
                        'votes' => "You selected too many candidates for position: {$position->name}",
                    ]);
                }

                foreach ($candidateIdsForPosition as $candidateId) {
                    $candidate = $candidates->get($candidateId);

                    if (! $candidate) {
                        throw ValidationException::withMessages([
                            'votes' => "Candidate ID {$candidateId} not found.",
                        ]);
                    }

                    if ((int) $candidate->event_id !== (int) $lockedVoter->event_id) {
                        throw ValidationException::withMessages([
                            'votes' => 'Invalid candidate selection.',
                        ]);
                    }

                    if ((int) $candidate->position_id !== $positionId) {
                        throw ValidationException::withMessages([
                            'votes' => "Candidate {$candidate->name} does not belong to position {$position->name}",
                        ]);
                    }

                    $rows[] = [
                        'voter_id' => $lockedVoter->id,
                        'candidate_id' => $candidateId,
                        'position_id' => $positionId,
                        'event_id' => $position->event_id,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }
            }

            if (count($rows) === 0) {
                throw ValidationException::withMessages([
                    'votes' => 'Please select at least one candidate.',
                ]);
            }

            Vote::query()
                ->where('voter_id', $lockedVoter->id)
                ->whereIn('position_id', $positionIds)
                ->delete();

            Vote::query()->insert($rows);

            $writtenRows = Vote::query()
                ->where('event_id', $voter->event_id)
                ->where('voter_id', $voter->id)
                ->count();

            if ($writtenRows !== count($rows)) {
                throw ValidationException::withMessages([
                    'votes' => 'Votes were not saved. Please try again.',
                ]);
            }

            $lockedVoter->forceFill([
                'has_voted' => true,
                'is_active' => false,
                'current_session_token' => null,
            ])->save();
        });

        Auth::guard('voter')->logout();
        $request->session()->forget('voter_session_token');
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        $request->session()->flash('success', 'Votes submitted successfully.');

        return Inertia::location(route('voter.login'));
    }
}
