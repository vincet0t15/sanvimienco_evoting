<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use App\Models\Event;
use App\Models\Position;
use App\Models\Vote;
use App\Models\Voter;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $event = Event::query()
            ->select(['id', 'name', 'start_at', 'end_at', 'is_active'])
            ->active()
            ->orderByDesc('id')
            ->first();

        if (! $event) {
            return Inertia::render('Reports/index', [
                'event' => null,
                'stats' => [
                    'total_voters' => 0,
                    'votes_cast' => 0,
                    'turnout_percentage' => 0,
                    'did_not_vote' => 0,
                ],
                'positions' => [],
                'candidates' => [],
                'voters' => null,
            ]);
        }

        $totalVoters = Voter::query()
            ->where('event_id', $event->id)
            ->count();

        $votesCast = Vote::query()
            ->where('event_id', $event->id)
            ->distinct()
            ->count('voter_id');

        $didNotVoteCount = max(0, $totalVoters - $votesCast);

        $turnoutPercentage = $totalVoters > 0
            ? round(($votesCast / $totalVoters) * 100, 2)
            : 0;

        $positionStats = Vote::query()
            ->where('event_id', $event->id)
            ->selectRaw('position_id, COUNT(*) as total_votes, COUNT(DISTINCT voter_id) as voters_voted')
            ->groupBy('position_id')
            ->get()
            ->keyBy('position_id');

        $voteCountsByCandidate = Vote::query()
            ->where('event_id', $event->id)
            ->selectRaw('candidate_id, COUNT(*) as votes_count')
            ->groupBy('candidate_id')
            ->pluck('votes_count', 'candidate_id')
            ->map(fn($count) => (int) $count)
            ->all();

        $positions = Position::query()
            ->where('event_id', $event->id)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get(['id', 'name', 'max_vote']);

        $positionPayload = $positions->map(function (Position $position) use ($event, $positionStats, $totalVoters, $voteCountsByCandidate) {
            $stats = $positionStats->get($position->id);

            $totalVotesForPosition = $stats ? (int) $stats->total_votes : 0;
            $votersVotedForPosition = $stats ? (int) $stats->voters_voted : 0;
            $abstentions = max(0, $totalVoters - $votersVotedForPosition);

            $candidates = Candidate::query()
                ->where('event_id', $event->id)
                ->where('position_id', $position->id)
                ->orderBy('id')
                ->get(['id', 'name', 'photo_path'])
                ->map(function (Candidate $candidate) use ($totalVotesForPosition, $voteCountsByCandidate) {
                    $votesCount = $voteCountsByCandidate[$candidate->id] ?? 0;
                    $percent = $totalVotesForPosition > 0
                        ? round(($votesCount / $totalVotesForPosition) * 100, 2)
                        : 0;

                    return [
                        'id' => $candidate->id,
                        'name' => $candidate->name,
                        'photo_url' => $candidate->photo_path ? asset('storage/' . $candidate->photo_path) : null,
                        'votes_count' => $votesCount,
                        'percent' => $percent,
                    ];
                })
                ->sortByDesc('votes_count')
                ->values();

            $winnersCount = max(0, (int) $position->max_vote);
            $winnerIds = $winnersCount > 0
                ? $candidates->take($winnersCount)->pluck('id')->all()
                : [];

            $candidates = $candidates
                ->map(function ($candidate, $index) use ($winnerIds) {
                    return [
                        ...$candidate,
                        'rank' => $index + 1,
                        'is_winner' => in_array($candidate['id'], $winnerIds, true),
                    ];
                })
                ->values();

            return [
                'id' => $position->id,
                'name' => $position->name,
                'max_vote' => (int) $position->max_vote,
                'total_votes' => $totalVotesForPosition,
                'abstentions' => $abstentions,
                'candidates' => $candidates,
            ];
        })->values();

        $candidatesPayload = Candidate::query()
            ->with(['position:id,name'])
            ->where('event_id', $event->id)
            ->orderBy('id')
            ->get(['id', 'position_id', 'name', 'photo_path'])
            ->map(function (Candidate $candidate) use ($voteCountsByCandidate) {
                return [
                    'id' => $candidate->id,
                    'name' => $candidate->name,
                    'photo_url' => $candidate->photo_path ? asset('storage/' . $candidate->photo_path) : null,
                    'position_name' => $candidate->position?->name,
                    'votes_count' => $voteCountsByCandidate[$candidate->id] ?? 0,
                ];
            })
            ->values();

        $voters = Voter::query()
            ->where('event_id', $event->id)
            ->orderBy('name')
            ->orderBy('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn(Voter $voter) => [
                'id' => $voter->id,
                'name' => $voter->name,
                'username' => $voter->username,
                'has_voted' => (bool) $voter->has_voted,
                'is_active' => (bool) $voter->is_active,
            ]);

        return Inertia::render('Reports/index', [
            'event' => [
                'id' => $event->id,
                'name' => $event->name,
                'is_active' => (bool) $event->is_active,
                'start_at' => $event->start_at?->toIso8601String(),
                'end_at' => $event->end_at?->toIso8601String(),
            ],
            'stats' => [
                'total_voters' => $totalVoters,
                'votes_cast' => $votesCast,
                'turnout_percentage' => $turnoutPercentage,
                'did_not_vote' => $didNotVoteCount,
            ],
            'positions' => $positionPayload,
            'candidates' => $candidatesPayload,
            'voters' => $voters,
        ]);
    }

    public function auditLogs(Request $request, Event $event)
    {

        $event = Event::findOrFail($event->id);

        $voters = Voter::query()
            ->where('event_id', $event->id)
            ->where('has_voted', true)
            ->orderBy('name')
            ->orderBy('id')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Reports/auditLogs', [
            'event' => $event,
            'voters' => $voters,
        ]);
    }
    public function printAuditLogs(Request $request, Event $event)
    {

        $event = Event::findOrFail($event->id);

        $voters = Voter::query()
            ->where('event_id', $event->id)
            ->where('has_voted', true)
            ->orderBy('name')
            ->orderBy('id')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Reports/printAuditLogs', [
            'event' => $event,
            'voters' => $voters,
        ]);
    }
}
