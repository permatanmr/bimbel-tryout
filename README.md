# Latihan Soal

Jalankan: `npm install && npm run dev` (produksi: `npm run build && npm start`).

## Menambah paket ujian
Setiap paket = satu folder di `paket/<slug>/`. Aplikasi memindai folder ini
tiap permintaan, jadi paket baru muncul tanpa rebuild/restart.

### Cara 1: dari Excel + zip gambar
```
python3 scripts/import_paket.py paket-2 bank_soal.xlsx gambar.zip --judul "Paket 2" --durasi 60
```

### Cara 2: manual
```
paket/paket-2/
  soal.json
  gambar/soal_01.png ...
```
`soal.json` (objek, semua meta opsional):
```json
{
  "judul": "Paket 2",
  "deskripsi": "…",
  "durasi_menit": 60,
  "soal": [
    {"no": 1, "soal": "…", "gambar": "soal_01.png",
     "pilihan": {"A": "…", "B": "…", "C": "…", "D": "…", "E": "…"},
     "jawaban": "B", "penjelasan": "…"}
  ]
}
```
Boleh juga berupa array soal langsung, atau memakai kolom `pilihan_a`..`pilihan_e`.
`gambar` boleh nama file di `gambar/`, atau URL (`https://…` / `/path`). Jumlah pilihan bebas (2–5).
Paket tanpa `durasi_menit` tidak memakai timer.
Secara default jawaban & pembahasan disembunyikan saat mengerjakan (mode ujian) dan baru terbuka setelah Selesai. `"tampilkan_jawaban": true` di `soal.json` menyalakan opsi "Tampilkan jawaban & pembahasan langsung" secara default untuk paket itu. Pengguna tetap bisa mengubahnya di layar mulai.
