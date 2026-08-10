# Kupon Generator React

Aplikasi React + Vite untuk membuat kupon/label konsumsi secara otomatis.

## Fitur

- Pilih tanggal.
- Input label kupon.
- Input jumlah kupon, 1-10.000.
- Input nilai gizi: energi, protein, lemak, karbohidrat, serat.
- Generate kode kupon unik secara otomatis.
- Nomor kupon otomatis 000001, 000002, dst.
- Preview seluruh kupon.
- Print langsung ke A4 melalui dialog print browser.
- Pilihan "Save as PDF" tersedia dari dialog print Chrome/Edge.
- Storage offline menggunakan IndexedDB.
- Riwayat generate dapat dibuka kembali dan dihapus.
- Pencarian riwayat.
- Tidak membutuhkan backend/database.

## Menjalankan

```bash
npm install
npm run dev
```

Aplikasi akan tersedia di:

http://127.0.0.1:20128

## Build production

```bash
npm run build
npm run preview
```

## Catatan cetak

Klik `Print A4` atau `Print / PDF`, kemudian pada dialog browser:
- Paper: A4
- Orientation: Portrait
- Margins: Default/None sesuai kebutuhan
- Scale: 100%
- Destination: Printer atau Save to PDF

## Storage

Data disimpan di IndexedDB browser dengan database:

`kupon-generator-db`

Jadi aplikasi dapat berjalan tanpa server database. Data hanya tersimpan pada browser/perangkat yang digunakan.

## Catatan QR

Versi dasar ini menampilkan area kode visual sebagai placeholder. Untuk QR Code yang benar-benar dapat discan, tambahkan library QR seperti `qrcode.react` lalu render QR berdasarkan `coupon.code`.
