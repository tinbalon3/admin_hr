# Sử dụng Node phiên bản 23.6
FROM node:23.6

# Đặt thư mục làm việc trong container
WORKDIR /app

# Copy file package.json và package-lock.json (nếu có) để cài đặt dependencies
COPY package*.json ./

# Cài đặt Angular CLI toàn cục (nếu chưa có trong package.json)
RUN npm install -g @angular/cli

# Cài đặt các package cần thiết cho dự án Angular
RUN npm install

# Copy toàn bộ mã nguồn của dự án vào container
COPY . .

# Expose cổng 4200 để truy cập ứng dụng
EXPOSE 4200

# Chạy ứng dụng Angular với Angular CLI
CMD ["ng", "serve", "--host", "0.0.0.0"]
