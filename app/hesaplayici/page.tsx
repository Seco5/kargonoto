'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import Icon from '../components/Icon';

type PackageKey = 'kucuk' | 'orta' | 'buyuk';

const PACKAGES: { key: PackageKey; label: string; dims: string; en: number; boy: number; yuk: number; ag: number; size: number }[] = [
  { key: 'kucuk', label: 'Küçük', dims: '15×10×10 (0.5kg)', en: 15, boy: 10, yuk: 10, ag: 0.5, size: 120 },
  { key: 'orta', label: 'Orta', dims: '30×20×10 (2kg)', en: 30, boy: 20, yuk: 10, ag: 2, size: 150 },
  { key: 'buyuk', label: 'Büyük', dims: '50×30×20 (5kg)', en: 50, boy: 30, yuk: 20, ag: 5, size: 180 },
];

const CARRIERS = [
  { key: 'sendeo', name: 'Sendeo Kargo', short: 'Sendeo', price: 53.0, sure: '1-2 gün', anlasmali: true },
  { key: 'aras', name: 'Aras Kargo', short: 'Aras', price: 58.9, sure: '1-2 gün' },
  { key: 'yurtici', name: 'Yurtiçi Kargo', short: 'Yurtiçi', price: 61.5, sure: '2-3 gün' },
  { key: 'mng', name: 'MNG Kargo', short: 'MNG', price: 55.9, sure: '2-3 gün' },
  { key: 'surat', name: 'Sürat Kargo', short: 'Sürat', price: 57.0, sure: '1-2 gün' },
  { key: 'ptt', name: 'PTT Kargo', short: 'PTT', price: 49.9, sure: '3-5 gün' },
  { key: 'dhl', name: 'DHL Express', short: 'DHL', price: 189.0, sure: '1-2 gün' },
  { key: 'ups', name: 'UPS Türkiye', short: 'UPS', price: 210.0, sure: '1-2 gün' },
];

// Comparison table covers domestic carriers only
const COMPARE = CARRIERS.filter(c => !['dhl', 'ups'].includes(c.key));
const RECOMMENDED = CARRIERS[0]; // Sendeo (anlaşmalı)

const TL = (n: number) => n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';

export default function HesaplayiciPage() {
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<PackageKey | null>(null);
  const [carrier, setCarrier] = useState('all');
  const [en, setEn] = useState('');
  const [boy, setBoy] = useState('');
  const [yuk, setYuk] = useState('');
  const [ag, setAg] = useState('');
  const [calculated, setCalculated] = useState(false);
  const [error, setError] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const enN = parseFloat(en) || 0;
  const boyN = parseFloat(boy) || 0;
  const yukN = parseFloat(yuk) || 0;
  const agN = parseFloat(ag) || 0;
  const desi = (enN * boyN * yukN) / 3000;
  const ucretlendirme = Math.max(desi, agN);
  const desiAgir = desi > agN && desi > 0;

  const selectPackage = (p: typeof PACKAGES[number]) => {
    setSelectedPackage(p.key);
    setEn(String(p.en)); setBoy(String(p.boy)); setYuk(String(p.yuk)); setAg(String(p.ag));
    setError(false);
    setCalculated(false);
  };

  const handleCalculate = () => {
    if (enN <= 0 && boyN <= 0 && yukN <= 0 && agN <= 0) {
      setError(true);
      setCalculated(false);
      return;
    }
    setError(false);
    setCalculated(true);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  const handleClear = () => {
    setSelectedPackage(null); setCarrier('all');
    setEn(''); setBoy(''); setYuk(''); setAg('');
    setCalculated(false); setError(false);
  };

  const boxSize = selectedPackage ? PACKAGES.find(p => p.key === selectedPackage)!.size : 140;
  const inputBorder = (val: string) => '1.5px solid ' + (error && !val ? '#D63B3B' : '#E5E7EB');
  const single = carrier !== 'all' ? CARRIERS.find(c => c.key === carrier)! : null;
  const shown = single || RECOMMENDED;

  const inputStyle = (val: string): React.CSSProperties => ({
    width: '100%', background: '#fff', border: inputBorder(val), borderRadius: 10,
    padding: 12, textAlign: 'center', fontSize: 18, fontWeight: 600, fontFamily: 'inherit',
    color: '#1A1915', outline: 'none',
  });
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#5A574F', marginBottom: 6 };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#F7F6F2' }}>
      <style>{`@keyframes boxBounce { 0% { transform: scale(0.9); } 60% { transform: scale(1.04); } 100% { transform: scale(1); } } input[type=number]::-webkit-inner-spin-button { opacity: 0.3; }`}</style>
      <Sidebar />
      <TopBar title="Fiyat Hesaplayıcı" />

      <main style={{ marginLeft: 240, flex: 1, padding: '88px 36px 32px' }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* ── SOL KOLON ── */}
          <div style={{ flex: 1, minWidth: 480, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Başlık kartı */}
            <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 1px 8px rgba(26,25,21,0.06)', border: '1px solid rgba(26,25,21,0.08)', borderLeft: '3px solid #1A6B46', padding: '20px 32px' }}>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>
                <span style={{ color: '#1A1915' }}>Kargo Ücretinizi </span>
                <span style={{ color: '#1A6B46' }}>Hemen Hesaplayın</span>
              </div>
            </div>

            {/* Form kartı */}
            <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 1px 8px rgba(26,25,21,0.06)', border: '1px solid rgba(26,25,21,0.08)', padding: 28 }}>
              {/* Kargo firması */}
              <label style={labelStyle}>Kargo Firması</label>
              <select
                value={carrier}
                onChange={e => { setCarrier(e.target.value); setCalculated(false); }}
                style={{ width: '100%', fontSize: 14, padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E5E7EB', background: '#fff', color: '#1A1915', fontFamily: 'inherit', cursor: 'pointer', marginBottom: 24 }}
              >
                <option value="all">Tüm Firmalar (karşılaştır)</option>
                <optgroup label="Anlaşmalı">
                  <option value="sendeo">Sendeo Kargo ✓</option>
                </optgroup>
                <optgroup label="Diğer Firmalar">
                  {CARRIERS.filter(c => c.key !== 'sendeo').map(c => (
                    <option key={c.key} value={c.key}>{c.name}</option>
                  ))}
                </optgroup>
              </select>

              {/* Paket görseli */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '12px 0 20px' }}>
                <div key={selectedPackage ?? 'none'} style={{ animation: selectedPackage ? 'boxBounce 0.35s ease' : undefined, color: selectedPackage ? '#1A6B46' : '#C9C6BE' }}>
                  <Icon name="stock" size={boxSize} strokeWidth={1.4} />
                </div>
              </div>

              {/* Hazır paket seçimi */}
              <div style={{ textAlign: 'center', fontSize: 12, color: '#9E9B93', fontWeight: 600, marginBottom: 12 }}>Hazır Paket Seçimi</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 26 }}>
                {PACKAGES.map(p => {
                  const sel = selectedPackage === p.key;
                  return (
                    <button
                      key={p.key}
                      onClick={() => selectPackage(p)}
                      style={{
                        background: sel ? '#EBF5EF' : '#fff', border: '1.5px solid ' + (sel ? '#1A6B46' : '#E5E7EB'),
                        borderRadius: 12, padding: 16, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
                      }}
                      onMouseEnter={e => { if (!sel) (e.currentTarget as HTMLElement).style.borderColor = '#1A6B46'; }}
                      onMouseLeave={e => { if (!sel) (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, color: sel ? '#1A6B46' : '#5A574F' }}>
                        <Icon name="stock" size={26} strokeWidth={1.7} />
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1915' }}>{p.label}</div>
                      <div style={{ fontSize: 11, color: '#9E9B93', marginTop: 3 }}>{p.dims}</div>
                    </button>
                  );
                })}
              </div>

              {/* Manuel ölçü */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                <div><label style={labelStyle}>Eni (cm)</label><input type="number" min={0} placeholder="0" value={en} onChange={e => { setEn(e.target.value); setSelectedPackage(null); }} style={inputStyle(en)} /></div>
                <div><label style={labelStyle}>Boyu (cm)</label><input type="number" min={0} placeholder="0" value={boy} onChange={e => { setBoy(e.target.value); setSelectedPackage(null); }} style={inputStyle(boy)} /></div>
                <div><label style={labelStyle}>Yüksekliği (cm)</label><input type="number" min={0} placeholder="0" value={yuk} onChange={e => { setYuk(e.target.value); setSelectedPackage(null); }} style={inputStyle(yuk)} /></div>
                <div><label style={labelStyle}>Ağırlığı (kg)</label><input type="number" min={0} placeholder="0" value={ag} onChange={e => { setAg(e.target.value); setSelectedPackage(null); }} style={inputStyle(ag)} /></div>
              </div>

              {/* Desi */}
              <div style={{ marginTop: 12, fontSize: 12, fontWeight: 500, color: desiAgir ? '#C94E1A' : '#9E9B93', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>Desi: {desi > 0 ? desi.toFixed(2) : '--'} kg</span>
                {desiAgir && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#C94E1A', fontWeight: 600 }}>
                    <Icon name="alert" size={13} /> Desi ağırlığı geçerli
                  </span>
                )}
              </div>

              {error && <div style={{ marginTop: 10, fontSize: 13, color: '#D63B3B', fontWeight: 600 }}>Lütfen ölçüleri girin</div>}

              {/* Butonlar */}
              <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
                <button onClick={handleCalculate} style={{ flex: 1, background: '#1A1915', color: '#fff', border: 'none', borderRadius: 12, padding: 16, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Icon name="calculator" size={17} /> Hesapla
                </button>
                <button onClick={handleClear} style={{ flex: 1, background: '#F7F6F2', color: '#1A1915', border: '1px solid #E5E7EB', borderRadius: 12, padding: 16, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Icon name="refresh" size={17} /> Temizle
                </button>
              </div>
            </div>
          </div>

          {/* ── SAĞ KOLON ── */}
          <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Sonuç kartı */}
            <div ref={resultRef} style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(26,25,21,0.08)', boxShadow: '0 1px 8px rgba(26,25,21,0.06)', padding: 24 }}>
              {!calculated ? (
                <>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1915', marginBottom: 8 }}>Hesaplama Sonucu</div>
                  <div style={{ fontSize: 13, color: '#9E9B93', lineHeight: 1.5 }}>Sonucu görmek için ölçüleri girip Hesapla butonuna basın.</div>
                </>
              ) : (
                <>
                  <span style={{ background: '#EBF5EF', color: '#1A6B46', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>{single ? 'Seçilen Firma' : 'Önerilen'}</span>
                  <div style={{ fontSize: 36, fontWeight: 800, color: '#1A1915', letterSpacing: '-1px', marginTop: 10 }}>{TL(shown.price)}</div>
                  <div style={{ fontSize: 13, color: '#9E9B93', marginTop: 2 }}>{shown.name} · {shown.sure.replace('gün', 'iş günü')}</div>

                  {/* Karşılaştırma tablosu */}
                  {!single && (
                    <div style={{ marginTop: 18, border: '1px solid #F0EFEB', borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', padding: '8px 12px', background: '#FAF9F6', fontSize: 11, fontWeight: 700, color: '#9E9B93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <span style={{ flex: 1 }}>Firma</span><span style={{ width: 70, textAlign: 'right' }}>Fiyat</span><span style={{ width: 56, textAlign: 'right' }}>Süre</span>
                      </div>
                      {COMPARE.map(c => (
                        <div key={c.key} style={{ display: 'flex', alignItems: 'center', padding: '9px 12px', fontSize: 12.5, background: c.anlasmali ? '#EBF5EF' : '#fff', borderTop: '1px solid #F5F4F0' }}>
                          <span style={{ flex: 1, fontWeight: c.anlasmali ? 700 : 500, color: '#1A1915', display: 'flex', alignItems: 'center', gap: 5 }}>
                            {c.short}{c.anlasmali && <Icon name="check-circle" size={13} color="#1A6B46" />}
                          </span>
                          <span style={{ width: 70, textAlign: 'right', fontWeight: 600, color: '#1A1915' }}>{TL(c.price)}</span>
                          <span style={{ width: 56, textAlign: 'right', color: '#9E9B93' }}>{c.sure}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Özet */}
                  <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#9E9B93', lineHeight: 1.5 }}>
                    <Icon name="stock" size={14} />
                    <span>Desi: {Math.max(desi, 0).toFixed(2)} kg · Ağırlık: {agN} kg · Ücretlendirme: {desiAgir ? 'Desi' : 'Ağırlık'}</span>
                  </div>

                  <button
                    onClick={() => router.push('/gonder')}
                    style={{ width: '100%', marginTop: 18, background: '#1A6B46', color: '#fff', border: 'none', borderRadius: 12, padding: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    <Icon name="shipping" size={16} /> {shown.short} ile Hemen Gönder
                  </button>
                </>
              )}
            </div>

            {/* CTA kartı */}
            <div style={{ background: '#1A1915', color: '#fff', borderRadius: 18, padding: 24 }}>
              <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.5, marginBottom: 16 }}>
                Kargonoto ile gönderi maliyetlerinizi minimuma indirin.
              </div>
              <button
                onClick={() => alert('Demo hesabınız zaten aktif! 🎉')}
                style={{ background: '#1A6B46', color: '#fff', border: 'none', borderRadius: 999, padding: '12px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Hemen Ücretsiz Deneyin →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
