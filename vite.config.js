import {defineConfig, loadEnv} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {oxygen} from '@shopify/mini-oxygen/vite';
import {reactRouter} from '@react-router/dev/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      tailwindcss(),
      hydrogen(),
      oxygen(),
      reactRouter(),
      tsconfigPaths(),
    ],
    build: {
      // Allow a strict Content-Security-Policy
      // without inlining assets as base64:
      assetsInlineLimit: 0,
    },
    ssr: {
      optimizeDeps: {
        include: ['set-cookie-parser', 'cookie', 'react-router', 'react-dom/server'],
      },
      noExternal: ['react-dom'],
    },
    optimizeDeps: {
      include: ['react-dom/server'],
    },
    define: {
      'process.env.PUBLIC_CHECKOUT_DOMAIN': JSON.stringify(env.PUBLIC_CHECKOUT_DOMAIN || 'hydrogen-headless-2.myshopify.com'),
      'process.env.PUBLIC_STORE_DOMAIN': JSON.stringify(env.PUBLIC_STORE_DOMAIN || 'hydrogen-headless-2.myshopify.com'),
    },
    server: {
      allowedHosts: ['headless.pinblooms.in'],
    },
  };
});

