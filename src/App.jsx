import React, { useEffect, useMemo, useState } from "react";
import { Printer, Trash2, Save, RotateCcw, Database, Ticket, Search, Upload, CheckSquare, Square, Palette, Image as ImageIcon, Clock } from "lucide-react";
import CouponCard from "./components/CouponCard";
import {
  clearGenerations,
  deleteGeneration,
  getGenerations,
  saveGeneration
} from "./lib/storage";
import { generateCoupons, formatDateID } from "./lib/coupon";

const DEFAULT_DISPLAY_OPTIONS = {
  showLogo: true,
  showLabel: true,
  showDate: true,
  showBatch: true,
  showExp: true,
  showPrice: true,
  showNotes: true,
  showMenu: true,
  showNutrition: true,
  showCode: true,
  showNumbering: true,
  showFooterText: true,
  showFooterNumber: false
};

const EMPTY_FORM = {
  label: "NAMA SPPG",
  batch: "Batch 01",
  expStartTime: "08:00",
  expEndTime: "12:00",
  price: "",
  notes: "",
  logoUrl: "",
  theme: "blue",
  menuName: "1. Nasi Putih Sehat\n2. Ayam Crispy Gurih\n3. Melon Segar\n4. Susu UHT",
  date: new Date().toISOString().slice(0, 10),
  quantity: 10,
  displayOptions: { ...DEFAULT_DISPLAY_OPTIONS },
  energy: "",
  protein: "",
  fat: "",
  carbs: "",
  fiber: ""
};

const THEMES = [
  { id: "blue", name: "Ocean Blue", color: "#2563eb" },
  { id: "emerald", name: "Emerald Green", color: "#059669" },
  { id: "purple", name: "Royal Purple", color: "#7c3aed" },
  { id: "amber", name: "Sunset Amber", color: "#d97706" },
  { id: "ruby", name: "Ruby Red", color: "#dc2626" },
  { id: "monochrome", name: "Sleek Dark", color: "#27272a" }
];

function normalizeNutrition(form) {
  return {
    energy: form.energy || "0",
    protein: form.protein || "0",
    fat: form.fat || "0",
    carbs: form.carbs || "0",
    fiber: form.fiber || "0"
  };
}

function formatExpTime(startTime, endTime) {
  if (startTime && endTime) {
    return `${startTime} - ${endTime} WIB`;
  }
  if (startTime) return `${startTime} WIB`;
  if (endTime) return `${endTime} WIB`;
  return "";
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
      `${x.label || ""} ${x.menuName || ""} ${x.date || ""} ${x.quantity}`.toLowerCase().includes(q)
    );
  }, [history, search]);

  function change(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function toggleDisplay(key, value) {
    setForm((prev) => ({
      ...prev,
      displayOptions: {
        ...prev.displayOptions,
        [key]: value
      }
    }));
  }

  function checkAllDisplay() {
    setForm((prev) => ({
      ...prev,
      displayOptions: {
        showLogo: true,
        showLabel: true,
        showDate: true,
        showBatch: true,
        showExp: true,
        showPrice: true,
        showNotes: true,
        showMenu: true,
        showNutrition: true,
        showCode: true,
        showNumbering: true,
        showFooterText: true,
        showFooterNumber: true
      }
    }));
  }

  function uncheckAllDisplay() {
    setForm((prev) => ({
      ...prev,
      displayOptions: {
        showLogo: false,
        showLabel: false,
        showDate: false,
        showBatch: false,
        showExp: false,
        showPrice: false,
        showNotes: false,
        showMenu: false,
        showNutrition: false,
        showCode: false,
        showNumbering: false,
        showFooterText: false,
        showFooterNumber: false
      }
    }));
  }

  function handleLogoUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran gambar logo maksimal 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setForm((prev) => ({ ...prev, logoUrl: event.target.result }));
    };
    reader.readAsDataURL(file);
  }

  function removeLogo() {
    setForm((prev) => ({ ...prev, logoUrl: "" }));
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

    const expString = formatExpTime(form.expStartTime, form.expEndTime);

    setLoading(true);
    try {
      const rawCoupons = generateCoupons({
        quantity,
        label: (form.label || "").trim(),
        batch: (form.batch || "").trim(),
        exp: expString,
        price: (form.price || "").trim(),
        notes: (form.notes || "").trim(),
        menuName: (form.menuName || "").trim(),
        date: form.date || "",
        logoUrl: form.logoUrl || "",
        theme: form.theme || "blue",
        nutrition: normalizeNutrition(form),
        displayOptions: { ...form.displayOptions }
      });

      const generated = rawCoupons.map((coupon) => ({
        ...coupon,
        dateLabel: formatDateID(form.date)
      }));

      const record = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        label: (form.label || "").trim(),
        batch: (form.batch || "").trim(),
        expStartTime: form.expStartTime || "",
        expEndTime: form.expEndTime || "",
        exp: expString,
        price: (form.price || "").trim(),
        notes: (form.notes || "").trim(),
        menuName: (form.menuName || "").trim(),
        date: form.date || "",
        logoUrl: form.logoUrl || "",
        theme: form.theme || "blue",
        quantity,
        displayOptions: { ...form.displayOptions },
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
    setForm({
      ...EMPTY_FORM,
      displayOptions: { ...DEFAULT_DISPLAY_OPTIONS }
    });
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
      label: record.label || "",
      batch: record.batch || "",
      expStartTime: record.expStartTime || (record.exp ? record.exp.split(" - ")[0]?.replace(" WIB", "") : ""),
      expEndTime: record.expEndTime || (record.exp ? (record.exp.split(" - ")[1] || "").replace(" WIB", "") : ""),
      price: record.price || "",
      notes: record.notes || "",
      logoUrl: record.logoUrl || "",
      theme: record.theme || "blue",
      menuName: record.menuName || "",
      date: record.date || "",
      quantity: record.quantity || 10,
      displayOptions: record.displayOptions ? { ...record.displayOptions } : {
        ...DEFAULT_DISPLAY_OPTIONS,
        showCode: record.showCode !== undefined ? record.showCode : true,
        showNumbering: record.showNumbering !== undefined ? record.showNumbering : true
      },
      energy: record.nutrition?.energy || "",
      protein: record.nutrition?.protein || "",
      fat: record.nutrition?.fat || "",
      carbs: record.nutrition?.carbs || "",
      fiber: record.nutrition?.fiber || ""
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
            <p>Generate label informasi makanan otomatis</p>
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
              <p>Isi data atau kosongkan bagian yang tidak diperlukan, lalu tentukan opsi tampilan dan tema label.</p>
            </div>
          </div>

          <form onSubmit={handleGenerate}>
            <div className="form-grid">
              <label className="field">
                <span>Nama SPPG / Label</span>
                <input
                  value={form.label}
                  onChange={(e) => change("label", e.target.value)}
                  placeholder="Contoh: NAMA SPPG"
                />
              </label>

              <label className="field">
                <span>Batch Pengiriman</span>
                <input
                  value={form.batch}
                  onChange={(e) => change("batch", e.target.value)}
                  placeholder="Contoh: Batch 01"
                />
              </label>

              <label className="field">
                <span>Tanggal Produksi</span>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => change("date", e.target.value)}
                />
              </label>

              <label className="field">
                <span>Jam Awal Batas Konsumsi</span>
                <input
                  type="time"
                  value={form.expStartTime}
                  onChange={(e) => change("expStartTime", e.target.value)}
                />
              </label>

              <label className="field">
                <span>Jam Akhir Batas Konsumsi</span>
                <input
                  type="time"
                  value={form.expEndTime}
                  onChange={(e) => change("expEndTime", e.target.value)}
                />
              </label>

              <label className="field">
                <span>Harga</span>
                <input
                  value={form.price}
                  onChange={(e) => change("price", e.target.value)}
                  placeholder="Contoh: Rp 15.000"
                />
              </label>

              <label className="field field-full">
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

              <div className="field field-full logo-upload-field">
                <span><ImageIcon size={14} style={{ display: "inline", marginRight: 4 }} /> Upload Logo Label (PNG / JPG)</span>
                <div className="logo-upload-box">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    id="logo-file-input"
                    className="file-input-hidden"
                  />
                  <label htmlFor="logo-file-input" className="btn secondary small">
                    <Upload size={14} /> {form.logoUrl ? "Ganti Logo" : "Pilih File Logo"}
                  </label>
                  {form.logoUrl && (
                    <div className="logo-preview-badge">
                      <img src={form.logoUrl} alt="Preview Logo" />
                      <span>Logo Terpasang</span>
                      <button type="button" className="btn danger-outline small" onClick={removeLogo}>Hapus</button>
                    </div>
                  )}
                </div>
              </div>

              <label className="field field-full">
                <span>Nama Menu (Gunakan tombol Enter untuk membuat baris baru/daftar)</span>
                <textarea
                  value={form.menuName}
                  onChange={(e) => change("menuName", e.target.value)}
                  placeholder="Contoh:&#10;1. Nasi Putih&#10;2. Ayam Goreng&#10;3. Buah Pisang"
                  rows={4}
                />
              </label>

              <label className="field field-full">
                <span>Keterangan Lainnya / Catatan Khusus</span>
                <textarea
                  value={form.notes}
                  onChange={(e) => change("notes", e.target.value)}
                  placeholder="Contoh: Simpan di tempat sejuk. Best before 2 jam setelah diterima."
                  rows={2}
                />
              </label>
            </div>

            <div className="section-caption"><Palette size={16} style={{ display: "inline", marginRight: 6 }} /> Pilih Desain / Warna Label</div>

            <div className="theme-selector-grid">
              {THEMES.map((th) => (
                <button
                  type="button"
                  key={th.id}
                  className={`theme-badge ${form.theme === th.id ? "active" : ""}`}
                  onClick={() => change("theme", th.id)}
                >
                  <span className="theme-dot" style={{ backgroundColor: th.color }}></span>
                  {th.name}
                </button>
              ))}
            </div>

            <div className="section-caption-header">
              <div className="section-caption">Opsi Tampilan Data pada Label</div>
              <div className="master-toggle-buttons">
                <button type="button" className="btn secondary small" onClick={checkAllDisplay}>
                  <CheckSquare size={14} /> Centang Semua
                </button>
                <button type="button" className="btn secondary small" onClick={uncheckAllDisplay}>
                  <Square size={14} /> Hapus Centang
                </button>
              </div>
            </div>

            <div className="checkbox-options-grid">
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={form.displayOptions?.showLogo !== false}
                  onChange={(e) => toggleDisplay("showLogo", e.target.checked)}
                />
                <span>Tampilkan Logo</span>
              </label>

              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={form.displayOptions?.showLabel !== false}
                  onChange={(e) => toggleDisplay("showLabel", e.target.checked)}
                />
                <span>Tampilkan Nama SPPG</span>
              </label>

              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={form.displayOptions?.showDate !== false}
                  onChange={(e) => toggleDisplay("showDate", e.target.checked)}
                />
                <span>Tampilkan Tanggal Produksi</span>
              </label>

              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={form.displayOptions?.showBatch !== false}
                  onChange={(e) => toggleDisplay("showBatch", e.target.checked)}
                />
                <span>Tampilkan Batch Pengiriman</span>
              </label>

              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={form.displayOptions?.showExp !== false}
                  onChange={(e) => toggleDisplay("showExp", e.target.checked)}
                />
                <span>Tampilkan Jam Exp / Kadaluarsa</span>
              </label>

              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={form.displayOptions?.showPrice !== false}
                  onChange={(e) => toggleDisplay("showPrice", e.target.checked)}
                />
                <span>Tampilkan Harga</span>
              </label>

              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={form.displayOptions?.showNotes !== false}
                  onChange={(e) => toggleDisplay("showNotes", e.target.checked)}
                />
                <span>Tampilkan Keterangan Lainnya</span>
              </label>

              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={form.displayOptions?.showMenu !== false}
                  onChange={(e) => toggleDisplay("showMenu", e.target.checked)}
                />
                <span>Tampilkan Daftar Menu</span>
              </label>

              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={form.displayOptions?.showNutrition !== false}
                  onChange={(e) => toggleDisplay("showNutrition", e.target.checked)}
                />
                <span>Tampilkan Nilai Gizi</span>
              </label>

              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={form.displayOptions?.showCode !== false}
                  onChange={(e) => toggleDisplay("showCode", e.target.checked)}
                />
                <span>Tampilkan Kode Label & QR</span>
              </label>

              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={form.displayOptions?.showNumbering !== false}
                  onChange={(e) => toggleDisplay("showNumbering", e.target.checked)}
                />
                <span>Tampilkan Penomoran Label (#000001)</span>
              </label>

              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={form.displayOptions?.showFooterText !== false}
                  onChange={(e) => toggleDisplay("showFooterText", e.target.checked)}
                />
                <span>Tampilkan Catatan Footer</span>
              </label>

              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={form.displayOptions?.showFooterNumber === true}
                  onChange={(e) => toggleDisplay("showFooterNumber", e.target.checked)}
                />
                <span>Tampilkan Nomor Urut Cetak (1, 2, 3...)</span>
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
                  <strong>{item.label || "Tanpa Judul"}{item.menuName ? ` - ${item.menuName}` : ""}</strong>
                  <span>{item.date ? formatDateID(item.date) : "Tanpa Tanggal"} · {item.quantity.toLocaleString("id-ID")} label</span>
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