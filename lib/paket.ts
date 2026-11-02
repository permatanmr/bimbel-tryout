import fs from "fs";
import path from "path";

export type Soal = {
  no: number;
  soal: string;
  gambar: string | null; // URL siap pakai
  pilihan: Record<string, string>;
  jawaban: string;
  penjelasan: string;
};

export type Paket = {
  slug: string;
  judul: string;
  deskripsi: string;
  durasiMenit: number | null;
  tampilkanJawaban: boolean; // default untuk opsi 'tampilkan jawaban langsung'
  soal: Soal[];
};

const ROOT = path.join(process.cwd(), "paket");

function normalisasi(slug: string, raw: any): Paket | null {
  const arr = Array.isArray(raw) ? raw : raw?.soal;
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const meta = Array.isArray(raw) ? {} : raw;
  const soal: Soal[] = arr.map((s: any, i: number) => {
    const pilihan: Record<string, string> = {};
    if (s.pilihan && typeof s.pilihan === "object") {
      Object.entries(s.pilihan).forEach(([k, v]) => v != null && v !== "" && (pilihan[k.toUpperCase()] = String(v)));
    } else {
      for (const k of ["a", "b", "c", "d", "e"]) {
        const v = s[`pilihan_${k}`];
        if (v != null && v !== "") pilihan[k.toUpperCase()] = String(v);
      }
    }
    const g = s.gambar ? String(s.gambar) : null;
    return {
      no: s.no ?? i + 1,
      soal: String(s.soal ?? ""),
      gambar: g ? (/^(https?:)?\//.test(g) ? g : `/gambar/${slug}/${encodeURIComponent(g)}`) : null,
      pilihan,
      jawaban: String(s.jawaban ?? "").trim().toUpperCase(),
      penjelasan: String(s.penjelasan ?? ""),
    };
  });
  return {
    slug,
    judul: meta.judul || slug,
    deskripsi: meta.deskripsi || "",
    durasiMenit: meta.durasi_menit ? Number(meta.durasi_menit) : null,
    tampilkanJawaban: meta.tampilkan_jawaban === true,
    soal,
  };
}

export function listPaket(): Paket[] {
  if (!fs.existsSync(ROOT)) return [];
  return fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => getPaket(d.name))
    .filter((p): p is Paket => !!p)
    .sort((a, b) => a.judul.localeCompare(b.judul, "id", { numeric: true }));
}

export function getPaket(slug: string): Paket | null {
  if (!/^[a-zA-Z0-9_-]+$/.test(slug)) return null;
  const file = path.join(ROOT, slug, "soal.json");
  if (!fs.existsSync(file)) return null;
  try {
    return normalisasi(slug, JSON.parse(fs.readFileSync(file, "utf-8")));
  } catch {
    return null;
  }
}
