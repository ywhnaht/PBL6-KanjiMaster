# --- Stage 1: Build React App ---
  FROM node:20-alpine as builder

  WORKDIR /app
  
  # Copy package.json trước để tận dụng cache của Docker
  COPY package*.json ./
  
  # Cài đặt dependencies
  RUN npm install
  
  # Copy toàn bộ code vào
  COPY . .
  
  # Build dự án (Tạo ra thư mục dist chuẩn production)
  RUN npm run build
  
  # --- Stage 2: Serve with Nginx ---
  FROM nginx:alpine
  
  # Xóa config mặc định của Nginx
  RUN rm /etc/nginx/conf.d/default.conf
  
  # Copy file build từ Stage 1 sang thư mục của Nginx
  COPY --from=builder /app/dist /usr/share/nginx/html
  
  # Copy file cấu hình Nginx riêng của bạn (nếu có)
  COPY nginx.conf /etc/nginx/conf.d/default.conf
  
  EXPOSE 80
  
  CMD ["nginx", "-g", "daemon off;"]