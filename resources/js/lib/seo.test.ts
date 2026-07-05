import { describe, expect, it } from 'vitest';
import { buildAbsoluteUrl, formatDocumentTitle } from './seo';

describe('seo helpers', () => {
    it('builds absolute URLs without duplicate slashes', () => {
        expect(buildAbsoluteUrl('https://example.com', '/og.jpg')).toBe('https://example.com/og.jpg');
        expect(buildAbsoluteUrl('https://example.com/', 'og.jpg')).toBe('https://example.com/og.jpg');
    });

    it('preserves the configured base path when resolving client URLs', () => {
        expect(buildAbsoluteUrl('https://example.com/app', '/og.jpg')).toBe('https://example.com/app/og.jpg');
        expect(buildAbsoluteUrl('https://example.com/app/', '/nested/og.jpg')).toBe('https://example.com/app/nested/og.jpg');
    });

    it('does not duplicate the base path for already-prefixed pathnames', () => {
        expect(buildAbsoluteUrl('https://example.com/app', '/app/projects')).toBe('https://example.com/app/projects');
    });

    it('keeps page titles readable when they already include the app name', () => {
        expect(formatDocumentTitle('Dashboard', 'The Dev House')).toBe('Dashboard - The Dev House');
        expect(formatDocumentTitle('Welcome to The Dev House', 'The Dev House')).toBe('Welcome to The Dev House');
    });
});
