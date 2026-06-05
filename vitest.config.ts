import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        setupFiles: ['./resources/js/test/setup.ts'],
        css: false,
        globals: false,
        include: ['resources/js/**/*.{test,spec}.{ts,tsx}'],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
            '@components': path.resolve(__dirname, './resources/js/components'),
            '@layouts': path.resolve(__dirname, './resources/js/layouts'),
        },
    },
});
