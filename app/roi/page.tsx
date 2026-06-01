'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import Icon, { IconName } from '../components/Icon';

type PlatformOpt = '1' | '2-3' | '4+';

const TL = (n: number) => '₺' + n.toLocaleString('tr-TR');

const STEPS: { icon: IconName; title: string; desc: string }[] = [
  { icon: 'download', title: 'Sipariş Gelir', desc: "Trendyol, HB, N11'den otomatik çekilir" },
  { icon: 'zap', title: 'Kural Çalışır', desc: 'Ağırlık, şehir, değer, platforma göre analiz' },
  { icon: 'shipping', title: 'Kargo Seçilir', desc: 'En uygun firma otomatik atanır' },
  { icon: 'printer', title: 'Barkod Basılır', desc: 'AWB oluşturulur, yazdırılmaya hazır' },
  { icon: 'chart', title: 'Her Şey Güncellenir', desc: 'Stok düşer, fatura kesilir, müşteri bilgilenir' },
];

const RULES = [
  { title: 'Ağır Gönderi → Yurtiçi Kargo', desc: '5 kg üzeri tüm gönderiler', color: '#B45309' },
  { title: 'İstanbul → HepsiJet Aynı Gün', desc: 'İstanbul içi siparişler', color: '#BE185D' },
  { title: 'Standart → Sendeo', desc: 'Diğer tüm gönderiler', color: '#1A6B46' },
];

export default function RoiPage() {
  const router = useRouter();
  const [orders, setOrders] = useState(150);
  const [platform, setPlatform] = useState<PlatformOpt>('2-3');
  const [people, setPeople] = useState(2);
  const [calculating, setCalculating] = useState(false);
  const [done, setDone] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };

  // ── Hesaplama ──
  const dakikaPerSiparis = platform === '1' ? 8 : platform === '2-3' ? 14 : 22;
  const aylikDakika = orders * 26 * dakikaPerSiparis;
  const saatTasarrufu = Math.round((aylikDakika * 0.85) / 60);
  const saatMaliyet = 25000 / 173;
  const personelTasarruf = Math.round(saatTasarrufu * saatMaliyet * people);
  const yillikTasarruf = personelTasarruf * 12;
  const planMaliyet = orders < 50 ? 990 : orders < 200 ? 2490 : orders < 500 ? 4990 : 9990;
  const roi = Math.round(personelTasarruf / planMaliyet);

  const handleCalc = () => {
    setCalculating(true);
    setTimeout(() => {
      setCalculating(false);
      setDone(true);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
    }, 1500);
  };

  const cardBox: React.CSSProperties = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 24 };
  const qLabel: React.CSSProperties = { fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 18 };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#F7F6F2' }}>
      <style>{`
        @keyframes roiSlideDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes roiSpin { to { transform: rotate(360deg); } }
        .roi-slider { -webkit-appearance: none; appearance: none; height: 6px; border-radius: 999px; background: rgba(255,255,255,0.18); outline: none; }
        .roi-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%; background: #34D399; cursor: pointer; border: 3px solid #1A1915; }
        .roi-slider::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: #34D399; cursor: pointer; border: 3px solid #1A1915; }
      `}</style>
      <Sidebar />
      <TopBar title="Tasarruf Hesapla" />

      <main style={{ marginLeft: 240, flex: 1, padding: '88px 36px 64px' }}>
        {/* ───────────── BÖLÜM 1: ROI HESAPLAYICI ───────────── */}
        <section style={{ background: '#1A1915', borderRadius: 24, padding: 48 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.2 }}>
              <span style={{ color: '#fff' }}>Kargonoto size ayda ne kadar</span><br />
              <span style={{ color: '#34D399' }}>kazandırıyor?</span>
            </div>
            <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginTop: 12 }}>3 soruyu yanıtlayın, hesaplayalım.</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 40 }}>
            {/* Soru 1 */}
            <div style={cardBox}>
              <div style={qLabel}>Günlük ortalama sipariş sayınız?</div>
              <input type="range" min={10} max={2000} value={orders} className="roi-slider"
                onChange={e => { setOrders(Number(e.target.value)); setDone(false); }}
                style={{ width: '100%' }} />
              <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginTop: 14, letterSpacing: '-0.5px' }}>{orders} <span style={{ fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>sipariş/gün</span></div>
              <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
                {[50, 100, 250, 500, 1000].map(v => (
                  <button key={v} onClick={() => { setOrders(v); setDone(false); }}
                    style={{ flex: 1, padding: '6px 0', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                      border: '1px solid ' + (orders === v ? '#34D399' : 'rgba(255,255,255,0.18)'),
                      background: orders === v ? 'rgba(52,211,153,0.18)' : 'transparent', color: orders === v ? '#34D399' : 'rgba(255,255,255,0.7)' }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Soru 2 */}
            <div style={cardBox}>
              <div style={qLabel}>Kaç pazaryerinde satış yapıyorsunuz?</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {([['1', '1 Platform'], ['2-3', '2-3 Platform'], ['4+', '4+ Platform']] as [PlatformOpt, string][]).map(([v, lbl]) => {
                  const sel = platform === v;
                  return (
                    <button key={v} onClick={() => { setPlatform(v); setDone(false); }}
                      style={{ padding: '12px 16px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
                        border: 'none', background: sel ? '#fff' : 'rgba(255,255,255,0.1)', color: sel ? '#1A1915' : 'rgba(255,255,255,0.7)' }}>
                      {lbl}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Soru 3 */}
            <div style={cardBox}>
              <div style={qLabel}>Bu işler için şu an kaç kişi çalışıyor?</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <button onClick={() => { setPeople(p => Math.max(1, p - 1)); setDone(false); }}
                  style={{ width: 44, height: 44, borderRadius: 12, border: '1px solid rgba(255,255,255,0.18)', background: 'transparent', color: '#fff', fontSize: 22, cursor: 'pointer', fontFamily: 'inherit' }}>−</button>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', minWidth: 50, textAlign: 'center' }}>{people}</div>
                <button onClick={() => { setPeople(p => Math.min(10, p + 1)); setDone(false); }}
                  style={{ width: 44, height: 44, borderRadius: 12, border: '1px solid rgba(255,255,255,0.18)', background: 'transparent', color: '#fff', fontSize: 22, cursor: 'pointer', fontFamily: 'inherit' }}>+</button>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 14 }}>Ortalama maaş: 25.000 ₺/ay</div>
            </div>
          </div>

          {/* Hesapla butonu */}
          <button onClick={handleCalc} disabled={calculating}
            style={{ width: '100%', marginTop: 24, background: '#1A6B46', color: '#fff', border: 'none', borderRadius: 14, padding: 18, fontSize: 16, fontWeight: 800, cursor: calculating ? 'wait' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            {calculating ? (
              <><span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'roiSpin 0.7s linear infinite' }} /> Hesaplanıyor...</>
            ) : (
              <><Icon name="coins" size={19} /> Tasarrufumu Hesapla →</>
            )}
          </button>

          {/* Sonuç */}
          {done && (
            <div ref={resultRef} style={{ background: 'linear-gradient(135deg, #1A6B46, #0D4A30)', borderRadius: 16, padding: 32, marginTop: 24, animation: 'roiSlideDown 0.4s ease' }}>
              <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Icon name="check-circle" size={20} color="#fff" /> İşte Sonuçlarınız
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                {[
                  { v: `${saatTasarrufu} saat`, l: 'Operasyon süresinden', t: 'Aylık Zaman Tasarrufu', c: '#fff' },
                  { v: TL(personelTasarruf), l: 'Aylık tasarruf potansiyeli', t: 'Personel Maliyeti Karşılığı', c: '#fff' },
                  { v: TL(yillikTasarruf), l: '12 aylık projeksiyon', t: 'Yıllık Tasarruf', c: '#FBBF24' },
                  { v: `${TL(planMaliyet)}/ay`, l: 'Pro plan', t: "Kargonoto'nun Maliyeti", c: '#34D399' },
                ].map(x => (
                  <div key={x.t} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: 20 }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginBottom: 8 }}>{x.t}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: x.c, letterSpacing: '-0.5px' }}>{x.v}</div>
                    <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{x.l}</div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', marginTop: 28 }}>
                <div style={{ fontSize: 16, color: '#fff', fontWeight: 600 }}>Her 1₺ Kargonoto&apos;ya harcayana</div>
                <div style={{ fontSize: 40, color: '#FBBF24', fontWeight: 800, letterSpacing: '-1px', marginTop: 4 }}>{roi}₺ geri kazanıyorsunuz</div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
                <button onClick={() => showToast('Demo talebiniz alındı! Sizi arayacağız 🎉')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#1A1915', border: 'none', borderRadius: 999, padding: '13px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  <Icon name="phone" size={16} /> Hemen Demo Talep Et
                </button>
                <button onClick={() => router.push('/otomasyon')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 999, padding: '13px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Planları Gör →
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ───────────── BÖLÜM 2: NASIL ÇALIŞIR ───────────── */}
        <section style={{ padding: '64px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1A1915', letterSpacing: '-0.5px' }}>Kargonoto arka planda ne yapıyor?</h2>
            <p style={{ fontSize: 15, color: '#9E9B93', marginTop: 8 }}>Siz uyurken bile çalışan bir lojistik beyni</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'stretch', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {STEPS.map((s, i) => (
              <div key={s.title} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ background: '#fff', border: '1px solid rgba(26,25,21,0.08)', borderRadius: 14, padding: 20, textAlign: 'center', width: 168, boxShadow: '0 1px 8px rgba(26,25,21,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                    <span style={{ width: 44, height: 44, borderRadius: 12, background: '#EBF5EF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A6B46' }}><Icon name={s.icon} size={22} /></span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1915' }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: '#9E9B93', marginTop: 6, lineHeight: 1.4 }}>{s.desc}</div>
                </div>
                {i < STEPS.length - 1 && <span style={{ color: '#D4D2CC', flexShrink: 0 }}><Icon name="arrow-right" size={20} strokeWidth={2} /></span>}
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 36, fontSize: 14, color: '#1A6B46', fontWeight: 600, lineHeight: 1.6 }}>
            Tüm bu süreç sipariş başına ortalama 2.3 saniye sürer.<br />
            Manuel yapılsaydı: 8-22 dakika.
          </div>
        </section>

        {/* ───────────── BÖLÜM 3: OTOMASYON KURALLARI ───────────── */}
        <section style={{ paddingBottom: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1A1915', letterSpacing: '-0.5px' }}>Siz Kuralları Koyun, Biz Uygulayalım</h2>
            <p style={{ fontSize: 15, color: '#9E9B93', marginTop: 8 }}>Hangi sipariş hangi kargoya gitsin? Bir kez ayarlayın, bir daha düşünmeyin.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
            {RULES.map(r => (
              <div key={r.title} style={{ background: '#fff', border: '1px solid rgba(26,25,21,0.08)', borderRadius: 14, padding: 16, boxShadow: '0 1px 8px rgba(26,25,21,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: r.color, flexShrink: 0 }} />
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1915' }}>{r.title}</div>
                </div>
                <div style={{ fontSize: 12.5, color: '#9E9B93', marginTop: 8, paddingLeft: 18 }}>{r.desc}</div>
              </div>
            ))}
          </div>

          <button onClick={() => router.push('/otomasyon')}
            style={{ width: '100%', background: '#1A1915', color: '#fff', border: 'none', borderRadius: 14, padding: 16, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
            <Icon name="settings" size={17} /> Kendi Kurallarımı Oluşturmak İstiyorum →
          </button>
        </section>
      </main>

      {/* Toasts */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 100 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ background: '#EBF5EF', color: '#1A6B46', border: '1px solid rgba(26,107,70,0.25)', borderRadius: 10, padding: '12px 18px', fontSize: 13, fontWeight: 600, boxShadow: '0 6px 24px rgba(0,0,0,0.12)', maxWidth: 340 }}>{t.msg}</div>
        ))}
      </div>
    </div>
  );
}
