<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use App\Models\Event;
use App\Models\Position;
use App\Models\Vote;
use Inertia\Inertia;

class ResultsController extends Controller
{
    public function index()
    {
        $event = Event::query()
            ->select(['id', 'name', 'description', 'start_at', 'end_at', 'is_active'])
            ->where('is_active', true)
            ->orderByDesc('id')
            ->first();

        if (! $event) {
            return Inertia::render('Results/index', [
                'event' => null,
                'positions' => [],
                'can_show_results' => false,
            ]);
        }

        $canShowResults = now()->greaterThanOrEqualTo($event->end_at);

        $positions = Position::query()
            ->where('event_id', $event->id)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get(['id', 'name', 'max_vote']);

        $positionPayload = $positions->map(function (Position $position) use ($event, $canShowResults) {
            $voteCounts = $canShowResults
                ? Vote::query()
                    ->where('event_id', $event->id)
                    ->where('position_id', $position->id)
                    ->selectRaw('candidate_id, COUNT(*) as votes_count')
                    ->groupBy('candidate_id')
                    ->pluck('votes_count', 'candidate_id')
                    ->map(fn ($count) => (int) $count)
                    ->all()
                : [];

            $candidates = Candidate::query()
                ->where('event_id', $event->id)
                ->where('position_id', $position->id)
                ->orderBy('id')
                ->get(['id', 'name', 'photo_path'])
                ->map(function (Candidate $candidate) use ($voteCounts) {
                    $votesCount = $voteCounts[$candidate->id] ?? 0;

                    return [
                        'id' => $candidate->id,
                        'name' => $candidate->name,
                        'photo_url' => $candidate->photo_path ? asset('storage/'.$candidate->photo_path) : null,
                        'votes_count' => $votesCount,
                    ];
                })
                ->values();

            if ($canShowResults) {
                $candidates = $candidates->sortByDesc('votes_count')->values();
            }

            return [
                'id' => $position->id,
                'name' => $position->name,
                'max_vote' => $position->max_vote,
                'candidates' => $candidates,
            ];
        })->values();

        return Inertia::render('Results/index', [
            'event' => [
                'id' => $event->id,
                'name' => $event->name,
                'is_active' => $event->is_active,
                'start_at' => $event->start_at?->toIso8601String(),
                'end_at' => $event->end_at?->toIso8601String(),
            ],
            'positions' => $positionPayload,
            'can_show_results' => $canShowResults,
        ]);
    }
}
