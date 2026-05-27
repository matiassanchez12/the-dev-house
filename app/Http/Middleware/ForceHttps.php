<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceHttps
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->header('X-Forwarded-Proto') === 'https' || $request->secure()) {
            $request->server->set('HTTPS', 'on');
        }

        return $next($request);
    }
}