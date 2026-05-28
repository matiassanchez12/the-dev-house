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

        <!-- SEO Meta Tags -->
        <meta name="description" content="The Dev House — Una plataforma colaborativa para desarrolladores. Crea proyectos, únete a equipos y construye software juntos.">
        <meta name="keywords" content="desarrolladores, programación, proyectos, colaboración, open source, comunidad, tech, software">
        <meta name="author" content="Matias Sanchez">
        <meta name="robots" content="index, follow">
        
        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ config('app.url', 'https://the-dev-house-1.onrender.com') }}/{{ request()->path() }}">
        <meta property="og:title" content="{{ config('app.name', 'The Dev House') }}">
        <meta property="og:description" content="Una plataforma colaborativa para desarrolladores. Crea proyectos, únete a equipos y construye software juntos.">
        <meta property="og:image" content="{{ config('app.url', 'https://the-dev-house-1.onrender.com') }}/og.jpg">
        <meta property="og:site_name" content="The Dev House">

        <!-- Twitter -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:url" content="{{ config('app.url', 'https://the-dev-house-1.onrender.com') }}/{{ request()->path() }}">
        <meta name="twitter:title" content="{{ config('app.name', 'The Dev House') }}">
        <meta name="twitter:description" content="Una plataforma colaborativa para desarrolladores. Crea proyectos, únete a equipos y construye software juntos.">
        <meta name="twitter:image" content="{{ config('app.url', 'https://the-dev-house-1.onrender.com') }}/og.jpg">
        <meta name="twitter:creator" content="@matiassanchez_">

        <!-- Canonical URL -->
        <link rel="canonical" href="{{ config('app.url', 'https://the-dev-house-1.onrender.com') }}/{{ request()->path() }}">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

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
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "The Dev House",
          "url": "{{ config('app.url', 'https://the-dev-house-1.onrender.com') }}",
          "description": "Una plataforma colaborativa para desarrolladores",
          "logo": "{{ config('app.url', 'https://the-dev-house-1.onrender.com') }}/favicon.svg",
          "sameAs": [
            "https://github.com/matiassanchez12/the-dev-house"
          ],
          "founder": {
            "@type": "Person",
            "name": "Matias Sanchez"
          }
        }
        </script>
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
