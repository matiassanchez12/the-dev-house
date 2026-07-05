import '../css/app.css'
import './bootstrap'

import { createInertiaApp } from '@inertiajs/react'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import { APP_NAME, formatDocumentTitle } from '@/lib/seo'

const appName = import.meta.env.VITE_APP_NAME || APP_NAME

createInertiaApp({
    title: (title) => formatDocumentTitle(title, appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob([
                './pages/**/*.tsx',
                '!./pages/**/*.test.tsx',
                '!./pages/**/*.spec.tsx',
            ]),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el)

        root.render(
            <>
                <App {...props} />
                <Toaster position="top-right" richColors closeButton />
            </>,
        )
    },
    progress: {
        color: '#4B5563',
    },
})

// Fonts are self-hosted via @font-face in app.css — no dynamic loading needed
