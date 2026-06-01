'use client';

import { useRouter, usePathname } from 'next/navigation';
import Icon, { IconName } from './Icon';

const navItems: { icon: IconName; label: string; href: string }[] = [
  { icon: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  { icon: 'orders', label: 'Siparişler', href: '/siparisler' },
  { icon: 'shipping', label: 'Kargo Gönder', href: '/gonder' },
  { icon: 'stock', label: 'Stok', href: '/stok' },
  { icon: 'invoice', label: 'Fatura', href: '/fatura' },
  { icon: 'integrations', label: 'Entegrasyonlar', href: '/entegrasyonlar' },
  { icon: 'settings', label: 'Ayarlar', href: '/ayarlar' },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside style={{ width: 240, background: '#1A1915', color: '#fff', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 10 }}>
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#1A1915', fontWeight: 800, fontSize: 17 }}>K</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.3px' }}>Kargonoto</span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {navItems.map(item => {
          const active = pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8, marginBottom: 2,
                fontSize: 14, fontWeight: active ? 600 : 500,
                color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                background: active ? '#1A6B46' : 'transparent',
                textDecoration: 'none',
              }}
            >
              <Icon name={item.icon} size={18} strokeWidth={active ? 2 : 1.8} />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div style={{ padding: '16px 16px 24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Demo Kullanıcı</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>demo@kargonoto.com</div>
        <button
          onClick={() => router.push('/login')}
          style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 7, color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
        >
          <Icon name="logout" size={15} strokeWidth={1.8} />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
