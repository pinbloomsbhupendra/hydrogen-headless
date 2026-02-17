import {defineConfig} from 'vite';
import fs from 'fs';
import {hydrogen} from '@shopify/hydrogen/vite';
import {reactRouter} from '@react-router/dev/vite';
import {oxygen} from '@shopify/mini-oxygen/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    // Custom plugin to ensure host header is present for MiniOxygen
    {
      name: 'ensure-host-header',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Ensure host header is present for MiniOxygen
          if (!req.headers.host) {
            const address = server.httpServer?.address();
            req.headers.host = address && typeof address !== 'string'
              ? `localhost:${address.port}`
              : 'localhost:3001';
          }
          next();
        });
      },
    },
    hydrogen(),
    reactRouter(),
    tailwindcss(),
    oxygen(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './app'),
    },
    mainFields: ['module', 'main'],
    conditions: ['production', 'import', 'module', 'browser'],
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    assetsInlineLimit: 0,
    sourcemap: false,
  },
  ssr: {
    noExternal: true,
    optimizeDeps: {
      include: ['react-router-dom', 'set-cookie-parser', 'cookie'],
    },
  },
  server: {
    host: '127.0.0.1',
    port: 4000,
  },
});
