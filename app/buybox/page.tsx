'use client';

import { useState, Fragment } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import Icon from '../components/Icon';

interface Product {
  name: string;
  sku: string;
  myPrice: number;
  winnerPrice: number;
  competitors: number;
  won: boolean;
  pct?: number; // kaybedenlerde fiyat farkı yüzdesi
}

const TL = (n: number) =>
  '₺' + n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const INITIAL: Product[] = [
  { name: 'Kablosuz Kulaklık Pro X3', sku: 'SKU-00441', myPrice: 1299, winnerPrice: 1299, competitors: 3, won: true },
  { name: 'Gaming Mouse + Pad Set', sku: 'SKU-00892', myPrice: 459.9, winnerPrice: 459.9, competitors: 2, won: true },
  { name: 'Akıllı Saat SE 2025', sku: 'SKU-02201', myPrice: 2199, winnerPrice: 2199, competitors: 5, won: true },
  { name: 'Bluetooth Hoparlör Mini', sku: 'SKU-02389', myPrice: 389.9, winnerPrice: 389.9, competitors: 1, won: true },
  { name: 'USB-C Hub 7 Port', sku: 'SKU-02788', myPrice: 299.9, winnerPrice: 299.9, competitors: 4, won: true },
  { name: 'Mousepad XL Gaming', sku: 'SKU-03245', myPrice: 149.9, winnerPrice: 149.9, competitors: 2, won: true },
  { name: 'Şarj Aleti 65W GaN', sku: 'SKU-03502', myPrice: 549.9, winnerPrice: 549.9, competitors: 3, won: true },
  { name: 'Laptop Çantası 15"', sku: 'SKU-02541', myPrice: 649.9, winnerPrice: 589.9, competitors: 2, won: false, pct: 10 },
  { name: 'Mekanik Klavye TKL', sku: 'SKU-03001', myPrice: 1899, winnerPrice: 1749, competitors: 3, won: false, pct: 8 },
  { name: 'Webcam Full HD 1080p', sku: 'SKU-03102', myPrice: 899, winnerPrice: 799, competitors: 4, won: false, pct: 12 },
  { name: 'Ring Light 10 inç', sku: 'SKU-03611', myPrice: 449.9, winnerPrice: 399.9, competitors: 2, won: false, pct: 12 },
  { name: 'Oyuncu Koltuğu Pro', sku: 'SKU-03788', myPrice: 8499, winnerPrice: 7999, competitors: 1, won: false, pct: 6 },
];

type Filter = 'all' | 'won' | 'lost';

export default function BuyboxPage() {
  const [rows, setRows] = useState<Product[]>(INITIAL);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [editSku, setEditSku] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [detail, setDetail] = useState<Product | null>(null);
  const [optimizeOpen, setOptimizeOpen] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);

  const showToast = (msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  const lostCount = rows.filter((r) => !r.won).length;

  const filtered = rows.filter((r) => {
    const matchSearch =
      !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.sku.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (filter === 'won' ? r.won : !r.won);
    return matchSearch && matchFilter;
  });

  const openEdit = (p: Product) => {
    setEditSku(p.sku);
    setNewPrice((p.winnerPrice - 1).toFixed(2));
  };

  const applyPrice = (sku: string) => {
    const price = parseFloat(newPrice);
    if (isNaN(price)) return;
    setRows((rs) => rs.map((r) => (r.sku === sku ? { ...r, myPrice: price, winnerPrice: price, won: true, pct: undefined } : r)));
    setEditSku(null);
    showToast("✅ Fiyat güncellendi. Trendyol'a iletildi.");
  };

  const optimizeAll = () => {
    setRows((rs) => rs.map((r) => (!r.won ? { ...r, myPrice: r.winnerPrice - 1, won: true, pct: undefined } : r)));
    setOptimizeOpen(false);
    showToast("✅ 5 ürün fiyatı Trendyol'a iletildi");
  };

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Tümü' },
    { key: 'won', label: 'Kazananlar' },
    { key: 'lost', label: 'Kaybedenler' },
  ];

  const metrics = [
    { label: 'Toplam Ürün', value: '48', color: '#1A1915' },
    { label: 'Buybox Kazanan', value: '31', color: '#1A6B46' },
    { label: 'Buybox Kaybeden', value: '17', color: '#D63B3B' },
    { label: 'Ortalama Fiyat Farkı', value: '%8', color: '#C47A00' },
  ];

  // Detay paneli için rakip & geçmiş üretimi
  const competitorRows = (p: Product) => {
    const me = { name: 'Sen', price: p.myPrice, winner: p.won };
    const comps = Array.from({ length: p.competitors }).map((_, i) => ({
      name: `Rakip ${i + 1}`,
      price: (p.won ? p.myPrice : p.winnerPrice) + (i + 1) * 50,
      winner: false,
    }));
    if (!p.won) comps.unshift({ name: 'Kazanan rakip', price: p.winnerPrice, winner: true });
    return [me, ...comps];
  };

  const priceHistory = (p: Product) => {
    const days = ['09 Haz', '10 Haz', '11 Haz', '12 Haz', '13 Haz', '14 Haz'];
    return days.map((d, i) => {
      const lostDay = i === 2; // örnek: 11 Haz kaybetmiş
      return { day: d, price: lostDay ? p.myPrice + 50 : p.myPrice, won: !lostDay && p.won };
    });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#F7F6F2' }}>
      <style>{`@keyframes slideIn { from { transform: translateX(100%);} to { transform: translateX(0);} } @keyframes modalIn { from { opacity:0; transform: translateY(12px) scale(0.98);} to { opacity:1; transform: translateY(0) scale(1);} } @keyframes panelIn { from { transform: translateX(100%);} to { transform: translateX(0);} }`}</style>
      <Sidebar />
      <TopBar title="Buybox Takibi" />

      <main style={{ marginLeft: 240, flex: 1, padding: '88px 36px 32px' }}>
        <div style={{ marginBottom: 18 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1915' }}>Buybox Takibi</h1>
          <p style={{ fontSize: 13, color: '#9E9B93', marginTop: 4 }}>
            Ürünlerinizin fiyat rekabetini takip edin, Buybox&apos;ı kazanın.
          </p>
        </div>

        {/* Bilgi banner */}
        <div style={{ background: '#EBF0F9', border: '1px solid #C9D8F0', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: '#1A4B8C', lineHeight: 1.55, marginBottom: 22 }}>
          ℹ️ <strong>Buybox nedir?</strong> Trendyol&apos;da aynı ürünü satan birden fazla satıcı olduğunda müşterinin &apos;Sepete Ekle&apos; butonuna tıkladığında hangi satıcının ürününü aldığını belirleyen sistemdir. Buybox&apos;ı kazanmak = daha fazla satış.
        </div>

        {/* Platform sekmesi */}
        <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid #E5E7EB', marginBottom: 20 }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 0 12px', background: 'none', border: 'none', borderBottom: '2px solid #1A1915', cursor: 'default', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, color: '#1A1915', marginBottom: -1 }}>
            <span style={{ width: 9, height: 9, borderRadius: 999, background: '#C94E1A' }} />
            Trendyol
          </button>
        </div>

        {/* Metrik kartlar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 22 }}>
          {metrics.map((m) => (
            <div key={m.label} style={{ background: '#fff', borderRadius: 14, padding: '18px 22px', boxShadow: '0 1px 8px rgba(26,25,21,0.06)', border: '1px solid rgba(26,25,21,0.08)' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: m.color, letterSpacing: '-1px' }}>{m.value}</div>
              <div style={{ fontSize: 13, color: '#9E9B93', marginTop: 4, fontWeight: 500 }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* İçerik: tablo + özet */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Filtre satırı */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9E9B93', display: 'flex' }}>
                  <Icon name="search" size={16} />
                </span>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ürün adı veya barkod..."
                  style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: 9, border: '1px solid rgba(26,25,21,0.14)', fontSize: 13, fontFamily: 'inherit', background: '#fff', color: '#1A1915', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {FILTERS.map((f) => {
                  const active = filter === f.key;
                  return (
                    <button key={f.key} onClick={() => setFilter(f.key)}
                      style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid ' + (active ? '#1A1915' : 'rgba(26,25,21,0.14)'), background: active ? '#1A1915' : '#fff', color: active ? '#fff' : '#5A574F', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tablo */}
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 8px rgba(26,25,21,0.06)', border: '1px solid rgba(26,25,21,0.08)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(26,25,21,0.08)' }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1A1915' }}>Ürün Bazlı Buybox Durumu</h2>
                <button onClick={() => showToast('Buybox verileri güncelleniyor...')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 8, border: '1px solid rgba(26,25,21,0.16)', background: '#fff', color: '#5A574F', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  <Icon name="refresh" size={14} /> Güncelle
                </button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(26,25,21,0.08)' }}>
                      {['Ürün', 'Barkod', 'Benim Fiyatım', 'Kazanan Fiyat', 'Rakip', 'Fark', 'Durum', 'İşlem'].map((h) => (
                        <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9E9B93', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr><td colSpan={8} style={{ padding: '40px 16px', textAlign: 'center', color: '#9E9B93', fontSize: 14 }}>Sonuç yok.</td></tr>
                    )}
                    {filtered.map((p, i) => {
                      const isEdit = editSku === p.sku;
                      const rowBg = p.won ? '#F0FDF4' : '#FFF5F5';
                      const last = i === filtered.length - 1;
                      return (
                        <Fragment key={p.sku}>
                          <tr style={{ background: rowBg, borderBottom: isEdit || !last ? '1px solid rgba(26,25,21,0.06)' : 'none' }}>
                            <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 600, color: '#1A1915' }}>{p.name}</td>
                            <td style={{ padding: '13px 16px', fontSize: 13, color: '#5A574F', fontFamily: 'monospace' }}>{p.sku}</td>
                            <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 700, color: '#1A1915', whiteSpace: 'nowrap' }}>{TL(p.myPrice)}</td>
                            <td style={{ padding: '13px 16px', fontSize: 13, color: '#5A574F', whiteSpace: 'nowrap' }}>
                              {TL(p.winnerPrice)} <span style={{ color: '#9E9B93', fontSize: 12 }}>({p.won ? 'ben' : 'rakip'})</span>
                            </td>
                            <td style={{ padding: '13px 16px', fontSize: 13, color: '#5A574F', whiteSpace: 'nowrap' }}>{p.competitors} rakip</td>
                            <td style={{ padding: '13px 16px', fontSize: 13, whiteSpace: 'nowrap' }}>
                              {p.won ? (
                                <span style={{ color: '#9E9B93' }}>—</span>
                              ) : (
                                <span style={{ color: '#D63B3B', fontWeight: 700 }}>
                                  +{TL(p.myPrice - p.winnerPrice)} (%{p.pct}↑)
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '13px 16px' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: p.won ? '#EBF5EF' : '#FBEAEA', color: p.won ? '#1A6B46' : '#D63B3B', fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                                {p.won ? '🏆 Kazandım' : '❌ Kaybettim'}
                              </span>
                            </td>
                            <td style={{ padding: '13px 16px' }}>
                              {p.won ? (
                                <button onClick={() => setDetail(p)}
                                  style={{ padding: '6px 13px', borderRadius: 7, border: '1px solid rgba(26,25,21,0.16)', background: '#fff', color: '#5A574F', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                                  Detay
                                </button>
                              ) : (
                                <button onClick={() => openEdit(p)}
                                  style={{ padding: '6px 13px', borderRadius: 7, border: 'none', background: '#1A6B46', color: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                                  Fiyat Güncelle
                                </button>
                              )}
                            </td>
                          </tr>
                          {isEdit && (
                            <tr style={{ borderBottom: !last ? '1px solid rgba(26,25,21,0.06)' : 'none' }}>
                              <td colSpan={8} style={{ padding: '0 16px 16px', background: rowBg }}>
                                <div style={{ background: '#fff', border: '1px solid rgba(26,25,21,0.1)', borderRadius: 12, padding: 16, marginTop: 4 }}>
                                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1915', marginBottom: 12 }}>Yeni Fiyat Belirle</div>
                                  <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#5A574F', marginBottom: 12, flexWrap: 'wrap' }}>
                                    <span>Mevcut fiyat: <strong style={{ color: '#1A1915' }}>{TL(p.myPrice)}</strong></span>
                                    <span>Kazanan fiyat: <strong style={{ color: '#1A6B46' }}>{TL(p.winnerPrice)}</strong></span>
                                  </div>
                                  <div style={{ background: '#EBF5EF', borderRadius: 9, padding: '10px 14px', fontSize: 12.5, color: '#1A6B46', fontWeight: 600, marginBottom: 14 }}>
                                    💡 Buybox kazanmak için {TL(p.winnerPrice)} veya altında fiyat belirlemeniz gerekiyor.
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                    <div style={{ position: 'relative', width: 180 }}>
                                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#5A574F', fontSize: 14, fontWeight: 600 }}>₺</span>
                                      <input
                                        type="number"
                                        value={newPrice}
                                        onChange={(e) => setNewPrice(e.target.value)}
                                        onFocus={(e) => (e.currentTarget.style.borderColor = '#1A6B46')}
                                        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(26,25,21,0.16)')}
                                        style={{ width: '100%', padding: '10px 12px 10px 26px', borderRadius: 9, border: '1px solid rgba(26,25,21,0.16)', fontSize: 14, fontFamily: 'inherit', color: '#1A1915', outline: 'none', boxSizing: 'border-box' }}
                                      />
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                                      <button onClick={() => setEditSku(null)}
                                        style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid rgba(26,25,21,0.14)', background: '#fff', color: '#5A574F', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                                        İptal
                                      </button>
                                      <button onClick={() => applyPrice(p.sku)}
                                        style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: '#1A6B46', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                                        ✓ Fiyatı Güncelle
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Özet kart */}
          <div style={{ width: 280, flexShrink: 0, background: '#fff', border: '1px solid rgba(26,25,21,0.08)', borderRadius: 20, padding: 22, boxShadow: '0 1px 8px rgba(26,25,21,0.06)', position: 'sticky', top: 88 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1A1915', marginBottom: 18 }}>📊 Buybox Özeti</h3>

            {/* Daire gösterge */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
              <div style={{ width: 130, height: 130, borderRadius: '50%', background: 'conic-gradient(#1A6B46 0 64%, #FBEAEA 64% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#1A6B46' }}>%64</div>
                  <div style={{ fontSize: 10, color: '#9E9B93', fontWeight: 600 }}>Buybox Oranı</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 18, marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9E9B93', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Bu Hafta Değişim</div>
              <div style={{ fontSize: 13, color: '#1A6B46', fontWeight: 600, marginBottom: 4 }}>↑ 3 ürün buybox kazandı</div>
              <div style={{ fontSize: 13, color: '#D63B3B', fontWeight: 600 }}>↓ 1 ürün buybox kaybetti</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9E9B93', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Kaybedilen Gelir Potansiyeli</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#D63B3B', letterSpacing: '-0.5px' }}>₺2.840/ay</div>
              <div style={{ fontSize: 11, color: '#9E9B93', marginTop: 2 }}>(Buybox&apos;ı geri alırsanız tahmini ek gelir)</div>
            </div>

            <div style={{ height: 1, background: 'rgba(26,25,21,0.08)', margin: '16px 0' }} />

            <button onClick={() => setOptimizeOpen(true)}
              style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: '#1A6B46', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              Tüm Fiyatları Optimize Et
            </button>
          </div>
        </div>
      </main>

      {/* Detay slide panel */}
      {detail && (
        <div onClick={() => setDetail(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(26,25,21,0.35)', zIndex: 55 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(420px,100%)', background: '#fff', boxShadow: '-8px 0 32px rgba(0,0,0,0.18)', animation: 'panelIn 0.22s ease', overflowY: 'auto', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1915' }}>Buybox Detayı</h3>
              <button onClick={() => setDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9E9B93', display: 'flex' }}>
                <Icon name="x" size={20} />
              </button>
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: '#9E9B93', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Ürün Bilgisi</div>
            <div style={{ fontSize: 13, lineHeight: 1.9, color: '#5A574F', marginBottom: 24 }}>
              <div><strong style={{ color: '#1A1915' }}>Ürün:</strong> {detail.name}</div>
              <div><strong style={{ color: '#1A1915' }}>Barkod:</strong> {detail.sku}</div>
              <div><strong style={{ color: '#1A1915' }}>Benim Fiyatım:</strong> {TL(detail.myPrice)}</div>
              <div><strong style={{ color: '#1A1915' }}>Durum:</strong> {detail.won ? '🏆 Buybox Kazananı' : '❌ Buybox Kaybediyor'}</div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: '#9E9B93', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Rakip Analizi</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(26,25,21,0.08)' }}>
                  {['Satıcı', 'Fiyat', 'Durum'].map((h) => (
                    <th key={h} style={{ padding: '8px 6px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, color: '#9E9B93', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {competitorRows(detail).map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(26,25,21,0.05)' }}>
                    <td style={{ padding: '8px 6px', fontSize: 13, fontWeight: c.name === 'Sen' ? 700 : 500, color: '#1A1915' }}>{c.name}</td>
                    <td style={{ padding: '8px 6px', fontSize: 13, color: '#5A574F', whiteSpace: 'nowrap' }}>{TL(c.price)}</td>
                    <td style={{ padding: '8px 6px', fontSize: 12.5 }}>{c.winner ? <span style={{ color: '#1A6B46', fontWeight: 700 }}>🏆 Kazanan</span> : <span style={{ color: '#9E9B93' }}>—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ fontSize: 11, fontWeight: 700, color: '#9E9B93', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Fiyat Geçmişi (son 7 gün)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {priceHistory(detail).map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#5A574F' }}>
                  <span>{h.day}</span>
                  <span>{TL(h.price).replace(',00', '')} {h.won ? '🏆' : '❌'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Optimize modalı */}
      {optimizeOpen && (
        <div onClick={() => setOptimizeOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(26,25,21,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 16, padding: 24, width: 'min(420px,100%)', boxShadow: '0 12px 40px rgba(0,0,0,0.2)', animation: 'modalIn 0.18s ease' }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1A1915', marginBottom: 10 }}>Tüm Fiyatları Optimize Et</h3>
            <p style={{ fontSize: 13.5, color: '#5A574F', lineHeight: 1.5, marginBottom: 20 }}>
              {lostCount} ürünün fiyatını rakibin ₺1 altına indirmek istiyor musunuz?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setOptimizeOpen(false)}
                style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid rgba(26,25,21,0.14)', background: '#fff', color: '#5A574F', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                İptal
              </button>
              <button onClick={optimizeAll}
                style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: '#1A6B46', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Evet, Güncelle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 60 }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ background: '#1A1915', color: '#fff', padding: '12px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: '0 6px 20px rgba(0,0,0,0.25)', animation: 'slideIn 0.25s ease', maxWidth: 320 }}>
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}
