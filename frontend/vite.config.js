import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
  plugins: [vue(), VitePWA({ registerType: 'autoUpdate', manifest: {
    name: '逢甲校園修繕與清潔通報系統', short_name: '校園通報', theme_color: '#ff5a5f', background_color: '#f7f7f7', display: 'standalone',
    icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }]
  }})],
  server: { port: 5173 }
});
