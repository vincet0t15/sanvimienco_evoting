<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Vote;
use App\Models\Voter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class VoterController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $onlineCutoff = now()->subMinutes(2);

        $events = Event::query()
            ->active()
            ->select(['id', 'name'])
            ->orderByDesc('id')
            ->get();

        $voterList = Voter::query()
            ->with(['event:id,name'])
            ->whereHas('event', fn ($q) => $q->active())
            ->when($search, function ($query, $search) {
                $query->where(function ($innerQuery) use ($search) {
                    $innerQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('id')
            ->paginate(10)
            ->through(function (Voter $voter) use ($onlineCutoff) {
                $lastSeen = $voter->last_seen_at;
                $isOnline = $voter->current_session_token
                    && $lastSeen
                    && $lastSeen->greaterThanOrEqualTo($onlineCutoff);

                return [
                    'id' => $voter->id,
                    'event_id' => $voter->event_id,
                    'name' => $voter->name,
                    'username' => $voter->username,
                    'is_active' => (bool) $voter->is_active,
                    'has_voted' => (bool) $voter->has_voted,
                    'last_seen_at' => $lastSeen?->toIso8601String(),
                    'is_online' => $isOnline,
                    'event' => $voter->event ? ['id' => $voter->event->id, 'name' => $voter->event->name] : null,
                ];
            })
            ->withQueryString();

        return Inertia::render('Voters/index', [
            'events' => $events,
            'voterList' => $voterList,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'event_id' => [
                'required',
                'integer',
                Rule::exists('events', 'id')->where(function ($query) {
                    $query->where('is_active', true);
                }),
            ],
            'name' => ['required', 'string', 'max:255'],
            'username' => [
                'required',
                'string',
                'max:255',
                Rule::unique('voters', 'username'),
            ],
            'password' => ['required', 'string', 'min:6'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $validated['is_active'] = (bool) ($validated['is_active'] ?? true);

        Voter::create($validated);

        return redirect()->route('voters.index');
    }

    public function bulkActive(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
            'search' => ['nullable', 'string', 'max:255'],
            'voter_ids' => ['nullable', 'array'],
            'voter_ids.*' => ['integer'],
        ]);

        $search = $validated['search'] ?? null;
        $voterIds = $validated['voter_ids'] ?? null;

        Voter::query()
            ->whereHas('event', fn ($q) => $q->active())
            ->when(
                is_array($voterIds) && count($voterIds) > 0,
                fn ($query) => $query->whereIn('id', $voterIds),
            )
            ->when($search, function ($query, $search) {
                $query->where(function ($innerQuery) use ($search) {
                    $innerQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%");
                });
            })
            ->update(['is_active' => $validated['is_active']]);

        return redirect()->back();
    }

    public function setActive(Request $request, Voter $voter): RedirectResponse
    {
        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        if (! $voter->event()->active()->exists()) {
            abort(Response::HTTP_NOT_FOUND);
        }

        $voter->update(['is_active' => $validated['is_active']]);

        return redirect()->back();
    }

    public function forceLogout(Voter $voter): RedirectResponse
    {
        if (! $voter->event()->active()->exists()) {
            abort(Response::HTTP_NOT_FOUND);
        }

        $voter->forceFill(['current_session_token' => null])->save();

        return redirect()->back();
    }

    public function destroyVotes(Voter $voter): RedirectResponse
    {
        if (! $voter->event()->active()->exists()) {
            abort(Response::HTTP_NOT_FOUND);
        }

        DB::transaction(function () use ($voter) {
            Vote::query()->where('voter_id', $voter->id)->delete();

            $voter->forceFill(['has_voted' => false])->save();
        });

        return redirect()->back();
    }

    public function bulkDestroyVotes(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'voter_ids' => ['required', 'array', 'min:1'],
            'voter_ids.*' => ['integer'],
        ]);

        $voterIds = $validated['voter_ids'];

        DB::transaction(function () use ($voterIds) {
            $validVoterIds = Voter::query()
                ->whereIn('id', $voterIds)
                ->whereHas('event', fn ($q) => $q->active())
                ->pluck('id')
                ->all();

            if (count($validVoterIds) === 0) {
                return;
            }

            Vote::query()->whereIn('voter_id', $validVoterIds)->delete();

            Voter::query()->whereIn('id', $validVoterIds)->update(['has_voted' => false]);
        });

        return redirect()->back();
    }

    public function print(Request $request)
    {
        $search = $request->input('search');
        $eventId = $request->integer('event_id');

        $event = $eventId
            ? Event::query()
                ->active()
                ->select(['id', 'name'])
                ->find($eventId)
            : Event::query()
                ->active()
                ->select(['id', 'name'])
                ->first();

        $voters = Voter::query()
            ->with(['event:id,name'])
            ->whereHas('event', fn ($q) => $q->active())
            ->when($eventId, fn ($q) => $q->where('event_id', $eventId))
            ->when($search, function ($query, $search) {
                $query->where(function ($innerQuery) use ($search) {
                    $innerQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%");
                });
            })
            ->orderBy('event_id')
            ->orderBy('name')
            ->get(['id', 'event_id', 'name', 'username']);

        return Inertia::render('Voters/print-cards', [
            'voters' => $voters,
            'event' => $event,
            'filters' => [
                'search' => $search,
                'event_id' => $eventId ?: null,
            ],
        ]);
    }

    public function votes(Voter $voter)
    {

        $voter->loadMissing(['event:id,name']);

        $voteRows = Vote::query()
            ->with(['position:id,name', 'candidate:id,name'])
            ->where('voter_id', $voter->id)
            ->orderBy('position_id')
            ->orderBy('candidate_id')
            ->get(['id', 'position_id', 'candidate_id', 'created_at']);

        $positions = $voteRows
            ->groupBy('position_id')
            ->map(function ($group) {
                $first = $group->first();
                $position = $first?->position;

                return [
                    'position' => $position
                        ? ['id' => $position->id, 'name' => $position->name]
                        : ['id' => (int) ($first?->position_id ?? 0), 'name' => 'Unknown position'],
                    'candidates' => $group
                        ->map(function ($vote) {
                            $candidate = $vote->candidate;

                            return $candidate
                                ? ['id' => $candidate->id, 'name' => $candidate->name]
                                : ['id' => (int) $vote->candidate_id, 'name' => 'Unknown candidate'];
                        })
                        ->unique('id')
                        ->values(),
                ];
            })
            ->values();

        return Inertia::render('Voters/votes', [
            'voter' => [
                'id' => $voter->id,
                'name' => $voter->name,
                'username' => $voter->username,
                'event' => $voter->event ? ['id' => $voter->event->id, 'name' => $voter->event->name] : null,
                'has_voted' => (bool) $voter->has_voted,
            ],
            'positions' => $positions,
            'vote_count' => $voteRows->count(),
            'voted_at' => $voteRows->max('created_at')?->toIso8601String(),
        ]);
    }
}
