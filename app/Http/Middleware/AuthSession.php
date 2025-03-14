<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthSession
{
    public function handle(Request $request, Closure $next)
    {
        if (! session()->has('logged_in')) {
            return redirect()->route('login');
        }
        return $next($request);
    }
}
