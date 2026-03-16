<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class AuthenticateVoter
{
    public function handle(Request $request, Closure $next)
    {
        if (! Auth::guard('voter')->check()) {
            return redirect()->guest(route('voter.login'));
        }

        $voter = $request->user('voter');

        if ($voter) {
            $sessionToken = (string) $request->session()->get('voter_session_token', '');
            $currentToken = (string) ($voter->current_session_token ?? '');

            if ($currentToken === '' || $sessionToken === '' || $currentToken !== $sessionToken) {
                $voter->forceFill(['current_session_token' => null])->save();

                Auth::guard('voter')->logout();
                $request->session()->forget('voter_session_token');
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()->guest(route('voter.login'));
            }

            $key = 'voter:last_seen:'.$voter->id;

            if (Cache::add($key, true, 60)) {
                $voter->forceFill(['last_seen_at' => now()])->save();
            }
        }

        return $next($request);
    }
}
