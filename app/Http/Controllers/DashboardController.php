<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use App\Models\Event;
use App\Models\Position;
use App\Models\Vote;
use App\Models\Voter;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $activeEvent = Event::query()
            ->select(['id', 'name', 'description', 'start_at', 'end_at', 'is_active'])
            ->where('is_active', true)
            ->orderByDesc('id')
            ->first();

        $totalVoters = $activeEvent
            ? Voter::query()->where('event_id', $activeEvent->id)->count()
            : 0;

        $totalCandidates = $activeEvent
            ? Candidate::query()->where('event_id', $activeEvent->id)->count()
            : 0;

        $totalPositions = $activeEvent
            ? Position::query()->where('event_id', $activeEvent->id)->count()
            : 0;

        $votesCast = 0;
        $notVotedCount = 0;
        $turnoutPercentage = 0;
        $recentActivity = [];

        if ($activeEvent) {
            $votesCast = Vote::query()
                ->where('event_id', $activeEvent->id)
                ->distinct()
                ->count('voter_id');

            $notVotedCount = max(0, $totalVoters - $votesCast);

            $turnoutPercentage = $totalVoters > 0
                ? round(($votesCast / $totalVoters) * 100, 2)
                : 0;

            $recentVotes = Vote::query()
                ->with(['voter:id,name,username'])
                ->where('event_id', $activeEvent->id)
                ->orderByDesc('created_at')
                ->limit(50)
                ->get(['id', 'voter_id', 'created_at']);

            $seen = [];

            foreach ($recentVotes as $vote) {
                $voterId = (int) $vote->voter_id;

                if (isset($seen[$voterId])) {
                    continue;
                }

                $seen[$voterId] = true;

                if (! $vote->voter) {
                    continue;
                }

                $recentActivity[] = [
                    'id' => $vote->id,
                    'voter' => [
                        'id' => $vote->voter->id,
                        'name' => $vote->voter->name,
                        'username' => $vote->voter->username,
                    ],
                    'created_at' => $vote->created_at?->toIso8601String(),
                ];

                if (count($recentActivity) >= 7) {
                    break;
                }
            }
        }

        return Inertia::render('dashboard', [
            'stats' => [
                'total_voters' => $totalVoters,
                'total_candidates' => $totalCandidates,
                'total_positions' => $totalPositions,
                'active_event' => $activeEvent,
                'votes_cast' => $votesCast,
                'not_voted' => $notVotedCount,
                'turnout_percentage' => $turnoutPercentage,
            ],
            'recentActivity' => $recentActivity,
        ]);
    }
}
