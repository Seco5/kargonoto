'use client';

import { useState, useMemo, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import Icon from '../components/Icon';

type InvType = 'e-Fatura' | 'e-Arşiv';
type InvStatus = 'İletildi' | 'Bekliyor' | 'Hata';
type Platform = 'Trendyol' | 'Hepsiburada' | 'N11';

interface Invoice {
  id: string;
  orderId: string;
  customer: string;
  email: string;
  platform: Platform;
  amount: number;
  type: InvType;
  status: InvStatus;
  date: string;
}

const INITIAL: Invoice[] = [
  { id: 'FAT-2024-001', orderId: '#TY-8842901', customer: 'Ayşe Kaya', email: 'ayse@email.com', platform: 'Trendyol', amount: 1606.68, type: 'e-Fatura', status: 'İletildi', date: '01 Haz' },
  { id: 'FAT-2024-002', orderId: '#HB-5521038', customer: 'Mehmet Yılmaz', email: 'mehmet@email.com', platform: 'Hepsiburada', amount: 849.90, type: 'e-Arşiv', status: 'İletildi', date: '01 Haz' },
  { id: 'FAT-2024-003', orderId: '#N11-3310094', customer: 'Fatma Şahin', email: 'fatma@email.com', platform: 'N11', amount: 2199.00, type: 'e-Fatura', status: 'İletildi', date: '01 Haz' },
  { id: 'FAT-2024-004', orderId: '#TY-8843212', customer: 'Ali Rıza', email: 'ali@email.com', platform: 'Trendyol', amount: 459.90, type: 'e-Arşiv', status: 'İletildi', date: '31 May' },
  { id: 'FAT-2024-005', orderId: '#HB-5521199', customer: 'Zeynep Ak', email: 'zeynep@email.com', platform: 'Hepsiburada', amount: 1299.00, type: 'e-Fatura', status: 'Bekliyor', date: '31 May' },
  { id: 'FAT-2024-006', orderId: '#TY-8844001', customer: 'Murat Demir', email: 'murat@email.com', platform: 'Trendyol', amount: 3450.00, type: 'e-Fatura', status: 'İletildi', date: '30 May' },
  { id: 'FAT-2024-007', orderId: '#N11-3310201', customer: 'Selin Çelik', email: 'selin@email.com', platform: 'N11', amount: 789.90, type: 'e-Arşiv', status: 'İletildi', date: '30 May' },
  { id: 'FAT-2024-008', orderId: '#HB-5521300', customer: 'Kemal Arslan', email: 'kemal@email.com', platform: 'Hepsiburada', amount: 2840.00, type: 'e-Fatura', status: 'Hata', date: '29 May' },
  { id: 'FAT-2024-009', orderId: '#TY-8844102', customer: 'Merve Koç', email: 'merve@email.com', platform: 'Trendyol', amount: 649.90, type: 'e-Arşiv', status: 'İletildi', date: '29 May' },
  { id: 'FAT-2024-010', orderId: '#N11-3310388', customer: 'Burak Yurt', email: 'burak@email.com', platform: 'N11', amount: 1890.00, type: 'e-Fatura', status: 'İletildi', date: '28 May' },
  { id: 'FAT-2024-011', orderId: '#TY-8844201', customer: 'Elif Demir', email: 'elif@email.com', platform: 'Trendyol', amount: 3199.00, type: 'e-Fatura', status: 'İletildi', date: '28 May' },
  { id: 'FAT-2024-012', orderId: '#HB-5521401', customer: 'Hasan Kara', email: 'hasan@email.com', platform: 'Hepsiburada', amount: 529.90, type: 'e-Arşiv', status: 'İletildi', date: '27 May' },
  { id: 'FAT-2024-013', orderId: '#N11-3310502', customer: 'Cansu Yıldız', email: 'cansu@email.com', platform: 'N11', amount: 4299.00, type: 'e-Fatura', status: 'Bekliyor', date: '27 May' },
  { id: 'FAT-2024-014', orderId: '#TY-8844388', customer: 'Tarık Şen', email: 'tarik@email.com', platform: 'Trendyol', amount: 899.90, type: 'e-Arşiv', status: 'İletildi', date: '26 May' },
  { id: 'FAT-2024-015', orderId: '#HB-5521589', customer: 'Gizem Arslan', email: 'gizem@email.com', platform: 'Hepsiburada', amount: 1749.00, type: 'e-Fatura', status: 'İletildi', date: '26 May' },
];

const TL = (n: number) => '₺' + n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STATUS_STYLE: Record<InvStatus, { bg: string; color: string }> = {
  'İletildi': { bg: '#EBF5EF', color: '#1A6B46' },
  'Bekliyor': { bg: '#FEF9EB', color: '#B45309' },
  'Hata': { bg: '#FBEAEA', color: '#D63B3B' },
};

const TYPE_STYLE: Record<InvType, { bg: string; color: string }> = {
  'e-Fatura': { bg: 'rgba(26,25,21,0.08)', color: '#1A1915' },
  'e-Arşiv': { bg: '#EBF0F9', color: '#1A4B8C' },
};

const PLATFORM_STYLE: Record<Platform, { bg: string; color: string }> = {
  'Trendyol': { bg: 'rgba(201,78,26,0.1)', color: '#C94E1A' },
  'Hepsiburada': { bg: 'rgba(255,140,0,0.1)', color: '#C47A00' },
  'N11': { bg: 'rgba(100,50,200,0.1)', color: '#6432C8' },
};

function Badge({ text, style }: { text: string; style: { bg: string; color: string } }) {
  return (
    <span style={{ background: style.bg, color: style.color, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999, whiteSpace: 'nowrap' }}>
      {text}
    </span>
  );
}

function PdfButton({ small }: { small?: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        fontSize: small ? 11 : 13, fontWeight: 600, padding: small ? '4px 10px' : '8px 16px',
        borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit',
        border: '1px solid ' + (hover ? '#1A1915' : 'rgba(26,25,21,0.18)'),
        background: hover ? '#1A1915' : '#fff',
        color: hover ? '#fff' : '#5A574F',
        transition: 'all 0.12s',
      }}
    >
      PDF
    </button>
  );
}

function SlidePanel({ inv, onClose }: { inv: Invoice; onClose: () => void }) {
  const subtotal = inv.amount / 1.2;
  const kdv = inv.amount - subtotal;
  const isError = inv.status === 'Hata';

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 40 }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 440, background: '#fff', boxShadow: '-8px 0 32px rgba(0,0,0,0.16)', zIndex: 50, overflowY: 'auto', animation: 'slideIn 0.22s ease', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ padding: '24px 26px', borderBottom: '1px solid rgba(26,25,21,0.08)', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 22, width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(26,25,21,0.12)', background: '#fff', cursor: 'pointer', fontSize: 16, color: '#5A574F', fontFamily: 'inherit' }}>✕</button>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1A1915', letterSpacing: '-0.5px' }}>{inv.id}</div>
          <div style={{ fontSize: 13, color: '#5A574F', marginTop: 6 }}>Sipariş: {inv.orderId} · {inv.platform} · {inv.date} 2026</div>
          <div style={{ fontSize: 13, color: '#5A574F', marginTop: 3 }}>Müşteri: {inv.customer} · {inv.email}</div>
        </div>

        <div style={{ padding: '22px 26px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9E9B93', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Fatura Kalemleri</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(26,25,21,0.06)' }}>
                <td style={{ padding: '8px 0', color: '#1A1915' }}>Kablosuz Kulaklık Pro X3</td>
                <td style={{ padding: '8px 0', color: '#9E9B93', textAlign: 'center' }}>×1</td>
                <td style={{ padding: '8px 0', color: '#1A1915', textAlign: 'right', fontWeight: 600 }}>{TL(1299.00)}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(26,25,21,0.06)' }}>
                <td style={{ padding: '8px 0', color: '#1A1915' }}>Sendeo Kargo Ücreti</td>
                <td style={{ padding: '8px 0', color: '#9E9B93', textAlign: 'center' }}>×1</td>
                <td style={{ padding: '8px 0', color: '#1A1915', textAlign: 'right', fontWeight: 600 }}>{TL(39.90)}</td>
              </tr>
              <tr>
                <td colSpan={2} style={{ padding: '8px 0', color: '#5A574F' }}>Ara Toplam</td>
                <td style={{ padding: '8px 0', color: '#1A1915', textAlign: 'right' }}>{TL(subtotal)}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(26,25,21,0.08)' }}>
                <td colSpan={2} style={{ padding: '8px 0', color: '#5A574F' }}>KDV (%20)</td>
                <td style={{ padding: '8px 0', color: '#1A1915', textAlign: 'right' }}>{TL(kdv)}</td>
              </tr>
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1A1915', color: '#fff', borderRadius: 10, padding: '12px 16px', marginTop: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>TOPLAM</span>
            <span style={{ fontSize: 18, fontWeight: 800 }}>{TL(inv.amount)}</span>
          </div>
        </div>

        <div style={{ padding: '4px 26px 22px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9E9B93', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Fatura İletim Durumu</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Badge text="✓ GİB" style={{ bg: '#EBF5EF', color: '#1A6B46' }} />
            {isError ? (
              <Badge text="✗ HB Paneli — İletilemedi" style={{ bg: '#FBEAEA', color: '#D63B3B' }} />
            ) : (
              <Badge text={'✓ ' + inv.platform} style={PLATFORM_STYLE[inv.platform]} />
            )}
            <Badge text="✓ Müşteri" style={{ bg: '#EBF0F9', color: '#1A4B8C' }} />
          </div>
          <div style={{ fontSize: 11, color: '#9E9B93', marginTop: 10, fontFamily: 'monospace' }}>GİB UUID: e8f4a2b1-9c3d-4e5f-a6b7-c8d9e0f1a2b3</div>

          {isError && (
            <div style={{ background: '#FFF5F5', border: '1px solid rgba(214,59,59,0.25)', borderRadius: 10, padding: '12px 14px', marginTop: 14, fontSize: 12.5, color: '#D63B3B', lineHeight: 1.5 }}>
              Hepsiburada paneline iletim başarısız. Tekrar denemek için &apos;Yeniden Gönder&apos; butonuna tıklayın.
            </div>
          )}
        </div>

        <div style={{ padding: '0 26px 26px', display: 'flex', gap: 10 }}>
          <button style={{ flex: 1, padding: '11px', borderRadius: 9, border: '1px solid rgba(26,25,21,0.18)', background: '#fff', color: '#1A1915', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>PDF İndir</button>
          <button style={{ flex: 1, padding: '11px', borderRadius: 9, border: isError ? '1px solid #1A1915' : '1px solid rgba(26,25,21,0.18)', background: isError ? '#1A1915' : '#fff', color: isError ? '#fff' : '#1A1915', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Yeniden Gönder</button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 2 — Kargo Fatura Kontrolü
// ─────────────────────────────────────────────────────────────────────────────

const KK_CARRIERS = [
  { key: 'sendeo', label: 'Sendeo', anlasmali: true },
  { key: 'aras', label: 'Aras' },
  { key: 'yurtici', label: 'Yurtiçi' },
  { key: 'mng', label: 'MNG' },
];

type Row = { awb: string; date: string; expected: number; billed: number; reason: string; ok: boolean };
const KK_ROWS: Row[] = [
  { awb: 'SNE-2024-44821', date: '03 May', expected: 53, billed: 67, reason: 'Desi farkı', ok: false },
  { awb: 'SNE-2024-44903', date: '05 May', expected: 53, billed: 78.5, reason: 'Yakıt zammı eklendi', ok: false },
  { awb: 'SNE-2024-45112', date: '08 May', expected: 53, billed: 67, reason: 'Desi farkı', ok: false },
  { awb: 'SNE-2024-45388', date: '11 May', expected: 53, billed: 53, reason: '—', ok: true },
  { awb: 'SNE-2024-45501', date: '12 May', expected: 53, billed: 89, reason: 'Ek hizmet bedeli', ok: false },
  { awb: 'SNE-2024-45672', date: '14 May', expected: 53, billed: 67, reason: 'Desi farkı', ok: false },
  { awb: 'SNE-2024-45890', date: '16 May', expected: 53, billed: 53, reason: '—', ok: true },
  { awb: 'SNE-2024-46001', date: '18 May', expected: 53, billed: 71, reason: 'Adres düzeltme bedeli', ok: false },
  { awb: 'SNE-2024-46234', date: '21 May', expected: 53, billed: 53, reason: '—', ok: true },
  { awb: 'SNE-2024-46489', date: '24 May', expected: 53, billed: 67, reason: 'Desi farkı', ok: false },
];

const money = (n: number) => n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function KargoKontrol() {
  const [carrier, setCarrier] = useState('sendeo');
  const [start, setStart] = useState('2026-05-01');
  const [end, setEnd] = useState('2026-05-31');
  const [file, setFile] = useState<{ name: string; size: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };

  const onPickFile = (f?: File | null) => {
    if (!f) return;
    setFile({ name: f.name || 'mayis_2026_sendeo_fatura.xlsx', size: ((f.size || 2516582) / 1048576).toFixed(1) + ' MB' });
    setDone(false);
  };

  const handleCheck = () => {
    if (!file) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 60);
    }, 1500);
  };

  const cardBtn = (variant: 'outline' | 'primary'): React.CSSProperties => ({
    width: '100%', padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    border: variant === 'primary' ? 'none' : '1px solid rgba(26,25,21,0.18)',
    background: variant === 'primary' ? '#1A1915' : '#fff', color: variant === 'primary' ? '#fff' : '#1A1915',
  });

  return (
    <>
      <style>{`@keyframes kkspin { to { transform: rotate(360deg); } }`}</style>

      {/* Açıklama banner'ı */}
      <div style={{ display: 'flex', gap: 14, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 14, padding: '16px 20px', marginBottom: 24 }}>
        <span style={{ color: '#B45309', flexShrink: 0, marginTop: 1 }}><Icon name="zap" size={20} /></span>
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: '#92400E' }}>Kargo faturanızda fazla ödeme var mı?</div>
          <div style={{ fontSize: 12.5, color: '#92400E', marginTop: 4, lineHeight: 1.5, opacity: 0.9 }}>
            Kargo firmanızın size gönderdiği faturayı yükleyin, anlaşma fiyatlarınızla otomatik karşılaştıralım. Fazla alınan ücretleri saniyeler içinde tespit edin.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* ── SOL KOLON ── */}
        <div style={{ flex: 1, minWidth: 460, display: 'flex', flexDirection: 'column', gap: 22 }}>
          {/* Adım 1 */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1915', marginBottom: 10 }}>1. Kargo Firmasını Seçin</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
              {KK_CARRIERS.map(c => {
                const sel = carrier === c.key;
                return (
                  <button key={c.key} onClick={() => { setCarrier(c.key); setDone(false); }}
                    style={{
                      background: sel ? '#EBF5EF' : '#fff', border: '1px solid ' + (sel ? '#1A6B46' : '#E5E7EB'),
                      borderRadius: 12, padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600,
                      color: '#1A1915', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                    }}
                    onMouseEnter={e => { if (!sel) (e.currentTarget as HTMLElement).style.borderColor = '#1A1915'; }}
                    onMouseLeave={e => { if (!sel) (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB'; }}
                  >
                    {c.label}{c.anlasmali && <Icon name="check-circle" size={13} color="#1A6B46" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Adım 2 */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1915', marginBottom: 10 }}>2. Fatura Dönemi</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <input type="date" value={start} onChange={e => setStart(e.target.value)} style={{ flex: 1, fontSize: 13, padding: '10px 12px', borderRadius: 10, border: '1px solid #E5E7EB', fontFamily: 'inherit', color: '#1A1915', background: '#fff' }} />
              <input type="date" value={end} onChange={e => setEnd(e.target.value)} style={{ flex: 1, fontSize: 13, padding: '10px 12px', borderRadius: 10, border: '1px solid #E5E7EB', fontFamily: 'inherit', color: '#1A1915', background: '#fff' }} />
            </div>
          </div>

          {/* Adım 3 */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1915', marginBottom: 10 }}>3. Kargo Faturasını Yükleyin</div>
            <div
              onClick={() => fileInput.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); onPickFile(e.dataTransfer.files?.[0]); }}
              style={{
                background: file ? '#F0FDF4' : dragOver ? '#F0FDF4' : '#fff',
                border: '2px dashed ' + (file || dragOver ? '#1A6B46' : '#E5E7EB'),
                borderRadius: 18, padding: 40, textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <input ref={fileInput} type="file" accept=".xlsx,.csv" style={{ display: 'none' }} onChange={e => onPickFile(e.target.files?.[0])} />
              {file ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, color: '#1A6B46', fontWeight: 600, fontSize: 14 }}>
                  <Icon name="check-circle" size={20} /> {file.name} · {file.size}
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'center', color: '#9E9B93', marginBottom: 12 }}><Icon name="folder" size={42} strokeWidth={1.4} /></div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1915' }}>Excel veya CSV dosyasını buraya sürükleyin</div>
                  <div style={{ fontSize: 12, color: '#9E9B93', margin: '8px 0' }}>veya</div>
                  <span style={{ display: 'inline-block', padding: '8px 18px', borderRadius: 9, border: '1px solid #1A1915', color: '#1A1915', fontSize: 13, fontWeight: 600 }}>Dosya Seç</span>
                  <div style={{ fontSize: 11.5, color: '#9E9B93', marginTop: 12 }}>.xlsx, .csv desteklenir · Maks 10MB</div>
                </>
              )}
            </div>
            <div style={{ marginTop: 10 }}>
              <a onClick={() => showToast('Şablon indiriliyor... (Demo)')} style={{ fontSize: 12.5, color: '#1A6B46', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}>Örnek Şablon İndir</a>
            </div>
          </div>

          {/* Kontrol Et */}
          <button
            onClick={handleCheck}
            disabled={!file || loading}
            style={{
              width: '100%', padding: 16, borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 700,
              fontFamily: 'inherit', cursor: !file || loading ? 'not-allowed' : 'pointer',
              background: !file ? 'rgba(26,25,21,0.12)' : '#1A1915', color: !file ? '#9E9B93' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
            }}
          >
            {loading ? (
              <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'kkspin 0.7s linear infinite' }} /> Analiz ediliyor...</>
            ) : (
              <><Icon name="search" size={17} /> Faturayı Kontrol Et</>
            )}
          </button>

          {/* Sonuç tablosu */}
          {done && (
            <div ref={resultRef}>
              <div style={{ fontSize: 13, color: '#5A574F', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600 }}>Mayıs 2026 · Sendeo Kargo · 847 kalem analiz edildi ·</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#C94E1A', fontWeight: 700 }}><Icon name="alert" size={14} /> 23 uyuşmazlık tespit edildi</span>
              </div>

              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(26,25,21,0.08)', boxShadow: '0 1px 8px rgba(26,25,21,0.06)', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(26,25,21,0.08)', fontSize: 15, fontWeight: 700, color: '#D63B3B' }}>Tespit Edilen Uyuşmazlıklar</div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(26,25,21,0.08)' }}>
                        {['AWB No', 'Tarih', 'Beklenen', 'Faturalanan', 'Fark', 'Sebep', 'Durum'].map(h => (
                          <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9E9B93', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {KK_ROWS.map((r, i) => {
                        const diff = r.billed - r.expected;
                        const big = diff >= 14;
                        return (
                          <tr key={r.awb} style={{ borderBottom: i < KK_ROWS.length - 1 ? '1px solid rgba(26,25,21,0.06)' : 'none' }}>
                            <td style={{ padding: '12px 16px', fontSize: 12.5, fontWeight: 600, color: '#1A1915', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{r.awb}</td>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: '#9E9B93', whiteSpace: 'nowrap' }}>{r.date}</td>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: '#5A574F' }}>{money(r.expected)} ₺</td>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: '#1A1915', fontWeight: 500 }}>{money(r.billed)} ₺</td>
                            <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: big ? 700 : 500, color: diff === 0 ? '#9E9B93' : big ? '#D63B3B' : '#5A574F', whiteSpace: 'nowrap' }}>{diff > 0 ? '+' : ''}{money(diff)} ₺</td>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: '#5A574F' }}>{r.reason}</td>
                            <td style={{ padding: '12px 16px' }}>
                              {r.ok ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#EBF5EF', color: '#1A6B46', fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}><Icon name="check-circle" size={12} /> Uyumlu</span>
                              ) : (
                                <button onClick={() => showToast('İtiraz kaydedildi. Sendeo ile iletişime geçilecek.')}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#FDF0EB', color: '#C94E1A', fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                                  <Icon name="alert" size={12} /> İtiraz Et
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(26,25,21,0.06)' }}>
                  <span style={{ fontSize: 12.5, color: '#9E9B93', cursor: 'pointer', textDecoration: 'underline' }}>... ve 13 uyuşmazlık daha</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── SAĞ KOLON ── */}
        <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Özet kart */}
          <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(26,25,21,0.08)', boxShadow: '0 1px 8px rgba(26,25,21,0.06)', padding: 24 }}>
            {!done ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', color: '#C9C6BE', marginBottom: 12 }}><Icon name="chart" size={34} strokeWidth={1.5} /></div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1915', marginBottom: 6 }}>Faturanızı yükleyip kontrol ettirin</div>
                <div style={{ fontSize: 12.5, color: '#9E9B93', lineHeight: 1.5 }}>Analiz sonucu burada özetlenecek.</div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: '#1A1915' }}><Icon name="chart" size={18} color="#1A6B46" /> Analiz Özeti</div>
                <div style={{ fontSize: 12.5, color: '#9E9B93', marginTop: 3 }}>Mayıs 2026 · Sendeo</div>
                <div style={{ borderTop: '1px solid #F0EFEB', margin: '14px 0', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#5A574F' }}>Toplam Kalem:</span><b style={{ color: '#1A1915' }}>847</b></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#5A574F' }}>Uyumlu:</span><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#1A6B46', fontWeight: 700 }}>824 <Icon name="check-circle" size={13} /></span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#5A574F' }}>Uyuşmazlık:</span><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#C94E1A', fontWeight: 700 }}>23 <Icon name="alert" size={13} /></span></div>
                </div>
                <div style={{ fontSize: 12, color: '#9E9B93' }}>Beklenen Toplam:</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1915', marginBottom: 8 }}>₺44.891,00</div>
                <div style={{ fontSize: 12, color: '#9E9B93' }}>Faturalanan Toplam:</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1915' }}>₺46.233,50</div>
                <div style={{ borderTop: '1px solid #F0EFEB', margin: '14px 0 0', paddingTop: 14 }}>
                  <div style={{ fontSize: 12, color: '#9E9B93' }}>Fazla Ödeme:</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 24, fontWeight: 800, color: '#D63B3B', marginTop: 2 }}>
                    ₺1.342,50 <span style={{ width: 9, height: 9, borderRadius: 999, background: '#D63B3B', display: 'inline-block' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
                  <button onClick={() => showToast('Rapor hazırlanıyor... (Demo)')} style={cardBtn('outline')}><Icon name="download" size={15} /> Raporu İndir</button>
                  <button onClick={() => showToast('23 itiraz Sendeo’ya iletildi. Yanıt 3-5 iş günü içinde gelecek.')} style={cardBtn('primary')}><Icon name="mail" size={15} /> Sendeo&apos;ya İtiraz Gönder</button>
                </div>
              </>
            )}
          </div>

          {/* CTA kart */}
          <div style={{ background: '#EBF5EF', border: '1px solid rgba(26,107,70,0.2)', borderRadius: 18, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#1A6B46', marginBottom: 8 }}><Icon name="bulb" size={15} /> Pro İpucu</div>
            <div style={{ fontSize: 12.5, color: '#1A6B46', lineHeight: 1.5, marginBottom: 14, opacity: 0.92 }}>
              Pro plan ile tüm kargo firmalarınızın faturalarını otomatik ve anlık kontrol edin. Manuel yüklemeye gerek kalmaz.
            </div>
            <button onClick={() => alert('Satış ekibimiz sizi arayacak! 🎉')} style={{ background: '#1A6B46', color: '#fff', border: 'none', borderRadius: 999, padding: '10px 18px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Pro&apos;ya Geç →</button>
          </div>
        </div>
      </div>

      {/* Toasts */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 100 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ background: '#EBF5EF', color: '#1A6B46', border: '1px solid rgba(26,107,70,0.25)', borderRadius: 10, padding: '12px 18px', fontSize: 13, fontWeight: 600, boxShadow: '0 6px 24px rgba(0,0,0,0.12)', maxWidth: 340 }}>{t.msg}</div>
        ))}
      </div>
    </>
  );
}

export default function FaturaPage() {
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState<'Tümü' | Platform>('Tümü');
  const [type, setType] = useState<'Tümü' | InvType>('Tümü');
  const [status, setStatus] = useState<'Tümü' | InvStatus>('Tümü');
  const [period, setPeriod] = useState('Bu Ay');
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [tab, setTab] = useState<'kesilen' | 'kontrol'>('kesilen');

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('tr');
    return INITIAL.filter(inv => {
      if (platform !== 'Tümü' && inv.platform !== platform) return false;
      if (type !== 'Tümü' && inv.type !== type) return false;
      if (status !== 'Tümü' && inv.status !== status) return false;
      if (q && !inv.id.toLocaleLowerCase('tr').includes(q) && !inv.customer.toLocaleLowerCase('tr').includes(q)) return false;
      return true;
    });
  }, [search, platform, type, status]);

  const selectStyle: React.CSSProperties = {
    fontSize: 13, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(26,25,21,0.16)',
    background: '#fff', color: '#1A1915', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 500,
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#F7F6F2' }}>
      <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } } @keyframes pulse { 0%,100% { opacity:1; transform:scale(1);} 50% { opacity:0.4; transform:scale(0.7);} }`}</style>
      <Sidebar />

      <TopBar title="Fatura" />
      <main style={{ marginLeft: 240, flex: 1, padding: '88px 36px 32px' }}>
        <div style={{ marginBottom: 18 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1915' }}>Fatura</h1>
          <p style={{ fontSize: 13, color: '#9E9B93', marginTop: 4 }}>e-Fatura ve e-Arşiv yönetimi</p>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid #E5E7EB', marginBottom: 24 }}>
          {([
            { key: 'kesilen' as const, icon: 'invoice' as const, label: 'Kesilen Faturalar' },
            { key: 'kontrol' as const, icon: 'search' as const, label: 'Kargo Fatura Kontrolü' },
          ]).map(t => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7, padding: '0 0 12px', background: 'none', cursor: 'pointer',
                  border: 'none', borderBottom: '2px solid ' + (active ? '#1A1915' : 'transparent'),
                  fontFamily: 'inherit', fontSize: 14, fontWeight: active ? 700 : 600,
                  color: active ? '#1A1915' : '#9E9B93', transition: 'all 0.15s', marginBottom: -1,
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#1A1915'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#9E9B93'; }}
              >
                <Icon name={t.icon} size={16} /> {t.label}
              </button>
            );
          })}
        </div>

        {tab === 'kontrol' && <KargoKontrol />}

        {tab === 'kesilen' && <>
        {/* Entegrasyon banner */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#EBF5EF', border: '1px solid rgba(26,107,70,0.2)', borderRadius: 12, padding: '12px 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 9, height: 9, borderRadius: 999, background: '#1A6B46', display: 'inline-block', animation: 'pulse 1.6s ease-in-out infinite' }} />
            <span style={{ fontSize: 13.5, fontWeight: 600, color: '#1A6B46' }}>Paraşüt ile bağlı — Faturalar otomatik kesiliyor ✓</span>
          </div>
          <a href="/entegrasyonlar" style={{ fontSize: 12.5, fontWeight: 600, color: '#1A6B46', textDecoration: 'none' }}>Entegrasyon Ayarları →</a>
        </div>

        {/* Metrik kartlar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Bu Ay Kesilen', value: '1.284', sub: 'fatura', color: '#1A1915' },
            { label: 'Toplam Ciro', value: '₺2.847.392', color: '#1A1915' },
            { label: "GİB'e İletilen", value: '1.279', color: '#1A6B46' },
            { label: 'Bekleyen / Hatalı', value: '5', color: '#D63B3B' },
          ].map(m => (
            <div key={m.label} style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 8px rgba(26,25,21,0.06)', border: '1px solid rgba(26,25,21,0.08)' }}>
              <div style={{ fontSize: 25, fontWeight: 800, color: m.color, letterSpacing: '-0.5px' }}>
                {m.value}{m.sub && <span style={{ fontSize: 13, fontWeight: 500, color: '#9E9B93', marginLeft: 6 }}>{m.sub}</span>}
              </div>
              <div style={{ fontSize: 13, color: '#9E9B93', marginTop: 5, fontWeight: 500 }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Filtre satırı */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Fatura no veya müşteri ara..."
            style={{ flex: '1 1 240px', minWidth: 200, fontSize: 13, padding: '9px 14px', borderRadius: 9, border: '1px solid rgba(26,25,21,0.16)', background: '#fff', fontFamily: 'inherit', color: '#1A1915' }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            {(['Tümü', 'Trendyol', 'Hepsiburada', 'N11'] as const).map(p => {
              const active = platform === p;
              return (
                <button key={p} onClick={() => setPlatform(p)} style={{
                  fontSize: 12.5, fontWeight: 600, padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
                  border: '1px solid ' + (active ? '#1A1915' : 'rgba(26,25,21,0.16)'),
                  background: active ? '#1A1915' : '#fff', color: active ? '#fff' : '#5A574F',
                }}>{p}</button>
              );
            })}
          </div>
          <select value={type} onChange={e => setType(e.target.value as typeof type)} style={selectStyle}>
            <option value="Tümü">Tür: Tümü</option>
            <option value="e-Fatura">e-Fatura</option>
            <option value="e-Arşiv">e-Arşiv</option>
          </select>
          <select value={status} onChange={e => setStatus(e.target.value as typeof status)} style={selectStyle}>
            <option value="Tümü">Durum: Tümü</option>
            <option value="İletildi">İletildi</option>
            <option value="Bekliyor">Bekliyor</option>
            <option value="Hata">Hata</option>
          </select>
          <select value={period} onChange={e => setPeriod(e.target.value)} style={selectStyle}>
            <option>Bu Ay</option>
            <option>Geçen Ay</option>
            <option>Son 3 Ay</option>
          </select>
        </div>

        {/* Tablo */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 8px rgba(26,25,21,0.06)', border: '1px solid rgba(26,25,21,0.08)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(26,25,21,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1A1915' }}>Faturalar <span style={{ fontSize: 13, fontWeight: 500, color: '#9E9B93' }}>({filtered.length})</span></h2>
            <button style={{ fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(26,25,21,0.18)', background: '#fff', color: '#1A1915', cursor: 'pointer', fontFamily: 'inherit' }}>PDF Toplu İndir</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(26,25,21,0.08)' }}>
                  {['Fatura No', 'Sipariş No', 'Müşteri', 'Platform', 'Tutar', 'Tür', 'Durum', 'Tarih', 'İşlem'].map(h => (
                    <th key={h} style={{ padding: '10px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9E9B93', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv, i) => (
                  <tr
                    key={inv.id}
                    onClick={() => setSelected(inv)}
                    style={{
                      borderBottom: i < filtered.length - 1 ? '1px solid rgba(26,25,21,0.06)' : 'none',
                      cursor: 'pointer',
                      background: inv.status === 'Hata' ? '#FFF5F5' : '#fff',
                    }}
                    onMouseEnter={e => { if (inv.status !== 'Hata') (e.currentTarget as HTMLElement).style.background = '#FAF9F6'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = inv.status === 'Hata' ? '#FFF5F5' : '#fff'; }}
                  >
                    <td style={{ padding: '13px 18px', fontSize: 13, fontWeight: 600, color: '#1A1915', whiteSpace: 'nowrap' }}>{inv.id}</td>
                    <td style={{ padding: '13px 18px', fontSize: 13, color: '#5A574F', fontFamily: 'monospace' }}>{inv.orderId}</td>
                    <td style={{ padding: '13px 18px', fontSize: 13, color: '#1A1915' }}>{inv.customer}</td>
                    <td style={{ padding: '13px 18px' }}><Badge text={inv.platform} style={PLATFORM_STYLE[inv.platform]} /></td>
                    <td style={{ padding: '13px 18px', fontSize: 13, fontWeight: 600, color: '#1A1915', whiteSpace: 'nowrap' }}>{TL(inv.amount)}</td>
                    <td style={{ padding: '13px 18px' }}><Badge text={inv.type} style={TYPE_STYLE[inv.type]} /></td>
                    <td style={{ padding: '13px 18px' }}><Badge text={inv.status} style={STATUS_STYLE[inv.status]} /></td>
                    <td style={{ padding: '13px 18px', fontSize: 13, color: '#9E9B93', whiteSpace: 'nowrap' }}>{inv.date}</td>
                    <td style={{ padding: '13px 18px' }}><PdfButton small /></td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} style={{ padding: '40px', textAlign: 'center', fontSize: 13, color: '#9E9B93' }}>Sonuç bulunamadı</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        </>}
      </main>

      {selected && <SlidePanel inv={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
