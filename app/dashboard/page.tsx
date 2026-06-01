'use client';

import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import Icon, { IconName } from '../components/Icon';

const METRIC_ICONS: Record<string, IconName> = {
  'Toplam Gönderi': 'stock',
  'Bekleyen': 'orders',
  'Teslim Edilen': 'shipping',
  'İade': 'invoice',
};

const orders = [
  { id: '#TY-8842901', customer: 'Ayşe Kaya', platform: 'Trendyol', carrier: 'Sendeo', status: 'Kargoda', date: '01 Haz' },
  { id: '#HB-5521038', customer: 'Mehmet Yılmaz', platform: 'Hepsiburada', carrier: 'Aras', status: 'Teslim Edildi', date: '01 Haz' },
  { id: '#N11-3310094', customer: 'Fatma Şahin', platform: 'N11', carrier: 'Yurtiçi', status: 'Bekliyor', date: '31 May' },
  { id: '#TY-8843212', customer: 'Ali Rıza', platform: 'Trendyol', carrier: 'Sendeo', status: 'Teslim Edildi', date: '31 May' },
  { id: '#HB-5521199', customer: 'Zeynep Ak', platform: 'Hepsiburada', carrier: 'MNG', status: 'İade', date: '30 May' },
  { id: '#TY-8844001', customer: 'Murat Demir', platform: 'Trendyol', carrier: 'Sendeo', status: 'Kargoda', date: '30 May' },
  { id: '#N11-3310201', customer: 'Selin Çelik', platform: 'N11', carrier: 'Aras', status: 'Bekliyor', date: '29 May' },
  { id: '#HB-5521300', customer: 'Kemal Arslan', platform: 'Hepsiburada', carrier: 'Sendeo', status: 'Teslim Edildi', date: '29 May' },
  { id: '#TY-8844102', customer: 'Merve Koç', platform: 'Trendyol', carrier: 'Yurtiçi', status: 'Kargoda', date: '28 May' },
  { id: '#N11-3310388', customer: 'Burak Yurt', platform: 'N11', carrier: 'MNG', status: 'Teslim Edildi', date: '28 May' },
];

function statusBadge(status: string) {
  const styles: Record<string, { bg: string; color: string }> = {
    'Bekliyor': { bg: '#FEF3C7', color: '#D97706' },
    'Kargoda': { bg: '#DBEAFE', color: '#1D4ED8' },
    'Teslim Edildi': { bg: '#D1FAE5', color: '#065F46' },
    'İade': { bg: '#FEE2E2', color: '#DC2626' },
  };
  const s = styles[status] || { bg: '#F3F4F6', color: '#6B7280' };
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
}

function platformBadge(platform: string) {
  const styles: Record<string, { bg: string; color: string }> = {
    'Trendyol': { bg: 'rgba(201,78,26,0.1)', color: '#C94E1A' },
    'Hepsiburada': { bg: 'rgba(255,140,0,0.1)', color: '#C47A00' },
    'N11': { bg: 'rgba(100,50,200,0.1)', color: '#6432C8' },
  };
  const s = styles[platform] || { bg: '#F3F4F6', color: '#6B7280' };
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999 }}>
      {platform}
    </span>
  );
}

export default function DashboardPage() {
  const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#F7F6F2' }}>
      <Sidebar />

      <TopBar title="Dashboard" />
      <main style={{ marginLeft: 240, flex: 1, padding: '88px 36px 32px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1915' }}>Hoş geldin, Demo Kullanıcı 👋</h1>
          <p style={{ fontSize: 13, color: '#9E9B93', marginTop: 4 }}>{today}</p>
        </div>

        {/* Hero banner */}
        <div style={{
          background: '#1A1915', borderRadius: 20, padding: '28px 32px', marginBottom: 28,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap',
        }}>
          <div style={{ flex: '1 1 360px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#1A6B46', color: '#fff', borderRadius: 999, padding: '5px 12px', fontSize: 12, fontWeight: 700, marginBottom: 14 }}>
              <Icon name="zap" size={13} /> Otomasyon Aktif
            </span>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.4px', lineHeight: 1.25 }}>Bugün 284 siparişiniz otomatik yönetildi.</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 8, lineHeight: 1.5 }}>
              En ucuz kargo seçildi · Barkodlar basıldı · Stoklar güncellendi · Faturalar kesildi · Müdahale: 0
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            {[
              { value: '2.3 sn', label: 'Ort. işlem süresi', color: '#fff' },
              { value: '₺0', label: 'Hatalı yönl.', color: '#34D399' },
              { value: '63 saat', label: 'Bu ay tasarruf', color: '#34D399' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 18px', textAlign: 'center', minWidth: 96 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color, letterSpacing: '-0.5px' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
            <a href="/otomasyon" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#1A6B46', color: '#fff', borderRadius: 10, padding: '11px 16px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              <Icon name="settings" size={15} /> Kuralları Yönet →
            </a>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Toplam Gönderi', value: '1.284', color: '#1A1915', badge: 'rgba(26,25,21,0.08)', trend: { arrow: '↑', text: '%12 geçen haftaya göre', color: '#1A6B46' } },
            { label: 'Bekleyen', value: '47', color: '#D97706', badge: '#FEF3C7', trend: { arrow: '↑', text: '%3 artış', color: '#D63B3B' } },
            { label: 'Teslim Edilen', value: '1.198', color: '#065F46', badge: '#D1FAE5', trend: { arrow: '↑', text: '%8 geçen haftaya göre', color: '#1A6B46' } },
            { label: 'İade', value: '39', color: '#DC2626', badge: '#FEE2E2', trend: { arrow: '↓', text: '%5 azaldı', color: '#1A6B46' } },
          ].map(m => (
            <div key={m.label} style={{ background: '#fff', borderRadius: 14, padding: '20px 22px', boxShadow: '0 1px 8px rgba(26,25,21,0.06)', border: '1px solid rgba(26,25,21,0.08)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: m.badge, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Icon name={METRIC_ICONS[m.label]} size={20} color={m.color} strokeWidth={1.9} />
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: m.color, letterSpacing: '-1px' }}>{m.value}</div>
              <div style={{ fontSize: 13, color: '#9E9B93', marginTop: 4, fontWeight: 500 }}>{m.label}</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: m.trend.color, marginTop: 8 }}>
                {m.trend.arrow} {m.trend.text}
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 8px rgba(26,25,21,0.06)', border: '1px solid rgba(26,25,21,0.08)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(26,25,21,0.08)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1A1915' }}>Son Siparişler</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(26,25,21,0.08)' }}>
                  {['Sipariş No', 'Müşteri', 'Platform', 'Kargo', 'Durum', 'Tarih'].map(h => (
                    <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9E9B93', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <tr
                    key={o.id}
                    style={{ borderBottom: i < orders.length - 1 ? '1px solid rgba(26,25,21,0.06)' : 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#EFEDE8'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: '#1A1915', fontFamily: 'monospace' }}>{o.id}</td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#1A1915' }}>{o.customer}</td>
                    <td style={{ padding: '14px 20px' }}>{platformBadge(o.platform)}</td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#5A574F' }}>{o.carrier}</td>
                    <td style={{ padding: '14px 20px' }}>{statusBadge(o.status)}</td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#9E9B93' }}>{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
