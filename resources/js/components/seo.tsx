import { Head } from '@inertiajs/react';
import {
    APP_NAME,
    APP_URL,
    DEFAULT_SEO_DESCRIPTION,
    DEFAULT_SEO_IMAGE,
    buildAbsoluteUrl,
    formatDocumentTitle,
} from '@/lib/seo';

interface SeoProps {
    title: string;
    description?: string;
    image?: string;
    type?: 'website' | 'article' | 'product';
    canonicalUrl?: string;
}

const appName = import.meta.env.VITE_APP_NAME || APP_NAME;

export default function Seo({
    title,
    description = DEFAULT_SEO_DESCRIPTION,
    image = DEFAULT_SEO_IMAGE,
    type = 'website',
    canonicalUrl,
}: SeoProps) {
    const fullTitle = formatDocumentTitle(title, appName);
    const appUrl = import.meta.env.VITE_APP_URL || APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    const canonical = canonicalUrl || buildAbsoluteUrl(appUrl, typeof window !== 'undefined' ? window.location.pathname : '/');
    const imageUrl = buildAbsoluteUrl(appUrl, image);

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
            <meta property="og:image" content={imageUrl} />
            <meta property="og:site_name" content={appName} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={canonical} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={imageUrl} />
            <meta name="twitter:creator" content="@matiassanchez_" />
        </Head>
    );
}
