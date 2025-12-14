import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    // --- KHU VỰC "HỦY DIỆT" LỖI (Đã bao gồm tất cả các biến nội bộ) ---
    
    // 1. Nhóm cấu hình chung
    '__DEFINES__': JSON.stringify({}),
    '__HMR_CONFIG_NAME__': JSON.stringify('vite.config.js'),
    '__BASE__': JSON.stringify('/'),
    '__SERVER_HOST__': JSON.stringify('localhost'),
    
    // 2. Nhóm HMR (Hot Module Replacement) - Nguyên nhân chính
    '__HMR_PROTOCOL__': JSON.stringify('ws'),
    '__HMR_HOSTNAME__': JSON.stringify(null),
    '__HMR_PORT__': JSON.stringify(null),
    '__HMR_DIRECT_TARGET__': JSON.stringify('frontend'),
    '__HMR_BASE__': JSON.stringify('/'),
    '__HMR_TIMEOUT__': JSON.stringify(5000),
    '__HMR_ENABLE_OVERLAY__': JSON.stringify(false),
    
    // 3. Nhóm WebSocket (Lỗi bạn vừa gặp)
    '__WS_TOKEN__': JSON.stringify(''), // Fix lỗi __WS_TOKEN__
    '__HMR_CLIENT_PORT__': JSON.stringify(null), // Phòng hờ lỗi Client Port
    
    // 4. Nhóm biến môi trường cũ (Phòng hờ thư viện legacy)
    'process.env': JSON.stringify({}),
    'global': 'window', // Fix lỗi "global is not defined" nếu có thư viện cũ dùng
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});