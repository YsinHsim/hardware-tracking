<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureProfileCompleted
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if ($user && ! $user->profile_completed_at && ! $request->routeIs(['onboarding.*', 'logout'])) {
            return redirect()->route('onboarding.show');
        }

        return $next($request);
    }
}
