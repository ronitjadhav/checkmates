import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Published by GitHub Pages on its own domain, https://checkmates.ronit.io/, so the base stays '/'.
export default defineConfig({
  // Keep the px fallbacks next to the cqw values for Safari 15 (older iPads).
  build: { cssTarget: 'safari15' },
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'icon.png'],
      manifest: {
        name: 'Checkmates',
        short_name: 'Checkmates',
        description: 'Pass-and-play chess for one phone or tablet',
        display: 'fullscreen',
        orientation: 'any',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' },
          { src: 'icon.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  test: { environment: 'node' },
})
