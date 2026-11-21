"use client";

import { useState } from "react";
import Link from "next/link";

type PaketRingkas = {
  slug: string;
  judul: string;
  deskripsi: string;
  durasiMenit: number | null;
  jumlahSoal: number;
};

export default function PaketList({ paket }: { paket: PaketRingkas[] }) {
  const [query, setQuery] = useState("");
  const hasil = paket.filter((p) => p.judul.toLocaleLowerCase("id").includes(query.trim().toLocaleLowerCase("id")));

  return (
    <>
      <label className="search-label" htmlFor="search-paket">Cari nama ujian</label>
      <input
        id="search-paket"
        className="search-input"
        type="search"
        placeholder="Ketik judul paket ujian..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {hasil.length > 0 ? (
        <div className="grid">
          {hasil.map((p) => (
            <Link key={p.slug} href={`/paket/${p.slug}`} className="card pk">
              <h2>{p.judul}</h2>
              {p.deskripsi && <p className="muted">{p.deskripsi}</p>}
              <div className="meta">
                {p.jumlahSoal} soal{p.durasiMenit ? ` · ${p.durasiMenit} menit` : ""}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="muted" role="status">Tidak ada paket ujian dengan judul “{query}”.</p>
      )}
    </>
  );
}