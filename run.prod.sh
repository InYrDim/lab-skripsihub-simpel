#!/bin/bash
# run docker-compose.prod.yml

echo "Menjalankan SkripsiHub Production Environment..."

# Pastikan file .env tersedia
if [ ! -f .env ]; then
  echo "Error: File .env tidak ditemukan di root directory. Silakan buat berdasarkan .env.example atau referensi yang ada."
  exit 1
fi

# Build dan jalankan container di background
docker-compose -f docker-compose.prod.yml --env-file .env up -d --build

echo "Deployment berhasil. Container sedang berjalan."
