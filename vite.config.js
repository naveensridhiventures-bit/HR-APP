import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Sridhi HR — Hiring Pipeline',
        short_name: 'Sridhi HR',
        description: 'Track every applicant, every follow-up, every hire — Driver, Field Sales, Housekeeping, Security and more.',
        theme_color: '#16213E',
        background_color: '#FAF6EF',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' }
        ]
      },
      workbox: {
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // Use CacheFirst for GAS API — serve cache instantly, update in background
            urlPattern: ({ url }) =>
              url.hostname.includes('script.google.com') ||
              url.hostname.includes('script.googleusercontent.com'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'sridhi-api-cache-v2',
              expiration: {
                maxAgeSeconds: 60,      // Cache GAS responses for 60 seconds max
                maxEntries: 10,
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      devOptions: { enabled: false }
    })
  ],
  server: { port: 5173 }
})
