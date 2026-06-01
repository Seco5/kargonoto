'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (email === 'demo@kargonoto.com' && password === 'demo1234') {
      router.push('/dashboard');
    } else {
      setError('E-posta veya şifre hatalı. Lütfen tekrar deneyin.');
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '48px 40px', width: '100%', maxWidth: 400, boxShadow: '0 4px 32px rgba(26,25,21,0.08)' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, justifyContent: 'center' }}>
          <div style={{ width: 38, height: 38, background: '#1A1915', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 20 }}>K</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: 22, color: '#1A1915', letterSpacing: '-0.5px' }}>Kargonoto</span>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1915', marginBottom: 6, textAlign: 'center' }}>Hoş Geldiniz</h1>
        <p style={{ fontSize: 14, color: '#9E9B93', textAlign: 'center', marginBottom: 28 }}>Hesabınıza giriş yapın</p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#5A574F', marginBottom: 6 }}>E-posta</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="demo@kargonoto.com"
              required
              style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid rgba(26,25,21,0.16)', fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#F7F6F2', color: '#1A1915' }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#5A574F', marginBottom: 6 }}>Şifre</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid rgba(26,25,21,0.16)', fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#F7F6F2', color: '#1A1915' }}
            />
          </div>

          {error && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#DC2626' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{ width: '100%', padding: '13px', background: '#1A1915', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Giriş Yap
          </button>
        </form>

        <div style={{ marginTop: 20, padding: '12px 16px', background: '#F7F6F2', borderRadius: 8, fontSize: 12, color: '#9E9B93', textAlign: 'center' }}>
          Demo: <span style={{ color: '#1A6B46', fontWeight: 600 }}>demo@kargonoto.com</span> / <span style={{ color: '#1A6B46', fontWeight: 600 }}>demo1234</span>
        </div>
      </div>
    </div>
  );
}
