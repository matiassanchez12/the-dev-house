<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        @php
            $appName = config('app.name', 'The Dev House');
            $appUrl = rtrim(config('app.url', url('/')), '/');
            $currentPath = ltrim(request()->path(), '/');
            $currentUrl = $currentPath === '' ? $appUrl . '/' : $appUrl . '/' . $currentPath;
            $ogImage = $appUrl . '/og.jpg';
            $seoDescription = 'The Dev House — Una plataforma colaborativa para desarrolladores. Crea proyectos, únete a equipos y construye software juntos.';
        @endphp

        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ $appName }}</title>

        <!-- Favicon -->
        <link rel="icon" type="image/svg+xml" href="/favicon.svg">
        <link rel="alternate icon" href="/favicon.ico">
        <link rel="apple-touch-icon" href="/favicon.svg">
        <!-- Fallback SEO Meta Tags (overridden per-page by <Seo />) -->
        <meta name="description" content="{{ $seoDescription }}">
        <meta name="keywords" content="desarrolladores, programacion, proyectos, colaboracion, open source, comunidad, tech, software">
        <meta name="author" content="Matias Sanchez">
        <meta name="robots" content="index, follow">
        <meta property="og:locale" content="es_ES">
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="{{ $appName }}">
        <meta property="og:title" content="{{ $appName }}">
        <meta property="og:description" content="{{ $seoDescription }}">
        <meta property="og:url" content="{{ $currentUrl }}">
        <meta property="og:image" content="{{ $ogImage }}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $appName }}">
        <meta name="twitter:description" content="{{ $seoDescription }}">
        <meta name="twitter:image" content="{{ $ogImage }}">

        <!-- Canonical URL (fallback when no per-page canonical) -->
        <link rel="canonical" href="{{ $currentUrl }}">

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
        @unless (app()->runningUnitTests())
            @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @endunless
        @inertiaHead

        <!-- Analytics -->
        <script defer src="https://cloud.umami.is/script.js" data-website-id="6c403120-fd9d-4d63-b365-33605619023a"></script>

        <!-- Structured Data - Organization -->
        <script type="application/ld+json">
        {
          "@@context": "https://schema.org",
          "@@type": "Organization",
          "name": "{{ $appName }}",
          "url": "{{ $appUrl }}",
          "description": "Una plataforma colaborativa para desarrolladores",
          "logo": "{{ $appUrl }}/favicon.svg",
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
