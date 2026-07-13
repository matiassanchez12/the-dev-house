<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetAppUrl
{
    public function handle(Request $request, Closure $next): Response
    {
        $host = $request->getHost();
        $allowed = (array) config('app.allowed_hosts', []);

        if ($host && in_array($host, $allowed, true)) {
            config(['app.url' => $request->getSchemeAndHttpHost()]);
        }

        return $next($request);
    }
}
