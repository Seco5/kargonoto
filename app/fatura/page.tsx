'use client';

import { useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar';

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

export default function FaturaPage() {
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState<'Tümü' | Platform>('Tümü');
  const [type, setType] = useState<'Tümü' | InvType>('Tümü');
  const [status, setStatus] = useState<'Tümü' | InvStatus>('Tümü');
  const [period, setPeriod] = useState('Bu Ay');
  const [selected, setSelected] = useState<Invoice | null>(null);

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

      <main style={{ marginLeft: 240, flex: 1, padding: '32px 36px' }}>
        <div style={{ marginBottom: 22 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1915' }}>Fatura</h1>
          <p style={{ fontSize: 13, color: '#9E9B93', marginTop: 4 }}>e-Fatura ve e-Arşiv yönetimi</p>
        </div>

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
      </main>

      {selected && <SlidePanel inv={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
