<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $userList = User::query()
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

        return Inertia::render('Users/index', [
            'userList' => $userList,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function setActive(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        if ((int) $request->user()->id === (int) $user->id && ! $validated['is_active']) {
            return back()->withErrors([
                'user' => 'You cannot deactivate your own account.',
            ]);
        }

        $user->update(['is_active' => $validated['is_active']]);

        return redirect()->back()->with('success', 'User status updated successfully.');
    }
}
