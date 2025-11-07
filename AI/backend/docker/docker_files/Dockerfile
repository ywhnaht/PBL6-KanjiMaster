# Dockerfile for Django API
FROM python:3.10

# Không ghi cache bytecode, output không buffer
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

# Cài đặt các dependency cơ bản
RUN apt-get update && \
    apt-get install -y netcat-openbsd gettext && \
    rm -rf /var/lib/apt/lists/*

# Tạo thư mục code trong container
RUN mkdir /code

# COPY chỉ copy backend vào /code
COPY . /code/

# Chọn WORKDIR
WORKDIR /code

# Cài pip và các requirements
RUN python -m pip install --upgrade pip && \
    python -m pip install -r requirements.txt

# Thêm quyền thực thi cho entrypoint
RUN chmod +x docker/entrypoints/entrypoint.sh

# Mở port
EXPOSE 8000

# ENTRYPOINT
ENTRYPOINT ["./docker/entrypoints/entrypoint.sh"]
