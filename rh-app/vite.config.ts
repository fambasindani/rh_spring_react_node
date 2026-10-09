import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Redirige "/rh" (sans slash) vers "/rh/" : la base Vite est "/rh/" et le chemin
// sans slash final renvoie 404 (donc pas d'app ni de favicon -> erreurs 404).
const baseTrailingSlashRedirect = {
  name: 'base-trailing-slash-redirect',
  apply: 'serve' as const,
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      const path = (req.url || '').split('?')[0];
      if (path === '/rh') {
        res.writeHead(302, { Location: '/rh/' });
        res.end();
        return;
      }
      next();
    });
  },
  configurePreviewServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      const path = (req.url || '').split('?')[0];
      if (path === '/rh') {
        res.writeHead(302, { Location: '/rh/' });
        res.end();
        return;
      }
      next();
    });
  },
};

export default defineConfig({
  base: '/rh/',
  plugins: [react(), baseTrailingSlashRedirect],
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
  define: {
    global: 'globalThis',
    'global.Buffer': ['buffer', 'Buffer'],
  },
  resolve: {
    alias: {
      buffer: 'buffer',
    },
  },
})
