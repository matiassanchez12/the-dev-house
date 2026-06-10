<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'The Dev House') }}</title>

        <!-- Favicon -->
        <link rel="icon" type="image/svg+xml" href="/favicon.svg">
        <link rel="alternate icon" href="/favicon.ico">
        <link rel="apple-touch-icon" href="/favicon.svg">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <!-- Fallback SEO Meta Tags (overridden per-page by <Seo />) -->
        <meta name="description" content="The Dev House - Una plataforma colaborativa para desarrolladores. Crea proyectos, unete a equipos y construye software juntos.">
        <meta name="keywords" content="desarrolladores, programacion, proyectos, colaboracion, open source, comunidad, tech, software">
        <meta name="author" content="Matias Sanchez">
        <meta name="robots" content="index, follow">
        <meta property="og:locale" content="es_ES">

        <!-- Canonical URL (fallback when no per-page canonical) -->
        <link rel="canonical" href="{{ config('app.url', 'https://the-dev-house-1.onrender.com') }}/{{ request()->path() }}">

        <!-- Prevent dark-mode FOUC — apply .dark class BEFORE CSS renders -->
        <script>
            (function() {
                var theme = localStorage.getItem('theme');
                if (!theme) {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                }
            })();
        </script>

        @php
            $reverbConfig = [
                'key' => config('reverb.apps.apps.0.key'),
                'host' => config('reverb.apps.apps.0.options.host'),
                'port' => (int) config('reverb.apps.apps.0.options.port'),
                'scheme' => config('reverb.apps.apps.0.options.scheme'),
            ];
        @endphp
        <script>window.__REVERB_CONFIG__ = @json($reverbConfig);</script>

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead

        <!-- Analytics -->
        <script defer src="https://cloud.umami.is/script.js" data-website-id="6c403120-fd9d-4d63-b365-33605619023a"></script>

        <!-- Structured Data - Organization -->
        <script type="application/ld+json">
        {
          "@@context": "https://schema.org",
          "@@type": "Organization",
          "name": "The Dev House",
          "url": "{{ config('app.url', 'https://the-dev-house-1.onrender.com') }}",
          "description": "Una plataforma colaborativa para desarrolladores",
          "logo": "{{ config('app.url', 'https://the-dev-house-1.onrender.com') }}/favicon.svg",
          "sameAs": [
            "https://github.com/matiassanchez12/the-dev-house"
          ],
          "founder": {
            "@@type": "Person",
            "name": "Matias Sanchez"
          }
        }
        </script>
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
