'use client';

import { useRouter, usePathname } from 'next/navigation';
import Icon, { IconName } from './Icon';

type NavItem = { icon: IconName; label: string; href: string; highlight?: boolean };
type NavGroup = { title: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    title: 'Genel',
    items: [
      { icon: 'dashboard', label: 'Dashboard', href: '/dashboard' },
      { icon: 'coins', label: 'Tasarruf Hesapla', href: '/roi', highlight: true },
    ],
  },
  {
    title: 'Kargo',
    items: [
      { icon: 'orders', label: 'Siparişler', href: '/siparisler' },
      { icon: 'shipping', label: 'Kargo Gönder', href: '/gonder' },
      { icon: 'refresh', label: 'Kargo Takip', href: '/takip' },
      { icon: 'undo', label: 'İade Yönetimi', href: '/iade' },
      { icon: 'palette', label: 'Barkod Tasarımı', href: '/barkod-tasarim' },
      { icon: 'zap', label: 'Otomasyon Kuralları', href: '/otomasyon' },
    ],
  },
  {
    title: 'Müşteri İlişkileri',
    items: [
      { icon: 'mail', label: 'Müşteri Soruları', href: '/sorular' },
      { icon: 'folder', label: 'Talepler', href: '/talepler' },
      { icon: 'chart', label: 'Buybox Takibi', href: '/buybox' },
      { icon: 'card', label: 'Mutabakat', href: '/mutabakat' },
    ],
  },
  {
    title: 'Stok & Finans',
    items: [
      { icon: 'stock', label: 'Stok Yönetimi', href: '/stok' },
      { icon: 'invoice', label: 'Fatura', href: '/fatura' },
      { icon: 'clock', label: 'Fiyat Hesaplayıcı', href: '/hesaplayici' },
    ],
  },
  {
    title: 'Entegrasyonlar',
    items: [
      { icon: 'integrations', label: 'Satış Kanalları', href: '/entegrasyonlar/kanallar' },
      { icon: 'shipping', label: 'Kargo Firmaları', href: '/entegrasyonlar/kargo' },
      { icon: 'invoice', label: 'Fatura Sistemleri', href: '/entegrasyonlar/fatura' },
    ],
  },
  {
    title: 'Yönetim',
    items: [
      { icon: 'orders', label: 'Kullanıcılar', href: '/kullanicilar' },
      { icon: 'settings', label: 'Ayarlar', href: '/ayarlar' },
    ],
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside style={{ width: 240, background: '#1A1915', color: '#fff', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 30 }}>
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#1A1915', fontWeight: 800, fontSize: 17 }}>K</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.3px' }}>Kargonoto</span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '8px 12px 16px', overflowY: 'auto' }}>
        {navGroups.map(group => (
          <div key={group.title}>
            <div style={{ fontSize: 10, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginTop: 20, marginBottom: 4, paddingLeft: 12, fontWeight: 600 }}>
              {group.title}
            </div>
            {group.items.map(item => {
              const active = pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 8, marginBottom: 2,
                    fontSize: 14, fontWeight: active ? 600 : item.highlight ? 600 : 500,
                    color: active ? '#fff' : item.highlight ? '#34D399' : 'rgba(255,255,255,0.6)',
                    background: active ? '#1A6B46' : 'transparent',
                    borderLeft: active ? '3px solid #34D399' : '3px solid transparent',
                    textDecoration: 'none',
                  }}
                >
                  <Icon name={item.icon} size={18} strokeWidth={active ? 2 : 1.8} />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Pro upgrade card */}
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{ background: '#1A6B46', borderRadius: 12, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
            <Icon name="integrations" size={15} color="#fff" /> Pro&apos;ya Geç
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1.4, marginBottom: 12 }}>
            14 kargo firması + öncelikli destek
          </div>
          <button
            onClick={() => alert('Yakında! Satış ekibimiz sizi arayacak.')}
            style={{ width: '100%', padding: '8px', background: '#fff', color: '#1A6B46', border: 'none', borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Hemen Geç →
          </button>
        </div>
      </div>

      <div style={{ padding: '16px 16px 24px' }}>
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
