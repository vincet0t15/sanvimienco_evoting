<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $events = Event::query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->paginate(10)
            ->withQueryString();
        return Inertia::render('Events/index', [
            'events' => $events,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }
}
