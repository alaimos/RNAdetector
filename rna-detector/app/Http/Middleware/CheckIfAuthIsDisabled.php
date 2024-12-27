<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckIfAuthIsDisabled
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // If auth is disabled, automatically log in the default user
        // Auth should be disabled only in local development or when the app is running in a personal environment
        // Never disable auth in a production environment with multiple users
        if (! config('auth.enabled') && ! Auth::user()) {
            Auth::login(User::where('email', config('auth.default_user'))->first());
        }

        return $next($request);
    }
}
