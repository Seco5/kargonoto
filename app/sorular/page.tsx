'use client';

import { useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import Icon from '../components/Icon';

type Platform = 'trendyol' | 'hepsiburada';
type QStatus = 'pending' | 'answered' | 'expired';
type Tone = 'green' | 'orange' | 'red' | 'expired';

interface Question {
  id: string;
  product: string;
  question: string;
  customer: string;
  date: string;
  timeLabel: string; // süre sayacı metni
  tone: Tone;
  pulse?: boolean; // acil — kırmızı nokta pulse
  status: QStatus;
  answer?: string;
  answeredDate?: string;
}

const TRENDYOL_QUESTIONS: Question[] = [
  {
    id: 'ty-1',
    product: 'Kablosuz Kulaklık Pro X3',
    question: 'Bu ürün iPhone 14 ile uyumlu mu? Bluetooth versiyonu nedir?',
    customer: 'Ayşe K.',
    date: '14 Haz 10:30',
    timeLabel: '🔴 2 saat kaldı',
    tone: 'red',
    pulse: true,
    status: 'pending',
  },
  {
    id: 'ty-2',
    product: 'Gaming Mouse + Pad Set',
    question: 'Mousepad boyutu tam olarak kaç cm x kaç cm?',
    customer: 'Mehmet Y.',
    date: '14 Haz 08:15',
    timeLabel: '⚠️ 6 saat kaldı',
    tone: 'orange',
    status: 'pending',
  },
  {
    id: 'ty-3',
    product: 'Akıllı Saat SE 2025',
    question: 'Android telefon ile çalışıyor mu, sadece iPhone için mi?',
    customer: 'Fatma Ş.',
    date: '13 Haz 22:00',
    timeLabel: '⚠️ 14 saat kaldı',
    tone: 'orange',
    status: 'pending',
  },
  {
    id: 'ty-4',
    product: 'Bluetooth Hoparlör Mini',
    question: 'Su geçirmezlik sertifikası var mı? IP67 mi IP68 mi?',
    customer: 'Ali R.',
    date: '13 Haz 18:45',
    timeLabel: '22 saat kaldı',
    tone: 'green',
    status: 'pending',
  },
  {
    id: 'ty-5',
    product: 'USB-C Hub 7 Port',
    question: 'MacBook Pro M3 ile uyumlu mu?',
    customer: 'Zeynep A.',
    date: '13 Haz 15:30',
    timeLabel: '28 saat kaldı',
    tone: 'green',
    status: 'pending',
  },
  {
    id: 'ty-6',
    product: 'Laptop Çantası 15"',
    question: '15.6 inç laptop sığar mı, tam ölçü nedir?',
    customer: 'Murat D.',
    date: '13 Haz 12:00',
    timeLabel: '34 saat kaldı',
    tone: 'green',
    status: 'pending',
  },
  {
    id: 'ty-7',
    product: 'Mekanik Klavye TKL',
    question: 'Türkçe Q klavye mi?',
    customer: 'Selin Ç.',
    date: '13 Haz 13:00',
    timeLabel: '✅ Cevaplandı',
    tone: 'green',
    status: 'answered',
    answer: 'Evet, Türkçe Q klavye düzeniyle gelir.',
    answeredDate: '13 Haz 14:22',
  },
  {
    id: 'ty-8',
    product: 'Ring Light 10 inç',
    question: 'Telefon tutucu dahil mi?',
    customer: 'Burak Y.',
    date: '11 Haz 09:00',
    timeLabel: '❌ Süresi Doldu',
    tone: 'expired',
    status: 'expired',
  },
];

const HEPSIBURADA_QUESTIONS: Question[] = [
  {
    id: 'hb-1',
    product: 'Deri Çanta Siyah',
    question: 'Omuz askısı çıkarılabilir mi?',
    customer: 'Merve K.',
    date: '14 Haz 11:00',
    timeLabel: '🔴 1 saat 30 dk kaldı',
    tone: 'red',
    pulse: true,
    status: 'pending',
  },
  {
    id: 'hb-2',
    product: 'Şarj Aleti 65W GaN',
    question: 'Aynı anda kaç cihaz şarj eder?',
    customer: 'Kemal A.',
    date: '14 Haz 09:30',
    timeLabel: '🔴 3 saat kaldı',
    tone: 'red',
    pulse: true,
    status: 'pending',
  },
  {
    id: 'hb-3',
    product: 'Mousepad XL Gaming',
    question: 'RGB aydınlatma var mı?',
    customer: 'Hasan K.',
    date: '14 Haz 07:45',
    timeLabel: '⚠️ 5 saat kaldı',
    tone: 'orange',
    status: 'pending',
  },
  {
    id: 'hb-4',
    product: 'Webcam Full HD',
    question: 'Mac ile çalışır mı, sürücü kurulumu gerekiyor mu?',
    customer: 'Cansu Y.',
    date: '14 Haz 05:30',
    timeLabel: '⚠️ 7 saat kaldı',
    tone: 'orange',
    status: 'pending',
  },
  {
    id: 'hb-5',
    product: 'Bluetooth Kulaklık',
    question: 'Gürültü engelleme özelliği var mı?',
    customer: 'Tarık Ş.',
    date: '13 Haz 23:00',
    timeLabel: '12 saat kaldı',
    tone: 'green',
    status: 'pending',
  },
];

const TEMPLATES: { label: string; text: string }[] = [
  {
    label: 'Teşekkürler',
    text: 'Ürünümüze gösterdiğiniz ilgi için teşekkür ederiz. ',
  },
  {
    label: 'Uyumlu',
    text: 'Evet, ürünümüz [CİHAZ] ile tam uyumludur. ',
  },
  {
    label: 'Stok/Kargo',
    text: 'Ürün stokta mevcuttur, siparişiniz 1-2 iş günü içinde kargoya verilir.',
  },
  {
    label: 'Teknik Özellik',
    text: 'Ürün teknik özellikleri için lütfen ürün sayfasındaki detaylara bakınız.',
  },
];

const REJECT_REASONS = ['Uygunsuz içerik', 'Konu dışı', 'Tekrar eden soru'];

const TONE_STYLE: Record<Tone, { bg: string; color: string }> = {
  green: { bg: '#EBF5EF', color: '#1A6B46' },
  orange: { bg: '#FDF4E7', color: '#C47A00' },
  red: { bg: '#FBEAEA', color: '#D63B3B' },
  expired: { bg: '#FBEAEA', color: '#D63B3B' },
};

const PLATFORM_DOT: Record<Platform, string> = {
  trendyol: '#C94E1A',
  hepsiburada: '#FF8C00',
};

type StatusFilter = 'pending' | 'answered' | 'expired' | 'all';

export default function SorularPage() {
  const [platform, setPlatform] = useState<Platform>('trendyol');
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [search, setSearch] = useState('');
  const [tyRows, setTyRows] = useState<Question[]>(TRENDYOL_QUESTIONS);
  const [hbRows, setHbRows] = useState<Question[]>(HEPSIBURADA_QUESTIONS);
  const [openAnswer, setOpenAnswer] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [rejectTarget, setRejectTarget] = useState<Question | null>(null);
  const [rejectReason, setRejectReason] = useState(REJECT_REASONS[0]);
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const rows = platform === 'trendyol' ? tyRows : hbRows;
  const setRows = platform === 'trendyol' ? setTyRows : setHbRows;

  const tyPending = tyRows.filter((q) => q.status === 'pending').length;
  const hbPending = hbRows.filter((q) => q.status === 'pending').length;
  const answeredToday = 12;
  const expiredCount =
    tyRows.filter((q) => q.status === 'expired').length +
    hbRows.filter((q) => q.status === 'expired').length;

  const showToast = (msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  const filtered = rows.filter((q) => {
    const matchSearch =
      !search ||
      q.product.toLowerCase().includes(search.toLowerCase()) ||
      q.question.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || q.status === filter;
    return matchSearch && matchFilter;
  });

  const openAnswerBox = (id: string) => {
    setOpenAnswer(id);
    setDraft('');
  };

  const insertTemplate = (text: string) => {
    setDraft((d) => d + text);
    // cursor metnin sonuna
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) {
        el.focus();
        el.selectionStart = el.selectionEnd = el.value.length;
      }
    });
  };

  const sendAnswer = (id: string) => {
    setRows((rs) =>
      rs.map((q) =>
        q.id === id
          ? {
              ...q,
              status: 'answered',
              answer: draft,
              answeredDate: 'Az önce',
              timeLabel: '✅ Cevaplandı',
              tone: 'green',
              pulse: false,
            }
          : q
      )
    );
    setOpenAnswer(null);
    setDraft('');
    showToast('✅ Soru cevaplandı');
  };

  const confirmReject = () => {
    if (!rejectTarget) return;
    setRows((rs) =>
      rs.map((q) =>
        q.id === rejectTarget.id
          ? { ...q, status: 'expired', timeLabel: '⛔ Reddedildi', tone: 'expired' }
          : q
      )
    );
    showToast('Soru reddedildi');
    setRejectTarget(null);
    setRejectReason(REJECT_REASONS[0]);
  };

  const TABS: { key: Platform; label: string; count: number }[] = [
    { key: 'trendyol', label: 'Trendyol', count: tyPending },
    { key: 'hepsiburada', label: 'Hepsiburada', count: hbPending },
  ];

  const FILTERS: { key: StatusFilter; label: string }[] = [
    { key: 'pending', label: 'Bekleyenler' },
    { key: 'answered', label: 'Cevaplananlar' },
    { key: 'expired', label: 'Süresi Dolan' },
    { key: 'all', label: 'Tümü' },
  ];

  const metrics = [
    { label: 'Bekleyen (TY)', value: tyPending, color: '#D63B3B' },
    { label: 'Bekleyen (HB)', value: hbPending, color: '#D63B3B' },
    { label: 'Bugün Cevaplanan', value: answeredToday, color: '#1A6B46' },
    { label: 'Süresi Dolan', value: expiredCount, color: '#D63B3B' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#F7F6F2' }}>
      <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } } @keyframes modalIn { from { opacity:0; transform: translateY(12px) scale(0.98);} to { opacity:1; transform: translateY(0) scale(1);} } @keyframes pulseDot { 0%{ box-shadow: 0 0 0 0 rgba(214,59,59,0.5);} 70%{ box-shadow: 0 0 0 6px rgba(214,59,59,0);} 100%{ box-shadow: 0 0 0 0 rgba(214,59,59,0);} }`}</style>
      <Sidebar />
      <TopBar title="Müşteri Soruları" />

      <main style={{ marginLeft: 240, flex: 1, padding: '88px 36px 32px' }}>
        <div style={{ marginBottom: 22 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1915' }}>Müşteri Soruları</h1>
          <p style={{ fontSize: 13, color: '#9E9B93', marginTop: 4 }}>
            Tüm platformlardaki müşteri sorularını tek ekrandan yönetin ve cevaplayın.
          </p>
        </div>

        {/* Metrik kartlar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          {metrics.map((m) => (
            <div key={m.label} style={{ background: '#fff', borderRadius: 14, padding: '18px 22px', boxShadow: '0 1px 8px rgba(26,25,21,0.06)', border: '1px solid rgba(26,25,21,0.08)' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: m.color, letterSpacing: '-1px' }}>{m.value}</div>
              <div style={{ fontSize: 13, color: '#9E9B93', marginTop: 4, fontWeight: 500 }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Platform sekmeleri */}
        <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid #E5E7EB', marginBottom: 20 }}>
          {TABS.map((t) => {
            const active = platform === t.key;
            return (
              <button
                key={t.key}
                onClick={() => {
                  setPlatform(t.key);
                  setOpenAnswer(null);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 0 12px', background: 'none', border: 'none', borderBottom: '2px solid ' + (active ? '#1A1915' : 'transparent'), cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: active ? 700 : 600, color: active ? '#1A1915' : '#9E9B93', marginBottom: -1 }}
              >
                <span style={{ width: 9, height: 9, borderRadius: 999, background: PLATFORM_DOT[t.key] }} />
                {t.label} ({t.count})
              </button>
            );
          })}
        </div>

        {/* Filtre satırı */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 360 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9E9B93', display: 'flex' }}>
              <Icon name="search" size={16} />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ürün adı veya soru ara..."
              style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: 9, border: '1px solid rgba(26,25,21,0.14)', fontSize: 13, fontFamily: 'inherit', background: '#fff', color: '#1A1915', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid ' + (active ? '#1A1915' : 'rgba(26,25,21,0.14)'), background: active ? '#1A1915' : '#fff', color: active ? '#fff' : '#5A574F', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Soru listesi */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 8px rgba(26,25,21,0.06)', border: '1px solid rgba(26,25,21,0.08)', overflow: 'hidden' }}>
          {filtered.length === 0 && (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: '#9E9B93', fontSize: 14 }}>
              Bu filtreye uygun soru yok.
            </div>
          )}
          {filtered.map((q, i) => {
            const answered = q.status === 'answered';
            const expired = q.status === 'expired';
            const toneStyle = TONE_STYLE[q.tone];
            return (
              <div
                key={q.id}
                style={{
                  padding: '18px 22px',
                  borderBottom: i < filtered.length - 1 ? '1px solid rgba(26,25,21,0.07)' : 'none',
                  background: answered ? '#F4FAF6' : expired ? '#FBF6F6' : '#fff',
                  opacity: expired ? 0.72 : 1,
                }}
              >
                {/* Üst satır */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1915' }}>{q.product}</div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: toneStyle.bg, color: toneStyle.color, fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                    {q.pulse && (
                      <span style={{ width: 7, height: 7, borderRadius: 999, background: '#D63B3B', animation: 'pulseDot 1.4s infinite' }} />
                    )}
                    {q.timeLabel}
                  </span>
                </div>

                {/* Soru metni */}
                <div style={{ fontSize: 13, color: '#5A574F', marginTop: 8, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {q.question}
                </div>

                {/* Cevaplandı gösterimi */}
                {answered && q.answer && (
                  <div style={{ marginTop: 10, padding: '10px 14px', background: '#EBF5EF', borderRadius: 10, borderLeft: '3px solid #1A6B46' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#1A6B46', marginBottom: 4 }}>
                      <Icon name="check-circle" size={12} /> Cevap gönderildi {q.answeredDate ? `· ${q.answeredDate}` : ''}
                    </div>
                    <div style={{ fontSize: 13, color: '#1A1915' }}>{q.answer}</div>
                  </div>
                )}

                {/* Alt satır */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: '#9E9B93' }}>
                    <span style={{ fontWeight: 600, color: '#5A574F' }}>{q.customer}</span>
                    <span>{q.date}</span>
                  </div>
                  {q.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => (openAnswer === q.id ? setOpenAnswer(null) : openAnswerBox(q.id))}
                        style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: '#1A1915', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        Cevapla
                      </button>
                      <button
                        onClick={() => setRejectTarget(q)}
                        style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid #D63B3B', background: '#fff', color: '#D63B3B', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        Reddet
                      </button>
                    </div>
                  )}
                </div>

                {/* Cevap accordion */}
                {openAnswer === q.id && (
                  <div style={{ marginTop: 14, padding: 16, background: '#FAF9F6', borderRadius: 12, border: '1px solid rgba(26,25,21,0.08)' }}>
                    <textarea
                      ref={textareaRef}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Müşteriye cevabınızı yazın..."
                      rows={3}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid rgba(26,25,21,0.16)', fontSize: 13, fontFamily: 'inherit', color: '#1A1915', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                    />
                    {/* Şablonlar */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                      {TEMPLATES.map((tpl) => (
                        <button
                          key={tpl.label}
                          onClick={() => insertTemplate(tpl.text)}
                          style={{ padding: '5px 11px', borderRadius: 999, border: '1px solid rgba(26,25,21,0.16)', background: '#fff', color: '#5A574F', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                          {tpl.label}
                        </button>
                      ))}
                    </div>
                    {/* Alt butonlar */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
                      <button
                        onClick={() => {
                          setOpenAnswer(null);
                          setDraft('');
                        }}
                        style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(26,25,21,0.14)', background: '#fff', color: '#5A574F', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        İptal
                      </button>
                      <button
                        onClick={() => sendAnswer(q.id)}
                        disabled={!draft.trim()}
                        style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: draft.trim() ? '#1A1915' : 'rgba(26,25,21,0.3)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: draft.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}
                      >
                        ✓ Cevabı Gönder
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Reddet modalı */}
      {rejectTarget && (
        <div
          onClick={() => setRejectTarget(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(26,25,21,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 16, padding: 24, width: 'min(420px,100%)', boxShadow: '0 12px 40px rgba(0,0,0,0.2)', animation: 'modalIn 0.18s ease' }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1915', marginBottom: 6 }}>Soruyu Reddet</h3>
            <p style={{ fontSize: 13, color: '#5A574F', marginBottom: 16 }}>
              Bu soruyu reddetmek istediğinize emin misiniz?
            </p>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#9E9B93', display: 'block', marginBottom: 6 }}>Sebep</label>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid rgba(26,25,21,0.16)', fontSize: 13, fontFamily: 'inherit', color: '#1A1915', background: '#fff', marginBottom: 20 }}
            >
              {REJECT_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                onClick={() => setRejectTarget(null)}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(26,25,21,0.14)', background: '#fff', color: '#5A574F', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                İptal
              </button>
              <button
                onClick={confirmReject}
                style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#D63B3B', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Reddet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 60 }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ background: '#1A1915', color: '#fff', padding: '12px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: '0 6px 20px rgba(0,0,0,0.25)', animation: 'slideIn 0.25s ease' }}>
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}
