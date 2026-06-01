'use client';

import { useState, useMemo, JSX } from 'react';
import Sidebar from '../components/Sidebar';

// ─── Types ────────────────────────────────────────────────
type Status = 'Bekliyor' | 'Kargoda' | 'Teslim Edildi' | 'İade';
type Platform = 'Trendyol' | 'Hepsiburada' | 'N11';
type Carrier = 'Sendeo' | 'Aras' | 'Yurtiçi' | 'MNG' | 'Sürat';

interface Product {
  id: string;
  name: string;
  sku: string;
  image: string; // dummy url
  qty: number;
}

interface Order {
  id: string;
  customer: string;
  platform: Platform;
  carrier: Carrier;
  status: Status;
  date: string;
  packages: number; // 1 = tekli, >1 = çoklu
  products: Product[];
  printed: boolean;
  printedAt?: string;
}

// ─── Dummy product images (picsum with seed) ──────────────
const PRODUCT_IMGS: Record<string, string> = {
  'PRD-001': 'https://picsum.photos/seed/headphone/64/64',
  'PRD-002': 'https://picsum.photos/seed/bag/64/64',
  'PRD-003': 'https://picsum.photos/seed/watch/64/64',
  'PRD-004': 'https://picsum.photos/seed/mouse/64/64',
  'PRD-005': 'https://picsum.photos/seed/keyboard/64/64',
  'PRD-006': 'https://picsum.photos/seed/tshirt/64/64',
  'PRD-007': 'https://picsum.photos/seed/shoe/64/64',
  'PRD-008': 'https://picsum.photos/seed/phone/64/64',
  'PRD-009': 'https://picsum.photos/seed/lamp/64/64',
  'PRD-010': 'https://picsum.photos/seed/book/64/64',
  'PRD-011': 'https://picsum.photos/seed/charger/64/64',
  'PRD-012': 'https://picsum.photos/seed/jacket/64/64',
};

// ─── Mock data ────────────────────────────────────────────
const INITIAL_ORDERS: Order[] = [
  {
    id: '#TY-8842901', customer: 'Ayşe Kaya', platform: 'Trendyol', carrier: 'Sendeo',
    status: 'Bekliyor', date: '01 Haz', packages: 1, printed: false,
    products: [{ id: 'PRD-001', name: 'Kablosuz Kulaklık Pro X3', sku: 'SKU-00441', image: PRODUCT_IMGS['PRD-001'], qty: 1 }],
  },
  {
    id: '#HB-5521038', customer: 'Mehmet Yılmaz', platform: 'Hepsiburada', carrier: 'Aras',
    status: 'Bekliyor', date: '01 Haz', packages: 2, printed: false,
    products: [
      { id: 'PRD-002', name: 'Deri Çanta, Siyah', sku: 'SKU-01123', image: PRODUCT_IMGS['PRD-002'], qty: 1 },
      { id: 'PRD-005', name: 'Mekanik Klavye TKL', sku: 'SKU-00892', image: PRODUCT_IMGS['PRD-005'], qty: 1 },
    ],
  },
  {
    id: '#N11-3310094', customer: 'Fatma Şahin', platform: 'N11', carrier: 'Yurtiçi',
    status: 'Bekliyor', date: '31 May', packages: 1, printed: true, printedAt: '31 May 14:22',
    products: [{ id: 'PRD-003', name: 'Akıllı Saat SE 2025', sku: 'SKU-02201', image: PRODUCT_IMGS['PRD-003'], qty: 1 }],
  },
  {
    id: '#TY-8843212', customer: 'Ali Rıza', platform: 'Trendyol', carrier: 'Sendeo',
    status: 'Kargoda', date: '31 May', packages: 1, printed: true, printedAt: '31 May 10:05',
    products: [{ id: 'PRD-004', name: 'Gaming Mouse + Pad Set', sku: 'SKU-00892', image: PRODUCT_IMGS['PRD-004'], qty: 1 }],
  },
  {
    id: '#HB-5521199', customer: 'Zeynep Ak', platform: 'Hepsiburada', carrier: 'MNG',
    status: 'İade', date: '30 May', packages: 1, printed: true, printedAt: '30 May 09:10',
    products: [{ id: 'PRD-006', name: 'Oversize T-Shirt', sku: 'SKU-03312', image: PRODUCT_IMGS['PRD-006'], qty: 2 }],
  },
  {
    id: '#TY-8844001', customer: 'Murat Demir', platform: 'Trendyol', carrier: 'Sendeo',
    status: 'Bekliyor', date: '30 May', packages: 3, printed: false,
    products: [
      { id: 'PRD-007', name: 'Spor Ayakkabı', sku: 'SKU-04401', image: PRODUCT_IMGS['PRD-007'], qty: 1 },
      { id: 'PRD-008', name: 'Akıllı Telefon Kılıfı', sku: 'SKU-04402', image: PRODUCT_IMGS['PRD-008'], qty: 1 },
      { id: 'PRD-011', name: 'Hızlı Şarj Adaptörü', sku: 'SKU-04403', image: PRODUCT_IMGS['PRD-011'], qty: 1 },
    ],
  },
  {
    id: '#N11-3310201', customer: 'Selin Çelik', platform: 'N11', carrier: 'Aras',
    status: 'Bekliyor', date: '29 May', packages: 1, printed: false,
    products: [{ id: 'PRD-009', name: 'Masa Lambası LED', sku: 'SKU-05510', image: PRODUCT_IMGS['PRD-009'], qty: 1 }],
  },
  {
    id: '#HB-5521300', customer: 'Kemal Arslan', platform: 'Hepsiburada', carrier: 'Sendeo',
    status: 'Kargoda', date: '29 May', packages: 2, printed: true, printedAt: '29 May 16:45',
    products: [
      { id: 'PRD-010', name: 'Programlama Kitabı', sku: 'SKU-06601', image: PRODUCT_IMGS['PRD-010'], qty: 1 },
      { id: 'PRD-001', name: 'Kablosuz Kulaklık Pro X3', sku: 'SKU-00441', image: PRODUCT_IMGS['PRD-001'], qty: 1 },
    ],
  },
  {
    id: '#TY-8844102', customer: 'Merve Koç', platform: 'Trendyol', carrier: 'Yurtiçi',
    status: 'Kargoda', date: '28 May', packages: 1, printed: true, printedAt: '28 May 11:30',
    products: [{ id: 'PRD-012', name: 'Deri Mont', sku: 'SKU-07701', image: PRODUCT_IMGS['PRD-012'], qty: 1 }],
  },
  {
    id: '#N11-3310388', customer: 'Burak Yurt', platform: 'N11', carrier: 'MNG',
    status: 'Teslim Edildi', date: '28 May', packages: 1, printed: true, printedAt: '28 May 08:15',
    products: [{ id: 'PRD-004', name: 'Gaming Mouse + Pad Set', sku: 'SKU-00892', image: PRODUCT_IMGS['PRD-004'], qty: 1 }],
  },
  {
    id: '#TY-8844250', customer: 'Canan Yıldız', platform: 'Trendyol', carrier: 'Sürat',
    status: 'Bekliyor', date: '01 Haz', packages: 2, printed: false,
    products: [
      { id: 'PRD-003', name: 'Akıllı Saat SE 2025', sku: 'SKU-02201', image: PRODUCT_IMGS['PRD-003'], qty: 1 },
      { id: 'PRD-008', name: 'Akıllı Telefon Kılıfı', sku: 'SKU-04402', image: PRODUCT_IMGS['PRD-008'], qty: 2 },
    ],
  },
  {
    id: '#HB-5521410', customer: 'Emre Aktaş', platform: 'Hepsiburada', carrier: 'Aras',
    status: 'Bekliyor', date: '01 Haz', packages: 1, printed: false,
    products: [{ id: 'PRD-005', name: 'Mekanik Klavye TKL', sku: 'SKU-00892', image: PRODUCT_IMGS['PRD-005'], qty: 1 }],
  },
];

// ─── Style helpers ────────────────────────────────────────
const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  'Bekliyor': { bg: '#FEF3C7', color: '#D97706' },
  'Kargoda': { bg: '#DBEAFE', color: '#1D4ED8' },
  'Teslim Edildi': { bg: '#D1FAE5', color: '#065F46' },
  'İade': { bg: '#FEE2E2', color: '#DC2626' },
};

const PLATFORM_STYLE: Record<string, { bg: string; color: string }> = {
  'Trendyol': { bg: 'rgba(201,78,26,0.1)', color: '#C94E1A' },
  'Hepsiburada': { bg: 'rgba(255,140,0,0.1)', color: '#C47A00' },
  'N11': { bg: 'rgba(100,50,200,0.1)', color: '#6432C8' },
};

const CARRIERS: Carrier[] = ['Sendeo', 'Aras', 'Yurtiçi', 'MNG', 'Sürat'];

// ─── Barkod SVG (sade çizgiler) ──────────────────────────
function BarcodeSVG() {
  const bars = [3,2,4,2,3,1,4,2,3,1,4,2,3,5,2,4,1,3,2,5,1,4,2,3,4,2,1,5,2,3,4,1,3,2,5,1,4,2,3,1,4,3,2,5,1,4,2,3,5,1,4,2,3,4,1,5,2,3,4,1,3,2,3];
  let x = 0;
  const rects: JSX.Element[] = [];
  bars.forEach((w, i) => {
    if (i % 2 === 0) rects.push(<rect key={i} x={x} y={0} width={w} height={36} fill="#1A1915" />);
    x += w + (i % 2 === 0 ? 2 : 1);
  });
  return <svg viewBox={`0 0 ${x} 36`} style={{ width: '100%', height: 36 }}>{rects}</svg>;
}

// ─── Print modal ──────────────────────────────────────────
function PrintModal({ orders, onClose, onConfirm }: {
  orders: Order[];
  onClose: () => void;
  onConfirm: () => void;
}) {
  const totalPkgs = orders.reduce((s, o) => s + o.packages, 0);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: 480, maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1A1915' }}>Barkod Yazdır</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9E9B93' }}>×</button>
        </div>

        <div style={{ background: '#F7F6F2', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13 }}>
          <span style={{ fontWeight: 600, color: '#1A1915' }}>{orders.length} sipariş</span>
          <span style={{ color: '#9E9B93' }}> · {totalPkgs} barkod yazdırılacak</span>
          {orders.some(o => o.printed) && (
            <div style={{ marginTop: 6, color: '#D97706', fontWeight: 600, fontSize: 12 }}>
              ⚠️ {orders.filter(o => o.printed).length} sipariş daha önce yazdırıldı — tekrar yazdırılacak
            </div>
          )}
        </div>

        {orders.map(order => (
          <div key={order.id} style={{ marginBottom: 16, padding: 16, border: '1px solid rgba(26,25,21,0.1)', borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: '#1A1915' }}>{order.id}</span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {order.printed && <span style={{ fontSize: 11, color: '#D97706', fontWeight: 600 }}>Tekrar</span>}
                <span style={{ fontSize: 12, color: '#9E9B93' }}>{order.packages} barkod</span>
              </div>
            </div>
            <BarcodeSVG />
            <div style={{ marginTop: 6, fontSize: 11, fontFamily: 'monospace', color: '#9E9B93', letterSpacing: 2, textAlign: 'center' }}>
              {order.carrier.toUpperCase().substring(0,3)} {order.id.replace('#','').replace('-','')} TR 00
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1.5px solid rgba(26,25,21,0.16)', background: '#F7F6F2', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#5A574F' }}>
            İptal
          </button>
          <button onClick={onConfirm} style={{ flex: 2, padding: '11px', borderRadius: 10, border: 'none', background: '#1A1915', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            🖨 Yazdır ({totalPkgs} barkod)
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Alias editor inline ──────────────────────────────────
function AliasCell({ productId, name, aliases, onSave }: {
  productId: string;
  name: string;
  aliases: Record<string, string>;
  onSave: (id: string, alias: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(aliases[productId] || '');
  const alias = aliases[productId];

  if (editing) {
    return (
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input
          autoFocus
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { onSave(productId, val); setEditing(false); } if (e.key === 'Escape') setEditing(false); }}
          placeholder="kısa ad gir…"
          style={{ fontSize: 12, padding: '3px 8px', borderRadius: 6, border: '1.5px solid #1A6B46', outline: 'none', width: 110, fontFamily: 'inherit', color: '#1A1915' }}
        />
        <button onClick={() => { onSave(productId, val); setEditing(false); }} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: '#1A6B46', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>✓</button>
        <button onClick={() => setEditing(false)} style={{ fontSize: 11, padding: '3px 7px', borderRadius: 6, background: '#F7F6F2', color: '#9E9B93', border: '1px solid rgba(26,25,21,0.12)', cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 13, color: '#1A1915', fontWeight: 500 }}>{alias || name}</span>
      {alias && <span style={{ fontSize: 11, color: '#9E9B93', fontStyle: 'italic' }}>(orijinal: {name.length > 20 ? name.slice(0,20)+'…' : name})</span>}
      <button
        onClick={() => { setVal(aliases[productId] || ''); setEditing(true); }}
        title="Kısa ad tanımla"
        style={{ fontSize: 11, padding: '2px 7px', borderRadius: 5, background: 'transparent', border: '1px solid rgba(26,25,21,0.12)', color: '#9E9B93', cursor: 'pointer', fontFamily: 'inherit', lineHeight: 1.4 }}
      >
        ✏️
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────
export default function SiparislerPage() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterCarrier, setFilterCarrier] = useState<string>('Tümü');
  const [filterStatus, setFilterStatus] = useState<string>('Tümü');
  const [filterPackage, setFilterPackage] = useState<string>('Tümü');
  const [filterPrinted, setFilterPrinted] = useState<string>('Tümü');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [aliases, setAliases] = useState<Record<string, string>>({});

  // Filtered list
  const filtered = useMemo(() => {
    return orders.filter(o => {
      if (filterCarrier !== 'Tümü' && o.carrier !== filterCarrier) return false;
      if (filterStatus !== 'Tümü' && o.status !== filterStatus) return false;
      if (filterPackage === 'Tekli' && o.packages !== 1) return false;
      if (filterPackage === 'Çoklu' && o.packages <= 1) return false;
      if (filterPrinted === 'Yazdırıldı' && !o.printed) return false;
      if (filterPrinted === 'Yazdırılmadı' && o.printed) return false;
      return true;
    });
  }, [orders, filterCarrier, filterStatus, filterPackage, filterPrinted]);

  const selectedOrders = filtered.filter(o => selectedIds.has(o.id));

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id); else s.add(id);
      return s;
    });
  }

  function toggleAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(o => o.id)));
    }
  }

  function toggleExpand(id: string) {
    setExpandedIds(prev => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id); else s.add(id);
      return s;
    });
  }

  function handlePrintConfirm() {
    const ids = new Set(selectedOrders.map(o => o.id));
    setOrders(prev => prev.map(o =>
      ids.has(o.id) ? { ...o, printed: true, printedAt: new Date().toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) } : o
    ));
    setShowPrintModal(false);
    const total = selectedOrders.reduce((s, o) => s + o.packages, 0);
    showToast(`✅ ${total} barkod yazdırıldı`);
    setSelectedIds(new Set());
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  function saveAlias(productId: string, alias: string) {
    setAliases(prev => ({ ...prev, [productId]: alias.trim() }));
  }

  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  // ─── Select styles ───────────────────────────────────────
  const selectStyle: React.CSSProperties = {
    padding: '8px 12px', borderRadius: 8, border: '1.5px solid rgba(26,25,21,0.16)',
    background: '#fff', fontSize: 13, fontFamily: 'inherit', color: '#1A1915',
    cursor: 'pointer', outline: 'none', fontWeight: 500,
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#F7F6F2' }}>
      <Sidebar />

      <main style={{ marginLeft: 240, flex: 1, padding: '32px 36px' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1915' }}>Siparişler</h1>
          <p style={{ fontSize: 13, color: '#9E9B93', marginTop: 4 }}>{orders.length} sipariş · {orders.filter(o => o.status === 'Bekliyor').length} bekliyor</p>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#9E9B93' }}>Kargo</span>
            <select value={filterCarrier} onChange={e => setFilterCarrier(e.target.value)} style={selectStyle}>
              <option>Tümü</option>
              {CARRIERS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#9E9B93' }}>Durum</span>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
              <option>Tümü</option>
              {(['Bekliyor','Kargoda','Teslim Edildi','İade'] as Status[]).map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#9E9B93' }}>Paket</span>
            <select value={filterPackage} onChange={e => setFilterPackage(e.target.value)} style={selectStyle}>
              <option>Tümü</option>
              <option>Tekli</option>
              <option>Çoklu</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#9E9B93' }}>Barkod</span>
            <select value={filterPrinted} onChange={e => setFilterPrinted(e.target.value)} style={selectStyle}>
              <option>Tümü</option>
              <option>Yazdırıldı</option>
              <option>Yazdırılmadı</option>
            </select>
          </div>

          {(filterCarrier !== 'Tümü' || filterStatus !== 'Tümü' || filterPackage !== 'Tümü' || filterPrinted !== 'Tümü') && (
            <button
              onClick={() => { setFilterCarrier('Tümü'); setFilterStatus('Tümü'); setFilterPackage('Tümü'); setFilterPrinted('Tümü'); }}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid rgba(220,38,38,0.3)', background: '#FEE2E2', color: '#DC2626', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Filtreleri Temizle ×
            </button>
          )}

          <div style={{ marginLeft: 'auto', fontSize: 13, color: '#9E9B93' }}>
            {filtered.length} sonuç
          </div>
        </div>

        {/* Action bar (shows when selection active) */}
        {selectedIds.size > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#1A1915', borderRadius: 12, marginBottom: 12 }}>
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{selectedIds.size} sipariş seçildi</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>· {selectedOrders.reduce((s, o) => s + o.packages, 0)} barkod</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button
                onClick={() => setSelectedIds(new Set())}
                style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Seçimi Kaldır
              </button>
              <button
                onClick={() => setShowPrintModal(true)}
                style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#1A6B46', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                🖨 Barkod Yazdır
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 8px rgba(26,25,21,0.06)', border: '1px solid rgba(26,25,21,0.08)', overflow: 'hidden' }}>
          {/* Table head */}
          <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 140px 100px 80px 100px 90px 50px', padding: '10px 16px', borderBottom: '1px solid rgba(26,25,21,0.08)', background: '#F7F6F2' }}>
            {/* Checkbox all */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={allSelected}
                ref={el => { if (el) el.indeterminate = someSelected; }}
                onChange={toggleAll}
                style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#1A6B46' }}
              />
            </div>
            {['Sipariş / Ürünler','Müşteri','Platform','Kargo','Paket','Durum',''].map((h, i) => (
              <div key={i} style={{ fontSize: 11, fontWeight: 700, color: '#9E9B93', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'flex', alignItems: 'center' }}>{h}</div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ padding: '48px', textAlign: 'center', color: '#9E9B93', fontSize: 14 }}>
              Bu filtreyle eşleşen sipariş bulunamadı.
            </div>
          )}

          {filtered.map((order, idx) => {
            const expanded = expandedIds.has(order.id);
            const selected = selectedIds.has(order.id);
            const ss = STATUS_STYLE[order.status];
            const ps = PLATFORM_STYLE[order.platform];
            const firstProduct = order.products[0];

            return (
              <div key={order.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid rgba(26,25,21,0.06)' : 'none', background: selected ? 'rgba(26,107,70,0.04)' : '#fff' }}>
                {/* Main row */}
                <div
                  style={{ display: 'grid', gridTemplateColumns: '40px 1fr 140px 100px 80px 100px 90px 50px', padding: '14px 16px', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => toggleSelect(order.id)}
                >
                  <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleSelect(order.id)}
                      style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#1A6B46' }}
                    />
                  </div>

                  {/* Order + product preview */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img
                      src={firstProduct.image}
                      alt={firstProduct.name}
                      width={40}
                      height={40}
                      style={{ borderRadius: 8, objectFit: 'cover', border: '1px solid rgba(26,25,21,0.08)', flexShrink: 0 }}
                      onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${firstProduct.id}/64/64`; }}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: '#1A1915' }}>{order.id}</div>
                      <div style={{ fontSize: 12, color: '#9E9B93', marginTop: 2 }}>
                        {aliases[firstProduct.id] || (firstProduct.name.length > 28 ? firstProduct.name.slice(0,28)+'…' : firstProduct.name)}
                        {order.products.length > 1 && <span style={{ marginLeft: 5, color: '#1A6B46', fontWeight: 600 }}>+{order.products.length - 1} ürün</span>}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: 13, color: '#1A1915' }}>{order.customer}</div>

                  <div>
                    <span style={{ background: ps.bg, color: ps.color, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999 }}>{order.platform}</span>
                  </div>

                  <div style={{ fontSize: 13, color: '#5A574F', fontWeight: 500 }}>{order.carrier}</div>

                  <div>
                    <span style={{ background: order.packages > 1 ? '#EBF0F9' : '#F7F6F2', color: order.packages > 1 ? '#1A4B8C' : '#9E9B93', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 999 }}>
                      {order.packages > 1 ? `📦 ${order.packages} paket` : '📦 Tekli'}
                    </span>
                  </div>

                  <div>
                    <span style={{ background: ss.bg, color: ss.color, fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                      {order.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                    {order.printed ? (
                      <div title={`Yazdırıldı: ${order.printedAt}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 16 }}>✅</span>
                        <button
                          onClick={() => { setSelectedIds(new Set([order.id])); setShowPrintModal(true); }}
                          title="Tekrar yazdır"
                          style={{ fontSize: 12, padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(26,25,21,0.14)', background: '#F7F6F2', color: '#9E9B93', cursor: 'pointer', fontFamily: 'inherit' }}
                        >↩</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setSelectedIds(new Set([order.id])); setShowPrintModal(true); }}
                        style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: 'none', background: '#1A1915', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
                      >
                        🖨
                      </button>
                    )}
                    <button
                      onClick={() => toggleExpand(order.id)}
                      style={{ fontSize: 14, padding: '3px 7px', borderRadius: 6, border: '1px solid rgba(26,25,21,0.12)', background: 'transparent', color: '#9E9B93', cursor: 'pointer', fontFamily: 'inherit', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                    >
                      ▾
                    </button>
                  </div>
                </div>

                {/* Expanded products */}
                {expanded && (
                  <div style={{ padding: '0 16px 16px 56px', borderTop: '1px dashed rgba(26,25,21,0.08)', background: 'rgba(26,107,70,0.02)' }}>
                    <div style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {order.printed && (
                        <div style={{ fontSize: 12, color: '#D97706', fontWeight: 600, marginBottom: 4 }}>
                          ⚠️ Barkod daha önce yazdırıldı — {order.printedAt}
                        </div>
                      )}
                      {order.products.map(prod => (
                        <div key={prod.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#fff', borderRadius: 10, border: '1px solid rgba(26,25,21,0.08)' }}>
                          <img
                            src={prod.image}
                            alt={prod.name}
                            width={48}
                            height={48}
                            style={{ borderRadius: 8, objectFit: 'cover', border: '1px solid rgba(26,25,21,0.08)', flexShrink: 0 }}
                            onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${prod.id}/64/64`; }}
                          />
                          <div style={{ flex: 1 }}>
                            <AliasCell productId={prod.id} name={prod.name} aliases={aliases} onSave={saveAlias} />
                            <div style={{ display: 'flex', gap: 12, marginTop: 3 }}>
                              <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#9E9B93' }}>{prod.sku}</span>
                              <span style={{ fontSize: 11, color: '#9E9B93' }}>× {prod.qty} adet</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {order.packages > 1 && (
                        <div style={{ padding: '8px 14px', background: '#EBF0F9', borderRadius: 8, fontSize: 12, color: '#1A4B8C', fontWeight: 600 }}>
                          📦 Bu sipariş {order.packages} ayrı pakete bölünmüş — {order.packages} barkod yazdırılacak
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary footer */}
        {filtered.length > 0 && (
          <div style={{ marginTop: 12, padding: '10px 16px', display: 'flex', gap: 20, fontSize: 12, color: '#9E9B93' }}>
            <span>🖨 Yazdırıldı: <b style={{ color: '#1A1915' }}>{filtered.filter(o => o.printed).length}</b></span>
            <span>⏳ Bekleyen: <b style={{ color: '#D97706' }}>{filtered.filter(o => !o.printed).length}</b></span>
            <span>📦 Toplam paket: <b style={{ color: '#1A1915' }}>{filtered.reduce((s,o) => s + o.packages, 0)}</b></span>
          </div>
        )}
      </main>

      {/* Print modal */}
      {showPrintModal && selectedOrders.length > 0 && (
        <PrintModal
          orders={selectedOrders}
          onClose={() => setShowPrintModal(false)}
          onConfirm={handlePrintConfirm}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 28, right: 28, background: '#1A1915', color: '#fff', borderRadius: 12, padding: '14px 20px', fontSize: 14, fontWeight: 600, boxShadow: '0 8px 32px rgba(26,25,21,0.2)', zIndex: 200 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
