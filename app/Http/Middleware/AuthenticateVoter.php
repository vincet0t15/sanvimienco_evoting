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
            $key = 'voter:last_seen:'.$voter->id;

            if (Cache::add($key, true, 60)) {
                $voter->forceFill(['last_seen_at' => now()])->save();
            }
        }

        return $next($request);
    }
}
