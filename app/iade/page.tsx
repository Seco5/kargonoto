'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import Icon, { IconName } from '../components/Icon';

type Status = 'islemde' | 'teslim' | 'tamamlandi' | 'reddedildi';
type Channel = 'Web Sitesi' | 'Trendyol' | 'Hepsiburada' | 'N11';

interface Ret {
  id: string; orderId: string; customer: string; product: string; channel: Channel;
  reason: string; date: string; status: Status; amount: number; note: string; address: string;
}

const RETURNS: Ret[] = [
  { id: 'İADE-001', orderId: '#WEB-2024-0441', customer: 'Ayşe Kaya', product: 'Kablosuz Kulaklık Pro X3', channel: 'Web Sitesi', reason: 'Arızalı ürün', date: '01 Haz', status: 'islemde', amount: 1299, note: 'Sol kulak çalışmıyor', address: 'Kadıköy, Moda Cad. No:15, İstanbul' },
  { id: 'İADE-002', orderId: '#TY-8843212', customer: 'Mehmet Yılmaz', product: 'Gaming Mouse Set', channel: 'Trendyol', reason: 'Yanlış ürün', date: '01 Haz', status: 'islemde', amount: 459, note: 'Farklı model geldi', address: 'Çankaya, Tunalı Hilmi Cd. No:42, Ankara' },
  { id: 'İADE-003', orderId: '#HB-5521199', customer: 'Fatma Şahin', product: 'Deri Çanta Siyah', channel: 'Hepsiburada', reason: 'Beğenmedim', date: '31 May', status: 'islemde', amount: 1299, note: '—', address: 'Konak, Cumhuriyet Blv. No:7, İzmir' },
  { id: 'İADE-004', orderId: '#WEB-2024-0389', customer: 'Ali Rıza', product: 'Akıllı Saat SE', channel: 'Web Sitesi', reason: 'Açıklamaya uymuyor', date: '31 May', status: 'islemde', amount: 2199, note: 'Su geçirmez değilmiş', address: 'Nilüfer, FSM Blv. No:21, Bursa' },
  { id: 'İADE-005', orderId: '#N11-3310201', customer: 'Zeynep Ak', product: 'USB-C Hub 7 Port', channel: 'N11', reason: 'Hasarlı teslimat', date: '30 May', status: 'islemde', amount: 389, note: 'Kutu ezilmiş', address: 'Muratpaşa, Atatürk Cd. No:9, Antalya' },
  { id: 'İADE-006', orderId: '#WEB-2024-0312', customer: 'Murat Demir', product: 'Bluetooth Hoparlör', channel: 'Web Sitesi', reason: 'Arızalı ürün', date: '28 May', status: 'teslim', amount: 649, note: 'Şarj olmuyor', address: 'Şişli, Halaskargazi Cd. No:88, İstanbul' },
  { id: 'İADE-007', orderId: '#TY-8842901', customer: 'Selin Çelik', product: 'Mekanik Klavye TKL', channel: 'Trendyol', reason: 'Yanlış ürün', date: '27 May', status: 'teslim', amount: 899, note: 'Türkçe Q değil', address: 'Karşıyaka, Girne Cd. No:14, İzmir' },
  { id: 'İADE-008', orderId: '#HB-5521038', customer: 'Kemal Arslan', product: 'Laptop Çantası 15"', channel: 'Hepsiburada', reason: 'Beğenmedim', date: '25 May', status: 'tamamlandi', amount: 849.9, note: '—', address: 'Çankaya, Kızılay, Ankara' },
  { id: 'İADE-009', orderId: '#WEB-2024-0298', customer: 'Merve Koç', product: 'Ring Light 10 inç', channel: 'Web Sitesi', reason: 'Arızalı ürün', date: '24 May', status: 'tamamlandi', amount: 329, note: 'LED titriyor', address: 'Beşiktaş, Barbaros Blv. No:3, İstanbul' },
  { id: 'İADE-010', orderId: '#TY-8844001', customer: 'Burak Yurt', product: 'Şarj Aleti 65W', channel: 'Trendyol', reason: 'Fikir değişikliği', date: '23 May', status: 'reddedildi', amount: 299, note: '—', address: 'Selçuklu, Mevlana Cd. No:55, Konya' },
];

const TL = (n: number) => '₺' + n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CHANNEL_STYLE: Record<Channel, { bg: string; color: string }> = {
  'Web Sitesi': { bg: '#EBF0F9', color: '#1A4B8C' },
  'Trendyol': { bg: 'rgba(201,78,26,0.1)', color: '#C94E1A' },
  'Hepsiburada': { bg: 'rgba(255,140,0,0.1)', color: '#C47A00' },
  'N11': { bg: 'rgba(100,50,200,0.1)', color: '#6432C8' },
};

const STATUS_META: Record<Status, { label: string; bg: string; color: string; icon: IconName }> = {
  islemde: { label: 'İşlemde', bg: '#FDF0EB', color: '#C94E1A', icon: 'refresh' },
  teslim: { label: 'Teslim Alındı', bg: '#EBF0F9', color: '#1A4B8C', icon: 'stock' },
  tamamlandi: { label: 'Tamamlandı', bg: '#EBF5EF', color: '#1A6B46', icon: 'check-circle' },
  reddedildi: { label: 'Reddedildi', bg: '#FBEAEA', color: '#D63B3B', icon: 'x' },
};

const TABS: { key: Status; label: string; count: number; icon: IconName }[] = [
  { key: 'islemde', label: 'İşlemde', count: 12, icon: 'refresh' },
  { key: 'teslim', label: 'Teslim Alındı', count: 47, icon: 'stock' },
  { key: 'tamamlandi', label: 'Tamamlandı', count: 284, icon: 'check-circle' },
  { key: 'reddedildi', label: 'Reddedildi / İptal', count: 18, icon: 'x' },
];

function Badge({ text, style, icon }: { text: string; style: { bg: string; color: string }; icon?: IconName }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: style.bg, color: style.color, fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999, whiteSpace: 'nowrap' }}>
      {icon && <Icon name={icon} size={12} />} {text}
    </span>
  );
}

export default function IadePage() {
  const [tab, setTab] = useState<Status>('islemde');
  const [rows, setRows] = useState<Ret[]>(RETURNS);
  const [manage, setManage] = useState<Ret | null>(null);
  const [detail, setDetail] = useState<Ret | null>(null);
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);

  const showToast = (msg: string) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };

  const completeReturn = (id: string, amount: number) => {
    setRows(rs => rs.map(r => r.id === id ? { ...r, status: 'tamamlandi' } : r));
    setManage(null);
    showToast(`İade tamamlandı! ${TL(amount)} para iadesi başlatıldı.`);
  };

  const filtered = rows.filter(r => r.status === tab);

  const metrics = [
    { label: 'İşlemde', value: 12, color: '#C94E1A' },
    { label: 'Teslim Alındı', value: 47, color: '#1A4B8C' },
    { label: 'Tamamlandı', value: 284, color: '#1A6B46' },
    { label: 'Reddedildi', value: 18, color: '#D63B3B' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#F7F6F2' }}>
      <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } } @keyframes modalIn { from { opacity:0; transform: translateY(12px) scale(0.98);} to { opacity:1; transform: translateY(0) scale(1);} }`}</style>
      <Sidebar />
      <TopBar title="İade Yönetimi" />

      <main style={{ marginLeft: 240, flex: 1, padding: '88px 36px 32px' }}>
        <div style={{ marginBottom: 22 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1915' }}>İade Yönetimi</h1>
          <p style={{ fontSize: 13, color: '#9E9B93', marginTop: 4 }}>Tüm kanallardan gelen iade taleplerini tek ekrandan yönetin.</p>
        </div>

        {/* Metrik kartlar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          {metrics.map(m => (
            <div key={m.label} style={{ background: '#fff', borderRadius: 14, padding: '18px 22px', boxShadow: '0 1px 8px rgba(26,25,21,0.06)', border: '1px solid rgba(26,25,21,0.08)' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: m.color, letterSpacing: '-1px' }}>{m.value}</div>
              <div style={{ fontSize: 13, color: '#9E9B93', marginTop: 4, fontWeight: 500 }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Sekmeler */}
        <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid #E5E7EB', marginBottom: 20, flexWrap: 'wrap' }}>
          {TABS.map(t => {
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 0 12px', background: 'none', border: 'none', borderBottom: '2px solid ' + (active ? '#1A1915' : 'transparent'), cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: active ? 700 : 600, color: active ? '#1A1915' : '#9E9B93', marginBottom: -1 }}>
                <Icon name={t.icon} size={15} /> {t.label} ({t.count})
              </button>
            );
          })}
        </div>

        {/* Tablo */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 8px rgba(26,25,21,0.06)', border: '1px solid rgba(26,25,21,0.08)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(26,25,21,0.08)' }}>
                  {['İade No', 'Sipariş No', 'Müşteri', 'Ürün', 'Kanal', 'Sebep', 'Talep Tarihi', 'Durum', 'İşlem'].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9E9B93', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const isOpen = r.status === 'islemde' || r.status === 'teslim';
                  return (
                    <tr key={r.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(26,25,21,0.06)' : 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#EFEDE8'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                      <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 700, color: '#1A1915', whiteSpace: 'nowrap' }}>{r.id}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: '#5A574F', fontFamily: 'monospace' }}>{r.orderId}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: '#1A1915', whiteSpace: 'nowrap' }}>{r.customer}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: '#1A1915' }}>{r.product}</td>
                      <td style={{ padding: '13px 16px' }}><Badge text={r.channel} style={CHANNEL_STYLE[r.channel]} /></td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: '#5A574F', whiteSpace: 'nowrap' }}>{r.reason}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: '#9E9B93', whiteSpace: 'nowrap' }}>{r.date}</td>
                      <td style={{ padding: '13px 16px' }}><Badge text={STATUS_META[r.status].label} style={STATUS_META[r.status]} icon={STATUS_META[r.status].icon} /></td>
                      <td style={{ padding: '13px 16px' }}>
                        <button onClick={() => isOpen ? setManage(r) : setDetail(r)}
                          style={{ fontSize: 12.5, fontWeight: 600, padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', border: '1px solid ' + (isOpen ? '#1A1915' : 'rgba(26,25,21,0.18)'), background: isOpen ? '#1A1915' : '#fff', color: isOpen ? '#fff' : '#1A1915', whiteSpace: 'nowrap' }}>
                          {isOpen ? 'Yönet' : 'Detay'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', fontSize: 13, color: '#9E9B93' }}>Bu durumda iade yok.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {manage && <ManageModal ret={manage} onClose={() => setManage(null)} onComplete={completeReturn} showToast={showToast} />}
      {detail && <DetailPanel ret={detail} onClose={() => setDetail(null)} showToast={showToast} />}

      <div style={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 200 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ background: '#EBF5EF', color: '#1A6B46', border: '1px solid rgba(26,107,70,0.25)', borderRadius: 10, padding: '12px 18px', fontSize: 13, fontWeight: 600, boxShadow: '0 6px 24px rgba(0,0,0,0.12)', maxWidth: 360 }}>{t.msg}</div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MANAGE MODAL (3 aşama)
// ─────────────────────────────────────────────────────────────────────────────

const RC_CARRIERS = [{ n: 'Sendeo', c: '#1A6B46' }, { n: 'Aras', c: '#C94E1A' }, { n: 'Yurtiçi', c: '#B45309' }];
const CONDITIONS: { key: string; label: string; icon: IconName; color: string }[] = [
  { key: 'saglam', label: 'Sağlam — İade kabul edilebilir', icon: 'check-circle', color: '#1A6B46' },
  { key: 'hafif', label: 'Hafif Hasarlı — Kabul, değer düşük', icon: 'alert', color: '#C94E1A' },
  { key: 'agir', label: 'Ağır Hasarlı — İade reddedilebilir', icon: 'x', color: '#D63B3B' },
  { key: 'acilmamis', label: 'Açılmamış — Mükemmel durum', icon: 'stock', color: '#1A4B8C' },
];
const REFUNDS: { key: string; label: string; desc: string; icon: IconName }[] = [
  { key: 'para', label: 'Para İadesi', desc: 'Ödeme yöntemine geri yükle', icon: 'card' },
  { key: 'degisim', label: 'Ürün Değişimi', desc: 'Farklı ürün veya renk gönder', icon: 'refresh' },
  { key: 'kredi', label: 'Mağaza Kredisi', desc: 'Sonraki alışverişte kullanılabilir', icon: 'gift' },
];
const REJECT_REASONS = ['İade süresi dolmuş', 'Ürün ağır hasarlı / kullanılmış', 'Politika kapsamı dışında', 'Diğer'];

function ManageModal({ ret, onClose, onComplete, showToast }: { ret: Ret; onClose: () => void; onComplete: (id: string, amount: number) => void; showToast: (m: string) => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(ret.status === 'teslim' ? 2 : 1);
  // step1
  const [carrier, setCarrier] = useState('Sendeo');
  const [method, setMethod] = useState<'kapi' | 'sube'>('kapi');
  // step2
  const [received, setReceived] = useState(ret.status === 'teslim');
  const [condition, setCondition] = useState('');
  const [qty, setQty] = useState('1');
  // step3
  const [refund, setRefund] = useState('para');
  const [refundAmount, setRefundAmount] = useState(ret.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 }));
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const today = '2026-06-01';

  const stepDot = (n: number) => {
    const done = step > n;
    const active = step === n;
    return (
      <div style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0,
        background: done ? '#1A6B46' : active ? '#1A4B8C' : '#F0EFEB', color: done || active ? '#fff' : '#9E9B93' }}>
        {done ? <Icon name="check" size={15} /> : n}
      </div>
    );
  };
  const stepLabel = (n: number, label: string) => (
    <span style={{ fontSize: 12.5, fontWeight: step === n ? 700 : 600, color: step >= n ? '#1A1915' : '#9E9B93' }}>{label}</span>
  );

  const footBtn = (variant: 'ghost' | 'primary', label: React.ReactNode, onClick: () => void, disabled = false): React.ReactNode => (
    <button onClick={onClick} disabled={disabled}
      style={{ padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 7,
        border: variant === 'ghost' ? '1px solid #E5E7EB' : 'none',
        background: variant === 'ghost' ? '#fff' : disabled ? 'rgba(26,25,21,0.12)' : '#1A1915',
        color: variant === 'ghost' ? '#1A1915' : disabled ? '#9E9B93' : '#fff' }}>{label}</button>
  );

  const radioCard = (selected: boolean) => ({
    display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 10, cursor: 'pointer',
    border: '1.5px solid ' + (selected ? '#1A1915' : '#E5E7EB'), background: selected ? '#F7F6F2' : '#fff', fontFamily: 'inherit', width: '100%', textAlign: 'left' as const,
  });

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 640, maxWidth: '94vw', maxHeight: '90vh', overflowY: 'auto', background: '#fff', borderRadius: 20, boxShadow: '0 24px 64px rgba(0,0,0,0.25)', zIndex: 101, animation: 'modalIn 0.22s ease', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {/* Başlık */}
        <div style={{ padding: '20px 26px', borderBottom: '1px solid rgba(26,25,21,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', borderRadius: '20px 20px 0 0' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1915' }}>İade Yönet — {ret.id}</div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(26,25,21,0.12)', background: '#fff', cursor: 'pointer', color: '#5A574F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="x" size={16} /></button>
        </div>

        <div style={{ padding: 26 }}>
          {/* Müşteri + ürün bilgisi */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            <div style={{ background: '#F7F6F2', borderRadius: 12, padding: 14, fontSize: 13, lineHeight: 1.7, color: '#5A574F' }}>
              <div><b style={{ color: '#1A1915' }}>Müşteri:</b> {ret.customer}</div>
              <div><b style={{ color: '#1A1915' }}>Sipariş:</b> {ret.orderId}</div>
              <div><b style={{ color: '#1A1915' }}>Kanal:</b> {ret.channel}</div>
              <div><b style={{ color: '#1A1915' }}>Tarih:</b> {ret.date} 2026</div>
            </div>
            <div style={{ background: '#F7F6F2', borderRadius: 12, padding: 14, fontSize: 13, lineHeight: 1.7, color: '#5A574F' }}>
              <div><b style={{ color: '#1A1915' }}>Ürün:</b> {ret.product}</div>
              <div><b style={{ color: '#1A1915' }}>Tutar:</b> {TL(ret.amount)}</div>
              <div><b style={{ color: '#1A1915' }}>Sebep:</b> {ret.reason}</div>
              <div><b style={{ color: '#1A1915' }}>Müşteri Notu:</b> “{ret.note}”</div>
            </div>
          </div>

          {/* Stepper */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 26 }}>
            {stepDot(1)} {stepLabel(1, 'Ters Kargo')}
            <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
            {stepDot(2)} {stepLabel(2, 'Teslim & Kontrol')}
            <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
            {stepDot(3)} {stepLabel(3, 'İade')}
          </div>

          {/* ───── AŞAMA 1 ───── */}
          {step === 1 && (
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1915' }}>Ters Kargo Oluştur</div>
              <div style={{ fontSize: 13, color: '#9E9B93', marginTop: 3, marginBottom: 18 }}>Ürünü müşteriden geri almak için kargo etiketi oluşturun.</div>

              <label style={{ fontSize: 12.5, fontWeight: 700, color: '#5A574F' }}>Kargo Firması</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, margin: '8px 0 20px' }}>
                {RC_CARRIERS.map(c => {
                  const sel = carrier === c.n;
                  return <button key={c.n} onClick={() => setCarrier(c.n)} style={{ padding: '12px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', border: '1.5px solid ' + (sel ? '#1A6B46' : '#E5E7EB'), background: sel ? '#EBF5EF' : '#fff', color: '#1A1915' }}>{c.n}</button>;
                })}
              </div>

              <label style={{ fontSize: 12.5, fontWeight: 700, color: '#5A574F' }}>Teslim Alma Yöntemi</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '8px 0 20px' }}>
                <button onClick={() => setMethod('kapi')} style={radioCard(method === 'kapi')}>
                  <Icon name="shipping" size={20} color="#1A6B46" />
                  <div><div style={{ fontSize: 13.5, fontWeight: 700, color: '#1A1915' }}>Kapıdan Alım</div><div style={{ fontSize: 12, color: '#9E9B93' }}>Kargo kurye müşterinin adresine gider</div></div>
                </button>
                <button onClick={() => setMethod('sube')} style={radioCard(method === 'sube')}>
                  <Icon name="store" size={20} color="#1A4B8C" />
                  <div><div style={{ fontSize: 13.5, fontWeight: 700, color: '#1A1915' }}>Şubeye Teslim</div><div style={{ fontSize: 12, color: '#9E9B93' }}>Müşteri en yakın şubeye bırakır</div></div>
                </button>
              </div>

              <label style={{ fontSize: 12.5, fontWeight: 700, color: '#5A574F' }}>Teslimat Adresi</label>
              <div style={{ background: '#F7F6F2', borderRadius: 10, padding: '11px 14px', margin: '8px 0 4px', fontSize: 13, color: '#1A1915', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span><Icon name="home" size={14} color="#9E9B93" /> {ret.address}</span>
                <a onClick={() => showToast('Adres düzenleme demo modunda')} style={{ fontSize: 12, color: '#1A6B46', fontWeight: 600, cursor: 'pointer' }}>Düzenle</a>
              </div>

              <label style={{ fontSize: 12.5, fontWeight: 700, color: '#5A574F', display: 'block', marginTop: 18, marginBottom: 8 }}>İade Gidecek Depo</label>
              <select style={{ width: '100%', fontSize: 13, padding: '10px 12px', borderRadius: 9, border: '1px solid #E5E7EB', fontFamily: 'inherit', color: '#1A1915', background: '#fff' }}>
                <option>Ana Depo — İstanbul</option>
                <option>Bölge Depo — Ankara</option>
                <option>Bölge Depo — İzmir</option>
              </select>
            </div>
          )}

          {/* ───── AŞAMA 2 ───── */}
          {step === 2 && (
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1915' }}>Ürün Teslim Alındı mı?</div>
              <div style={{ fontSize: 13, color: '#9E9B93', marginTop: 3, marginBottom: 16 }}>Ürün deponuza ulaştığında durumunu kaydedin.</div>

              <div style={{ background: '#EBF0F9', borderRadius: 10, padding: '11px 14px', marginBottom: 18, fontSize: 13 }}>
                <div style={{ fontWeight: 700, color: '#1A4B8C' }}>{carrier} — SND-İADE-8842901</div>
                <div style={{ color: '#1A4B8C', display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}><span style={{ width: 8, height: 8, borderRadius: 999, background: '#1A4B8C', display: 'inline-block' }} /> Dağıtım merkezinde — bugün 09:45</div>
              </div>

              {!received ? (
                <button onClick={() => setReceived(true)} style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', background: '#1A6B46', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Icon name="check" size={17} /> Evet, Teslim Alındı
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div><label style={{ fontSize: 12, fontWeight: 600, color: '#5A574F' }}>Teslim Tarihi</label><input type="date" defaultValue={today} style={{ width: '100%', fontSize: 13, padding: '9px 11px', borderRadius: 9, border: '1px solid #E5E7EB', fontFamily: 'inherit', marginTop: 5, color: '#1A1915' }} /></div>
                    <div><label style={{ fontSize: 12, fontWeight: 600, color: '#5A574F' }}>Teslim Saati</label><input type="time" defaultValue="09:45" style={{ width: '100%', fontSize: 13, padding: '9px 11px', borderRadius: 9, border: '1px solid #E5E7EB', fontFamily: 'inherit', marginTop: 5, color: '#1A1915' }} /></div>
                  </div>
                  <div><label style={{ fontSize: 12, fontWeight: 600, color: '#5A574F' }}>Teslim Alan Depo</label>
                    <select style={{ width: '100%', fontSize: 13, padding: '9px 11px', borderRadius: 9, border: '1px solid #E5E7EB', fontFamily: 'inherit', marginTop: 5, color: '#1A1915', background: '#fff' }}><option>Ana Depo — İstanbul</option><option>Bölge Depo — Ankara</option></select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12.5, fontWeight: 700, color: '#5A574F' }}>Ürün Durumu <span style={{ color: '#D63B3B' }}>*</span></label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                      {CONDITIONS.map(c => (
                        <button key={c.key} onClick={() => setCondition(c.key)} style={radioCard(condition === c.key)}>
                          <Icon name={c.icon} size={18} color={c.color} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1915' }}>{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 13 }}>
                    <span style={{ color: '#5A574F' }}>Miktar Kontrolü — İstenen: <b style={{ color: '#1A1915' }}>1 adet</b> · Gelen:</span>
                    <input value={qty} onChange={e => setQty(e.target.value)} type="number" min={0} style={{ width: 60, fontSize: 14, fontWeight: 600, textAlign: 'center', padding: '7px', borderRadius: 8, border: '1px solid #E5E7EB', fontFamily: 'inherit', color: '#1A1915' }} />
                  </div>
                  <div><label style={{ fontSize: 12, fontWeight: 600, color: '#5A574F' }}>İç Not (opsiyonel)</label>
                    <textarea placeholder="Ürün durumu hakkında not..." rows={2} style={{ width: '100%', fontSize: 13, padding: '9px 11px', borderRadius: 9, border: '1px solid #E5E7EB', fontFamily: 'inherit', marginTop: 5, color: '#1A1915', resize: 'vertical' }} />
                  </div>
                  <button onClick={() => showToast('Demo modunda fotoğraf yükleme simüle edildi')} style={{ border: '1.5px dashed #E5E7EB', borderRadius: 10, padding: 16, background: '#FAF9F6', cursor: 'pointer', fontFamily: 'inherit', color: '#9E9B93', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Icon name="camera" size={18} /> Fotoğraf Ekle
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ───── AŞAMA 3 ───── */}
          {step === 3 && (
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1915' }}>İade İşlemini Tamamla</div>
              <div style={{ fontSize: 13, color: '#9E9B93', marginTop: 3, marginBottom: 16 }}>Geri ödeme yöntemini seçin ve iade sürecini kapatın.</div>

              <div style={{ background: '#F7F6F2', borderRadius: 12, padding: 14, fontSize: 13, lineHeight: 1.7, color: '#5A574F', marginBottom: 18 }}>
                <div><b style={{ color: '#1A1915' }}>Ürün:</b> {ret.product}</div>
                <div><b style={{ color: '#1A1915' }}>Orijinal Tutar:</b> {TL(ret.amount)}</div>
                <div><b style={{ color: '#1A1915' }}>İade Tutarı:</b> {TL(ret.amount)}</div>
                <div><b style={{ color: '#1A1915' }}>Ürün Durumu:</b> {CONDITIONS.find(c => c.key === condition)?.label.split(' —')[0] ?? 'Sağlam'}</div>
              </div>

              {!rejecting && (
                <>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: '#5A574F' }}>Geri Ödeme Yöntemi</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, margin: '8px 0 18px' }}>
                    {REFUNDS.map(r => {
                      const sel = refund === r.key;
                      return (
                        <button key={r.key} onClick={() => setRefund(r.key)} style={{ padding: 14, borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', border: '1.5px solid ' + (sel ? '#1A1915' : '#E5E7EB'), background: sel ? '#F7F6F2' : '#fff' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, color: '#1A1915' }}><Icon name={r.icon} size={22} /></div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1915' }}>{r.label}</div>
                          <div style={{ fontSize: 11, color: '#9E9B93', marginTop: 3, lineHeight: 1.3 }}>{r.desc}</div>
                        </button>
                      );
                    })}
                  </div>

                  <label style={{ fontSize: 12, fontWeight: 600, color: '#5A574F' }}>Geri Ödeme Tutarı</label>
                  <div style={{ position: 'relative', margin: '5px 0 16px' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9E9B93', fontSize: 14, fontWeight: 600 }}>₺</span>
                    <input value={refundAmount} onChange={e => setRefundAmount(e.target.value)} style={{ width: '100%', fontSize: 15, fontWeight: 600, padding: '11px 12px 11px 28px', borderRadius: 9, border: '1px solid #E5E7EB', fontFamily: 'inherit', color: '#1A1915' }} />
                  </div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#5A574F' }}>İç Not</label>
                  <textarea placeholder="Muhasebe için not (opsiyonel)" rows={2} style={{ width: '100%', fontSize: 13, padding: '9px 11px', borderRadius: 9, border: '1px solid #E5E7EB', fontFamily: 'inherit', marginTop: 5, color: '#1A1915', resize: 'vertical' }} />

                  <a onClick={() => setRejecting(true)} style={{ display: 'inline-block', marginTop: 14, fontSize: 13, color: '#D63B3B', fontWeight: 600, cursor: 'pointer' }}>Bu iadeyi reddet →</a>
                </>
              )}

              {rejecting && (
                <div style={{ background: '#FFF5F5', border: '1px solid rgba(214,59,59,0.25)', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#D63B3B', marginBottom: 10 }}>Red Sebebi <span>*</span></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {REJECT_REASONS.map(r => (
                      <button key={r} onClick={() => setRejectReason(r)} style={radioCard(rejectReason === r)}>
                        <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid ' + (rejectReason === r ? '#D63B3B' : '#C9C6BE'), display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{rejectReason === r && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#D63B3B' }} />}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1915' }}>{r}</span>
                      </button>
                    ))}
                  </div>
                  {rejectReason === 'Diğer' && <textarea placeholder="Açıklama..." rows={2} style={{ width: '100%', fontSize: 13, padding: '9px 11px', borderRadius: 9, border: '1px solid #E5E7EB', fontFamily: 'inherit', marginTop: 10, color: '#1A1915' }} />}
                  <a onClick={() => { setRejecting(false); setRejectReason(''); }} style={{ display: 'inline-block', marginTop: 12, fontSize: 12.5, color: '#5A574F', fontWeight: 600, cursor: 'pointer' }}>← Geri ödemeye dön</a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 26px', borderTop: '1px solid rgba(26,25,21,0.08)', display: 'flex', justifyContent: 'space-between', position: 'sticky', bottom: 0, background: '#fff', borderRadius: '0 0 20px 20px' }}>
          {step === 1 ? footBtn('ghost', 'İptal', onClose) : footBtn('ghost', <><Icon name="undo" size={15} /> Geri</>, () => setStep((step - 1) as 1 | 2 | 3))}
          {step === 1 && footBtn('primary', <>Etiketi Oluştur ve Gönder →</>, () => { setStep(2); showToast(`${carrier} iade etiketi oluşturuldu. Müşteriye SMS gönderildi.`); })}
          {step === 2 && footBtn('primary', <>Teslimi Kaydet →</>, () => { setStep(3); showToast('Teslim alındı olarak kaydedildi'); }, !received || !condition)}
          {step === 3 && (rejecting
            ? footBtn('primary', <><Icon name="x" size={15} /> İadeyi Reddet</>, () => { onComplete(ret.id, 0); showToast('İade reddedildi'); }, !rejectReason)
            : footBtn('primary', <><Icon name="check" size={15} /> İadeyi Tamamla</>, () => onComplete(ret.id, ret.amount)))}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DETAIL PANEL (Tamamlandı / Reddedildi)
// ─────────────────────────────────────────────────────────────────────────────

function DetailPanel({ ret, onClose, showToast }: { ret: Ret; onClose: () => void; showToast: (m: string) => void }) {
  const rejected = ret.status === 'reddedildi';
  const timeline = rejected
    ? [
        { date: '23 May', text: 'İade talebi oluşturuldu', ok: true },
        { date: '23 May', text: 'Talep incelendi', ok: true },
        { date: '24 May', text: 'İade reddedildi — Fikir değişikliği iade süresi dışında', ok: false },
      ]
    : [
        { date: '25 May', text: 'İade talebi oluşturuldu', ok: true },
        { date: '26 May', text: 'Aras iade etiketi oluşturuldu', ok: true },
        { date: '27 May', text: 'Ürün teslim alındı (Sağlam)', ok: true },
        { date: '28 May', text: 'Para iadesi tamamlandı', ok: true },
      ];

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 100 }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 420, background: '#fff', boxShadow: '-8px 0 32px rgba(0,0,0,0.16)', zIndex: 101, overflowY: 'auto', animation: 'slideIn 0.22s ease', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ padding: '22px 26px', borderBottom: '1px solid rgba(26,25,21,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1915' }}>{ret.id}</div>
            <Badge text={STATUS_META[ret.status].label} style={STATUS_META[ret.status]} icon={STATUS_META[ret.status].icon} />
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(26,25,21,0.12)', background: '#fff', cursor: 'pointer', color: '#5A574F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="x" size={16} /></button>
        </div>

        <div style={{ padding: 26 }}>
          <div style={{ fontSize: 13, lineHeight: 1.9, color: '#5A574F', marginBottom: 22 }}>
            <div><b style={{ color: '#1A1915' }}>Müşteri:</b> {ret.customer}</div>
            <div><b style={{ color: '#1A1915' }}>Sipariş:</b> {ret.orderId}</div>
            <div><b style={{ color: '#1A1915' }}>Ürün:</b> {ret.product}</div>
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: '#9E9B93', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Süreç Geçmişi</div>
          <div style={{ position: 'relative', paddingLeft: 4 }}>
            {timeline.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: i < timeline.length - 1 ? 18 : 0, position: 'relative' }}>
                {i < timeline.length - 1 && <span style={{ position: 'absolute', left: 9, top: 20, bottom: 0, width: 2, background: '#F0EFEB' }} />}
                <span style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.ok ? '#1A6B46' : '#D63B3B', color: '#fff', zIndex: 1 }}>
                  <Icon name={t.ok ? 'check' : 'x'} size={12} />
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1915' }}>{t.text}</div>
                  <div style={{ fontSize: 11.5, color: '#9E9B93', marginTop: 1 }}>{t.date} 2026</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: '#9E9B93', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '26px 0 12px' }}>Özet</div>
          <div style={{ background: '#F7F6F2', borderRadius: 12, padding: 14, fontSize: 13, lineHeight: 1.8, color: '#5A574F' }}>
            <div><b style={{ color: '#1A1915' }}>İade Tutarı:</b> {TL(ret.amount)}</div>
            <div><b style={{ color: '#1A1915' }}>Yöntem:</b> {rejected ? '—' : 'Para İadesi'}</div>
            <div><b style={{ color: '#1A1915' }}>Kargo:</b> {rejected ? '—' : 'Aras Kargo'}</div>
          </div>

          <button onClick={() => showToast('İade raporu hazırlanıyor... (Demo)')} style={{ width: '100%', marginTop: 22, padding: 13, borderRadius: 10, border: '1px solid rgba(26,25,21,0.18)', background: '#fff', color: '#1A1915', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icon name="printer" size={16} /> İade Raporu İndir
          </button>
        </div>
      </div>
    </>
  );
}
