import Link from "next/link";
import { listPaket } from "@/lib/paket";

export const dynamic = "force-dynamic";

export default function Home() {
  const paket = listPaket();
  return (
    <main className="wrap">
      <h1>Latihan Soal</h1>
      <p className="muted">Pilih paket ujian.</p>
      {paket.length === 0 && (
        <div className="card">
          Belum ada paket. Tambahkan folder di <code>paket/&lt;nama&gt;/</code> berisi <code>soal.json</code>,
          atau jalankan <code>python3 scripts/import_paket.py</code>.
        </div>
      )}
      <div className="grid">
        {paket.map((p) => (
          <Link key={p.slug} href={`/paket/${p.slug}`} className="card pk">
            <h2>{p.judul}</h2>
            {p.deskripsi && <p className="muted">{p.deskripsi}</p>}
            <div className="meta">
              {p.soal.length} soal{p.durasiMenit ? ` · ${p.durasiMenit} menit` : ""}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
