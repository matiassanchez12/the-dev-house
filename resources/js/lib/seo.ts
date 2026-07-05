export const APP_NAME = 'The Dev House';
export const APP_URL = import.meta.env.VITE_APP_URL || '';
export const DEFAULT_SEO_DESCRIPTION = 'The Dev House — Una plataforma colaborativa para desarrolladores. Crea proyectos, únete a equipos y construye software juntos.';
export const DEFAULT_SEO_IMAGE = '/og.jpg';

export function formatDocumentTitle(title: string, appName = APP_NAME): string {
    const normalizedTitle = title.trim();
    const normalizedAppName = appName.trim();

    if (normalizedTitle.endsWith(normalizedAppName)) {
        return normalizedTitle;
    }

    return `${normalizedTitle} - ${normalizedAppName}`;
}

export function buildAbsoluteUrl(baseUrl: string, path: string): string {
    const normalizedBaseUrl = new URL(baseUrl);
    const basePath = normalizedBaseUrl.pathname.replace(/\/$/, '');
    const resolvedPath = path.startsWith('/') && basePath && !path.startsWith(`${basePath}/`) && path !== basePath
        ? `${basePath}${path}`
        : path;

    return new URL(resolvedPath, normalizedBaseUrl).toString();
}
