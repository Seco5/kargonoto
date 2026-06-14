'use client';

import { useReducer, useEffect, useRef, useState, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import Icon, { IconName } from '../components/Icon';
import BarcodeCanvas, {
  ElementType, LabelSize, CanvasElement, SIZES, TEXT_TYPES, LINE_TYPES, DEFAULT_TEXT, ElementContent,
} from '../components/BarcodeCanvas';

// ─── Types ──────────────────────────────────────────────────────────────────
interface State {
  elements: CanvasElement[];
  selectedId: string | null;
  labelSize: LabelSize;
  zoom: number;
  showGrid: boolean;
  history: CanvasElement[][];
}

type Action =
  | { t: 'ADD'; el: CanvasElement }
  | { t: 'UPDATE'; id: string; patch: Partial<CanvasElement> }
  | { t: 'COMMIT' }
  | { t: 'DELETE'; id: string }
  | { t: 'SELECT'; id: string | null }
  | { t: 'LOAD'; elements: CanvasElement[] }
  | { t: 'SIZE'; size: LabelSize }
  | { t: 'GRID' }
  | { t: 'ZOOM'; zoom: number }
  | { t: 'REORDER'; dir: 'front' | 'back' }
  | { t: 'DUPLICATE'; id: string }
  | { t: 'NUDGE'; dx: number; dy: number }
  | { t: 'UNDO' };

// ─── Field definitions (left panel) ─────────────────────────────────────────
const FIELD_GROUPS: { group: string; items: { type: ElementType; label: string; icon: IconName }[] }[] = [
  { group: 'Sipariş Bilgileri', items: [
    { type: 'siparis-no', label: 'Sipariş No', icon: 'orders' },
    { type: 'urun-adi', label: 'Ürün Adı (Kısa)', icon: 'stock' },
    { type: 'paket-sirasi', label: 'Paket Sırası', icon: 'grid' },
    { type: 'desi-kg', label: 'Desi / KG', icon: 'calculator' },
    { type: 'odeme-tipi', label: 'Ödeme Tipi', icon: 'card' },
  ]},
  { group: 'Alıcı Bilgileri', items: [
    { type: 'alici-adi', label: 'Alıcı Adı', icon: 'orders' },
    { type: 'alici-telefon', label: 'Alıcı Telefon', icon: 'phone' },
    { type: 'alici-adres', label: 'Alıcı Adresi', icon: 'home' },
    { type: 'sehir-ilce', label: 'Şehir / İlçe', icon: 'store' },
    { type: 'varis-noktasi', label: 'Varış Noktası', icon: 'shipping' },
  ]},
  { group: 'Firma Bilgileri', items: [
    { type: 'firma-adi', label: 'Firma Adı', icon: 'store' },
    { type: 'firma-logo', label: 'Firma Logosu', icon: 'image' },
    { type: 'tarih', label: 'Tarih', icon: 'clock' },
    { type: 'kategori-kodu', label: 'Kategori Kodu', icon: 'grid' },
  ]},
  { group: 'Kargo', items: [
    { type: 'ana-barkod', label: 'Ana Barkod', icon: 'barcode' },
    { type: 'qr-kod', label: 'QR Kod', icon: 'qrcode' },
    { type: 'takip-no', label: 'Takip No', icon: 'search' },
  ]},
  { group: 'Serbest', items: [
    { type: 'ozel-metin', label: 'Özel Metin', icon: 'edit' },
    { type: 'yatay-cizgi', label: 'Yatay Çizgi', icon: 'grip' },
    { type: 'dikey-cizgi', label: 'Dikey Çizgi', icon: 'grip' },
    { type: 'koyu-alan', label: 'Koyu Alan', icon: 'stock' },
  ]},
];

const LABELS: Record<ElementType, string> = {
  'siparis-no':'Sipariş No','urun-adi':'Ürün Adı','paket-sirasi':'Paket Sırası','desi-kg':'Desi / KG','odeme-tipi':'Ödeme Tipi',
  'alici-adi':'Alıcı Adı','alici-telefon':'Alıcı Telefon','alici-adres':'Alıcı Adresi','sehir-ilce':'Şehir / İlçe','varis-noktasi':'Varış Noktası',
  'firma-adi':'Firma Adı','firma-logo':'Firma Logosu','tarih':'Tarih','kategori-kodu':'Kategori Kodu',
  'ana-barkod':'Ana Barkod','qr-kod':'QR Kod','takip-no':'Takip No',
  'ozel-metin':'Özel Metin','yatay-cizgi':'Yatay Çizgi','dikey-cizgi':'Dikey Çizgi','koyu-alan':'Koyu Alan',
};

// default sizing when dropped fresh
function freshElement(type: ElementType, x: number, y: number): CanvasElement {
  const id = `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const base: CanvasElement = { id, type, x, y, width: 120, height: 24, zIndex: 1, color: '#000000', textAlign: 'left', fontWeight: 'normal', fontSize: 12 };
  if (LINE_TYPES.includes(type)) {
    if (type === 'yatay-cizgi') return { ...base, width: 120, height: 2, bgColor: '#000000' };
    if (type === 'dikey-cizgi') return { ...base, width: 2, height: 80, bgColor: '#000000' };
    return { ...base, width: 80, height: 40, bgColor: '#000000' }; // koyu-alan
  }
  if (type === 'ana-barkod') return { ...base, width: 160, height: 50 };
  if (type === 'qr-kod') return { ...base, width: 60, height: 60 };
  if (type === 'firma-logo') return { ...base, width: 70, height: 40 };
  if (type === 'kategori-kodu') return { ...base, width: 50, height: 60, fontSize: 32, fontWeight: 'bold', bgColor: '#000000', color: '#ffffff', textAlign: 'center', content: 'C24' };
  if (type === 'varis-noktasi') return { ...base, width: 200, height: 30, fontSize: 20, fontWeight: 'bold', content: DEFAULT_TEXT[type] };
  return { ...base, content: DEFAULT_TEXT[type], fontSize: 12 };
}

// ─── Default template (görseldeki etiket) ───────────────────────────────────
function defaultTemplate(): CanvasElement[] {
  const mk = (type: ElementType, p: Partial<CanvasElement>): CanvasElement => ({
    ...freshElement(type, p.x ?? 0, p.y ?? 0), ...p, id: `${type}-${Math.random().toString(36).slice(2, 8)}`,
  });
  return [
    mk('ana-barkod', { x: 300, y: 10, width: 60, height: 200, rotate: 90 }),
    mk('siparis-no', { x: 300, y: 8, width: 70, height: 16, fontSize: 9, fontWeight: 'bold' }),
    mk('takip-no', { x: 300, y: 220, width: 70, height: 14, fontSize: 8 }),
    mk('firma-adi', { x: 120, y: 10, width: 170, height: 16, fontSize: 10, fontWeight: 'bold' }),
    mk('alici-adi', { x: 120, y: 32, width: 170, height: 20, fontSize: 14, fontWeight: 'bold' }),
    mk('alici-adres', { x: 120, y: 56, width: 170, height: 50, fontSize: 9 }),
    mk('tarih', { x: 120, y: 110, width: 100, height: 12, fontSize: 8 }),
    mk('odeme-tipi', { x: 120, y: 124, width: 100, height: 12, fontSize: 8 }),
    mk('qr-kod', { x: 220, y: 100, width: 60, height: 60 }),
    mk('kategori-kodu', { x: 8, y: 140, width: 50, height: 70, fontSize: 32, fontWeight: 'bold', bgColor: '#000000', color: '#ffffff', textAlign: 'center', content: 'C24' }),
    mk('paket-sirasi', { x: 62, y: 170, width: 60, height: 24, fontSize: 18, fontWeight: 'bold' }),
    mk('desi-kg', { x: 62, y: 196, width: 60, height: 14, fontSize: 10 }),
    mk('yatay-cizgi', { x: 0, y: 240, width: 290, height: 2, bgColor: '#000000' }),
    mk('varis-noktasi', { x: 8, y: 248, width: 280, height: 30, fontSize: 20, fontWeight: 'bold' }),
    mk('urun-adi', { x: 8, y: 10, width: 110, height: 120, fontSize: 9, rotate: 90 }),
  ];
}

// ─── Reducer ─────────────────────────────────────────────────────────────────
const HISTORYABLE: Action['t'][] = ['ADD', 'DELETE', 'LOAD', 'REORDER', 'DUPLICATE', 'COMMIT'];
const snap = (h: CanvasElement[][], els: CanvasElement[]) => [...h, els.map(e => ({ ...e }))].slice(-20);

function reducer(state: State, a: Action): State {
  const pushHist = HISTORYABLE.includes(a.t) ? snap(state.history, state.elements) : state.history;
  switch (a.t) {
    case 'ADD': return { ...state, elements: [...state.elements, a.el], selectedId: a.el.id, history: pushHist };
    case 'UPDATE': return { ...state, elements: state.elements.map(e => e.id === a.id ? { ...e, ...a.patch } : e) };
    case 'COMMIT': return { ...state, history: pushHist };
    case 'DELETE': return { ...state, elements: state.elements.filter(e => e.id !== a.id), selectedId: null, history: pushHist };
    case 'SELECT': return { ...state, selectedId: a.id };
    case 'LOAD': return { ...state, elements: a.elements.map(e => ({ ...e })), selectedId: null, history: pushHist };
    case 'SIZE': return { ...state, labelSize: a.size };
    case 'GRID': return { ...state, showGrid: !state.showGrid };
    case 'ZOOM': return { ...state, zoom: a.zoom };
    case 'NUDGE': return state.selectedId ? { ...state, elements: state.elements.map(e => e.id === state.selectedId ? { ...e, x: e.x + a.dx, y: e.y + a.dy } : e) } : state;
    case 'DUPLICATE': {
      const src = state.elements.find(e => e.id === a.id); if (!src) return state;
      const copy = { ...src, id: `${src.type}-${Date.now()}`, x: src.x + 12, y: src.y + 12 };
      return { ...state, elements: [...state.elements, copy], selectedId: copy.id, history: pushHist };
    }
    case 'REORDER': {
      if (!state.selectedId) return state;
      const maxZ = Math.max(0, ...state.elements.map(e => e.zIndex || 1));
      const minZ = Math.min(0, ...state.elements.map(e => e.zIndex || 1));
      return { ...state, elements: state.elements.map(e => e.id === state.selectedId ? { ...e, zIndex: a.dir === 'front' ? maxZ + 1 : minZ - 1 } : e), history: pushHist };
    }
    case 'UNDO': {
      if (state.history.length === 0) return state;
      const prev = state.history[state.history.length - 1];
      return { ...state, elements: prev, history: state.history.slice(0, -1), selectedId: null };
    }
    default: return state;
  }
}

// ─── Property panel helpers ─────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#9E9B93', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}
const numInput: React.CSSProperties = { width: '100%', fontSize: 13, padding: '7px 8px', borderRadius: 7, border: '1px solid #E5E7EB', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };

function Toggle({ options, value, onChange }: { options: { v: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {options.map(o => (
        <button key={o.v} onClick={() => onChange(o.v)}
          style={{ flex: 1, padding: '6px 4px', borderRadius: 7, border: '1px solid', borderColor: value === o.v ? '#1A1915' : '#E5E7EB', background: value === o.v ? '#1A1915' : '#fff', color: value === o.v ? '#fff' : '#5A574F', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function BarkodTasarimPage() {
  const [state, dispatch] = useReducer(reducer, {
    elements: [], selectedId: null, labelSize: '100x150', zoom: 1, showGrid: true, history: [],
  });
  const { elements, selectedId, labelSize, zoom, showGrid } = state;
  const selected = elements.find(e => e.id === selectedId) || null;
  const size = SIZES[labelSize];

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ mode: 'move' | 'resize'; corner?: string; id: string; sx: number; sy: number; ox: number; oy: number; ow: number; oh: number } | null>(null);
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);
  const [showSave, setShowSave] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [tplName, setTplName] = useState('');
  const [templates, setTemplates] = useState<{ name: string; elements: CanvasElement[]; labelSize?: LabelSize }[]>([]);
  const [tplMenu, setTplMenu] = useState(false);

  const toast = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2800);
  }, []);

  // load templates from localStorage
  useEffect(() => {
    try { const raw = localStorage.getItem('kargonoto_templates'); if (raw) setTemplates(JSON.parse(raw)); } catch {}
  }, []);

  const fontFamily = "'Plus Jakarta Sans', sans-serif";

  // ── drag / resize via window listeners ──
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current; if (!d) return;
      const dx = (e.clientX - d.sx) / zoom;
      const dy = (e.clientY - d.sy) / zoom;
      const sn = (n: number) => Math.round(n / 5) * 5; // snap 5px
      if (d.mode === 'move') {
        dispatch({ t: 'UPDATE', id: d.id, patch: { x: sn(d.ox + dx), y: sn(d.oy + dy) } });
      } else {
        const patch: Partial<CanvasElement> = {};
        const right = d.corner?.includes('r'), bottom = d.corner?.includes('b');
        if (right) patch.width = Math.max(8, sn(d.ow + dx)); else { patch.width = Math.max(8, sn(d.ow - dx)); patch.x = sn(d.ox + dx); }
        if (bottom) patch.height = Math.max(8, sn(d.oh + dy)); else { patch.height = Math.max(8, sn(d.oh - dy)); patch.y = sn(d.oy + dy); }
        dispatch({ t: 'UPDATE', id: d.id, patch });
      }
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [zoom]);

  // ── keyboard shortcuts ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === 'z') { e.preventDefault(); dispatch({ t: 'UNDO' }); return; }
      if (meta && e.key.toLowerCase() === 'd') { e.preventDefault(); if (selectedId) dispatch({ t: 'DUPLICATE', id: selectedId }); return; }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) { e.preventDefault(); dispatch({ t: 'DELETE', id: selectedId }); return; }
      if (e.key === 'Escape') { dispatch({ t: 'SELECT', id: null }); return; }
      const step = e.shiftKey ? 10 : 1;
      if (selectedId && e.key.startsWith('Arrow')) {
        e.preventDefault();
        if (e.key === 'ArrowUp') dispatch({ t: 'NUDGE', dx: 0, dy: -step });
        if (e.key === 'ArrowDown') dispatch({ t: 'NUDGE', dx: 0, dy: step });
        if (e.key === 'ArrowLeft') dispatch({ t: 'NUDGE', dx: -step, dy: 0 });
        if (e.key === 'ArrowRight') dispatch({ t: 'NUDGE', dx: step, dy: 0 });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId]);

  const startMove = (e: React.MouseEvent, el: CanvasElement) => {
    e.stopPropagation();
    dispatch({ t: 'SELECT', id: el.id });
    dispatch({ t: 'COMMIT' });
    dragRef.current = { mode: 'move', id: el.id, sx: e.clientX, sy: e.clientY, ox: el.x, oy: el.y, ow: el.width, oh: el.height };
  };
  const startResize = (e: React.MouseEvent, el: CanvasElement, corner: string) => {
    e.stopPropagation();
    dispatch({ t: 'COMMIT' });
    dragRef.current = { mode: 'resize', corner, id: el.id, sx: e.clientX, sy: e.clientY, ox: el.x, oy: el.y, ow: el.width, oh: el.height };
  };

  const onCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('type') as ElementType;
    if (!type) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / zoom) / 5) * 5;
    const y = Math.round(((e.clientY - rect.top) / zoom) / 5) * 5;
    dispatch({ t: 'ADD', el: freshElement(type, Math.max(0, x), Math.max(0, y)) });
  };

  const persist = (els: CanvasElement[], ls: LabelSize, name: string) => {
    try {
      localStorage.setItem('kargonoto_active_template', JSON.stringify({ name, elements: els, labelSize: ls, savedAt: new Date().toISOString() }));
    } catch {}
  };

  const saveTemplate = () => {
    const name = tplName.trim() || 'Şablonum';
    const next = [...templates.filter(t => t.name !== name), { name, elements, labelSize }];
    setTemplates(next);
    try { localStorage.setItem('kargonoto_templates', JSON.stringify(next)); } catch {}
    persist(elements, labelSize, name);   // son kaydedilen her zaman aktif
    setShowSave(false); setTplName('');
    toast('Şablon kaydedildi');
  };

  const makeDefault = (t: { name: string; elements: CanvasElement[]; labelSize?: LabelSize }) => {
    persist(t.elements, t.labelSize || labelSize, t.name);
    toast('Varsayılan şablon güncellendi');
  };

  const upd = (patch: Partial<CanvasElement>) => { if (selectedId) dispatch({ t: 'UPDATE', id: selectedId, patch }); };

  // toolbar button styles
  const tbBtn = (active: boolean, primary = false): React.CSSProperties => ({
    padding: '7px 12px', borderRadius: 8, border: primary ? 'none' : '1px solid #E5E7EB',
    background: active ? '#1A1915' : primary ? '#1A1915' : '#fff', color: active || primary ? '#fff' : '#5A574F',
    fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily, display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
  });

  const isText = selected && TEXT_TYPES.includes(selected.type);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily, background: '#F7F6F2' }}>
      <style>{`
        @keyframes slideDown { from { opacity:0; transform: translateY(-8px) } to { opacity:1; transform: translateY(0) } }
        @keyframes modalIn { from { opacity:0; transform: scale(0.96) } to { opacity:1; transform: scale(1) } }
        @media print { body * { visibility: hidden; } .print-label, .print-label * { visibility: visible; } .print-label { position: fixed; left: 0; top: 0; } }
      `}</style>
      <Sidebar />
      <TopBar title="Barkod Tasarımı" />

      <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', paddingTop: 56, boxSizing: 'border-box' }}>
        {/* ── Toolbar ─────────────────────────────────────────────── */}
        <div style={{ height: 52, background: '#fff', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14, color: '#1A1915' }}>
            <Icon name="palette" size={18} color="#1A6B46" /> Barkod Tasarım Editörü
          </div>
          <div style={{ display: 'flex', gap: 6, marginLeft: 24 }}>
            {(Object.keys(SIZES) as LabelSize[]).map(s => (
              <button key={s} onClick={() => dispatch({ t: 'SIZE', size: s })} style={tbBtn(labelSize === s)}>{SIZES[s].label}</button>
            ))}
          </div>
          {templates.length > 0 && (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setTplMenu(v => !v)} style={tbBtn(tplMenu)}><Icon name="folder" size={15} /> Şablon Seç <Icon name="chevron-down" size={13} /></button>
              {tplMenu && (
                <>
                  <div onClick={() => setTplMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                  <div style={{ position: 'absolute', top: 44, left: 0, width: 260, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, boxShadow: '0 8px 28px rgba(0,0,0,0.12)', zIndex: 50, padding: 6 }}>
                    <div onClick={() => { dispatch({ t: 'LOAD', elements: defaultTemplate() }); setTplMenu(false); }} style={{ padding: '8px 10px', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#1A1915', display: 'flex', alignItems: 'center', gap: 7 }}><Icon name="refresh" size={14} color="#6B7280" /> Varsayılan Tasarım</div>
                    {templates.map(t => (
                      <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 7 }}>
                        <button onClick={() => { dispatch({ t: 'LOAD', elements: t.elements }); if (t.labelSize) dispatch({ t: 'SIZE', size: t.labelSize }); setTplMenu(false); }}
                          style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontFamily, fontSize: 13, fontWeight: 600, color: '#1A1915' }}>{t.name}</button>
                        <button title="Varsayılan Yap" onClick={() => makeDefault(t)} style={{ background: '#EBF5EF', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#1A6B46', fontFamily }}>Varsayılan Yap</button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button onClick={() => { dispatch({ t: 'LOAD', elements: defaultTemplate() }); toast('Varsayılan tasarım yüklendi'); }} style={tbBtn(false)}><Icon name="refresh" size={15} /> Varsayılanı Yükle</button>
            <button onClick={() => setShowSave(true)} style={tbBtn(false)}><Icon name="save" size={15} /> Şablon Kaydet</button>
            <button onClick={() => setShowPrint(true)} style={tbBtn(false, true)}><Icon name="printer" size={15} /> Test Yazdır</button>
          </div>
        </div>

        {/* ── 3-column body ───────────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* LEFT panel */}
          <div style={{ width: 220, background: '#F7F6F2', borderRight: '1px solid #E5E7EB', overflowY: 'auto', padding: 12, flexShrink: 0 }}>
            {FIELD_GROUPS.map(g => (
              <div key={g.group} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#9E9B93', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{g.group}</div>
                {g.items.map(item => (
                  <div key={item.type} draggable
                    onDragStart={e => e.dataTransfer.setData('type', item.type)}
                    onDoubleClick={() => dispatch({ t: 'ADD', el: freshElement(item.type, 20, 20) })}
                    style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 10px', fontSize: 12, fontWeight: 500, color: '#1A1915', display: 'flex', alignItems: 'center', gap: 7, cursor: 'grab', marginBottom: 6 }}>
                    <Icon name={item.icon} size={14} color="#6B7280" /> {item.label}
                  </div>
                ))}
              </div>
            ))}
            <div style={{ fontSize: 11, color: '#9E9B93', marginTop: 4, lineHeight: 1.4 }}>Alanları canvas&apos;a sürükleyin (veya çift tıklayın)</div>
          </div>

          {/* CENTER canvas */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* canvas mini toolbar */}
            <div style={{ height: 40, background: '#fff', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', flexShrink: 0 }}>
              <button onClick={() => dispatch({ t: 'ZOOM', zoom: Math.min(1.5, +(zoom + 0.25).toFixed(2)) })} style={{ ...tbBtn(false), padding: '4px 8px' }}><Icon name="plus" size={14} /></button>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#5A574F', width: 44, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
              <button onClick={() => dispatch({ t: 'ZOOM', zoom: Math.max(0.5, +(zoom - 0.25).toFixed(2)) })} style={{ ...tbBtn(false), padding: '4px 8px' }}><Icon name="x" size={14} /></button>
              <button onClick={() => dispatch({ t: 'GRID' })} style={{ ...tbBtn(showGrid), padding: '4px 10px' }}><Icon name="grid" size={14} /> Grid</button>
              <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9E9B93' }}>{elements.length} eleman · {size.label}</span>
            </div>

            <div style={{ flex: 1, background: '#E8E5DF', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', padding: 32 }}>
              <div
                ref={canvasRef}
                onMouseDown={() => dispatch({ t: 'SELECT', id: null })}
                onDragOver={e => e.preventDefault()}
                onDrop={onCanvasDrop}
                style={{
                  position: 'relative', width: size.w, height: size.h, background: '#fff',
                  border: '2px solid #D1D5DB', boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                  transform: `scale(${zoom})`, transformOrigin: 'center', flexShrink: 0,
                  backgroundImage: showGrid ? 'radial-gradient(#0000001a 1px, transparent 1px)' : 'none',
                  backgroundSize: showGrid ? '19px 19px' : 'auto',
                }}>
                {elements.map(el => {
                  const sel = el.id === selectedId;
                  return (
                    <div key={el.id}
                      onMouseDown={e => startMove(e, el)}
                      style={{
                        position: 'absolute', left: el.x, top: el.y, width: el.width, height: el.height,
                        transform: el.rotate ? `rotate(${el.rotate}deg)` : undefined, transformOrigin: 'top left',
                        background: el.bgColor || 'transparent',
                        border: el.borderWidth ? `${el.borderWidth}px solid ${el.borderColor || '#000'}` : 'none',
                        cursor: 'move', userSelect: 'none', zIndex: el.zIndex || 1,
                        outline: sel ? '2px solid #1A6B46' : 'none', outlineOffset: 2, boxSizing: 'border-box',
                      }}>
                      <ElementContent el={el} />
                      {sel && ['tl', 'tr', 'bl', 'br'].map(c => (
                        <div key={c} onMouseDown={e => startResize(e, el, c)}
                          style={{
                            position: 'absolute', width: 8, height: 8, background: '#fff', border: '1.5px solid #1A6B46', borderRadius: 2,
                            top: c[0] === 't' ? -5 : undefined, bottom: c[0] === 'b' ? -5 : undefined,
                            left: c[1] === 'l' ? -5 : undefined, right: c[1] === 'r' ? -5 : undefined,
                            cursor: c === 'tl' || c === 'br' ? 'nwse-resize' : 'nesw-resize',
                          }} />
                      ))}
                    </div>
                  );
                })}
                {elements.length === 0 && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 13, textAlign: 'center', padding: 20 }}>
                    Soldan alan sürükleyin veya<br />&quot;Varsayılanı Yükle&quot; deneyin
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT panel */}
          <div style={{ width: 240, background: '#fff', borderLeft: '1px solid #E5E7EB', overflowY: 'auto', padding: 16, flexShrink: 0 }}>
            {!selected ? (
              <div style={{ color: '#9E9B93', fontSize: 13, textAlign: 'center', marginTop: 40 }}>Bir eleman seçin</div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1915' }}>{LABELS[selected.type]}</span>
                  <button onClick={() => dispatch({ t: 'DELETE', id: selected.id })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', display: 'flex' }}><Icon name="trash" size={17} /></button>
                </div>

                <Section title="Boyut & Konum">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {([['X', 'x'], ['Y', 'y'], ['G', 'width'], ['Y', 'height']] as const).map(([lbl, key], i) => (
                      <label key={i} style={{ fontSize: 12, color: '#5A574F' }}>{lbl}
                        <input type="number" value={Math.round(selected[key] as number)} onChange={e => upd({ [key]: Number(e.target.value) })} style={{ ...numInput, marginTop: 3 }} />
                      </label>
                    ))}
                  </div>
                </Section>

                {isText && (
                  <Section title="Tipografi">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <input type="range" min={8} max={48} value={selected.fontSize || 12} onChange={e => upd({ fontSize: Number(e.target.value) })} style={{ flex: 1, accentColor: '#1A6B46' }} />
                      <input type="number" value={selected.fontSize || 12} onChange={e => upd({ fontSize: Number(e.target.value) })} style={{ ...numInput, width: 52 }} />
                    </div>
                    <div style={{ marginBottom: 8 }}><Toggle options={[{ v: 'normal', label: 'Normal' }, { v: 'bold', label: 'Kalın' }]} value={selected.fontWeight || 'normal'} onChange={v => upd({ fontWeight: v as 'normal' | 'bold' })} /></div>
                    <div style={{ marginBottom: 8 }}><Toggle options={[{ v: 'left', label: 'Sol' }, { v: 'center', label: 'Orta' }, { v: 'right', label: 'Sağ' }]} value={selected.textAlign || 'left'} onChange={v => upd({ textAlign: v as 'left' | 'center' | 'right' })} /></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <input type="color" value={selected.color || '#000000'} onChange={e => upd({ color: e.target.value })} style={{ width: 34, height: 30, border: '1px solid #E5E7EB', borderRadius: 6, cursor: 'pointer', padding: 0 }} />
                      <input value={selected.color || '#000000'} onChange={e => upd({ color: e.target.value })} style={numInput} />
                    </div>
                    <Toggle options={[{ v: 'off', label: 'AA Kapalı' }, { v: 'on', label: 'AA Açık' }]} value={selected.uppercase ? 'on' : 'off'} onChange={v => upd({ uppercase: v === 'on' })} />
                  </Section>
                )}

                <Section title="Arka Plan">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <input type="color" value={selected.bgColor || '#ffffff'} onChange={e => upd({ bgColor: e.target.value })} style={{ width: 34, height: 30, border: '1px solid #E5E7EB', borderRadius: 6, cursor: 'pointer', padding: 0 }} />
                    <input value={selected.bgColor || ''} placeholder="şeffaf" onChange={e => upd({ bgColor: e.target.value })} style={numInput} />
                  </div>
                  <button onClick={() => upd({ bgColor: undefined })} style={{ ...numInput, cursor: 'pointer', background: '#F7F6F2', fontWeight: 600, color: '#5A574F' }}>Şeffaf</button>
                </Section>

                <Section title="Kenar Çizgisi">
                  <div style={{ marginBottom: 8 }}><Toggle options={[0, 1, 2, 4].map(n => ({ v: String(n), label: `${n}px` }))} value={String(selected.borderWidth || 0)} onChange={v => upd({ borderWidth: Number(v) })} /></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="color" value={selected.borderColor || '#000000'} onChange={e => upd({ borderColor: e.target.value })} style={{ width: 34, height: 30, border: '1px solid #E5E7EB', borderRadius: 6, cursor: 'pointer', padding: 0 }} />
                    <input value={selected.borderColor || '#000000'} onChange={e => upd({ borderColor: e.target.value })} style={numInput} />
                  </div>
                </Section>

                <Section title="Döndür">
                  <Toggle options={[0, 90, 180, 270].map(n => ({ v: String(n), label: `${n}°` }))} value={String(selected.rotate || 0)} onChange={v => upd({ rotate: Number(v) })} />
                </Section>

                {selected.type === 'ozel-metin' && (
                  <Section title="İçerik">
                    <textarea rows={3} value={selected.content || ''} onChange={e => upd({ content: e.target.value })} style={{ ...numInput, resize: 'vertical', fontFamily }} />
                  </Section>
                )}

                <Section title="Katman Sırası">
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => dispatch({ t: 'REORDER', dir: 'front' })} style={{ ...numInput, cursor: 'pointer', background: '#fff', fontWeight: 600 }}>↑ Öne</button>
                    <button onClick={() => dispatch({ t: 'REORDER', dir: 'back' })} style={{ ...numInput, cursor: 'pointer', background: '#fff', fontWeight: 600 }}>↓ Arkaya</button>
                  </div>
                </Section>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Save modal ──────────────────────────────────────────── */}
      {showSave && (
        <div onClick={() => setShowSave(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, padding: 26, width: 380, animation: 'modalIn 0.2s ease' }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1A1915', marginBottom: 16 }}>Şablon Kaydet</h2>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#5A574F', display: 'block', marginBottom: 6 }}>Şablon Adı</label>
            <input autoFocus value={tplName} onChange={e => setTplName(e.target.value)} placeholder="Şablonum" onKeyDown={e => e.key === 'Enter' && saveTemplate()}
              style={{ width: '100%', fontSize: 14, padding: '10px 12px', borderRadius: 8, border: '1px solid #E5E7EB', outline: 'none', fontFamily, boxSizing: 'border-box', marginBottom: 20 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowSave(false)} style={{ flex: 1, padding: '10px', borderRadius: 9, border: '1.5px solid #E5E7EB', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily, color: '#5A574F' }}>İptal</button>
              <button onClick={saveTemplate} style={{ flex: 1, padding: '10px', borderRadius: 9, border: 'none', background: '#1A1915', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily }}>Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Print preview modal ─────────────────────────────────── */}
      {showPrint && (
        <div onClick={() => setShowPrint(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, padding: 26, maxHeight: '90vh', overflow: 'auto', animation: 'modalIn 0.2s ease' }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1A1915', marginBottom: 16, textAlign: 'center' }}>Yazdırma Önizlemesi</h2>
            <div className="print-label" style={{ position: 'relative', width: size.w, height: size.h, background: '#fff', border: '1px solid #D1D5DB', margin: '0 auto 16px' }}>
              {[...elements].sort((a, b) => (a.zIndex || 1) - (b.zIndex || 1)).map(el => (
                <div key={el.id} style={{ position: 'absolute', left: el.x, top: el.y, width: el.width, height: el.height, transform: el.rotate ? `rotate(${el.rotate}deg)` : undefined, transformOrigin: 'top left', background: el.bgColor || 'transparent', border: el.borderWidth ? `${el.borderWidth}px solid ${el.borderColor || '#000'}` : 'none', boxSizing: 'border-box' }}>
                  <ElementContent el={el} />
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: '#9E9B93', textAlign: 'center', marginBottom: 18 }}>Bu tasarım seçilen yazıcıya gönderilecek.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setShowPrint(false)} style={{ padding: '10px 24px', borderRadius: 9, border: '1.5px solid #E5E7EB', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily, color: '#5A574F' }}>İptal</button>
              <button onClick={() => { window.print(); toast('Yazdırma işlemi başlatıldı'); }} style={{ padding: '10px 24px', borderRadius: 9, border: 'none', background: '#1A1915', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily, display: 'inline-flex', alignItems: 'center', gap: 7 }}><Icon name="printer" size={16} /> Yazdır</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toasts ──────────────────────────────────────────────── */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 200 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ background: '#1A1915', color: '#fff', borderRadius: 12, padding: '13px 18px', fontSize: 14, fontWeight: 600, boxShadow: '0 8px 32px rgba(26,25,21,0.25)', display: 'flex', alignItems: 'center', gap: 8, animation: 'slideDown 0.25s ease' }}>
            <Icon name="check-circle" size={17} color="#34D399" /> {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}
