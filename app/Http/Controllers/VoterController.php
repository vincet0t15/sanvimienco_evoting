<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Voter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class VoterController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $events = Event::query()
            ->select(['id', 'name'])
            ->orderByDesc('id')
            ->get();

        $voterList = Voter::query()
            ->with(['event:id,name'])
            ->when($search, function ($query, $search) {
                $query->where(function ($innerQuery) use ($search) {
                    $innerQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('id')
            ->paginate(10)
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
        $eventId = (int) $request->input('event_id');

        $validated = $request->validate([
            'event_id' => ['required', 'integer', Rule::exists('events', 'id')],
            'name' => ['required', 'string', 'max:255'],
            'username' => [
                'required',
                'string',
                'max:255',
                Rule::unique('voters', 'username')->where('event_id', $eventId),
            ],
            'password' => ['required', 'string', 'min:6'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $validated['is_active'] = (bool) ($validated['is_active'] ?? true);

        Voter::create($validated);

        return redirect()->route('voters.index');
    }
}
