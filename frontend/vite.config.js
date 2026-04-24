import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/menu-items': {
        target: 'http://localhost:8082', // admin-service
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '/api'),
      },
      '/api/tables': {
        target: 'http://localhost:8082', // admin-service
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '/api'),
      },
      '/api/restaurants': {
        target: 'http://localhost:8082', // admin-service
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '/api'),
      },
      // User/customer auth endpoints
      '/api/auth': {
        target: 'http://localhost:8081', // customer-service
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '/api'),
      },
      // Admin auth endpoints
      '/api/admin-auth': {
        target: 'http://localhost:8082', // admin-service
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/admin-auth/, '/api/auth'),
      },
      '/api/customers': {
        target: 'http://localhost:8081', // customer-service
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '/api'),
      },
      '/api/orders': {
        target: 'http://localhost:8081', // customer-service
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '/api'),
      },
      '/api/reservations': {
        target: 'http://localhost:8081', // customer-service
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '/api'),
      },
    },
  },
});
