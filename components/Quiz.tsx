"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Paket, Soal } from "@/lib/paket";

type Key = string;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  return `${m}:${String(sec % 60).padStart(2, "0")}`;
}

export default function Quiz({ paket }: { paket: Paket }) {
  const soal = paket.soal;
  const [sisa, setSisa] = useState<number | null>(null);
  const [started, setStarted] = useState(false);
  const [acak, setAcak] = useState(false);
  const [langsung, setLangsung] = useState(paket.tampilkanJawaban);
  const [finished, setFinished] = useState(false);
  const [order, setOrder] = useState<Soal[]>(soal);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Key>>({});
  const [done, setDone] = useState(false);

  const q = order[idx];
  const picked = q ? answers[q.no] : undefined;
  const reveal = langsung || finished;
  const answeredCount = Object.keys(answers).length;
  const score = useMemo(
    () => order.filter((s) => answers[s.no] === s.jawaban).length,
    [order, answers]
  );

  useEffect(() => {
    if (!started || done || sisa === null) return;
    if (sisa <= 0) { setFinished(true); setDone(true); return; }
    const t = setTimeout(() => setSisa((x) => (x === null ? x : x - 1)), 1000);
    return () => clearTimeout(t);
  }, [started, done, sisa]);

  function start() {
    setSisa(paket.durasiMenit ? paket.durasiMenit * 60 : null);
    setOrder(acak ? shuffle(soal) : soal);
    setAnswers({});
    setIdx(0);
    setDone(false);
    setFinished(false);
    setStarted(true);
  }

  if (!started) {
    return (
      <main className="wrap">
        <div className="card center">
          <h1>{paket.judul}</h1>
          {paket.deskripsi && <p className="muted">{paket.deskripsi}</p>}
          <p className="muted">{soal.length} soal{paket.durasiMenit ? ` · waktu ${paket.durasiMenit} menit` : ""}</p>
          <label className="check">
            <input type="checkbox" checked={acak} onChange={(e) => setAcak(e.target.checked)} />
            Acak urutan soal
          </label>
          <label className="check">
            <input type="checkbox" checked={langsung} onChange={(e) => setLangsung(e.target.checked)} />
            Tampilkan jawaban &amp; pembahasan langsung
          </label>
          <div className="row center">
            <Link href="/" className="btn">← Daftar Paket</Link>
            <button className="btn primary" onClick={start}>Mulai Latihan</button>
          </div>
        </div>
      </main>
    );
  }

  if (done) {
    const pct = Math.round((score / order.length) * 100);
    return (
      <main className="wrap">
        <div className="card">
          <h1 className="center">Hasil Latihan</h1>
          <div className="score center">
            <span className="big">{score}</span> / {order.length}
            <div className="muted">Nilai {pct}</div>
          </div>
          <ul className="review">
            {order.map((s, i) => {
              const a = answers[s.no];
              const ok = a === s.jawaban;
              return (
                <li key={s.no}>
                  <button
                    className={`chip ${a === undefined ? "skip" : ok ? "ok" : "bad"}`}
                    onClick={() => { setIdx(i); setDone(false); }}
                    title="Tinjau soal"
                  >
                    {i + 1}
                  </button>
                  <span className="muted">
                    {a === undefined ? "Belum dijawab" : ok ? "Benar" : `Salah (jawabanmu ${a}, benar ${s.jawaban})`}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="row center">
            <Link href="/" className="btn">Daftar Paket</Link>
            <button className="btn primary" onClick={start}>Ulangi</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="wrap">
      <div className="top">
        <span>Soal {idx + 1} / {order.length}</span>
        <span className="muted">{sisa !== null ? `⏱ ${fmt(sisa)} · ` : ""}Terjawab {answeredCount}</span>
      </div>
      <div className="bar"><div style={{ width: `${((idx + 1) / order.length) * 100}%` }} /></div>

      <div className="card">
        <p className="soal">{q.soal}</p>
        {q.gambar && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="gambar" src={q.gambar} alt={`Gambar soal ${q.no}`} />
        )}

        <div className="opts">
          {Object.keys(q.pilihan).map((k) => {
            let cls = "opt";
            if (picked && reveal) {
              if (k === q.jawaban) cls += " correct";
              else if (k === picked) cls += " wrong";
            } else if (picked === k) cls += " chosen";
            return (
              <button
                key={k}
                className={cls}
                disabled={reveal && !!picked}
                onClick={() => setAnswers((a) => ({ ...a, [q.no]: k }))}
              >
                <b>{k}</b>
                <span>{q.pilihan[k]}</span>
              </button>
            );
          })}
        </div>

        {picked && reveal && (
          <div className={`expl ${picked === q.jawaban ? "ok" : "bad"}`}>
            <strong>{picked === q.jawaban ? "Benar!" : `Kurang tepat. Jawaban benar: ${q.jawaban}`}</strong>
            <p>{q.penjelasan}</p>
          </div>
        )}
      </div>

      <div className="row between">
        <button className="btn" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>← Sebelumnya</button>
        {idx < order.length - 1 ? (
          <button className="btn primary" onClick={() => setIdx(idx + 1)}>Berikutnya →</button>
        ) : (
          <button className="btn primary" onClick={() => { setFinished(true); setDone(true); }}>Selesai</button>
        )}
      </div>
    </main>
  );
}
