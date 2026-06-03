import { Head } from '@inertiajs/react';

interface SeoProps {
    title: string;
    description?: string;
    image?: string;
    type?: 'website' | 'article' | 'product';
    canonicalUrl?: string;
}

const appName = import.meta.env.VITE_APP_NAME || 'The Dev House';

export default function Seo({
    title,
    description = 'The Dev House — Una plataforma colaborativa para desarrolladores. Crea proyectos, únete a equipos y construye software juntos.',
    image = '/og.jpg',
    type = 'website',
    canonicalUrl,
}: SeoProps) {
    const fullTitle = `${title} - ${appName}`;
    const appUrl = import.meta.env.VITE_APP_URL || 'https://the-dev-house-1.onrender.com';
    const canonical = canonicalUrl || `${appUrl}/${typeof window !== 'undefined' ? window.location.pathname : ''}`;

    return (
        <Head title={title}>
            <meta name="title" content={fullTitle} />
            <meta name="description" content={description} />
            <meta name="author" content="Matias Sanchez" />

            {canonicalUrl && <link rel="canonical" href={canonical} />}

            <meta property="og:type" content={type} />
            <meta property="og:url" content={canonical} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={`${appUrl}${image}`} />
            <meta property="og:site_name" content={appName} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={canonical} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={`${appUrl}${image}`} />
            <meta name="twitter:creator" content="@matiassanchez_" />
        </Head>
    );
}
