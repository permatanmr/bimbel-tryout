import Link from "next/link";
import { listPaket } from "@/lib/paket";
import PaketList from "@/components/PaketList";

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
      {paket.length > 0 && (
        <PaketList
          paket={paket.map(({ slug, judul, deskripsi, durasiMenit, soal }) => ({
            slug,
            judul,
            deskripsi,
            durasiMenit,
            jumlahSoal: soal.length,
          }))}
        />
      )}
    </main>
  );
}
