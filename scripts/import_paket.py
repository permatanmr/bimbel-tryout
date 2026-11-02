#!/usr/bin/env python3
"""Buat/ganti paket ujian dari xlsx (+ zip gambar opsional).

Pemakaian:
  python3 scripts/import_paket.py <slug> <bank_soal.xlsx> [gambar.zip] \
      [--judul "Judul"] [--deskripsi "..."] [--durasi 60]

Hasil: paket/<slug>/soal.json dan paket/<slug>/gambar/*
Kolom xlsx: no, soal, gambar, pilihan_a..pilihan_e, jawaban_benar, penjelasan
(pilihan_e opsional; pilihan kosong diabaikan).
Tanpa xlsx: cukup buat folder & soal.json sendiri, format di README.md.
"""
import argparse, json, os, re, shutil, zipfile
import openpyxl

ap = argparse.ArgumentParser()
ap.add_argument("slug")
ap.add_argument("xlsx")
ap.add_argument("zip", nargs="?")
ap.add_argument("--judul")
ap.add_argument("--deskripsi", default="")
ap.add_argument("--durasi", type=int)
a = ap.parse_args()

if not re.fullmatch(r"[A-Za-z0-9_-]+", a.slug):
    raise SystemExit("slug hanya boleh huruf, angka, - dan _")

root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "paket", a.slug)
os.makedirs(os.path.join(root, "gambar"), exist_ok=True)

ws = openpyxl.load_workbook(a.xlsx).active
head = [str(c.value).strip().lower() if c.value else "" for c in ws[1]]
col = {h: i for i, h in enumerate(head)}

def get(r, k):
    i = col.get(k)
    return r[i] if i is not None and i < len(r) else None

soal = []
for r in ws.iter_rows(min_row=2, values_only=True):
    if get(r, "soal") is None:
        continue
    pil = {k.upper(): str(get(r, f"pilihan_{k}")) for k in "abcde" if get(r, f"pilihan_{k}") not in (None, "")}
    soal.append(dict(
        no=get(r, "no") or len(soal) + 1,
        soal=str(get(r, "soal")),
        gambar=get(r, "gambar") or None,
        pilihan=pil,
        jawaban=str(get(r, "jawaban_benar") or get(r, "jawaban") or "").strip().upper(),
        penjelasan=str(get(r, "penjelasan") or ""),
    ))

if a.zip:
    with zipfile.ZipFile(a.zip) as z:
        for n in z.namelist():
            if n.endswith("/") or n.startswith("__MACOSX"):
                continue
            with z.open(n) as src, open(os.path.join(root, "gambar", os.path.basename(n)), "wb") as dst:
                shutil.copyfileobj(src, dst)

missing = [s["gambar"] for s in soal if s["gambar"] and not os.path.exists(os.path.join(root, "gambar", s["gambar"]))]
bad = [s["no"] for s in soal if s["jawaban"] not in s["pilihan"]]

json.dump(dict(judul=a.judul or a.slug, deskripsi=a.deskripsi, durasi_menit=a.durasi, soal=soal),
          open(os.path.join(root, "soal.json"), "w"), ensure_ascii=False, indent=2)
print(f"{len(soal)} soal -> paket/{a.slug}/soal.json")
if missing: print("PERINGATAN gambar tidak ditemukan:", missing)
if bad: print("PERINGATAN jawaban tidak cocok dengan pilihan, soal no:", bad)
