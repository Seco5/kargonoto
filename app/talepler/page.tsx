'use client';

import { useState, Fragment } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import Icon from '../components/Icon';

type Platform = 'trendyol' | 'hepsiburada';
type ClaimStatus = 'pending' | 'approved' | 'rejected';
type TYType = 'iade' | 'iptal';
type HBType = 'iade' | 'degisim' | 'eksik' | 'hasarli' | 'yanlis';

interface Claim {
  id: string;
  orderId: string;
  customer: string;
  product: string;
  reason: string;
  date: string;
  status: ClaimStatus;
  amount: number;
  tyType?: TYType; // trendyol
  hbType?: HBType; // hepsiburada
}

const TL = (n: number) =>
  '₺' + n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const emailOf = (name: string) =>
  name.split(' ')[0].toLowerCase().replace(/[çğıöşü]/g, (c) => ({ ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' }[c] || c)) + '@email.com';

const TRENDYOL_CLAIMS: Claim[] = [
  { id: 'TY-İADE-001', orderId: '#TY-8842901', customer: 'Ayşe Kaya', product: 'Kablosuz Kulaklık Pro X3', reason: 'Arızalı ürün', date: '12 Haz', status: 'pending', amount: 1299, tyType: 'iade' },
  { id: 'TY-İADE-002', orderId: '#TY-8843212', customer: 'Mehmet Yılmaz', product: 'Gaming Mouse Set', reason: 'Yanlış ürün', date: '12 Haz', status: 'pending', amount: 459, tyType: 'iade' },
  { id: 'TY-İADE-003', orderId: '#TY-8844001', customer: 'Fatma Şahin', product: 'Akıllı Saat SE 2025', reason: 'Beğenmedim', date: '11 Haz', status: 'pending', amount: 2199, tyType: 'iade' },
  { id: 'TY-İADE-004', orderId: '#TY-8844102', customer: 'Ali Rıza', product: 'Bluetooth Hoparlör', reason: 'Hasarlı teslimat', date: '11 Haz', status: 'pending', amount: 649, tyType: 'iade' },
  { id: 'TY-İADE-005', orderId: '#TY-8844388', customer: 'Zeynep Ak', product: 'USB-C Hub 7 Port', reason: 'Açıklamaya uymuyor', date: '10 Haz', status: 'pending', amount: 389, tyType: 'iade' },
  { id: 'TY-İADE-006', orderId: '#TY-8844501', customer: 'Murat Demir', product: 'Laptop Çantası 15"', reason: 'Arızalı ürün', date: '10 Haz', status: 'pending', amount: 849, tyType: 'iade' },
  { id: 'TY-İADE-007', orderId: '#TY-8843890', customer: 'Selin Çelik', product: 'Mekanik Klavye TKL', reason: 'Yanlış ürün', date: '09 Haz', status: 'approved', amount: 2499, tyType: 'iade' },
  { id: 'TY-İADE-008', orderId: '#TY-8843701', customer: 'Kemal Arslan', product: 'Ring Light 10 inç', reason: 'Beğenmedim', date: '08 Haz', status: 'rejected', amount: 329, tyType: 'iade' },
];

const HEPSIBURADA_CLAIMS: Claim[] = [
  { id: 'HB-TAL-001', orderId: '#HB-5521038', customer: 'Merve Koç', product: 'Deri Çanta Siyah', reason: 'Arızalı ürün', date: '12 Haz', status: 'pending', amount: 1299, hbType: 'iade' },
  { id: 'HB-TAL-002', orderId: '#HB-5521199', customer: 'Kemal Arslan', product: 'Şarj Aleti 65W GaN', reason: 'Yanlış ürün', date: '12 Haz', status: 'pending', amount: 899, hbType: 'degisim' },
  { id: 'HB-TAL-003', orderId: '#HB-5521300', customer: 'Hasan Kara', product: 'Bluetooth Hoparlör Mini', reason: 'Kutu içi eksik', date: '11 Haz', status: 'pending', amount: 649, hbType: 'eksik' },
  { id: 'HB-TAL-004', orderId: '#HB-5521401', customer: 'Cansu Yıldız', product: 'USB-C Hub 7 Port', reason: 'Kırık geldi', date: '11 Haz', status: 'pending', amount: 389, hbType: 'hasarli' },
  { id: 'HB-TAL-005', orderId: '#HB-5521589', customer: 'Tarık Şen', product: 'Webcam Full HD', reason: 'Beğenmedim', date: '10 Haz', status: 'approved', amount: 799, hbType: 'iade' },
  { id: 'HB-TAL-006', orderId: '#HB-5521601', customer: 'Gizem Arslan', product: 'Mousepad XL Gaming', reason: 'Renk farklı', date: '09 Haz', status: 'approved', amount: 259, hbType: 'degisim' },
  { id: 'HB-TAL-007', orderId: '#HB-5521712', customer: 'Burak Yurt', product: 'Mekanik Klavye', reason: 'Fikir değişikliği', date: '08 Haz', status: 'rejected', amount: 899, hbType: 'iade' },
];

const STATUS_META: Record<ClaimStatus, { label: string; bg: string; color: string }> = {
  pending: { label: 'Bekliyor', bg: '#FDF0EB', color: '#C94E1A' },
  approved: { label: 'Onaylandı', bg: '#EBF5EF', color: '#1A6B46' },
  rejected: { label: 'Reddedildi', bg: '#FBEAEA', color: '#D63B3B' },
};

const REASON_STYLE: Record<string, { bg: string; color: string }> = {
  'Arızalı ürün': { bg: '#FBEAEA', color: '#D63B3B' },
  'Yanlış ürün': { bg: 'rgba(100,50,200,0.1)', color: '#6432C8' },
  'Hasarlı teslimat': { bg: '#FDF4E7', color: '#C47A00' },
  Beğenmedim: { bg: '#EEEDEA', color: '#5A574F' },
  'Açıklamaya uymuyor': { bg: '#EBF0F9', color: '#1A4B8C' },
};
const reasonStyle = (r: string) => REASON_STYLE[r] || { bg: '#EEEDEA', color: '#5A574F' };

const HB_TYPE_META: Record<HBType, { label: string; emoji: string; bg: string; color: string }> = {
  iade: { label: 'İade', emoji: '🔴', bg: '#FBEAEA', color: '#D63B3B' },
  degisim: { label: 'Değişim', emoji: '🔄', bg: '#EBF0F9', color: '#1A4B8C' },
  eksik: { label: 'Eksik Parça', emoji: '📦', bg: '#FDF4E7', color: '#C47A00' },
  hasarli: { label: 'Hasarlı', emoji: '💥', bg: 'rgba(100,50,200,0.1)', color: '#6432C8' },
  yanlis: { label: 'Yanlış Ürün', emoji: '❌', bg: '#EEEDEA', color: '#5A574F' },
};

const PLATFORM_DOT: Record<Platform, string> = { trendyol: '#C94E1A', hepsiburada: '#FF8C00' };
const CARGO_OPTIONS = ['Sendeo', 'Aras', 'Yurtiçi'];
const REJECT_REASONS = [
  'İade süresi dolmuş',
  'Ürün kullanılmış / hasarlı',
  'İade politikası kapsamı dışında',
  'Diğer',
];

type StatusFilter = 'pending' | 'approved' | 'rejected';

function Pill({ text, style, emoji }: { text: string; style: { bg: string; color: string }; emoji?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: style.bg, color: style.color, fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999, whiteSpace: 'nowrap' }}>
      {emoji && <span>{emoji}</span>} {text}
    </span>
  );
}

export default function TaleplerPage() {
  const [platform, setPlatform] = useState<Platform>('trendyol');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [tyRows, setTyRows] = useState<Claim[]>(TRENDYOL_CLAIMS);
  const [hbRows, setHbRows] = useState<Claim[]>(HEPSIBURADA_CLAIMS);

  const [approveTarget, setApproveTarget] = useState<Claim | null>(null);
  const [cargo, setCargo] = useState('Sendeo');
  const [note, setNote] = useState('');
  const [exchangeProduct, setExchangeProduct] = useState('');
  const [sendMissingPart, setSendMissingPart] = useState(true);

  const [rejectTarget, setRejectTarget] = useState<Claim | null>(null);
  const [rejectReason, setRejectReason] = useState(REJECT_REASONS[0]);
  const [rejectOther, setRejectOther] = useState('');

  const [detailTarget, setDetailTarget] = useState<Claim | null>(null);
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);

  const rows = platform === 'trendyol' ? tyRows : hbRows;
  const setRows = platform === 'trendyol' ? setTyRows : setHbRows;

  const tyPending = tyRows.filter((c) => c.status === 'pending').length;
  const hbPending = hbRows.filter((c) => c.status === 'pending').length;

  const showToast = (msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  const switchPlatform = (p: Platform) => {
    setPlatform(p);
    setTypeFilter('all');
  };

  const filtered = rows.filter((c) => {
    const matchSearch =
      !search ||
      c.orderId.toLowerCase().includes(search.toLowerCase()) ||
      c.product.toLowerCase().includes(search.toLowerCase());
    const matchStatus = c.status === statusFilter;
    let matchType = true;
    if (typeFilter !== 'all') {
      matchType = platform === 'trendyol' ? c.tyType === typeFilter : c.hbType === typeFilter;
    }
    return matchSearch && matchStatus && matchType;
  });

  const openApprove = (c: Claim) => {
    setApproveTarget(c);
    setCargo('Sendeo');
    setNote('');
    setExchangeProduct('');
    setSendMissingPart(true);
  };

  const confirmApprove = () => {
    if (!approveTarget) return;
    setRows((rs) => rs.map((c) => (c.id === approveTarget.id ? { ...c, status: 'approved' } : c)));
    showToast(`✅ İade onaylandı. ${cargo} iade etiketi oluşturuldu.`);
    setApproveTarget(null);
  };

  const confirmReject = () => {
    if (!rejectTarget) return;
    setRows((rs) => rs.map((c) => (c.id === rejectTarget.id ? { ...c, status: 'rejected' } : c)));
    showToast('İade reddedildi.');
    setRejectTarget(null);
    setRejectReason(REJECT_REASONS[0]);
    setRejectOther('');
  };

  const TABS: { key: Platform; label: string; count: number }[] = [
    { key: 'trendyol', label: 'Trendyol', count: tyPending },
    { key: 'hepsiburada', label: 'Hepsiburada', count: hbPending },
  ];

  const TY_TYPES = [
    { key: 'all', label: 'Tümü' },
    { key: 'iade', label: 'İade' },
    { key: 'iptal', label: 'İptal' },
  ];
  const HB_TYPES = [
    { key: 'all', label: 'Tümü' },
    { key: 'iade', label: 'İade' },
    { key: 'degisim', label: 'Değişim' },
    { key: 'eksik', label: 'Eksik Parça' },
    { key: 'hasarli', label: 'Hasarlı' },
    { key: 'yanlis', label: 'Yanlış Ürün' },
  ];
  const typeButtons = platform === 'trendyol' ? TY_TYPES : HB_TYPES;

  const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
    { key: 'pending', label: 'Bekliyor' },
    { key: 'approved', label: 'Onaylandı' },
    { key: 'rejected', label: 'Reddedildi' },
  ];

  const metrics = [
    { label: 'Bekleyen (TY)', value: tyPending, color: '#C94E1A' },
    { label: 'Bekleyen (HB)', value: hbPending, color: '#C94E1A' },
    { label: 'Bu Ay Onaylanan', value: 47, color: '#1A6B46' },
    { label: 'Bu Ay Reddedilen', value: 8, color: '#D63B3B' },
  ];

  const headers =
    platform === 'trendyol'
      ? ['İade No', 'Sipariş No', 'Müşteri', 'Ürün', 'Sebep', 'Talep Tarihi', 'Durum', 'İşlem']
      : ['Talep No', 'Sipariş No', 'Müşteri', 'Ürün', 'Talep Tipi', 'Sebep', 'Tarih', 'Durum', 'İşlem'];

  const buildTimeline = (c: Claim) => {
    const base = [`${c.date} — Talep oluşturuldu`];
    if (c.status === 'approved') {
      base.push('10 Haz — Onaylandı', '11 Haz — Aras iade etiketi oluşturuldu', '12 Haz — Ürün teslim alındı');
    } else if (c.status === 'rejected') {
      base.push('10 Haz — Reddedildi');
    }
    return base;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#F7F6F2' }}>
      <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } } @keyframes modalIn { from { opacity:0; transform: translateY(12px) scale(0.98);} to { opacity:1; transform: translateY(0) scale(1);} } @keyframes panelIn { from { transform: translateX(100%);} to { transform: translateX(0);} }`}</style>
      <Sidebar />
      <TopBar title="Talepler & İadeler" />

      <main style={{ marginLeft: 240, flex: 1, padding: '88px 36px 32px' }}>
        <div style={{ marginBottom: 22 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1915' }}>Talepler & İadeler</h1>
          <p style={{ fontSize: 13, color: '#9E9B93', marginTop: 4 }}>
            Trendyol ve Hepsiburada&apos;dan gelen iade, değişim ve talepleri yönetin.
          </p>
        </div>

        {/* Metrik kartlar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          {metrics.map((m) => (
            <div key={m.label} style={{ background: '#fff', borderRadius: 14, padding: '18px 22px', boxShadow: '0 1px 8px rgba(26,25,21,0.06)', border: '1px solid rgba(26,25,21,0.08)' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: m.color, letterSpacing: '-1px' }}>{m.value}</div>
              <div style={{ fontSize: 13, color: '#9E9B93', marginTop: 4, fontWeight: 500 }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Platform sekmeleri */}
        <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid #E5E7EB', marginBottom: 20 }}>
          {TABS.map((t) => {
            const active = platform === t.key;
            return (
              <button key={t.key} onClick={() => switchPlatform(t.key)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 0 12px', background: 'none', border: 'none', borderBottom: '2px solid ' + (active ? '#1A1915' : 'transparent'), cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: active ? 700 : 600, color: active ? '#1A1915' : '#9E9B93', marginBottom: -1 }}>
                <span style={{ width: 9, height: 9, borderRadius: 999, background: PLATFORM_DOT[t.key] }} />
                {t.label} ({t.count})
              </button>
            );
          })}
        </div>

        {/* Filtre satırı */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 300 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9E9B93', display: 'flex' }}>
              <Icon name="search" size={16} />
            </span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Sipariş no veya ürün ara..."
              style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: 9, border: '1px solid rgba(26,25,21,0.14)', fontSize: 13, fontFamily: 'inherit', background: '#fff', color: '#1A1915', outline: 'none' }} />
          </div>

          {/* Talep tipi filtresi */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {typeButtons.map((t) => {
              const active = typeFilter === t.key;
              return (
                <button key={t.key} onClick={() => setTypeFilter(t.key)}
                  style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid ' + (active ? '#1A1915' : 'rgba(26,25,21,0.14)'), background: active ? '#1A1915' : '#fff', color: active ? '#fff' : '#5A574F', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Durum filtresi */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {STATUS_FILTERS.map((f) => {
              const active = statusFilter === f.key;
              return (
                <button key={f.key} onClick={() => setStatusFilter(f.key)}
                  style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid ' + (active ? STATUS_META[f.key].color : 'rgba(26,25,21,0.14)'), background: active ? STATUS_META[f.key].color : '#fff', color: active ? '#fff' : '#5A574F', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tablo */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 8px rgba(26,25,21,0.06)', border: '1px solid rgba(26,25,21,0.08)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(26,25,21,0.08)' }}>
                  {headers.map((h) => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9E9B93', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={headers.length} style={{ padding: '40px 16px', textAlign: 'center', color: '#9E9B93', fontSize: 14 }}>
                      Bu filtreye uygun talep yok.
                    </td>
                  </tr>
                )}
                {filtered.map((c, i) => {
                  const showBanner = platform === 'hepsiburada' && c.hbType === 'degisim' && c.status === 'pending';
                  return (
                    <Fragment key={c.id}>
                      <tr style={{ borderBottom: showBanner ? 'none' : i < filtered.length - 1 ? '1px solid rgba(26,25,21,0.06)' : 'none' }}>
                        <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 700, color: '#1A1915', whiteSpace: 'nowrap' }}>{c.id}</td>
                        <td style={{ padding: '13px 16px', fontSize: 13, color: '#5A574F', fontFamily: 'monospace' }}>{c.orderId}</td>
                        <td style={{ padding: '13px 16px', fontSize: 13, color: '#1A1915', whiteSpace: 'nowrap' }}>{c.customer}</td>
                        <td style={{ padding: '13px 16px', fontSize: 13, color: '#1A1915' }}>{c.product}</td>
                        {platform === 'hepsiburada' && (
                          <td style={{ padding: '13px 16px' }}>
                            {c.hbType && <Pill text={HB_TYPE_META[c.hbType].label} emoji={HB_TYPE_META[c.hbType].emoji} style={HB_TYPE_META[c.hbType]} />}
                          </td>
                        )}
                        <td style={{ padding: '13px 16px' }}><Pill text={c.reason} style={reasonStyle(c.reason)} /></td>
                        <td style={{ padding: '13px 16px', fontSize: 13, color: '#9E9B93', whiteSpace: 'nowrap' }}>{c.date}</td>
                        <td style={{ padding: '13px 16px' }}><Pill text={STATUS_META[c.status].label} style={STATUS_META[c.status]} /></td>
                        <td style={{ padding: '13px 16px' }}>
                          {c.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: 7 }}>
                              <button onClick={() => openApprove(c)}
                                style={{ padding: '6px 13px', borderRadius: 7, border: 'none', background: '#1A1915', color: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                                Onayla
                              </button>
                              <button onClick={() => setRejectTarget(c)}
                                style={{ padding: '6px 13px', borderRadius: 7, border: '1px solid #D63B3B', background: '#fff', color: '#D63B3B', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                                Reddet
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setDetailTarget(c)}
                              style={{ padding: '6px 13px', borderRadius: 7, border: '1px solid rgba(26,25,21,0.16)', background: '#fff', color: '#5A574F', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                              Detay
                            </button>
                          )}
                        </td>
                      </tr>
                      {showBanner && (
                        <tr style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(26,25,21,0.06)' : 'none' }}>
                          <td colSpan={headers.length} style={{ padding: '0 16px 13px' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#FEF9E7', color: '#9A7B00', border: '1px solid #F5E2A0', borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 600 }}>
                              ⚠️ Değişim kargo bedeli satıcıya aittir
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
      </main>

      {/* Onayla modalı */}
      {approveTarget && (
        <div onClick={() => setApproveTarget(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(26,25,21,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 16, padding: 24, width: 'min(480px,100%)', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 12px 40px rgba(0,0,0,0.2)', animation: 'modalIn 0.18s ease' }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1A1915', marginBottom: 16 }}>
              {platform === 'hepsiburada' && approveTarget.hbType === 'degisim' ? 'Değişimi Onayla' : 'İadeyi Onayla'}
            </h3>

            {/* Özet kutusu */}
            <div style={{ background: '#F4F3EF', borderRadius: 12, padding: 14, marginBottom: 18, fontSize: 13, color: '#5A574F', lineHeight: 1.8 }}>
              <div><strong style={{ color: '#1A1915' }}>Sipariş:</strong> {approveTarget.orderId}</div>
              <div><strong style={{ color: '#1A1915' }}>Müşteri:</strong> {approveTarget.customer}</div>
              <div><strong style={{ color: '#1A1915' }}>Ürün:</strong> {approveTarget.product}</div>
              <div><strong style={{ color: '#1A1915' }}>Sebep:</strong> {approveTarget.reason}</div>
            </div>

            {/* Kargo firması */}
            <label style={{ fontSize: 12, fontWeight: 700, color: '#9E9B93', display: 'block', marginBottom: 8 }}>Kargo Firması</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              {CARGO_OPTIONS.map((opt) => {
                const active = cargo === opt;
                return (
                  <button key={opt} onClick={() => setCargo(opt)}
                    style={{ flex: 1, padding: '10px', borderRadius: 9, border: '2px solid ' + (active ? '#1A6B46' : 'rgba(26,25,21,0.14)'), background: active ? '#EBF5EF' : '#fff', color: active ? '#1A6B46' : '#5A574F', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* HB Değişim — ek alanlar */}
            {platform === 'hepsiburada' && approveTarget.hbType === 'degisim' && (
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#9E9B93', display: 'block', marginBottom: 6 }}>Değişim ürünü</label>
                <input value={exchangeProduct} onChange={(e) => setExchangeProduct(e.target.value)} placeholder="Yeni ürün barkodu veya adı"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid rgba(26,25,21,0.16)', fontSize: 13, fontFamily: 'inherit', color: '#1A1915', boxSizing: 'border-box', marginBottom: 12 }} />
                <div style={{ background: '#FEF9E7', color: '#9A7B00', border: '1px solid #F5E2A0', borderRadius: 9, padding: '10px 12px', fontSize: 12.5, fontWeight: 600 }}>
                  ⚠️ Değişim ürününün kargo bedeli satıcıya aittir.
                </div>
              </div>
            )}

            {/* HB Eksik Parça — ek alan */}
            {platform === 'hepsiburada' && approveTarget.hbType === 'eksik' && (
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#9E9B93', display: 'block', marginBottom: 8 }}>Eksik parçayı gönderecek misiniz?</label>
                {[{ v: true, l: 'Evet, gönderiyorum' }, { v: false, l: 'Hayır, tam iade yapıyorum' }].map((o) => (
                  <label key={o.l} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#1A1915', padding: '6px 0', cursor: 'pointer' }}>
                    <input type="radio" name="missing" checked={sendMissingPart === o.v} onChange={() => setSendMissingPart(o.v)} />
                    {o.l}
                  </label>
                ))}
              </div>
            )}

            {/* Not */}
            <label style={{ fontSize: 12, fontWeight: 700, color: '#9E9B93', display: 'block', marginBottom: 6 }}>Not (opsiyonel)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Müşteriye iletilecek not (opsiyonel)" rows={3}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid rgba(26,25,21,0.16)', fontSize: 13, fontFamily: 'inherit', color: '#1A1915', resize: 'vertical', boxSizing: 'border-box', marginBottom: 20 }} />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setApproveTarget(null)}
                style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid rgba(26,25,21,0.14)', background: '#fff', color: '#5A574F', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                İptal
              </button>
              <button onClick={confirmApprove}
                style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: '#1A1915', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                ✓ Onayla ve Etiket Oluştur
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reddet modalı */}
      {rejectTarget && (
        <div onClick={() => setRejectTarget(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(26,25,21,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 16, padding: 24, width: 'min(400px,100%)', boxShadow: '0 12px 40px rgba(0,0,0,0.2)', animation: 'modalIn 0.18s ease' }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1A1915', marginBottom: 16 }}>İadeyi Reddet</h3>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#9E9B93', display: 'block', marginBottom: 8 }}>Red Sebebi</label>
            {REJECT_REASONS.map((r) => (
              <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#1A1915', padding: '6px 0', cursor: 'pointer' }}>
                <input type="radio" name="rejectReason" checked={rejectReason === r} onChange={() => setRejectReason(r)} />
                {r}
              </label>
            ))}
            {rejectReason === 'Diğer' && (
              <textarea value={rejectOther} onChange={(e) => setRejectOther(e.target.value)} placeholder="Red sebebini yazın..." rows={3}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid rgba(26,25,21,0.16)', fontSize: 13, fontFamily: 'inherit', color: '#1A1915', resize: 'vertical', boxSizing: 'border-box', marginTop: 8 }} />
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button onClick={() => setRejectTarget(null)}
                style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid rgba(26,25,21,0.14)', background: '#fff', color: '#5A574F', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                İptal
              </button>
              <button onClick={confirmReject}
                style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: '#D63B3B', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Reddet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detay slide panel */}
      {detailTarget && (
        <div onClick={() => setDetailTarget(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(26,25,21,0.35)', zIndex: 55 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(440px,100%)', background: '#fff', boxShadow: '-8px 0 32px rgba(0,0,0,0.18)', animation: 'panelIn 0.22s ease', overflowY: 'auto', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1A1915' }}>{detailTarget.id}</h3>
              <button onClick={() => setDetailTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9E9B93', display: 'flex' }}>
                <Icon name="x" size={20} />
              </button>
            </div>

            <Section title="Müşteri">
              <Row k="Ad" v={detailTarget.customer} />
              <Row k="E-posta" v={emailOf(detailTarget.customer)} />
              <Row k="Telefon" v="0555 XXX XX XX" />
            </Section>

            <Section title="Sipariş">
              <Row k="No" v={detailTarget.orderId} />
              <Row k="Ürün" v={detailTarget.product} />
              <Row k="Tutar" v={TL(detailTarget.amount)} />
              <Row k="Sebep" v={detailTarget.reason} />
            </Section>

            <Section title="Süreç Geçmişi">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {buildTimeline(detailTarget).map((t, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#5A574F' }}>
                    <span style={{ color: '#1A6B46', display: 'flex' }}><Icon name="check-circle" size={15} /></span>
                    {t}
                  </div>
                ))}
              </div>
            </Section>

            <button
              onClick={() => showToast('İade raporu indiriliyor...')}
              style={{ marginTop: 8, width: '100%', padding: '11px', borderRadius: 9, border: '1px solid rgba(26,25,21,0.16)', background: '#fff', color: '#1A1915', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              <Icon name="download" size={16} /> İade Raporunu İndir
            </button>
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#9E9B93', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13, padding: '4px 0' }}>
      <span style={{ color: '#9E9B93' }}>{k}</span>
      <span style={{ color: '#1A1915', fontWeight: 600, textAlign: 'right' }}>{v}</span>
    </div>
  );
}
