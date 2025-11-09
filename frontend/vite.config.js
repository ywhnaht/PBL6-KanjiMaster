// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import tailwindcss from "@tailwindcss/vite";

// export default defineConfig({
//   plugins: [react(), tailwindcss()],
//   base: './',
//   server: {
//     proxy: {
//       // Khi frontend gọi /api, Vite sẽ chuyển sang backend
//       '/api': {
//         target: 'http://localhost:8080', // backend của bạn
//         changeOrigin: true,
//         rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
//       },
//     },
//   },
// });

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // 🆕 XÓA HOẶC SỬA REWRITE
        // rewrite: (path) => path.replace(/^\/api/, '/api'), // Giữ nguyên
        // Hoặc đơn giản xóa dòng rewrite
      },
    },
  },
});