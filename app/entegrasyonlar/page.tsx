'use client';

import { useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar';

type Field = { key: string; label: string; type: 'text' | 'password' };

interface Provider {
  id: string;
  name: string;
  desc: string;
  logoColor: string;
  letter: string;
  connected: boolean;
  maskedInfo?: string;
  fields: Field[];
}

interface Section {
  title: string;
  subtitle: string;
  providers: Provider[];
}

const SECTIONS: Section[] = [
  {
    title: 'Fatura Entegratörleri',
    subtitle: 'Siparişleriniz için e-fatura ve e-arşiv faturalar otomatik kesilir.',
    providers: [
      { id: 'parasut', name: 'Paraşüt', desc: "Türkiye'nin en popüler ön muhasebe yazılımı", logoColor: '#00B274', letter: 'P', connected: true, maskedInfo: 'client_id: para_••••••••••••••', fields: [{ key: 'client_id', label: 'Client ID', type: 'text' }, { key: 'client_secret', label: 'Client Secret', type: 'password' }, { key: 'company_id', label: 'Company ID', type: 'text' }] },
      { id: 'nilvera', name: 'Nilvera', desc: 'GİB onaylı e-fatura entegratörü, REST API', logoColor: '#6366F1', letter: 'N', connected: false, fields: [{ key: 'api_key', label: 'API Key', type: 'password' }] },
      { id: 'uyumsoft', name: 'Uyumsoft', desc: 'Kurumsal e-fatura ve e-dönüşüm çözümleri', logoColor: '#0EA5E9', letter: 'U', connected: false, fields: [{ key: 'username', label: 'Kullanıcı Adı', type: 'text' }, { key: 'password', label: 'Şifre', type: 'password' }] },
      { id: 'elogo', name: 'e-Logo', desc: "Logo'nun GİB onaylı özel entegrasyon hizmeti", logoColor: '#F97316', letter: 'L', connected: false, fields: [{ key: 'api_key', label: 'API Key', type: 'password' }, { key: 'firm_code', label: 'Firma Kodu', type: 'text' }] },
      { id: 'bizimhesap', name: 'BizimHesap', desc: "KOBİ'ler için bulut tabanlı muhasebe", logoColor: '#8B5CF6', letter: 'B', connected: false, fields: [{ key: 'api_key', label: 'API Key', type: 'password' }] },
      { id: 'turkcell', name: 'Turkcell e-Şirket', desc: 'Turkcell altyapısıyla güvenli e-fatura', logoColor: '#2563EB', letter: 'T', connected: false, fields: [{ key: 'username', label: 'Kullanıcı Adı', type: 'text' }, { key: 'password', label: 'Şifre', type: 'password' }] },
    ],
  },
  {
    title: 'Kargo Firmaları',
    subtitle: 'Kendi anlaşmalı olduğunuz kargo firmalarını API bilgilerinizle bağlayın.',
    providers: [
      { id: 'sendeo', name: 'Sendeo', desc: 'Anlaşmalı kargo firmanız', logoColor: '#1A6B46', letter: 'S', connected: true, maskedInfo: 'Müşteri No: SND-••••••', fields: [{ key: 'user_code', label: 'Kullanıcı Kodu', type: 'text' }, { key: 'password', label: 'Şifre / API Key', type: 'password' }, { key: 'customer_no', label: 'Müşteri No (opsiyonel)', type: 'text' }] },
      { id: 'aras', name: 'Aras Kargo', desc: 'Türkiye geneli hızlı teslimat', logoColor: '#C94E1A', letter: 'A', connected: false, fields: [{ key: 'user_code', label: 'Kullanıcı Kodu', type: 'text' }, { key: 'password', label: 'Şifre / API Key', type: 'password' }, { key: 'customer_no', label: 'Müşteri No (opsiyonel)', type: 'text' }] },
      { id: 'yurtici', name: 'Yurtiçi Kargo', desc: 'Geniş şube ve dağıtım ağı', logoColor: '#B45309', letter: 'Y', connected: false, fields: [{ key: 'user_code', label: 'Kullanıcı Kodu', type: 'text' }, { key: 'password', label: 'Şifre / API Key', type: 'password' }, { key: 'customer_no', label: 'Müşteri No (opsiyonel)', type: 'text' }] },
      { id: 'mng', name: 'MNG Kargo', desc: 'Kurumsal kargo çözümleri', logoColor: '#1A4B8C', letter: 'M', connected: false, fields: [{ key: 'user_code', label: 'Kullanıcı Kodu', type: 'text' }, { key: 'password', label: 'Şifre / API Key', type: 'password' }, { key: 'customer_no', label: 'Müşteri No (opsiyonel)', type: 'text' }] },
      { id: 'surat', name: 'Sürat Kargo', desc: 'Hızlı ve güvenilir teslimat', logoColor: '#DC2626', letter: 'S', connected: false, fields: [{ key: 'user_code', label: 'Kullanıcı Kodu', type: 'text' }, { key: 'password', label: 'Şifre / API Key', type: 'password' }, { key: 'customer_no', label: 'Müşteri No (opsiyonel)', type: 'text' }] },
      { id: 'ptt', name: 'PTT Kargo', desc: "Türkiye'nin en geniş ağı", logoColor: '#16A34A', letter: 'P', connected: false, fields: [{ key: 'user_code', label: 'Kullanıcı Kodu', type: 'text' }, { key: 'password', label: 'Şifre / API Key', type: 'password' }, { key: 'customer_no', label: 'Müşteri No (opsiyonel)', type: 'text' }] },
      { id: 'dhl', name: 'DHL Express', desc: 'Uluslararası ekspres gönderi', logoColor: '#CA8A04', letter: 'D', connected: false, fields: [{ key: 'user_code', label: 'Kullanıcı Kodu', type: 'text' }, { key: 'password', label: 'Şifre / API Key', type: 'password' }, { key: 'customer_no', label: 'Müşteri No (opsiyonel)', type: 'text' }] },
      { id: 'ups', name: 'UPS Türkiye', desc: 'Global lojistik ve kargo', logoColor: '#92400E', letter: 'U', connected: false, fields: [{ key: 'user_code', label: 'Kullanıcı Kodu', type: 'text' }, { key: 'password', label: 'Şifre / API Key', type: 'password' }, { key: 'customer_no', label: 'Müşteri No (opsiyonel)', type: 'text' }] },
      { id: 'hepsijet', name: 'HepsiJet', desc: "Hepsiburada'nın kargo hizmeti", logoColor: '#BE185D', letter: 'H', connected: false, fields: [{ key: 'user_code', label: 'Kullanıcı Kodu', type: 'text' }, { key: 'password', label: 'Şifre / API Key', type: 'password' }, { key: 'customer_no', label: 'Müşteri No (opsiyonel)', type: 'text' }] },
    ],
  },
  {
    title: 'Pazaryerleri',
    subtitle: 'Siparişlerinizi otomatik çekmek için pazaryeri API bilgilerinizi girin.',
    providers: [
      { id: 'trendyol', name: 'Trendyol', desc: "Türkiye'nin en büyük pazaryeri", logoColor: '#F97316', letter: 'T', connected: true, maskedInfo: 'Satıcı ID: TY-••••••', fields: [{ key: 'seller_id', label: 'Satıcı ID', type: 'text' }, { key: 'api_key', label: 'API Key', type: 'password' }, { key: 'api_secret', label: 'API Secret', type: 'password' }] },
      { id: 'hepsiburada', name: 'Hepsiburada', desc: 'Hepsiburada Satıcı Merkezi entegrasyonu', logoColor: '#F59E0B', letter: 'H', connected: false, fields: [{ key: 'username', label: 'Kullanıcı Adı', type: 'text' }, { key: 'api_password', label: 'API Şifre', type: 'password' }] },
      { id: 'n11', name: 'N11', desc: 'N11 mağaza entegrasyonu', logoColor: '#7C3AED', letter: 'N', connected: false, fields: [{ key: 'api_key', label: 'API Key', type: 'password' }, { key: 'api_secret', label: 'API Secret', type: 'password' }] },
    ],
  },
];

type Toast = { id: number; msg: string; ok: boolean };

function PasswordInput({ field }: { field: Field }) {
  const [show, setShow] = useState(false);
  const isPw = field.type === 'password';
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5A574F', marginBottom: 5 }}>{field.label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={isPw && !show ? 'password' : 'text'}
          placeholder={field.label}
          style={{ width: '100%', fontSize: 13, padding: '9px 12px', paddingRight: isPw ? 38 : 12, borderRadius: 8, border: '1px solid rgba(26,25,21,0.16)', background: '#fff', fontFamily: 'inherit', color: '#1A1915' }}
        />
        {isPw && (
          <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: 4 }}>
            {show ? '🙈' : '👁️'}
          </button>
        )}
      </div>
    </div>
  );
}

function ProviderCard({ provider, onToast }: { provider: Provider; onToast: (msg: string, ok: boolean) => void }) {
  const [connected, setConnected] = useState(provider.connected);
  const [open, setOpen] = useState(false);
  const [testing, setTesting] = useState(false);

  const handleTest = () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      onToast('Bağlantı başarılı ✓', true);
    }, 1500);
  };
  const handleSave = () => {
    setConnected(true);
    setOpen(false);
    onToast('Entegrasyon kaydedildi ✓', true);
  };
  const handleDisconnect = () => {
    if (window.confirm('Bu entegrasyonu kesmek istediğinize emin misiniz?')) {
      setConnected(false);
      setOpen(false);
      onToast('Bağlantı kesildi', true);
    }
  };

  const btn = (variant: 'outline' | 'danger' | 'primary'): React.CSSProperties => ({
    flex: 1, padding: '9px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
    border: '1px solid ' + (variant === 'danger' ? 'rgba(214,59,59,0.4)' : variant === 'primary' ? '#1A1915' : 'rgba(26,25,21,0.18)'),
    background: variant === 'primary' ? '#1A1915' : '#fff',
    color: variant === 'danger' ? '#D63B3B' : variant === 'primary' ? '#fff' : '#1A1915',
  });

  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid ' + (connected ? 'rgba(26,107,70,0.3)' : '#E5E7EB'), boxShadow: '0 1px 6px rgba(26,25,21,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 9, background: provider.logoColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 17, flexShrink: 0 }}>{provider.letter}</div>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#1A1915', flex: 1 }}>{provider.name}</div>
        {connected
          ? <span style={{ background: '#EBF5EF', color: '#1A6B46', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>Bağlı ✓</span>
          : <span style={{ background: '#F3F4F6', color: '#9E9B93', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>Bağlı Değil</span>}
      </div>

      <div style={{ fontSize: 12.5, color: connected ? '#9E9B93' : '#5A574F', marginBottom: 14, minHeight: 32, fontFamily: connected ? 'monospace' : 'inherit', lineHeight: 1.4 }}>
        {connected ? provider.maskedInfo : provider.desc}
      </div>

      {connected ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btn('outline')} onClick={() => setOpen(o => !o)}>Düzenle</button>
          <button style={btn('danger')} onClick={handleDisconnect}>Bağlantıyı Kes</button>
        </div>
      ) : !open ? (
        <button style={{ ...btn('outline'), width: '100%' }} onClick={() => setOpen(true)}>Bağla →</button>
      ) : null}

      <div style={{ maxHeight: open ? 600 : 0, overflow: 'hidden', transition: 'max-height 0.32s ease, margin 0.32s', marginTop: open ? 14 : 0 }}>
        {open && (
          <div style={{ borderTop: '1px solid rgba(26,25,21,0.08)', paddingTop: 14 }}>
            {provider.fields.map(f => <PasswordInput key={f.key} field={f} />)}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button style={btn('outline')} onClick={handleTest} disabled={testing}>
                {testing ? 'Test ediliyor…' : 'Bağlantıyı Test Et'}
              </button>
              <button style={btn('primary')} onClick={handleSave}>Kaydet ve Bağla</button>
            </div>
            {connected && <button style={{ ...btn('outline'), width: '100%', marginTop: 8 }} onClick={() => setOpen(false)}>Kapat</button>}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EntegrasyonlarPage() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (msg: string, ok: boolean) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, ok }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  };

  const { active, total } = useMemo(() => {
    const all = SECTIONS.flatMap(s => s.providers);
    return { active: all.filter(p => p.connected).length, total: all.length };
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#F7F6F2' }}>
      <Sidebar />

      <main style={{ marginLeft: 240, flex: 1, padding: '32px 36px', maxWidth: 1180 }}>
        <div style={{ marginBottom: 26 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1915' }}>Entegrasyon Ayarları</h1>
          <p style={{ fontSize: 13.5, color: '#9E9B93', marginTop: 5, maxWidth: 560, lineHeight: 1.5 }}>Kargo firmaları, pazaryerleri ve fatura entegratörlerinizi buradan bağlayın.</p>
          <div style={{ display: 'flex', gap: 18, marginTop: 12, fontSize: 13 }}>
            <span style={{ color: '#1A6B46', fontWeight: 600 }}>✓ {active} aktif bağlantı</span>
            <span style={{ color: '#9E9B93' }}>○ {total - active} bağlanmamış</span>
          </div>
        </div>

        {SECTIONS.map(section => (
          <section key={section.title} style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1A1915' }}>{section.title}</h2>
            <p style={{ fontSize: 13, color: '#9E9B93', marginTop: 3, marginBottom: 18 }}>{section.subtitle}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, alignItems: 'start' }}>
              {section.providers.map(p => <ProviderCard key={p.id} provider={p} onToast={addToast} />)}
            </div>
          </section>
        ))}

        {/* Güvenlik notu */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, background: '#F7F6F2', border: '1px solid rgba(26,25,21,0.12)', borderRadius: 14, padding: '16px 20px', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>🔒</span>
            <span style={{ fontSize: 12.5, color: '#5A574F', lineHeight: 1.5 }}>
              API anahtarlarınız AES-256 şifreleme ile güvenli şekilde saklanmaktadır. Hiçbir bilginiz üçüncü taraflarla paylaşılmaz.
            </span>
          </div>
          <a href="#" style={{ fontSize: 12, fontWeight: 600, color: '#5A574F', textDecoration: 'none', whiteSpace: 'nowrap' }}>Güvenlik Politikası →</a>
        </div>
      </main>

      {/* Toasts */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 100 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: t.ok ? '#EBF5EF' : '#FBEAEA', color: t.ok ? '#1A6B46' : '#D63B3B',
            border: '1px solid ' + (t.ok ? 'rgba(26,107,70,0.25)' : 'rgba(214,59,59,0.25)'),
            borderRadius: 10, padding: '12px 18px', fontSize: 13, fontWeight: 600,
            boxShadow: '0 6px 24px rgba(0,0,0,0.12)', animation: 'toastIn 0.25s ease',
          }}>{t.msg}</div>
        ))}
      </div>

      <style>{`@keyframes toastIn { from { opacity:0; transform:translateY(12px);} to { opacity:1; transform:translateY(0);} }`}</style>
    </div>
  );
}
