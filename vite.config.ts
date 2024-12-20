import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/ws': {
        target: 'wss://websocketserver-production-4d22.up.railway.app',
        ws: true,
        changeOrigin: true, // Ensure the origin header matches the target
        secure: true        // Use this option for secure WebSocket connections
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});