'use client';

import { useState, useRef, useEffect } from 'react';
import Icon from './Icon';

const NOTIFICATIONS = [
  { icon: 'shipping' as const, color: '#1A6B46', text: 'Yeni sipariş: #TY-8844501', time: '2 dk önce' },
  { icon: 'alert' as const, color: '#C94E1A', text: 'Az stok: Gaming Mouse', time: '15 dk önce' },
  { icon: 'invoice' as const, color: '#D63B3B', text: 'Fatura hatası: FAT-2024-008', time: '1 sa önce' },
];

export default function TopBar({ title }: { title: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header style={{
      position: 'fixed', top: 0, left: 240, right: 0, height: 56, zIndex: 20,
      background: '#fff', borderBottom: '1px solid #E5E7EB',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1915' }}>{title}</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Search */}
        <div style={{ position: 'relative', width: 200 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', color: '#9E9B93' }}>
            <Icon name="search" size={14} strokeWidth={1.8} />
          </span>
          <input
            placeholder="Sipariş ara... (⌘K)"
            style={{ width: '100%', padding: '7px 12px 7px 32px', borderRadius: 999, border: 'none', background: '#F7F6F2', fontSize: 13, fontFamily: 'inherit', color: '#1A1915', outline: 'none' }}
          />
        </div>

        {/* Notifications */}
        <div ref={ref} style={{ position: 'relative' }}>
          <button
            onClick={() => setOpen(o => !o)}
            style={{ position: 'relative', width: 34, height: 34, borderRadius: 999, border: 'none', background: open ? '#F7F6F2' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5A574F' }}
          >
            <Icon name="alert" size={18} strokeWidth={1.7} />
            <span style={{ position: 'absolute', top: 2, right: 2, minWidth: 16, height: 16, padding: '0 4px', background: '#D63B3B', color: '#fff', borderRadius: 999, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
          </button>
          {open && (
            <div style={{ position: 'absolute', top: 44, right: 0, width: 290, background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', boxShadow: '0 12px 32px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #F0EFEB', fontSize: 13, fontWeight: 700, color: '#1A1915' }}>Bildirimler</div>
              {NOTIFICATIONS.map((n, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '11px 16px', borderBottom: i < NOTIFICATIONS.length - 1 ? '1px solid #F5F4F0' : 'none', alignItems: 'flex-start' }}>
                  <span style={{ marginTop: 1, color: n.color, display: 'flex' }}><Icon name={n.icon} size={15} /></span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, color: '#1A1915', fontWeight: 500, lineHeight: 1.3 }}>{n.text}</div>
                    <div style={{ fontSize: 11, color: '#9E9B93', marginTop: 2 }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kontör pill */}
        <button
          onClick={() => alert('Kontör yükleme yakında aktif olacak.')}
          style={{ background: '#1A1915', color: '#fff', borderRadius: 999, border: 'none', fontSize: 13, fontWeight: 600, padding: '5px 13px', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Kontör: 847
        </button>

        {/* Avatar */}
        <div style={{ width: 32, height: 32, borderRadius: 999, background: '#1A6B46', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
          DK
        </div>
      </div>
    </header>
  );
}
