# Pakuwon Surplus — Full-Stack Functional Prototype

Prototype Node.js + Express dengan front-end responsive modern.

## Fitur
- Home modern dengan auto carousel.
- Katalog produk + filter kategori + search + sorting.
- Halaman detail produk.
- Keranjang dengan quantity dan local persistence.
- Checkout pickup / courier demo.
- Backend order API.
- QRIS demo dinamis per order (pakai package `qrcode`).
- Simulasi pembayaran + riwayat order.
- Login / sign-up demo tanpa database (profil disimpan di browser/localStorage).
- Geolocation browser + hitung jarak ke Pakuwon Mall.
- Responsive desktop dan mobile.
- Tenant directory demo berdasarkan nama tenant yang tampil di direktori resmi Pakuwon Mall.

## Jalankan lokal
1. Install Node.js 18+.
2. Buka terminal di folder ini.
3. `npm install`
4. `npm start`
5. Buka `http://localhost:3000`

## Deploy
Cocok untuk Render / Railway / Fly.io / VPS:
- Build command: `npm install`
- Start command: `npm start`
- Port mengikuti environment variable `PORT`.

## Catatan penting
- Produk, stok, harga, diskon, dan status surplus adalah DATA DEMO/ILUSTRATIF, bukan penawaran live tenant.
- Login bukan autentikasi production; tidak ada database dan jangan memakai password asli.
- QR adalah QRIS-style DEMO dan tidak terhubung payment gateway.
- Agar production, ganti mock auth dengan Supabase/Firebase/Auth0 dan payment dengan gateway QRIS resmi.

## Update v2
- Semua ikon emoji utama diganti line icon SVG / CSS illustration.
- Cart icon diperbarui.
- Dropdown `v` pada lokasi dihapus.
- Lokasi GPS diganti Address Book ala e-commerce: tambah/edit/hapus/pilih alamat, tersimpan di localStorage.
- Checkout bisa memilih Pickup atau Delivery ke alamat terpilih.
- Setiap kartu tenant di Home bisa diklik ke halaman brand masing-masing.
- Halaman brand menampilkan seluruh produk tenant tersebut; tenant tanpa listing menampilkan empty state.

## Update v2.2
- Login / sign-up sekarang wajib sebelum menambahkan produk ke keranjang, membeli langsung, membuka keranjang, atau checkout.
- Setelah user selesai login, aksi yang sebelumnya dipilih otomatis dilanjutkan.
- Product cards sekarang menampilkan brand wordmark/logo-style badge.
- Tenant directory sekarang memakai brand identity yang lebih visual.
- Brand page memiliki brand logo plaque di header.
- Emoji box/cart yang tersisa diganti SVG line icons.
