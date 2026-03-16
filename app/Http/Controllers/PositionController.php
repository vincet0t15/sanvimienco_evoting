<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Position;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PositionController extends Controller
{
    public function index(Request $request)
    {
        $events = Event::query()
            ->active()
            ->select(['id', 'name'])
            ->orderByDesc('id')
            ->get();

        $eventId = (int) $request->input('event_id', $events->first()?->id);
        if ($eventId && ! $events->contains('id', $eventId)) {
            $eventId = (int) ($events->first()?->id ?? 0);
        }

        $positionList = Position::query()
            ->when($eventId, fn ($q) => $q->where('event_id', $eventId))
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return Inertia::render('Positions/index', [
            'events' => $events,
            'eventId' => $eventId,
            'positionList' => $positionList,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $eventId = (int) $request->input('event_id');

        $validated = $request->validate([
            'event_id' => [
                'required',
                'integer',
                Rule::exists('events', 'id')->where(function ($query) {
                    $query->where('start_at', '<=', now())->where('end_at', '>=', now());
                }),
            ],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('positions', 'name')->where('event_id', $eventId),
            ],
            'max_vote' => ['required', 'integer', 'min:1'],
        ]);

        $nextOrder = (int) Position::query()
            ->where('event_id', $validated['event_id'])
            ->max('sort_order') + 1;

        Position::create([
            'event_id' => $validated['event_id'],
            'name' => $validated['name'],
            'max_vote' => $validated['max_vote'],
            'sort_order' => $nextOrder,
        ]);

        return redirect()->route('positions.index', [
            'event_id' => $validated['event_id'],
        ]);
    }

    public function update(Request $request, Position $position): RedirectResponse
    {
        abort_unless(Event::query()->active()->whereKey($position->event_id)->exists(), 403);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('positions', 'name')
                    ->where('event_id', $position->event_id)
                    ->ignore($position->id),
            ],
            'max_vote' => ['required', 'integer', 'min:1'],
        ]);

        $position->update($validated);

        return redirect()->route('positions.index', [
            'event_id' => $position->event_id,
        ]);
    }

    public function destroy(Position $position): RedirectResponse
    {
        abort_unless(Event::query()->active()->whereKey($position->event_id)->exists(), 403);

        $eventId = $position->event_id;
        $position->delete();

        return redirect()->route('positions.index', [
            'event_id' => $eventId,
        ]);
    }

    public function reorder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'event_id' => [
                'required',
                'integer',
                Rule::exists('events', 'id')->where(function ($query) {
                    $query->where('start_at', '<=', now())->where('end_at', '>=', now());
                }),
            ],
            'ordered_ids' => ['required', 'array'],
            'ordered_ids.*' => ['integer', Rule::exists('positions', 'id')],
        ]);

        $eventId = (int) $validated['event_id'];

        $countForEvent = Position::query()
            ->where('event_id', $eventId)
            ->count();

        if ($countForEvent !== count($validated['ordered_ids'])) {
            return back()->withErrors([
                'ordered_ids' => 'Invalid reorder payload.',
            ]);
        }

        $countMatching = Position::query()
            ->where('event_id', $eventId)
            ->whereIn('id', $validated['ordered_ids'])
            ->count();

        if ($countMatching !== $countForEvent) {
            return back()->withErrors([
                'ordered_ids' => 'Invalid reorder payload.',
            ]);
        }

        DB::transaction(function () use ($validated, $eventId) {
            foreach ($validated['ordered_ids'] as $index => $id) {
                Position::query()
                    ->where('event_id', $eventId)
                    ->where('id', $id)
                    ->update(['sort_order' => $index + 1]);
            }
        });

        return redirect()->route('positions.index', [
            'event_id' => $eventId,
        ]);
    }
}
