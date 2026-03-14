<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Voter;
use Illuminate\Http\Request;
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
}
