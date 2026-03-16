<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use App\Models\Event;
use App\Models\Position;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CandidateController extends Controller
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

        $positions = $eventId
            ? Position::query()
                ->select(['id', 'event_id', 'name'])
                ->where('event_id', $eventId)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get()
            : collect();

        $positionsByEvent = Position::query()
            ->select(['id', 'event_id', 'name'])
            ->whereIn('event_id', $events->pluck('id'))
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->groupBy('event_id')
            ->map(function ($group) {
                return $group->map(function (Position $position) {
                    return [
                        'id' => $position->id,
                        'name' => $position->name,
                    ];
                })->values();
            });

        $positionId = (int) $request->input('position_id', $positions->first()?->id);
        if ($positionId && ! $positions->contains('id', $positionId)) {
            $positionId = (int) ($positions->first()?->id ?? 0);
        }

        $candidateList = ($eventId && $positionId)
            ? Candidate::query()
                ->where('event_id', $eventId)
                ->where('position_id', $positionId)
                ->orderBy('id')
                ->get()
                ->map(function (Candidate $candidate) {
                    return [
                        'id' => $candidate->id,
                        'event_id' => $candidate->event_id,
                        'position_id' => $candidate->position_id,
                        'name' => $candidate->name,
                        'photo_path' => $candidate->photo_path,
                        'photo_url' => $candidate->photo_path
                            ? asset('storage/'.$candidate->photo_path)
                            : null,
                    ];
                })
            : collect();

        return Inertia::render('Candidates/index', [
            'events' => $events,
            'eventId' => $eventId,
            'positions' => $positions,
            'positionsByEvent' => $positionsByEvent,
            'positionId' => $positionId,
            'candidateList' => $candidateList,
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
                    $query->where('is_active', true);
                }),
            ],
            'position_id' => [
                'required',
                'integer',
                Rule::exists('positions', 'id')->where('event_id', $eventId),
            ],
            'name' => ['required', 'string', 'max:255', Rule::unique('candidates', 'name')->where('position_id', $request->input('position_id'))],
            'photo' => ['nullable', 'image', 'max:2048', 'mimes:jpg,jpeg,png,webp'],
        ]);

        $path = $request->hasFile('photo')
            ? $request->file('photo')->store('candidates', 'public')
            : null;

        Candidate::create([
            'event_id' => $validated['event_id'],
            'position_id' => $validated['position_id'],
            'name' => $validated['name'],
            'photo_path' => $path,
        ]);

        return redirect()->route('candidates.index', [
            'event_id' => $validated['event_id'],
            'position_id' => $validated['position_id'],
        ]);
    }

    public function update(Request $request, Candidate $candidate): RedirectResponse
    {
        abort_unless(Event::query()->active()->whereKey($candidate->event_id)->exists(), 403);

        $validated = $request->validate([
            'position_id' => ['required', 'integer', Rule::exists('positions', 'id')->where('event_id', $candidate->event_id)],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('candidates', 'name')
                    ->where('position_id', $request->input('position_id'))
                    ->ignore($candidate->id),
            ],
            'photo' => ['nullable', 'image', 'max:2048', 'mimes:jpg,jpeg,png,webp'],
        ]);

        if ($request->hasFile('photo')) {
            if ($candidate->photo_path) {
                Storage::disk('public')->delete($candidate->photo_path);
            }
            $candidate->photo_path = $request->file('photo')->store('candidates', 'public');
        }

        $candidate->position_id = $validated['position_id'];
        $candidate->name = $validated['name'];
        $candidate->save();

        return redirect()->route('candidates.index', [
            'event_id' => $candidate->event_id,
            'position_id' => $candidate->position_id,
        ]);
    }

    public function destroy(Candidate $candidate): RedirectResponse
    {
        abort_unless(Event::query()->active()->whereKey($candidate->event_id)->exists(), 403);

        $eventId = $candidate->event_id;
        $positionId = $candidate->position_id;

        if ($candidate->photo_path) {
            Storage::disk('public')->delete($candidate->photo_path);
        }
        $candidate->delete();

        return redirect()->route('candidates.index', [
            'event_id' => $eventId,
            'position_id' => $positionId,
        ]);
    }
}
