<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthenticateVoter
{
    public function handle(Request $request, Closure $next)
    {
        if (! Auth::guard('voter')->check()) {
            return redirect()->guest(route('voter.login'));
        }

        return $next($request);
    }
}
