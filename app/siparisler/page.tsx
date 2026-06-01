'use client';

import { useState, useMemo, JSX, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Icon from '../components/Icon';

// small helper for inline icon + label inside buttons/labels
function IconText({ name, color, children, gap = 6, size = 15 }: { name: import('../components/Icon').IconName; color?: string; children: React.ReactNode; gap?: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap }}>
      <Icon name={name} size={size} color={color} strokeWidth={1.8} />{children}
    </span>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Status   = 'Bekliyor' | 'Kargoda' | 'Teslim Edildi' | 'İade';
type Platform = 'Trendyol' | 'Hepsiburada' | 'N11' | 'ÇiçekSepeti' | 'Trendyol Go' | 'Getir' | 'Yemeksepeti' | 'Amazon';
type Carrier  = 'Sendeo' | 'Aras' | 'Yurtiçi' | 'MNG' | 'Sürat' | 'PTT' | 'Getir Kargo';
type SyncState = 'idle' | 'loading' | 'success' | 'error';

interface Product {
  id: string; name: string; sku: string; image: string; qty: number;
}
interface Order {
  id: string; customer: string; platform: Platform; carrier: Carrier;
  status: Status; date: string; packages: number;
  products: Product[]; printed: boolean; printedAt?: string;
  isNew?: boolean; // flag freshly-synced rows
}
interface PlatformConfig {
  key: Platform;
  label: string;
  abbr: string;
  bg: string;
  color: string;
  icon: string;
  syncState: SyncState;
  lastSync: string | null;
  newCount: number;
  enabled: boolean;
}

// ─── Dummy images ─────────────────────────────────────────────────────────────
const IMG: Record<string, string> = {
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
  'PRD-013': 'https://picsum.photos/seed/flower/64/64',
  'PRD-014': 'https://picsum.photos/seed/pizza/64/64',
  'PRD-015': 'https://picsum.photos/seed/sushi/64/64',
  'PRD-016': 'https://picsum.photos/seed/amazon/64/64',
};

// ─── Initial orders ───────────────────────────────────────────────────────────
const INITIAL_ORDERS: Order[] = [
  { id: '#TY-8842901', customer: 'Ayşe Kaya', platform: 'Trendyol', carrier: 'Sendeo', status: 'Bekliyor', date: '01 Haz', packages: 1, printed: false, products: [{ id: 'PRD-001', name: 'Kablosuz Kulaklık Pro X3', sku: 'SKU-00441', image: IMG['PRD-001'], qty: 1 }] },
  { id: '#HB-5521038', customer: 'Mehmet Yılmaz', platform: 'Hepsiburada', carrier: 'Aras', status: 'Bekliyor', date: '01 Haz', packages: 2, printed: false, products: [{ id: 'PRD-002', name: 'Deri Çanta, Siyah', sku: 'SKU-01123', image: IMG['PRD-002'], qty: 1 }, { id: 'PRD-005', name: 'Mekanik Klavye TKL', sku: 'SKU-00892', image: IMG['PRD-005'], qty: 1 }] },
  { id: '#N11-3310094', customer: 'Fatma Şahin', platform: 'N11', carrier: 'Yurtiçi', status: 'Bekliyor', date: '31 May', packages: 1, printed: true, printedAt: '31 May 14:22', products: [{ id: 'PRD-003', name: 'Akıllı Saat SE 2025', sku: 'SKU-02201', image: IMG['PRD-003'], qty: 1 }] },
  { id: '#TY-8843212', customer: 'Ali Rıza', platform: 'Trendyol', carrier: 'Sendeo', status: 'Kargoda', date: '31 May', packages: 1, printed: true, printedAt: '31 May 10:05', products: [{ id: 'PRD-004', name: 'Gaming Mouse + Pad Set', sku: 'SKU-00892', image: IMG['PRD-004'], qty: 1 }] },
  { id: '#HB-5521199', customer: 'Zeynep Ak', platform: 'Hepsiburada', carrier: 'MNG', status: 'İade', date: '30 May', packages: 1, printed: true, printedAt: '30 May 09:10', products: [{ id: 'PRD-006', name: 'Oversize T-Shirt', sku: 'SKU-03312', image: IMG['PRD-006'], qty: 2 }] },
  { id: '#TY-8844001', customer: 'Murat Demir', platform: 'Trendyol', carrier: 'Sendeo', status: 'Bekliyor', date: '30 May', packages: 3, printed: false, products: [{ id: 'PRD-007', name: 'Spor Ayakkabı', sku: 'SKU-04401', image: IMG['PRD-007'], qty: 1 }, { id: 'PRD-008', name: 'Akıllı Telefon Kılıfı', sku: 'SKU-04402', image: IMG['PRD-008'], qty: 1 }, { id: 'PRD-011', name: 'Hızlı Şarj Adaptörü', sku: 'SKU-04403', image: IMG['PRD-011'], qty: 1 }] },
  { id: '#N11-3310201', customer: 'Selin Çelik', platform: 'N11', carrier: 'Aras', status: 'Bekliyor', date: '29 May', packages: 1, printed: false, products: [{ id: 'PRD-009', name: 'Masa Lambası LED', sku: 'SKU-05510', image: IMG['PRD-009'], qty: 1 }] },
  { id: '#HB-5521300', customer: 'Kemal Arslan', platform: 'Hepsiburada', carrier: 'Sendeo', status: 'Kargoda', date: '29 May', packages: 2, printed: true, printedAt: '29 May 16:45', products: [{ id: 'PRD-010', name: 'Programlama Kitabı', sku: 'SKU-06601', image: IMG['PRD-010'], qty: 1 }, { id: 'PRD-001', name: 'Kablosuz Kulaklık Pro X3', sku: 'SKU-00441', image: IMG['PRD-001'], qty: 1 }] },
  { id: '#TY-8844102', customer: 'Merve Koç', platform: 'Trendyol', carrier: 'Yurtiçi', status: 'Kargoda', date: '28 May', packages: 1, printed: true, printedAt: '28 May 11:30', products: [{ id: 'PRD-012', name: 'Deri Mont', sku: 'SKU-07701', image: IMG['PRD-012'], qty: 1 }] },
  { id: '#N11-3310388', customer: 'Burak Yurt', platform: 'N11', carrier: 'MNG', status: 'Teslim Edildi', date: '28 May', packages: 1, printed: true, printedAt: '28 May 08:15', products: [{ id: 'PRD-004', name: 'Gaming Mouse + Pad Set', sku: 'SKU-00892', image: IMG['PRD-004'], qty: 1 }] },
  { id: '#TY-8844250', customer: 'Canan Yıldız', platform: 'Trendyol', carrier: 'Sürat', status: 'Bekliyor', date: '01 Haz', packages: 2, printed: false, products: [{ id: 'PRD-003', name: 'Akıllı Saat SE 2025', sku: 'SKU-02201', image: IMG['PRD-003'], qty: 1 }, { id: 'PRD-008', name: 'Akıllı Telefon Kılıfı', sku: 'SKU-04402', image: IMG['PRD-008'], qty: 2 }] },
  { id: '#HB-5521410', customer: 'Emre Aktaş', platform: 'Hepsiburada', carrier: 'Aras', status: 'Bekliyor', date: '01 Haz', packages: 1, printed: false, products: [{ id: 'PRD-005', name: 'Mekanik Klavye TKL', sku: 'SKU-00892', image: IMG['PRD-005'], qty: 1 }] },
];

// ─── Platform definitions ─────────────────────────────────────────────────────
const PLATFORM_DEFS: Omit<PlatformConfig, 'syncState' | 'lastSync' | 'newCount'>[] = [
  { key: 'Trendyol',     label: 'Trendyol',      abbr: 'TY',  bg: 'rgba(201,78,26,0.1)',   color: '#C94E1A', icon: '🛒', enabled: true  },
  { key: 'Hepsiburada',  label: 'Hepsiburada',   abbr: 'HB',  bg: 'rgba(255,140,0,0.1)',   color: '#C47A00', icon: '🟠', enabled: true  },
  { key: 'N11',          label: 'N11',            abbr: 'N11', bg: 'rgba(100,50,200,0.1)',  color: '#6432C8', icon: '🟣', enabled: true  },
  { key: 'ÇiçekSepeti',  label: 'ÇiçekSepeti',   abbr: 'ÇS',  bg: 'rgba(236,72,153,0.1)',  color: '#DB2777', icon: '🌸', enabled: false },
  { key: 'Trendyol Go',  label: 'Trendyol Go',   abbr: 'TGO', bg: 'rgba(201,78,26,0.08)',  color: '#C94E1A', icon: '⚡', enabled: false },
  { key: 'Getir',        label: 'Getir',          abbr: 'GET', bg: 'rgba(103,58,183,0.1)',  color: '#5E35B1', icon: '🟣', enabled: false },
  { key: 'Yemeksepeti',  label: 'Yemeksepeti',   abbr: 'YS',  bg: 'rgba(239,68,68,0.1)',   color: '#DC2626', icon: '🍔', enabled: false },
  { key: 'Amazon',       label: 'Amazon',         abbr: 'AMZ', bg: 'rgba(255,153,0,0.12)',  color: '#B45309', icon: '📦', enabled: false },
];

// ─── Mock new orders that arrive on sync per platform ────────────────────────
function mockFetch(platform: Platform): Promise<Order[]> {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });

  // Simulate occasional error for demo realism
  const willError = Math.random() < 0.08;

  return new Promise((resolve, reject) => {
    const delay = 900 + Math.random() * 1200;
    setTimeout(() => {
      if (willError) { reject(new Error('API bağlantı hatası')); return; }

      const pool: Record<Platform, Order[]> = {
        'Trendyol': [
          { id: `#TY-${Date.now().toString().slice(-7)}`, customer: 'Hande Yıldırım', platform: 'Trendyol', carrier: 'Sendeo', status: 'Bekliyor', date: dateStr, packages: 1, printed: false, isNew: true, products: [{ id: 'PRD-001', name: 'Kablosuz Kulaklık Pro X3', sku: 'SKU-00441', image: IMG['PRD-001'], qty: 1 }] },
          { id: `#TY-${(Date.now()+1).toString().slice(-7)}`, customer: 'Barış Öztürk', platform: 'Trendyol', carrier: 'Sendeo', status: 'Bekliyor', date: dateStr, packages: 2, printed: false, isNew: true, products: [{ id: 'PRD-007', name: 'Spor Ayakkabı', sku: 'SKU-04401', image: IMG['PRD-007'], qty: 1 }, { id: 'PRD-011', name: 'Hızlı Şarj Adaptörü', sku: 'SKU-04403', image: IMG['PRD-011'], qty: 1 }] },
        ],
        'Hepsiburada': [
          { id: `#HB-${Date.now().toString().slice(-7)}`, customer: 'Didem Kara', platform: 'Hepsiburada', carrier: 'Aras', status: 'Bekliyor', date: dateStr, packages: 1, printed: false, isNew: true, products: [{ id: 'PRD-003', name: 'Akıllı Saat SE 2025', sku: 'SKU-02201', image: IMG['PRD-003'], qty: 1 }] },
        ],
        'N11': [
          { id: `#N11-${Date.now().toString().slice(-7)}`, customer: 'Tolga Şimşek', platform: 'N11', carrier: 'Yurtiçi', status: 'Bekliyor', date: dateStr, packages: 1, printed: false, isNew: true, products: [{ id: 'PRD-009', name: 'Masa Lambası LED', sku: 'SKU-05510', image: IMG['PRD-009'], qty: 1 }] },
        ],
        'ÇiçekSepeti': [
          { id: `#CS-${Date.now().toString().slice(-7)}`, customer: 'Aylin Çetin', platform: 'ÇiçekSepeti', carrier: 'Sendeo', status: 'Bekliyor', date: dateStr, packages: 1, printed: false, isNew: true, products: [{ id: 'PRD-013', name: 'Gül Buketi 50 Adet', sku: 'SKU-09901', image: IMG['PRD-013'], qty: 1 }] },
        ],
        'Trendyol Go': [
          { id: `#TGO-${Date.now().toString().slice(-7)}`, customer: 'Serdar Koç', platform: 'Trendyol Go', carrier: 'Getir Kargo', status: 'Bekliyor', date: dateStr, packages: 1, printed: false, isNew: true, products: [{ id: 'PRD-011', name: 'Hızlı Şarj Adaptörü', sku: 'SKU-04403', image: IMG['PRD-011'], qty: 2 }] },
        ],
        'Getir': [
          { id: `#GET-${Date.now().toString().slice(-7)}`, customer: 'Özlem Aydın', platform: 'Getir', carrier: 'Getir Kargo', status: 'Bekliyor', date: dateStr, packages: 1, printed: false, isNew: true, products: [{ id: 'PRD-014', name: 'Karışık Pizza Large', sku: 'SKU-11100', image: IMG['PRD-014'], qty: 1 }] },
        ],
        'Yemeksepeti': [
          { id: `#YS-${Date.now().toString().slice(-7)}`, customer: 'Cem Yılmaz', platform: 'Yemeksepeti', carrier: 'PTT', status: 'Bekliyor', date: dateStr, packages: 1, printed: false, isNew: true, products: [{ id: 'PRD-015', name: 'Sushi Set 32 Parça', sku: 'SKU-11200', image: IMG['PRD-015'], qty: 1 }] },
        ],
        'Amazon': [
          { id: `#AMZ-${Date.now().toString().slice(-7)}`, customer: 'Linda Weber', platform: 'Amazon', carrier: 'MNG', status: 'Bekliyor', date: dateStr, packages: 1, printed: false, isNew: true, products: [{ id: 'PRD-016', name: 'Laptop Stand Aluminium', sku: 'SKU-12300', image: IMG['PRD-016'], qty: 1 }] },
          { id: `#AMZ-${(Date.now()+2).toString().slice(-7)}`, customer: 'John Smith', platform: 'Amazon', carrier: 'Aras', status: 'Bekliyor', date: dateStr, packages: 2, printed: false, isNew: true, products: [{ id: 'PRD-001', name: 'Kablosuz Kulaklık Pro X3', sku: 'SKU-00441', image: IMG['PRD-001'], qty: 1 }, { id: 'PRD-004', name: 'Gaming Mouse + Pad Set', sku: 'SKU-00892', image: IMG['PRD-004'], qty: 1 }] },
        ],
      };

      void timeStr; // used to tag logs, suppress lint
      resolve(pool[platform] ?? []);
    }, delay);
  });
}

// ─── Style helpers ────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  'Bekliyor':     { bg: '#FEF3C7', color: '#D97706' },
  'Kargoda':      { bg: '#DBEAFE', color: '#1D4ED8' },
  'Teslim Edildi':{ bg: '#D1FAE5', color: '#065F46' },
  'İade':         { bg: '#FEE2E2', color: '#DC2626' },
};
const CARRIERS: Carrier[] = ['Sendeo','Aras','Yurtiçi','MNG','Sürat','PTT','Getir Kargo'];

// ─── Barcode SVG ──────────────────────────────────────────────────────────────
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

// ─── Print modal ──────────────────────────────────────────────────────────────
function PrintModal({ orders, onClose, onConfirm }: { orders: Order[]; onClose: () => void; onConfirm: () => void }) {
  const totalPkgs = orders.reduce((s, o) => s + o.packages, 0);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: 480, maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1A1915' }}>Barkod Yazdır</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9E9B93' }}>×</button>
        </div>
        <div style={{ background: '#F7F6F2', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13 }}>
          <span style={{ fontWeight: 600, color: '#1A1915' }}>{orders.length} sipariş</span>
          <span style={{ color: '#9E9B93' }}> · {totalPkgs} barkod yazdırılacak</span>
          {orders.some(o => o.printed) && <div style={{ marginTop: 6, color: '#D97706', fontWeight: 600, fontSize: 12 }}><IconText name="alert" color="#D97706" size={13}>{orders.filter(o => o.printed).length} sipariş daha önce yazdırıldı — tekrar yazdırılacak</IconText></div>}
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
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1.5px solid rgba(26,25,21,0.16)', background: '#F7F6F2', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#5A574F' }}>İptal</button>
          <button onClick={onConfirm} style={{ flex: 2, padding: '11px', borderRadius: 10, border: 'none', background: '#1A1915', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}><Icon name="printer" size={16} /> Yazdır ({totalPkgs} barkod)</button>
        </div>
      </div>
    </div>
  );
}

// ─── Alias editor ─────────────────────────────────────────────────────────────
function AliasCell({ productId, name, aliases, onSave }: { productId: string; name: string; aliases: Record<string, string>; onSave: (id: string, alias: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(aliases[productId] || '');
  const alias = aliases[productId];
  if (editing) return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <input autoFocus value={val} onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { onSave(productId, val); setEditing(false); } if (e.key === 'Escape') setEditing(false); }}
        placeholder="kısa ad gir…"
        style={{ fontSize: 12, padding: '3px 8px', borderRadius: 6, border: '1.5px solid #1A6B46', outline: 'none', width: 110, fontFamily: 'inherit', color: '#1A1915' }} />
      <button onClick={() => { onSave(productId, val); setEditing(false); }} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: '#1A6B46', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>✓</button>
      <button onClick={() => setEditing(false)} style={{ fontSize: 11, padding: '3px 7px', borderRadius: 6, background: '#F7F6F2', color: '#9E9B93', border: '1px solid rgba(26,25,21,0.12)', cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>
    </div>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 13, color: '#1A1915', fontWeight: 500 }}>{alias || name}</span>
      {alias && <span style={{ fontSize: 11, color: '#9E9B93', fontStyle: 'italic' }}>(orijinal: {name.length > 20 ? name.slice(0,20)+'…' : name})</span>}
      <button onClick={() => { setVal(aliases[productId] || ''); setEditing(true); }} title="Kısa ad tanımla"
        style={{ padding: '3px 7px', borderRadius: 5, background: 'transparent', border: '1px solid rgba(26,25,21,0.12)', color: '#9E9B93', cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center' }}><Icon name="edit" size={13} /></button>
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
  );
}

// ─── Platform sync card ───────────────────────────────────────────────────────
function PlatformCard({ cfg, onToggle, onSync }: { cfg: PlatformConfig; onToggle: () => void; onSync: () => void }) {
  const loading  = cfg.syncState === 'loading';
  const success  = cfg.syncState === 'success';
  const error    = cfg.syncState === 'error';

  return (
    <div style={{
      border: `1.5px solid ${cfg.enabled ? cfg.color + '40' : 'rgba(26,25,21,0.1)'}`,
      borderRadius: 12,
      padding: '12px 14px',
      background: cfg.enabled ? cfg.bg : '#F7F6F2',
      opacity: cfg.enabled ? 1 : 0.55,
      transition: 'all 0.2s',
      minWidth: 150,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 26, height: 26, borderRadius: 7, background: cfg.enabled ? cfg.color : '#D4D2CC', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, letterSpacing: '-0.3px' }}>{cfg.abbr}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: cfg.enabled ? cfg.color : '#9E9B93' }}>{cfg.label}</span>
        </div>
        {/* Toggle switch */}
        <div
          onClick={onToggle}
          style={{ width: 32, height: 18, borderRadius: 9, background: cfg.enabled ? cfg.color : 'rgba(26,25,21,0.15)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
        >
          <div style={{ position: 'absolute', top: 2, left: cfg.enabled ? 16 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
        </div>
      </div>

      {/* Status row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, color: '#9E9B93' }}>
          {!cfg.enabled && 'Bağlı değil'}
          {cfg.enabled && !cfg.lastSync && !loading && 'Hiç çekilmedi'}
          {cfg.enabled && cfg.lastSync && !loading && !error && (
            <span>{success && cfg.newCount > 0 ? <span style={{ color: '#1A6B46', fontWeight: 600 }}>+{cfg.newCount} yeni · </span> : null}{cfg.lastSync}</span>
          )}
          {cfg.enabled && loading && <span style={{ color: cfg.color, fontWeight: 600 }}>Çekiliyor…</span>}
          {cfg.enabled && error && <span style={{ color: '#DC2626', fontWeight: 600 }}>Hata · tekrar dene</span>}
        </div>
        {cfg.enabled && (
          <button
            onClick={onSync}
            disabled={loading}
            style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: 'none', background: loading ? 'rgba(26,25,21,0.1)' : cfg.color, color: loading ? '#9E9B93' : '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}
          >
            {loading ? <><Spinner /> Çekiyor</> : <><Icon name={error ? 'undo' : 'refresh'} size={13} /> {error ? 'Tekrar' : 'Çek'}</>}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SiparislerPage() {
  const [orders, setOrders]           = useState<Order[]>(INITIAL_ORDERS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterCarrier, setFC]        = useState('Tümü');
  const [filterStatus, setFS]         = useState('Tümü');
  const [filterPackage, setFP]        = useState('Tümü');
  const [filterPrinted, setFPr]       = useState('Tümü');
  const [filterPlatform, setFPl]      = useState('Tümü');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showPrintModal, setShowPrint]= useState(false);
  const [toast, setToast]             = useState<{ msg: string; type: 'ok'|'err' } | null>(null);
  const [aliases, setAliases]         = useState<Record<string, string>>({});
  const [syncPanelOpen, setSyncPanel] = useState(false);

  // Platform configs
  const [platforms, setPlatforms] = useState<PlatformConfig[]>(
    PLATFORM_DEFS.map(d => ({ ...d, syncState: 'idle', lastSync: null, newCount: 0 }))
  );

  const showToast = useCallback((msg: string, type: 'ok'|'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ─── Sync single platform ──────────────────────────────────────────────────
  const syncPlatform = useCallback((platform: Platform) => {
    setPlatforms(prev => prev.map(p => p.key === platform ? { ...p, syncState: 'loading', newCount: 0 } : p));

    mockFetch(platform)
      .then(newOrders => {
        setOrders(prev => {
          const existingIds = new Set(prev.map(o => o.id));
          const truly = newOrders.filter(o => !existingIds.has(o.id));
          return [...truly, ...prev];
        });
        const timeStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        setPlatforms(prev => prev.map(p => p.key === platform
          ? { ...p, syncState: 'success', lastSync: timeStr, newCount: newOrders.length }
          : p
        ));
        showToast(`${platform}: ${newOrders.length} yeni sipariş`);
        // Clear "isNew" highlight after 8s
        setTimeout(() => setOrders(prev => prev.map(o => ({ ...o, isNew: false }))), 8000);
      })
      .catch(() => {
        setPlatforms(prev => prev.map(p => p.key === platform ? { ...p, syncState: 'error' } : p));
        showToast(`${platform} API hatası — tekrar dene`, 'err');
      });
  }, [showToast]);

  // ─── Sync all enabled platforms ───────────────────────────────────────────
  const syncAll = useCallback(() => {
    const enabled = platforms.filter(p => p.enabled);
    enabled.forEach(p => syncPlatform(p.key));
  }, [platforms, syncPlatform]);

  // ─── Filtering ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => orders.filter(o => {
    if (filterCarrier  !== 'Tümü' && o.carrier  !== filterCarrier)  return false;
    if (filterStatus   !== 'Tümü' && o.status   !== filterStatus)   return false;
    if (filterPlatform !== 'Tümü' && o.platform !== filterPlatform) return false;
    if (filterPackage  === 'Tekli'  && o.packages !== 1)  return false;
    if (filterPackage  === 'Çoklu'  && o.packages <= 1)  return false;
    if (filterPrinted  === 'Yazdırıldı'   && !o.printed) return false;
    if (filterPrinted  === 'Yazdırılmadı' &&  o.printed) return false;
    return true;
  }), [orders, filterCarrier, filterStatus, filterPackage, filterPrinted, filterPlatform]);

  const selectedOrders = filtered.filter(o => selectedIds.has(o.id));
  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  function toggleSelect(id: string) {
    setSelectedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }
  function toggleAll() {
    setSelectedIds(allSelected ? new Set() : new Set(filtered.map(o => o.id)));
  }
  function toggleExpand(id: string) {
    setExpandedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }
  function handlePrintConfirm() {
    const ids = new Set(selectedOrders.map(o => o.id));
    const ts = new Date().toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    setOrders(prev => prev.map(o => ids.has(o.id) ? { ...o, printed: true, printedAt: ts } : o));
    const total = selectedOrders.reduce((s, o) => s + o.packages, 0);
    showToast(`${total} barkod yazdırıldı`);
    setSelectedIds(new Set());
    setShowPrint(false);
  }

  const enabledCount = platforms.filter(p => p.enabled).length;
  const anyLoading   = platforms.some(p => p.syncState === 'loading');

  const selectStyle: React.CSSProperties = {
    padding: '8px 12px', borderRadius: 8, border: '1.5px solid rgba(26,25,21,0.16)',
    background: '#fff', fontSize: 13, fontFamily: 'inherit', color: '#1A1915', cursor: 'pointer', outline: 'none', fontWeight: 500,
  };
  const activePlatforms = platforms.filter(p => p.enabled).map(p => p.key as string);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#F7F6F2' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } } @keyframes fadeSlideIn { from { opacity:0;transform:translateY(-6px) } to { opacity:1;transform:translateY(0) } }`}</style>
      <Sidebar />

      <main style={{ marginLeft: 240, flex: 1, padding: '32px 36px' }}>

        {/* ── Header row ────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1915' }}>Siparişler</h1>
            <p style={{ fontSize: 13, color: '#9E9B93', marginTop: 4 }}>
              {orders.length} sipariş · {orders.filter(o => o.status === 'Bekliyor').length} bekliyor
            </p>
          </div>

          {/* Sync button group */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => setSyncPanel(v => !v)}
              style={{ padding: '9px 14px', borderRadius: 9, border: '1.5px solid rgba(26,25,21,0.16)', background: syncPanelOpen ? '#1A1915' : '#fff', color: syncPanelOpen ? '#fff' : '#1A1915', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Icon name="integrations" size={15} /> Platformlar {enabledCount > 0 && <span style={{ background: syncPanelOpen ? 'rgba(255,255,255,0.2)' : '#1A6B46', color: '#fff', borderRadius: 999, fontSize: 11, padding: '1px 7px', fontWeight: 700 }}>{enabledCount}</span>}
            </button>
            <button
              onClick={syncAll}
              disabled={enabledCount === 0 || anyLoading}
              style={{ padding: '9px 18px', borderRadius: 9, border: 'none', background: enabledCount === 0 || anyLoading ? 'rgba(26,25,21,0.12)' : '#1A6B46', color: enabledCount === 0 || anyLoading ? '#9E9B93' : '#fff', fontSize: 13, fontWeight: 700, cursor: enabledCount === 0 || anyLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7 }}
            >
              {anyLoading ? <><Spinner /> Güncelleniyor…</> : <><Icon name="refresh" size={15} /> Tümünü Güncelle</>}
            </button>
          </div>
        </div>

        {/* ── Platform sync panel ────────────────────────────────────────── */}
        {syncPanelOpen && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(26,25,21,0.1)', padding: '20px 20px 16px', marginBottom: 20, animation: 'fadeSlideIn 0.2s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1915' }}>Platform Bağlantıları</span>
                <span style={{ fontSize: 12, color: '#9E9B93', marginLeft: 10 }}>Aktif platformlardan siparişleri çek</span>
              </div>
              <button
                onClick={syncAll}
                disabled={enabledCount === 0 || anyLoading}
                style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: enabledCount === 0 || anyLoading ? 'rgba(26,25,21,0.1)' : '#1A1915', color: enabledCount === 0 || anyLoading ? '#9E9B93' : '#fff', fontSize: 13, fontWeight: 700, cursor: enabledCount === 0 || anyLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {anyLoading ? <><Spinner /> Güncelleniyor</> : <><Icon name="refresh" size={15} /> {enabledCount} Platformu Güncelle</>}
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
              {platforms.map(cfg => (
                <PlatformCard
                  key={cfg.key}
                  cfg={cfg}
                  onToggle={() => setPlatforms(prev => prev.map(p => p.key === cfg.key ? { ...p, enabled: !p.enabled } : p))}
                  onSync={() => syncPlatform(cfg.key)}
                />
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 11, color: '#9E9B93' }}>
              💡 Açık/kapalı toggle ile hangi platformların aktif olacağını seç. &quot;Tümünü Güncelle&quot; sadece açık platformları çeker.
            </div>
          </div>
        )}

        {/* ── Filter bar ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#9E9B93' }}>Platform</span>
            <select value={filterPlatform} onChange={e => setFPl(e.target.value)} style={selectStyle}>
              <option>Tümü</option>
              {activePlatforms.map(p => <option key={p}>{p}</option>)}
              {/* also include platforms that have orders but are now toggled off */}
              {Array.from(new Set(orders.map(o => o.platform))).filter(p => !activePlatforms.includes(p)).map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#9E9B93' }}>Kargo</span>
            <select value={filterCarrier} onChange={e => setFC(e.target.value)} style={selectStyle}>
              <option>Tümü</option>
              {CARRIERS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#9E9B93' }}>Durum</span>
            <select value={filterStatus} onChange={e => setFS(e.target.value)} style={selectStyle}>
              <option>Tümü</option>
              {(['Bekliyor','Kargoda','Teslim Edildi','İade'] as Status[]).map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#9E9B93' }}>Paket</span>
            <select value={filterPackage} onChange={e => setFP(e.target.value)} style={selectStyle}>
              <option>Tümü</option><option>Tekli</option><option>Çoklu</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#9E9B93' }}>Barkod</span>
            <select value={filterPrinted} onChange={e => setFPr(e.target.value)} style={selectStyle}>
              <option>Tümü</option><option>Yazdırıldı</option><option>Yazdırılmadı</option>
            </select>
          </div>
          {(filterCarrier !== 'Tümü' || filterStatus !== 'Tümü' || filterPackage !== 'Tümü' || filterPrinted !== 'Tümü' || filterPlatform !== 'Tümü') && (
            <button onClick={() => { setFC('Tümü'); setFS('Tümü'); setFP('Tümü'); setFPr('Tümü'); setFPl('Tümü'); }}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid rgba(220,38,38,0.3)', background: '#FEE2E2', color: '#DC2626', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Filtreleri Temizle ×
            </button>
          )}
          <div style={{ marginLeft: 'auto', fontSize: 13, color: '#9E9B93' }}>{filtered.length} sonuç</div>
        </div>

        {/* ── Action bar (selection) ─────────────────────────────────────── */}
        {selectedIds.size > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#1A1915', borderRadius: 12, marginBottom: 12 }}>
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{selectedIds.size} sipariş seçildi</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>· {selectedOrders.reduce((s, o) => s + o.packages, 0)} barkod</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button onClick={() => setSelectedIds(new Set())} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Seçimi Kaldır</button>
              <button onClick={() => setShowPrint(true)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#1A6B46', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 7 }}><Icon name="printer" size={15} /> Barkod Yazdır</button>
            </div>
          </div>
        )}

        {/* ── Orders table ───────────────────────────────────────────────── */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 8px rgba(26,25,21,0.06)', border: '1px solid rgba(26,25,21,0.08)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 140px 110px 80px 80px 100px 50px', padding: '10px 16px', borderBottom: '1px solid rgba(26,25,21,0.08)', background: '#F7F6F2' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input type="checkbox" checked={allSelected} ref={el => { if (el) el.indeterminate = someSelected; }} onChange={toggleAll} style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#1A6B46' }} />
            </div>
            {['Sipariş / Ürünler','Müşteri','Platform','Kargo','Paket','Durum',''].map((h, i) => (
              <div key={i} style={{ fontSize: 11, fontWeight: 700, color: '#9E9B93', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'flex', alignItems: 'center' }}>{h}</div>
            ))}
          </div>

          {filtered.length === 0 && <div style={{ padding: '48px', textAlign: 'center', color: '#9E9B93', fontSize: 14 }}>Bu filtreyle eşleşen sipariş bulunamadı.</div>}

          {filtered.map((order, idx) => {
            const expanded = expandedIds.has(order.id);
            const selected = selectedIds.has(order.id);
            const ss = STATUS_STYLE[order.status];
            const pd = PLATFORM_DEFS.find(p => p.key === order.platform)!;
            const firstProduct = order.products[0];
            return (
              <div key={order.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid rgba(26,25,21,0.06)' : 'none', background: order.isNew ? 'rgba(26,107,70,0.06)' : selected ? 'rgba(26,107,70,0.03)' : '#fff', transition: 'background 1s' }}>
                <div
                  style={{ display: 'grid', gridTemplateColumns: '40px 1fr 140px 110px 80px 80px 100px 50px', padding: '13px 16px', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => toggleSelect(order.id)}
                >
                  <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center' }}>
                    <input type="checkbox" checked={selected} onChange={() => toggleSelect(order.id)} style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#1A6B46' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img src={firstProduct.image} alt={firstProduct.name} width={40} height={40}
                        style={{ borderRadius: 8, objectFit: 'cover', border: '1px solid rgba(26,25,21,0.08)', display: 'block' }}
                        onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${firstProduct.id}/64/64`; }} />
                      {order.isNew && <span style={{ position: 'absolute', top: -4, right: -4, width: 10, height: 10, background: '#1A6B46', borderRadius: '50%', border: '2px solid #fff' }} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: '#1A1915' }}>{order.id}</div>
                      <div style={{ fontSize: 12, color: '#9E9B93', marginTop: 2 }}>
                        {(aliases[firstProduct.id] || firstProduct.name).slice(0,28)}{(aliases[firstProduct.id] || firstProduct.name).length > 28 ? '…' : ''}
                        {order.products.length > 1 && <span style={{ marginLeft: 5, color: '#1A6B46', fontWeight: 600 }}>+{order.products.length - 1}</span>}
                        {order.isNew && <span style={{ marginLeft: 6, fontSize: 10, background: '#1A6B46', color: '#fff', borderRadius: 4, padding: '1px 5px', fontWeight: 700 }}>YENİ</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: '#1A1915' }}>{order.customer}</div>
                  <div>
                    {pd && <span style={{ background: pd.bg, color: pd.color, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999 }}>{pd.abbr || pd.label}</span>}
                  </div>
                  <div style={{ fontSize: 13, color: '#5A574F', fontWeight: 500 }}>{order.carrier}</div>
                  <div>
                    <span style={{ background: order.packages > 1 ? '#EBF0F9' : '#F7F6F2', color: order.packages > 1 ? '#1A4B8C' : '#9E9B93', fontSize: 12, fontWeight: 600, padding: '3px 9px', borderRadius: 999 }}>
                      {order.packages > 1 ? `${order.packages}p` : '1p'}
                    </span>
                  </div>
                  <div>
                    <span style={{ background: ss.bg, color: ss.color, fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>{order.status}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 5, alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                    {order.printed ? (
                      <>
                        <span title={`Yazdırıldı: ${order.printedAt}`} style={{ display: 'inline-flex', color: '#1A6B46' }}><Icon name="check-circle" size={17} /></span>
                        <button onClick={() => { setSelectedIds(new Set([order.id])); setShowPrint(true); }} title="Tekrar yazdır"
                          style={{ padding: '4px 7px', borderRadius: 6, border: '1px solid rgba(26,25,21,0.14)', background: '#F7F6F2', color: '#9E9B93', cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center' }}><Icon name="undo" size={13} /></button>
                      </>
                    ) : (
                      <button onClick={() => { setSelectedIds(new Set([order.id])); setShowPrint(true); }} title="Barkod yazdır"
                        style={{ padding: '5px 9px', borderRadius: 6, border: 'none', background: '#1A1915', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center' }}><Icon name="printer" size={14} /></button>
                    )}
                    <button onClick={() => toggleExpand(order.id)}
                      style={{ fontSize: 14, padding: '3px 6px', borderRadius: 6, border: '1px solid rgba(26,25,21,0.12)', background: 'transparent', color: '#9E9B93', cursor: 'pointer', fontFamily: 'inherit', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</button>
                  </div>
                </div>

                {expanded && (
                  <div style={{ padding: '0 16px 16px 56px', borderTop: '1px dashed rgba(26,25,21,0.08)', background: 'rgba(26,107,70,0.02)' }}>
                    <div style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {order.printed && <div style={{ fontSize: 12, color: '#D97706', fontWeight: 600, marginBottom: 2 }}><IconText name="alert" color="#D97706" size={13}>Barkod daha önce yazdırıldı — {order.printedAt}</IconText></div>}
                      {order.products.map(prod => (
                        <div key={prod.id + order.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#fff', borderRadius: 10, border: '1px solid rgba(26,25,21,0.08)' }}>
                          <img src={prod.image} alt={prod.name} width={48} height={48}
                            style={{ borderRadius: 8, objectFit: 'cover', border: '1px solid rgba(26,25,21,0.08)', flexShrink: 0 }}
                            onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${prod.id}/64/64`; }} />
                          <div style={{ flex: 1 }}>
                            <AliasCell productId={prod.id} name={prod.name} aliases={aliases} onSave={(id, val) => setAliases(prev => ({ ...prev, [id]: val.trim() }))} />
                            <div style={{ display: 'flex', gap: 12, marginTop: 3 }}>
                              <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#9E9B93' }}>{prod.sku}</span>
                              <span style={{ fontSize: 11, color: '#9E9B93' }}>× {prod.qty} adet</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {order.packages > 1 && (
                        <div style={{ padding: '8px 14px', background: '#EBF0F9', borderRadius: 8, fontSize: 12, color: '#1A4B8C', fontWeight: 600 }}>
                          <IconText name="stock" color="#1A4B8C" size={14}>Bu sipariş {order.packages} ayrı pakete bölünmüş — {order.packages} barkod yazdırılacak</IconText>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Footer summary ─────────────────────────────────────────────── */}
        {filtered.length > 0 && (
          <div style={{ marginTop: 12, padding: '10px 16px', display: 'flex', gap: 20, fontSize: 12, color: '#9E9B93', alignItems: 'center' }}>
            <IconText name="printer" color="#9E9B93" size={14}>Yazdırıldı: <b style={{ color: '#1A1915', marginLeft: 2 }}>{filtered.filter(o => o.printed).length}</b></IconText>
            <IconText name="clock" color="#D97706" size={14}>Bekleyen: <b style={{ color: '#D97706', marginLeft: 2 }}>{filtered.filter(o => !o.printed).length}</b></IconText>
            <IconText name="stock" color="#9E9B93" size={14}>Toplam paket: <b style={{ color: '#1A1915', marginLeft: 2 }}>{filtered.reduce((s, o) => s + o.packages, 0)}</b></IconText>
          </div>
        )}
      </main>

      {showPrintModal && selectedOrders.length > 0 && (
        <PrintModal orders={selectedOrders} onClose={() => setShowPrint(false)} onConfirm={handlePrintConfirm} />
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 28, right: 28, background: toast.type === 'err' ? '#DC2626' : '#1A1915', color: '#fff', borderRadius: 12, padding: '14px 20px', fontSize: 14, fontWeight: 600, boxShadow: '0 8px 32px rgba(26,25,21,0.2)', zIndex: 200, animation: 'fadeSlideIn 0.3s ease' }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
