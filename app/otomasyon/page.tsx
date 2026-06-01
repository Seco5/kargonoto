'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import Icon from '../components/Icon';

type Cond = { field: string; op: string; value: string };
interface Rule {
  id: number;
  name: string;
  active: boolean;
  conds: Cond[];
  carrier: string;
}

const CARRIERS: { name: string; color: string }[] = [
  { name: 'Sendeo', color: '#1A6B46' },
  { name: 'Aras Kargo', color: '#C94E1A' },
  { name: 'Yurtiçi Kargo', color: '#B45309' },
  { name: 'MNG Kargo', color: '#1A4B8C' },
  { name: 'HepsiJet', color: '#BE185D' },
  { name: 'PTT Kargo', color: '#16A34A' },
];
const carrierColor = (name: string) => CARRIERS.find(c => name.startsWith(c.name.split(' ')[0]))?.color ?? '#5A574F';

const FIELDS = ['Ağırlık (kg)', 'Şehir', 'Sipariş Tutarı (₺)', 'Platform', 'Desi'];
const OPS = ['>', '<', '=', 'içinde'];

const INITIAL: Rule[] = [
  { id: 1, name: 'Ağır Gönderi → Yurtiçi Kargo', active: true, conds: [{ field: 'Ağırlık (kg)', op: '>', value: '5' }], carrier: 'Yurtiçi Kargo' },
  { id: 2, name: 'İstanbul → HepsiJet Aynı Gün', active: true, conds: [{ field: 'Şehir', op: '=', value: 'İstanbul' }], carrier: 'HepsiJet' },
  { id: 3, name: 'Yüksek Değerli → MNG Sigortalı', active: true, conds: [{ field: 'Sipariş Tutarı (₺)', op: '>', value: '2000' }], carrier: 'MNG Kargo' },
  { id: 4, name: 'Trendyol Standart → Aras', active: false, conds: [{ field: 'Platform', op: '=', value: 'Trendyol' }, { field: 'Ağırlık (kg)', op: '<', value: '5' }], carrier: 'Aras Kargo' },
  { id: 5, name: 'Standart → Sendeo', active: true, conds: [{ field: 'Ağırlık (kg)', op: '<', value: '5' }], carrier: 'Sendeo' },
];

export default function OtomasyonPage() {
  const [rules, setRules] = useState<Rule[]>(INITIAL);
  const [editing, setEditing] = useState<Rule | null>(null);
  const [fallback, setFallback] = useState('Sendeo');
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);

  const showToast = (msg: string) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  };

  const activeCount = rules.filter(r => r.active).length;

  const toggle = (id: number) => setRules(rs => rs.map(r => r.id === id ? { ...r, active: !r.active } : r));
  const remove = (id: number) => {
    if (window.confirm('Bu kuralı silmek istediğinize emin misiniz?')) {
      setRules(rs => rs.filter(r => r.id !== id));
      showToast('Kural silindi');
    }
  };
  const move = (id: number, dir: -1 | 1) => {
    setRules(rs => {
      const i = rs.findIndex(r => r.id === id);
      const j = i + dir;
      if (j < 0 || j >= rs.length) return rs;
      const copy = [...rs];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  };

  const openNew = () => setEditing({ id: 0, name: '', active: true, conds: [{ field: FIELDS[0], op: OPS[0], value: '' }], carrier: CARRIERS[0].name });
  const saveRule = (rule: Rule) => {
    if (rule.id === 0) {
      setRules(rs => [...rs, { ...rule, id: Date.now() }]);
      showToast('Yeni kural eklendi ✓');
    } else {
      setRules(rs => rs.map(r => r.id === rule.id ? rule : r));
      showToast('Kural güncellendi ✓');
    }
    setEditing(null);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#F7F6F2' }}>
      <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
      <Sidebar />
      <TopBar title="Otomasyon Kuralları" />

      <main style={{ marginLeft: 240, flex: 1, padding: '88px 36px 32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1915' }}>Otomasyon Kuralları</h1>
            <p style={{ fontSize: 13, color: '#9E9B93', marginTop: 4, maxWidth: 520, lineHeight: 1.5 }}>
              Kurallar yukarıdan aşağıya sırayla değerlendirilir — eşleşen ilk kural uygulanır. Sürükleyerek veya oklarla önceliği değiştirin.
            </p>
          </div>
          <button onClick={openNew}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#1A1915', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Icon name="plus" size={16} /> Yeni Kural Ekle
          </button>
        </div>

        {/* Stat banner */}
        <div style={{ display: 'flex', gap: 24, background: '#1A1915', borderRadius: 16, padding: '18px 28px', marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { v: String(rules.length), l: 'Toplam Kural', c: '#fff' },
            { v: String(activeCount), l: 'Aktif', c: '#34D399' },
            { v: '284', l: 'Bugün Yönlendirildi', c: '#fff' },
            { v: '2.3 sn', l: 'Ort. Karar Süresi', c: '#34D399' },
          ].map(s => (
            <div key={s.l} style={{ paddingRight: 24, borderRight: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.c, letterSpacing: '-0.5px' }}>{s.v}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Rules list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rules.map((r, i) => (
            <div key={r.id} style={{
              background: '#fff', border: '1px solid rgba(26,25,21,0.08)', borderRadius: 14, padding: '16px 18px',
              boxShadow: '0 1px 8px rgba(26,25,21,0.05)', display: 'flex', alignItems: 'center', gap: 16,
              opacity: r.active ? 1 : 0.6,
            }}>
              {/* Priority + reorder */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <button onClick={() => move(r.id, -1)} disabled={i === 0} style={{ border: 'none', background: 'none', cursor: i === 0 ? 'default' : 'pointer', color: i === 0 ? '#D4D2CC' : '#9E9B93', padding: 0, fontSize: 11, lineHeight: 1 }}>▲</button>
                  <button onClick={() => move(r.id, 1)} disabled={i === rules.length - 1} style={{ border: 'none', background: 'none', cursor: i === rules.length - 1 ? 'default' : 'pointer', color: i === rules.length - 1 ? '#D4D2CC' : '#9E9B93', padding: 0, fontSize: 11, lineHeight: 1 }}>▼</button>
                </div>
                <span style={{ width: 26, height: 26, borderRadius: 8, background: '#F0EFEB', color: '#5A574F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{i + 1}</span>
              </div>

              {/* Rule body */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1915', marginBottom: 8 }}>{r.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#9E9B93' }}>EĞER</span>
                  {r.conds.map((c, ci) => (
                    <span key={ci} style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}>
                      {ci > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: '#9E9B93' }}>VE</span>}
                      <span style={{ background: '#F7F6F2', border: '1px solid #E5E7EB', borderRadius: 7, padding: '3px 9px', fontSize: 12, color: '#1A1915', fontWeight: 500 }}>
                        {c.field} {c.op} <b>{c.value}</b>
                      </span>
                    </span>
                  ))}
                  <Icon name="arrow-right" size={15} color="#9E9B93" strokeWidth={2} />
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: carrierColor(r.carrier) + '1A', color: carrierColor(r.carrier), borderRadius: 7, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>
                    <Icon name="shipping" size={13} /> {r.carrier}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button onClick={() => toggle(r.id)} title={r.active ? 'Aktif' : 'Pasif'}
                  style={{ width: 42, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer', background: r.active ? '#1A6B46' : '#D4D2CC', position: 'relative', transition: 'background 0.15s' }}>
                  <span style={{ position: 'absolute', top: 3, left: r.active ? 21 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.15s' }} />
                </button>
                <button onClick={() => setEditing(r)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(26,25,21,0.12)', background: '#fff', cursor: 'pointer', color: '#5A574F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="edit" size={15} /></button>
                <button onClick={() => remove(r.id)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(214,59,59,0.25)', background: '#fff', cursor: 'pointer', color: '#D63B3B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="trash" size={15} /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Fallback rule — configurable */}
        <div style={{ marginTop: 16, padding: '16px 18px', background: '#EBF5EF', border: '1px dashed rgba(26,107,70,0.4)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(26,107,70,0.12)', color: '#1A6B46', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="bulb" size={17} />
          </span>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1A6B46' }}>Varsayılan Kural</div>
            <div style={{ fontSize: 12, color: '#1A6B46', opacity: 0.8, marginTop: 2 }}>Yukarıdaki hiçbir kurala uymayan siparişler bu firma ile gönderilir.</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="arrow-right" size={16} color="#1A6B46" strokeWidth={2} />
            <select
              value={fallback}
              onChange={e => { setFallback(e.target.value); showToast('Varsayılan firma güncellendi ✓'); }}
              style={{ fontSize: 13, fontWeight: 700, padding: '9px 12px', borderRadius: 9, border: '1px solid rgba(26,107,70,0.4)', background: '#fff', color: carrierColor(fallback), fontFamily: 'inherit', cursor: 'pointer' }}
            >
              {CARRIERS.map(c => <option key={c.name} style={{ color: '#1A1915' }}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </main>

      {editing && <RuleEditor rule={editing} onClose={() => setEditing(null)} onSave={saveRule} />}

      {/* Toasts */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 100 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ background: '#EBF5EF', color: '#1A6B46', border: '1px solid rgba(26,107,70,0.25)', borderRadius: 10, padding: '12px 18px', fontSize: 13, fontWeight: 600, boxShadow: '0 6px 24px rgba(0,0,0,0.12)' }}>{t.msg}</div>
        ))}
      </div>
    </div>
  );
}

function RuleEditor({ rule, onClose, onSave }: { rule: Rule; onClose: () => void; onSave: (r: Rule) => void }) {
  const [draft, setDraft] = useState<Rule>(rule);
  const isNew = rule.id === 0;

  const setCond = (i: number, patch: Partial<Cond>) =>
    setDraft(d => ({ ...d, conds: d.conds.map((c, ci) => ci === i ? { ...c, ...patch } : c) }));
  const addCond = () => setDraft(d => ({ ...d, conds: [...d.conds, { field: FIELDS[0], op: OPS[0], value: '' }] }));
  const removeCond = (i: number) => setDraft(d => ({ ...d, conds: d.conds.filter((_, ci) => ci !== i) }));

  const valid = draft.name.trim() && draft.conds.every(c => c.value.trim());

  const sel: React.CSSProperties = { fontSize: 13, padding: '8px 10px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', color: '#1A1915', fontFamily: 'inherit', cursor: 'pointer' };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 40 }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 460, background: '#fff', boxShadow: '-8px 0 32px rgba(0,0,0,0.16)', zIndex: 50, overflowY: 'auto', animation: 'slideIn 0.22s ease', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ padding: '22px 26px', borderBottom: '1px solid rgba(26,25,21,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1915' }}>{isNew ? 'Yeni Kural' : 'Kuralı Düzenle'}</div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(26,25,21,0.12)', background: '#fff', cursor: 'pointer', color: '#5A574F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="x" size={16} /></button>
        </div>

        <div style={{ padding: 26 }}>
          {/* Name */}
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5A574F', marginBottom: 6 }}>Kural Adı</label>
          <input value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} placeholder="Örn. Ağır Gönderi → Yurtiçi"
            style={{ width: '100%', fontSize: 13, padding: '10px 12px', borderRadius: 9, border: '1px solid #E5E7EB', fontFamily: 'inherit', color: '#1A1915', marginBottom: 24 }} />

          {/* Conditions */}
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9E9B93', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Koşullar (EĞER)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {draft.conds.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <select value={c.field} onChange={e => setCond(i, { field: e.target.value })} style={{ ...sel, flex: 1 }}>
                  {FIELDS.map(f => <option key={f}>{f}</option>)}
                </select>
                <select value={c.op} onChange={e => setCond(i, { op: e.target.value })} style={{ ...sel, width: 70 }}>
                  {OPS.map(o => <option key={o}>{o}</option>)}
                </select>
                <input value={c.value} onChange={e => setCond(i, { value: e.target.value })} placeholder="değer"
                  style={{ width: 90, fontSize: 13, padding: '8px 10px', borderRadius: 8, border: '1px solid #E5E7EB', fontFamily: 'inherit', color: '#1A1915' }} />
                {draft.conds.length > 1 && (
                  <button onClick={() => removeCond(i)} style={{ width: 32, height: 34, borderRadius: 8, border: '1px solid rgba(214,59,59,0.25)', background: '#fff', cursor: 'pointer', color: '#D63B3B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="x" size={14} /></button>
                )}
              </div>
            ))}
          </div>
          <button onClick={addCond} style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#1A6B46', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
            <Icon name="plus" size={14} /> Koşul Ekle
          </button>

          {/* Action */}
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9E9B93', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '24px 0 12px' }}>Aksiyon (GÖNDER)</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="arrow-right" size={18} color="#9E9B93" strokeWidth={2} />
            <select value={draft.carrier} onChange={e => setDraft(d => ({ ...d, carrier: e.target.value }))} style={{ ...sel, flex: 1, padding: '10px 12px' }}>
              {CARRIERS.map(c => <option key={c.name}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div style={{ padding: '0 26px 26px', display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff', color: '#1A1915', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>İptal</button>
          <button onClick={() => onSave(draft)} disabled={!valid}
            style={{ flex: 2, padding: 12, borderRadius: 10, border: 'none', background: valid ? '#1A1915' : 'rgba(26,25,21,0.12)', color: valid ? '#fff' : '#9E9B93', fontSize: 14, fontWeight: 700, cursor: valid ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
            {isNew ? 'Kuralı Oluştur' : 'Kaydet'}
          </button>
        </div>
      </div>
    </>
  );
}
