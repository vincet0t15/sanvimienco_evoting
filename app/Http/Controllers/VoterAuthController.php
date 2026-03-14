<?php

namespace App\Http\Controllers;

use App\Models\Voter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class VoterAuthController extends Controller
{
    public function create(Request $request)
    {
        return Inertia::render('VoterAuth/login');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $voter = Voter::query()
            ->where('username', $validated['username'])
            ->where('is_active', true)
            ->first();

        if (! $voter || ! Hash::check($validated['password'], (string) $voter->password)) {
            return back()->withErrors([
                'username' => 'Invalid credentials.',
            ]);
        }

        Auth::guard('voter')->login($voter, $request->boolean('remember'));
        $request->session()->regenerate();

        return redirect()->route('voter.dashboard');
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('voter')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('voter.login');
    }

    public function dashboard(Request $request)
    {
        $voter = $request->user('voter');

        return Inertia::render('VoterAuth/dashboard', [
            'voter' => $voter,
        ]);
    }
}
