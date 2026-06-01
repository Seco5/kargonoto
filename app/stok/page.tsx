'use client';

import { useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import Icon from '../components/Icon';

// ─── Types ────────────────────────────────────────────────────────────────────
type StockStatus = 'Aktif' | 'Az Stok' | 'Tükendi';
type PlatformFilter = 'Tümü' | 'Trendyol' | 'Hepsiburada' | 'N11';

interface StockItem {
  id: string;
  name: string;
  sku: string;
  trendyol: number;
  hepsiburada: number;
  n11: number;
  status: StockStatus;
  updatedAt: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const INITIAL_STOCK: StockItem[] = [
  { id: '1',  name: 'Kablosuz Kulaklık Pro X3',   sku: 'SKU-00441', trendyol: 54,  hepsiburada: 48, n11: 40,  status: 'Aktif',    updatedAt: '2 dk önce'   },
  { id: '2',  name: 'Gaming Mouse + Pad Set',      sku: 'SKU-00892', trendyol: 5,   hepsiburada: 0,  n11: 3,   status: 'Az Stok',  updatedAt: '15 dk önce'  },
  { id: '3',  name: 'Deri Çanta, Siyah',           sku: 'SKU-01123', trendyol: 0,   hepsiburada: 0,  n11: 0,   status: 'Tükendi',  updatedAt: '1 sa önce'   },
  { id: '4',  name: 'Akıllı Saat SE 2025',         sku: 'SKU-02201', trendyol: 130, hepsiburada: 141,n11: 120, status: 'Aktif',    updatedAt: '5 dk önce'   },
  { id: '5',  name: 'Bluetooth Hoparlör Mini',     sku: 'SKU-02389', trendyol: 22,  hepsiburada: 18, n11: 15,  status: 'Aktif',    updatedAt: '32 dk önce'  },
  { id: '6',  name: 'Laptop Çantası 15"',          sku: 'SKU-02541', trendyol: 4,   hepsiburada: 2,  n11: 0,   status: 'Az Stok',  updatedAt: '1 sa önce'   },
  { id: '7',  name: 'USB-C Hub 7 Port',            sku: 'SKU-02788', trendyol: 88,  hepsiburada: 71, n11: 64,  status: 'Aktif',    updatedAt: '8 dk önce'   },
  { id: '8',  name: 'Mekanik Klavye TKL',          sku: 'SKU-03001', trendyol: 0,   hepsiburada: 2,  n11: 0,   status: 'Az Stok',  updatedAt: '3 sa önce'   },
  { id: '9',  name: 'Webcam Full HD 1080p',        sku: 'SKU-03102', trendyol: 0,   hepsiburada: 0,  n11: 0,   status: 'Tükendi',  updatedAt: '5 sa önce'   },
  { id: '10', name: 'Mousepad XL Gaming',          sku: 'SKU-03245', trendyol: 67,  hepsiburada: 55, n11: 48,  status: 'Aktif',    updatedAt: '20 dk önce'  },
  { id: '11', name: 'Telefon Kılıfı iPhone 15',    sku: 'SKU-03389', trendyol: 3,   hepsiburada: 1,  n11: 2,   status: 'Az Stok',  updatedAt: '45 dk önce'  },
  { id: '12', name: 'Şarj Aleti 65W GaN',          sku: 'SKU-03502', trendyol: 44,  hepsiburada: 38, n11: 29,  status: 'Aktif',    updatedAt: '12 dk önce'  },
  { id: '13', name: 'Ring Light 10 inç',           sku: 'SKU-03611', trendyol: 0,   hepsiburada: 0,  n11: 0,   status: 'Tükendi',  updatedAt: '2 sa önce'   },
  { id: '14', name: 'Oyuncu Koltuğu Pro',          sku: 'SKU-03788', trendyol: 8,   hepsiburada: 6,  n11: 4,   status: 'Aktif',    updatedAt: '1 sa önce'   },
  { id: '15', name: 'Monitör Işık Çubuğu',         sku: 'SKU-03901', trendyol: 2,   hepsiburada: 0,  n11: 1,   status: 'Az Stok',  updatedAt: '3 sa önce'   },
];

const SALES_MOCK = [
  { label: 'Bugün',       value: 12 },
  { label: 'Dün',         value: 8  },
  { label: '2 gün önce',  value: 15 },
  { label: '3 gün önce',  value: 6  },
  { label: '4 gün önce',  value: 11 },
  { label: '5 gün önce',  value: 9  },
  { label: '6 gün önce',  value: 14 },
];

const STATUS_STYLE: Record<StockStatus, { bg: string; color: string }> = {
  'Aktif':    { bg: '#EBF5EF', color: '#1A6B46' },
  'Az Stok':  { bg: '#FDF0EB', color: '#C94E1A' },
  'Tükendi':  { bg: '#FBEAEA', color: '#D63B3B' },
};

function stockColor(n: number): React.CSSProperties {
  if (n === 0)  return { color: '#D63B3B', fontWeight: 700 };
  if (n <= 9)   return { color: '#C94E1A', fontWeight: 700 };
  return { color: '#1A1915' };
}

// ─── Slide-over panel ─────────────────────────────────────────────────────────
function SlidePanel({
  item, onClose, onSave,
}: {
  item: StockItem;
  onClose: () => void;
  onSave: (id: string, ty: number, hb: number, n11: number) => void;
}) {
  const [ty,  setTy]  = useState(item.trendyol);
  const [hb,  setHb]  = useState(item.hepsiburada);
  const [n11, setN11] = useState(item.n11);
  const maxSales = Math.max(...SALES_MOCK.map(s => s.value));

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 50, transition: 'opacity 0.2s' }}
      />
      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 400,
        background: '#fff', zIndex: 51, boxShadow: '-8px 0 40px rgba(26,25,21,0.14)',
        display: 'flex', flexDirection: 'column', animation: 'slideIn 0.22s ease',
      }}>
        {/* Header */}
        <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid rgba(26,25,21,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1A1915', lineHeight: 1.3 }}>{item.name}</h2>
              <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#9E9B93', marginTop: 4, display: 'block' }}>{item.sku}</span>
            </div>
            <button
              onClick={onClose}
              style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(26,25,21,0.12)', background: '#F7F6F2', cursor: 'pointer', fontSize: 18, color: '#9E9B93', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 12 }}
            >×</button>
          </div>
          <div style={{ marginTop: 10 }}>
            <span style={{ ...STATUS_STYLE[item.status], background: STATUS_STYLE[item.status].bg, fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 999 }}>
              {item.status}
            </span>
            <span style={{ fontSize: 12, color: '#9E9B93', marginLeft: 10 }}>Güncelleme: {item.updatedAt}</span>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {/* Channel stock inputs */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1A1915', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Kanal Bazlı Stok</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Trendyol',     color: '#C94E1A', bg: 'rgba(201,78,26,0.08)', val: ty,  set: setTy  },
                { label: 'Hepsiburada',  color: '#C47A00', bg: 'rgba(255,140,0,0.08)', val: hb,  set: setHb  },
                { label: 'N11',          color: '#6432C8', bg: 'rgba(100,50,200,0.08)',val: n11, set: setN11 },
              ].map(ch => (
                <div key={ch.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: ch.bg, borderRadius: 10, border: `1px solid ${ch.color}22` }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: ch.color, width: 100, flexShrink: 0 }}>{ch.label}</span>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: '#9E9B93' }}>Mevcut:</span>
                    <span style={{ ...stockColor(ch.val), fontSize: 15, minWidth: 28 }}>{ch.val}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: '#9E9B93' }}>Yeni:</span>
                    <div style={{ display: 'flex', alignItems: 'center', borderRadius: 8, border: '1.5px solid rgba(26,25,21,0.18)', overflow: 'hidden', background: '#fff' }}>
                      <button
                        onClick={() => ch.set(v => Math.max(0, v - 1))}
                        style={{ width: 28, height: 32, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 16, color: '#5A574F', fontFamily: 'inherit' }}
                      >−</button>
                      <input
                        type="number"
                        min={0}
                        value={ch.val}
                        onChange={e => ch.set(Math.max(0, parseInt(e.target.value) || 0))}
                        style={{ width: 52, height: 32, border: 'none', outline: 'none', textAlign: 'center', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', color: '#1A1915' }}
                      />
                      <button
                        onClick={() => ch.set(v => v + 1)}
                        style={{ width: 28, height: 32, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 16, color: '#5A574F', fontFamily: 'inherit' }}
                      >+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, padding: '8px 12px', background: '#F7F6F2', borderRadius: 8, fontSize: 12, color: '#9E9B93', display: 'flex', justifyContent: 'space-between' }}>
              <span>Toplam stok</span>
              <span style={{ fontWeight: 700, color: '#1A1915', fontSize: 13 }}>{ty + hb + n11} adet</span>
            </div>
          </div>

          {/* Sales chart */}
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1A1915', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Son 7 Gün Satış</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {SALES_MOCK.map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, color: '#9E9B93', width: 90, flexShrink: 0 }}>{s.label}</span>
                  <div style={{ flex: 1, height: 8, background: '#EFEDE8', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${(s.value / maxSales) * 100}%`, height: '100%', background: '#1A6B46', borderRadius: 4, transition: 'width 0.4s ease' }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1915', width: 50, textAlign: 'right' }}>{s.value} adet</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, padding: '8px 12px', background: '#EBF5EF', borderRadius: 8, fontSize: 12, color: '#1A6B46', fontWeight: 600 }}>
              📈 7 günlük toplam: {SALES_MOCK.reduce((s, x) => s + x.value, 0)} adet satış
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(26,25,21,0.1)', display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1.5px solid rgba(26,25,21,0.16)', background: '#F7F6F2', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#5A574F' }}
          >İptal</button>
          <button
            onClick={() => onSave(item.id, ty, hb, n11)}
            style={{ flex: 2, padding: '11px', borderRadius: 10, border: 'none', background: '#1A1915', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >Kaydet</button>
        </div>
      </div>
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function StokPage() {
  const [stock, setStock]             = useState<StockItem[]>(INITIAL_STOCK);
  const [search, setSearch]           = useState('');
  const [platFilter, setPlatFilter]   = useState<PlatformFilter>('Tümü');
  const [statusFilter, setStatusFilter] = useState<string>('Tümü');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeItem, setActiveItem]   = useState<StockItem | null>(null);
  const [toast, setToast]             = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }

  // ─── Filtering ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => stock.filter(item => {
    const q = search.toLowerCase();
    if (q && !item.name.toLowerCase().includes(q) && !item.sku.toLowerCase().includes(q)) return false;
    if (statusFilter !== 'Tümü' && item.status !== statusFilter) return false;
    return true;
  }), [stock, search, statusFilter]);

  // ─── Row dimming for platform filter ──────────────────────────────────────
  function isDimmed(item: StockItem): boolean {
    if (platFilter === 'Trendyol'    && item.trendyol === 0)    return true;
    if (platFilter === 'Hepsiburada' && item.hepsiburada === 0) return true;
    if (platFilter === 'N11'         && item.n11 === 0)         return true;
    return false;
  }

  // ─── Selection ────────────────────────────────────────────────────────────
  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  function toggleSelect(id: string) {
    setSelectedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }
  function toggleAll() {
    setSelectedIds(allSelected ? new Set() : new Set(filtered.map(i => i.id)));
  }

  // ─── Save from panel ──────────────────────────────────────────────────────
  function handleSave(id: string, ty: number, hb: number, n11: number) {
    setStock(prev => prev.map(item => {
      if (item.id !== id) return item;
      const total = ty + hb + n11;
      const status: StockStatus = total === 0 ? 'Tükendi' : total <= 9 ? 'Az Stok' : 'Aktif';
      return { ...item, trendyol: ty, hepsiburada: hb, n11, status, updatedAt: 'Az önce' };
    }));
    setActiveItem(null);
    showToast('Stok güncellendi ✓');
  }

  // ─── Metrics ──────────────────────────────────────────────────────────────
  const totalSKU    = stock.length;
  const kritik      = stock.filter(i => i.status === 'Az Stok').length;
  const tukendi     = stock.filter(i => i.status === 'Tükendi').length;
  const bugunGuncellendi = 34; // static mock

  const platBtns: PlatformFilter[] = ['Tümü', 'Trendyol', 'Hepsiburada', 'N11'];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#F7F6F2' }}>
      <style>{`
        @keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }
        .stock-row:hover { background: #FAFAF8 !important; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>

      <Sidebar />

      <TopBar title="Stok" />
      <main style={{ marginLeft: 240, flex: 1, padding: '88px 36px 32px' }}>

        {/* ── Page title ─────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1915' }}>Stok</h1>
          <p style={{ fontSize: 13, color: '#9E9B93', marginTop: 4 }}>{totalSKU} SKU · son güncelleme az önce</p>
        </div>

        {/* ── Metric cards ───────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          {([
            { label: 'Toplam SKU',       value: totalSKU,          icon: 'stock' as const,        color: '#1A1915', badge: 'rgba(26,25,21,0.08)' },
            { label: 'Kritik Stok',      value: kritik,            icon: 'alert' as const,        color: '#C94E1A', badge: '#FDF0EB' },
            { label: 'Tükendi',          value: tukendi,           icon: 'alert' as const,        color: '#D63B3B', badge: '#FBEAEA' },
            { label: 'Bugün Güncellendi',value: bugunGuncellendi,  icon: 'check-circle' as const, color: '#1A6B46', badge: '#EBF5EF' },
          ]).map(m => (
            <div key={m.label} style={{ background: '#fff', borderRadius: 14, padding: '20px 22px', boxShadow: '0 1px 8px rgba(26,25,21,0.06)', border: '1px solid rgba(26,25,21,0.08)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: m.badge, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Icon name={m.icon} size={20} color={m.color} strokeWidth={1.9} />
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: m.color, letterSpacing: '-1px' }}>{m.value}</div>
              <div style={{ fontSize: 13, color: '#9E9B93', marginTop: 4, fontWeight: 500 }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* ── Filter row ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 320 }}>
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', display: 'flex', color: '#9E9B93' }}><Icon name="search" size={15} strokeWidth={1.8} /></span>
            <input
              type="text"
              placeholder="Ürün adı veya SKU ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: 9, border: '1.5px solid rgba(26,25,21,0.16)', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#fff', color: '#1A1915' }}
            />
          </div>

          {/* Platform pill buttons */}
          <div style={{ display: 'flex', gap: 6 }}>
            {platBtns.map(p => (
              <button
                key={p}
                onClick={() => setPlatFilter(p)}
                style={{ padding: '8px 16px', borderRadius: 8, border: `1.5px solid ${platFilter === p ? '#1A1915' : 'rgba(26,25,21,0.18)'}`, background: platFilter === p ? '#1A1915' : '#fff', color: platFilter === p ? '#fff' : '#5A574F', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
              >{p}</button>
            ))}
          </div>

          {/* Status dropdown */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '9px 12px', borderRadius: 9, border: '1.5px solid rgba(26,25,21,0.16)', background: '#fff', fontSize: 13, fontFamily: 'inherit', color: '#1A1915', cursor: 'pointer', outline: 'none', fontWeight: 500 }}
          >
            <option>Tümü</option>
            <option>Aktif</option>
            <option>Az Stok</option>
            <option>Tükendi</option>
          </select>

          <div style={{ marginLeft: 'auto', fontSize: 13, color: '#9E9B93' }}>{filtered.length} ürün</div>
        </div>

        {/* ── Bulk selection banner ──────────────────────────────────────── */}
        {selectedIds.size > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', background: '#FEF3C7', border: '1.5px solid #FDE68A', borderRadius: 12, marginBottom: 14, animation: 'fadeSlideIn 0.2s ease' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#92400E' }}>{selectedIds.size} ürün seçildi</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button onClick={() => setSelectedIds(new Set())} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(146,64,14,0.3)', background: 'transparent', color: '#92400E', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Seçimi Kaldır</button>
              <button
                onClick={() => { showToast(`${selectedIds.size} ürün stok güncellemesi kuyruğa alındı ✓`); setSelectedIds(new Set()); }}
                style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: '#92400E', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
              >Toplu Güncelle</button>
            </div>
          </div>
        )}

        {/* ── Main table ─────────────────────────────────────────────────── */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 8px rgba(26,25,21,0.06)', border: '1px solid rgba(26,25,21,0.08)', overflow: 'hidden' }}>
          {/* Table header bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(26,25,21,0.08)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1A1915' }}>Stok Durumu</h2>
            <button
              onClick={() => { const allIds = new Set(filtered.map(i => i.id)); setSelectedIds(allIds); }}
              style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid rgba(26,25,21,0.16)', background: '#F7F6F2', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#1A1915' }}
            >Toplu Güncelle</button>
          </div>

          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '40px 2fr 120px 100px 100px 100px 90px 90px 110px 80px', padding: '9px 20px', background: '#F7F6F2', borderBottom: '1px solid rgba(26,25,21,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input type="checkbox" checked={allSelected} ref={el => { if (el) el.indeterminate = someSelected; }} onChange={toggleAll} style={{ width: 15, height: 15, cursor: 'pointer', accentColor: '#1A6B46' }} />
            </div>
            {['Ürün','SKU','Trendyol','Hepsiburada','N11','Toplam','Durum','Son Güncelleme','İşlem'].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 700, color: '#9E9B93', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'flex', alignItems: 'center' }}>{h}</div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ padding: '48px', textAlign: 'center', color: '#9E9B93', fontSize: 14 }}>Aramanızla eşleşen ürün bulunamadı.</div>
          )}

          {filtered.map((item, idx) => {
            const dimmed  = isDimmed(item);
            const selected = selectedIds.has(item.id);
            const ss = STATUS_STYLE[item.status];
            const total = item.trendyol + item.hepsiburada + item.n11;

            return (
              <div
                key={item.id}
                className="stock-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 2fr 120px 100px 100px 100px 90px 90px 110px 80px',
                  padding: '13px 20px',
                  borderBottom: idx < filtered.length - 1 ? '1px solid rgba(26,25,21,0.06)' : 'none',
                  alignItems: 'center',
                  opacity: dimmed ? 0.38 : 1,
                  background: selected ? 'rgba(26,107,70,0.04)' : 'transparent',
                  transition: 'opacity 0.2s, background 0.15s',
                  cursor: 'pointer',
                }}
                onClick={() => setActiveItem(item)}
              >
                <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center' }}>
                  <input type="checkbox" checked={selected} onChange={() => toggleSelect(item.id)} style={{ width: 15, height: 15, cursor: 'pointer', accentColor: '#1A6B46' }} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1915', paddingRight: 8 }}>{item.name}</div>
                <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#9E9B93' }}>{item.sku}</div>
                <div style={{ fontSize: 14, ...stockColor(item.trendyol) }}>{item.trendyol}</div>
                <div style={{ fontSize: 14, ...stockColor(item.hepsiburada) }}>{item.hepsiburada}</div>
                <div style={{ fontSize: 14, ...stockColor(item.n11) }}>{item.n11}</div>
                <div style={{ fontSize: 15, fontWeight: 700, ...stockColor(total) }}>{total}</div>
                <div>
                  <span style={{ background: ss.bg, color: ss.color, fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 999 }}>{item.status}</span>
                </div>
                <div style={{ fontSize: 12, color: '#9E9B93' }}>{item.updatedAt}</div>
                <div onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => setActiveItem(item)}
                    style={{ fontSize: 12, padding: '6px 12px', borderRadius: 7, border: '1.5px solid rgba(26,25,21,0.16)', background: '#F7F6F2', color: '#1A1915', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
                  >Düzenle</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Footer summary ─────────────────────────────────────────────── */}
        <div style={{ marginTop: 12, padding: '10px 16px', display: 'flex', gap: 20, fontSize: 12, color: '#9E9B93', alignItems: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="check-circle" size={14} color="#1A6B46" /> Aktif: <b style={{ color: '#1A6B46' }}>{stock.filter(i => i.status === 'Aktif').length}</b></span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="alert" size={14} color="#C94E1A" /> Az Stok: <b style={{ color: '#C94E1A' }}>{stock.filter(i => i.status === 'Az Stok').length}</b></span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="alert" size={14} color="#D63B3B" /> Tükendi: <b style={{ color: '#D63B3B' }}>{stock.filter(i => i.status === 'Tükendi').length}</b></span>
          <span style={{ marginLeft: 'auto' }}>Toplam stok: <b style={{ color: '#1A1915' }}>{stock.reduce((s, i) => s + i.trendyol + i.hepsiburada + i.n11, 0)} adet</b></span>
        </div>
      </main>

      {/* ── Slide-over panel ───────────────────────────────────────────────── */}
      {activeItem && (
        <SlidePanel
          item={activeItem}
          onClose={() => setActiveItem(null)}
          onSave={handleSave}
        />
      )}

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 28, right: 28, background: '#1A1915', color: '#fff', borderRadius: 12, padding: '14px 20px', fontSize: 14, fontWeight: 600, boxShadow: '0 8px 32px rgba(26,25,21,0.2)', zIndex: 200, animation: 'fadeSlideIn 0.3s ease' }}>
          {toast}
        </div>
      )}
    </div>
  );
}
