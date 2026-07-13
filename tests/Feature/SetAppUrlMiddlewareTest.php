<?php

namespace Tests\Feature;

use App\Http\Middleware\SetAppUrl;
use Illuminate\Http\Request;
use Tests\TestCase;

class SetAppUrlMiddlewareTest extends TestCase
{
    public function test_allowed_host_updates_config(): void
    {
        config(['app.url' => 'https://default.dev']);
        config(['app.allowed_hosts' => ['allowed.dev', 'old.up.railway.app']]);

        $request = Request::create('https://allowed.dev/test', 'GET');
        $middleware = new SetAppUrl();

        $response = $middleware->handle($request, fn () => response('OK'));

        $this->assertEquals('https://allowed.dev', config('app.url'));
        $this->assertEquals(200, $response->getStatusCode());
    }

    public function test_unknown_host_does_not_update_config(): void
    {
        config(['app.url' => 'https://default.dev']);
        config(['app.allowed_hosts' => ['allowed.dev', 'old.up.railway.app']]);

        $request = Request::create('https://malicious.com/test', 'GET');
        $middleware = new SetAppUrl();

        $response = $middleware->handle($request, fn () => response('OK'));

        $this->assertEquals('https://default.dev', config('app.url'));
        $this->assertEquals(200, $response->getStatusCode());
    }

    public function test_railway_domain_is_allowed(): void
    {
        config(['app.url' => 'https://default.dev']);
        config(['app.allowed_hosts' => ['allowed.dev', 'old.up.railway.app']]);

        $request = Request::create('https://old.up.railway.app/test', 'GET');
        $middleware = new SetAppUrl();

        $response = $middleware->handle($request, fn () => response('OK'));

        $this->assertEquals('https://old.up.railway.app', config('app.url'));
        $this->assertEquals(200, $response->getStatusCode());
    }
}
