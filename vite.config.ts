import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitroV2Plugin } from '@tanstack/nitro-v2-vite-plugin'
import { VitePWA } from 'vite-plugin-pwa'

const config = defineConfig({
  server: {
    allowedHosts: true,
  },
  plugins: [
    nitroV2Plugin({
      compatibilityDate: '2026-05-07',
    }),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    VitePWA({
      manifest: false,
      injectRegister: false,
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo192.png', 'logo512.png', 'robots.txt', 'manifest.json'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,txt}'],
      },
    }),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
