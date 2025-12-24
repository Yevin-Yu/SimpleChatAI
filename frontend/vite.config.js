import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const DEFAULT_PORT = 5173;
const DEFAULT_BASE_PATH = '/ai';
const DEFAULT_BACKEND_URL = 'http://localhost:3001';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    base: env.VITE_BASE_PATH || DEFAULT_BASE_PATH,
    plugins: [react()],
    server: {
      port: Number(env.VITE_PORT) || DEFAULT_PORT,
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL || DEFAULT_BACKEND_URL,
          changeOrigin: true,
          secure: true,
        }
      }
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'markdown-vendor': ['react-markdown', 'remark-gfm', 'rehype-highlight'],
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },
      minify: 'esbuild',
      esbuild: {
        drop: ['console', 'debugger'],
      },
    },
  };
});

