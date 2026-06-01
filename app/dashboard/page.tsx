'use client';

import { useRouter } from 'next/navigation';

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

const navItems = [
  { icon: '📦', label: 'Dashboard', href: '/dashboard', active: true },
  { icon: '📋', label: 'Siparişler', href: '/siparisler' },
  { icon: '🚚', label: 'Kargo Gönder', href: '/gonder' },
  { icon: '📊', label: 'Stok', href: '/stok' },
  { icon: '🧾', label: 'Fatura', href: '/fatura' },
  { icon: '🔌', label: 'Entegrasyonlar', href: '/entegrasyonlar' },
  { icon: '⚙️', label: 'Ayarlar', href: '/ayarlar' },
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
  const router = useRouter();

  function handleLogout() {
    router.push('/login');
  }

  const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#F7F6F2' }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: '#1A1915', color: '#fff', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0 }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#1A1915', fontWeight: 800, fontSize: 17 }}>K</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.3px' }}>Kargonoto</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {navItems.map(item => (
            <a
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 8,
                marginBottom: 2,
                fontSize: 14,
                fontWeight: item.active ? 600 : 500,
                color: item.active ? '#fff' : 'rgba(255,255,255,0.6)',
                background: item.active ? '#1A6B46' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s',
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '16px 16px 24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Demo Kullanıcı</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>demo@kargonoto.com</div>
          <button
            onClick={handleLogout}
            style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 7, color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: 240, flex: 1, padding: '32px 36px' }}>
        {/* Top bar */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1915' }}>Hoş geldin, Demo Kullanıcı 👋</h1>
          <p style={{ fontSize: 13, color: '#9E9B93', marginTop: 4 }}>{today}</p>
        </div>

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Toplam Gönderi', value: '1.284', icon: '📦', color: '#1A1915', bg: '#fff' },
            { label: 'Bekleyen', value: '47', icon: '⏳', color: '#D97706', bg: '#fff' },
            { label: 'Teslim Edilen', value: '1.198', icon: '✅', color: '#065F46', bg: '#fff' },
            { label: 'İade', value: '39', icon: '↩️', color: '#DC2626', bg: '#fff' },
          ].map(m => (
            <div key={m.label} style={{ background: m.bg, borderRadius: 14, padding: '20px 22px', boxShadow: '0 1px 8px rgba(26,25,21,0.06)', border: '1px solid rgba(26,25,21,0.08)' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{m.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: m.color, letterSpacing: '-1px' }}>{m.value}</div>
              <div style={{ fontSize: 13, color: '#9E9B93', marginTop: 4, fontWeight: 500 }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Orders table */}
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
                  <tr key={o.id} style={{ borderBottom: i < orders.length - 1 ? '1px solid rgba(26,25,21,0.06)' : 'none' }}>
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
