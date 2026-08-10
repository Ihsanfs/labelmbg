import React, { useEffect, useMemo, useState } from "react";
import { Printer, Trash2, Save, RotateCcw, Database, Ticket, Search } from "lucide-react";
import CouponCard from "./components/CouponCard";
import {
  clearGenerations,
  deleteGeneration,
  getGenerations,
  saveGeneration
} from "./lib/storage";
import { generateCoupons, formatDateID } from "./lib/coupon";

const EMPTY_FORM = {
  label: "PROGRAM MBG",
  menuName: "1. Nasi Putih Sehat\n2. Ayam Crispy Gurih\n3. Melon Segar\n4. Susu UHT",
  date: new Date().toISOString().slice(0, 10),
  quantity: 10,
  showCode: true,
  showNumbering: true,
  showFooterNumber: false,
  energy: "",
  protein: "",
  fat: "",
  carbs: "",
  fiber: ""
};

function normalizeNutrition(form) {
  return {
    energy: form.energy || "0",
    protein: form.protein || "0",
    fat: form.fat || "0",
    carbs: form.carbs || "0",
    fiber: form.fiber || "0"
  };
}

export default function App() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [coupons, setCoupons] = useState([]);
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [targetCount, setTargetCount] = useState(0);

  useEffect(() => {
    getGenerations().then((items) => {
      setHistory(items.sort((a, b) => b.createdAt - a.createdAt));
    });
  }, []);

  const filteredHistory = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return history;
    return history.filter((x) =>
      `${x.label} ${x.menuName || ""} ${x.date} ${x.quantity}`.toLowerCase().includes(q)
    );
  }, [history, search]);

  function change(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  const CHUNK_SIZE = 100;

  function loadCouponsInChunks(allCoupons) {
    setLoading(true);
    setProgress(0);
    setTargetCount(allCoupons.length);
    setCoupons([]);

    let index = 0;

    function nextChunk() {
      const nextIndex = Math.min(index + CHUNK_SIZE, allCoupons.length);
      const chunk = allCoupons.slice(0, nextIndex);

      setCoupons(chunk);
      index = nextIndex;

      const currentProgress = Math.round((index / allCoupons.length) * 100);
      setProgress(currentProgress);

      if (index < allCoupons.length) {
        setTimeout(nextChunk, 30);
      } else {
        setLoading(false);
        setTimeout(() => setProgress(null), 1000);
      }
    }

    nextChunk();
  }

  async function handleGenerate(e) {
    e.preventDefault();

    const quantity = Number(form.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000) {
      alert("Jumlah label harus 1 sampai 10.000.");
      return;
    }
    if (!form.label.trim()) {
      alert("Label wajib diisi.");
      return;
    }
    if (!form.menuName || !form.menuName.trim()) {
      alert("Nama menu wajib diisi.");
      return;
    }
    if (!form.date) {
      alert("Tanggal wajib dipilih.");
      return;
    }

    setLoading(true);
    try {
      const rawCoupons = generateCoupons({
        quantity,
        label: form.label.trim(),
        menuName: form.menuName.trim(),
        date: form.date,
        showCode: form.showCode,
        showNumbering: form.showNumbering,
        showFooterNumber: form.showFooterNumber,
        nutrition: normalizeNutrition(form)
      });

      const generated = rawCoupons.map((coupon) => ({
        ...coupon,
        dateLabel: formatDateID(form.date)
      }));

      const record = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        label: form.label.trim(),
        menuName: form.menuName.trim(),
        date: form.date,
        quantity,
        showCode: form.showCode,
        showNumbering: form.showNumbering,
        nutrition: normalizeNutrition(form),
        coupons: generated
      };

      await saveGeneration(record);
      setHistory((prev) => [record, ...prev]);
      loadCouponsInChunks(generated);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setCoupons([]);
  }

  function printCoupons() {
    if (!coupons.length) {
      alert("Generate label terlebih dahulu.");
      return;
    }
    window.print();
  }

  async function loadGeneration(record) {
    setForm({
      label: record.label,
      menuName: record.menuName || "",
      date: record.date,
      quantity: record.quantity,
      showCode: record.showCode !== undefined ? record.showCode : true,
      showNumbering: record.showNumbering !== undefined ? record.showNumbering : true,
      energy: record.nutrition.energy,
      protein: record.nutrition.protein,
      fat: record.nutrition.fat,
      carbs: record.nutrition.carbs,
      fiber: record.nutrition.fiber
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
    loadCouponsInChunks(record.coupons);
  }

  async function removeGeneration(id) {
    if (!confirm("Hapus riwayat generate ini?")) return;
    await deleteGeneration(id);
    setHistory((prev) => prev.filter((x) => x.id !== id));
  }

  async function removeAll() {
    if (!history.length) return;
    if (!confirm("Hapus seluruh riwayat yang tersimpan di browser?")) return;
    await clearGenerations();
    setHistory([]);
  }

  return (
    <div className="app">
      <header className="topbar no-print">
        <div className="brand">
          <div className="brand-icon"><Ticket size={22} /></div>
          <div>
            <h1>Label Generator</h1>
            <p>Generate label konsumsi otomatis</p>
          </div>
        </div>
        <div className="top-actions">
          <button className="btn secondary" onClick={resetForm}>
            <RotateCcw size={17} /> Reset
          </button>
          <button className="btn primary" onClick={printCoupons} disabled={!coupons.length}>
            <Printer size={17} /> Print A4
          </button>
        </div>
      </header>

      <main className="container">
        <section className="panel no-print">
          <div className="panel-title">
            <div>
              <h2>Input & Generate</h2>
              <p>Isi data di bawah, lalu tentukan jumlah label yang akan dibuat.</p>
            </div>
          </div>

          <form onSubmit={handleGenerate}>
            <div className="form-grid">
              <label className="field field-wide">
                <span>Label</span>
                <input
                  value={form.label}
                  onChange={(e) => change("label", e.target.value)}
                  placeholder="Contoh: PROGRAM MBG"
                  required
                />
              </label>

              <label className="field">
                <span>Tanggal</span>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => change("date", e.target.value)}
                  required
                />
              </label>

              <label className="field">
                <span>Jumlah Label</span>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={form.quantity}
                  onChange={(e) => change("quantity", e.target.value)}
                  required
                />
              </label>

              <label className="field field-full">
                <span>Nama Menu (Gunakan tombol Enter untuk membuat baris baru/daftar)</span>
                <textarea
                  value={form.menuName}
                  onChange={(e) => change("menuName", e.target.value)}
                  placeholder="Contoh:&#10;1. Nasi Putih&#10;2. Ayam Goreng&#10;3. Buah Pisang"
                  rows={4}
                  required
                />
              </label>

              <label className="checkbox-field field-full">
                <input
                  type="checkbox"
                  checked={form.showCode}
                  onChange={(e) => change("showCode", e.target.checked)}
                />
                <span>Tampilkan Kode Label & QR</span>
              </label>

              <label className="checkbox-field field-full">
                <input
                  type="checkbox"
                  checked={form.showNumbering}
                  onChange={(e) => change("showNumbering", e.target.checked)}
                />
                <span>Tampilkan Penomoran Label</span>
              </label>
            </div>

            <div className="section-caption">Informasi Nilai Gizi</div>

            <div className="nutrition-inputs">
              <label className="field"><span>Energi (kcal)</span><input type="number" min="0" step="0.01" value={form.energy} onChange={(e) => change("energy", e.target.value)} placeholder="Contoh: 450" /></label>
              <label className="field"><span>Protein (g)</span><input type="number" min="0" step="0.01" value={form.protein} onChange={(e) => change("protein", e.target.value)} placeholder="Contoh: 20" /></label>
              <label className="field"><span>Lemak (g)</span><input type="number" min="0" step="0.01" value={form.fat} onChange={(e) => change("fat", e.target.value)} placeholder="Contoh: 15" /></label>
              <label className="field"><span>Karbohidrat (g)</span><input type="number" min="0" step="0.01" value={form.carbs} onChange={(e) => change("carbs", e.target.value)} placeholder="Contoh: 60" /></label>
              <label className="field"><span>Serat (g)</span><input type="number" min="0" step="0.01" value={form.fiber} onChange={(e) => change("fiber", e.target.value)} placeholder="Contoh: 8" /></label>
            </div>

            <div className="generate-bar">
              <div className="quantity-info">
                <strong>{Number(form.quantity || 0).toLocaleString("id-ID")}</strong>
                <span>label akan digenerate</span>
              </div>
              <button className="btn primary large" type="submit" disabled={loading}>
                <Save size={18} />
                {loading ? "Generating..." : "Generate Label"}
              </button>
            </div>
          </form>
        </section>

        <section className="preview-header no-print">
          <div>
            <h2>Preview Label</h2>
            <p>{coupons.length ? `${coupons.length.toLocaleString("id-ID")} label siap dicetak.` : "Belum ada label yang digenerate."}</p>
          </div>
          {coupons.length > 0 && (
            <button className="btn primary" onClick={printCoupons}><Printer size={17} /> Print / PDF</button>
          )}
        </section>

        <section className="print-sheet">
          {coupons.length ? coupons.map((coupon, i) => (
            <CouponCard key={coupon.id} coupon={coupon} index={i + 1} />
          )) : (
            <div className="empty-preview no-print">
              <Ticket size={42} />
              <h3>Preview masih kosong</h3>
              <p>Isi form kemudian klik <b>Generate Label</b>.</p>
            </div>
          )}
        </section>

        <section className="panel history-panel no-print">
          <div className="history-head">
            <div>
              <h2><Database size={20} /> Storage / Riwayat</h2>
              <p>Data tersimpan di browser menggunakan IndexedDB, sehingga tetap tersedia setelah halaman direfresh.</p>
            </div>
            <button className="btn danger-outline" onClick={removeAll}><Trash2 size={16} /> Hapus Semua</button>
          </div>

          <div className="search-box">
            <Search size={17} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari label, tanggal, atau jumlah..." />
          </div>

          <div className="history-list">
            {filteredHistory.length ? filteredHistory.map((item) => (
              <div className="history-item" key={item.id}>
                <div>
                  <strong>{item.label}{item.menuName ? ` - ${item.menuName}` : ""}</strong>
                  <span>{formatDateID(item.date)} · {item.quantity.toLocaleString("id-ID")} label</span>
                </div>
                <div className="history-actions">
                  <button className="btn secondary small" onClick={() => loadGeneration(item)}>Buka</button>
                  <button className="icon-btn danger" title="Hapus" onClick={() => removeGeneration(item.id)}><Trash2 size={16} /></button>
                </div>
              </div>
            )) : <div className="history-empty">Belum ada data tersimpan.</div>}
          </div>
        </section>
      </main>

      {progress !== null && (
        <div className="progress-overlay no-print">
          <div className="progress-card">
            <h3>Memproses Label</h3>
            <p>Harap tunggu, sedang menyiapkan {coupons.length} dari {targetCount} label...</p>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="progress-percentage">{progress}%</div>
            {progress === 100 && <div className="progress-complete-msg">100% Selesai!</div>}
          </div>
        </div>
      )}
    </div>
  );
}