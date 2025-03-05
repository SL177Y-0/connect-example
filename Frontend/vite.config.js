import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Real backend URL
        changeOrigin: true,
        // Don't rewrite paths if your frontend code expects /api prefix
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@verida': '/node_modules/@verida',
    },
  },
  optimizeDeps: {
    include: ['@verida/account-web-vault'],
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignore specific warnings about pure annotations in Privy package
        if (warning.code === 'ANNOTATION_PURE_COMMENT' && 
            warning.message.includes('@privy-io/react-auth')) {
          return;
        }
        warn(warning);
      }
    }
  }
});
