<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeoFallbackTest extends TestCase
{
    use RefreshDatabase;

    public function test_server_rendered_homepage_includes_og_image_fallback(): void
    {
        $response = $this->get('/');

        $response->assertOk();
        $appUrl = rtrim(config('app.url'), '/');
        $response->assertSee('<meta property="og:image" content="' . $appUrl . '/og.jpg">', false);
        $response->assertSee('<meta property="og:url" content="' . $appUrl . '/">', false);
        $response->assertSee('<link rel="canonical" href="' . $appUrl . '/">', false);
        $response->assertSee('The Dev House — Una plataforma colaborativa para desarrolladores. Crea proyectos, únete a equipos y construye software juntos.', false);
        $response->assertDontSee('the-dev-house-1.onrender.com', false);
    }
}
