'use client';

import React from 'react';

// ─── Shared types ────────────────────────────────────────────────────────────
export type ElementType =
  | 'siparis-no' | 'urun-adi' | 'paket-sirasi' | 'desi-kg' | 'odeme-tipi'
  | 'alici-adi' | 'alici-telefon' | 'alici-adres' | 'sehir-ilce' | 'varis-noktasi'
  | 'firma-adi' | 'firma-logo' | 'tarih' | 'kategori-kodu'
  | 'ana-barkod' | 'qr-kod' | 'takip-no'
  | 'ozel-metin' | 'yatay-cizgi' | 'dikey-cizgi' | 'koyu-alan';

export type LabelSize = '100x150' | '100x100' | '58x40';

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number; y: number; width: number; height: number;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  bgColor?: string;
  borderWidth?: number;
  borderColor?: string;
  content?: string;
  rotate?: number;
  zIndex?: number;
  uppercase?: boolean;
}

export interface OrderData {
  orderNo?: string;
  customerName?: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  productName?: string;
  trackingNo?: string;
}

// ─── Label sizes (3.78px = 1mm) ──────────────────────────────────────────────
export const SIZES: Record<LabelSize, { w: number; h: number; label: string }> = {
  '100x150': { w: 378, h: 567, label: '100×150mm' },
  '100x100': { w: 378, h: 378, label: '100×100mm' },
  '58x40': { w: 219, h: 151, label: '58×40mm' },
};

export const TEXT_TYPES: ElementType[] = ['siparis-no','urun-adi','paket-sirasi','desi-kg','odeme-tipi','alici-adi','alici-telefon','alici-adres','sehir-ilce','varis-noktasi','firma-adi','tarih','kategori-kodu','takip-no','ozel-metin'];
export const LINE_TYPES: ElementType[] = ['yatay-cizgi','dikey-cizgi','koyu-alan'];

export const DEFAULT_TEXT: Partial<Record<ElementType, string>> = {
  'siparis-no':'#TY-8842901','urun-adi':'Kablosuz Kulaklık X3','paket-sirasi':'001/003','desi-kg':'1 DS/KG','odeme-tipi':'STD | ADRESE TESLİM',
  'alici-adi':'AYŞE KAYA','alici-telefon':'0555 123 45 67','alici-adres':'Kadıköy Moda Cad. No:15','sehir-ilce':'İSTANBUL / KADIKÖY','varis-noktasi':'İSTANBUL TM',
  'firma-adi':'Demo Mağaza','tarih':'14.06.2026 14:30','kategori-kodu':'C24','takip-no':'SND-8842901','ozel-metin':'Metin giriniz...',
};

// fill element preview content from real order data
function resolveContent(el: CanvasElement, data?: OrderData): { text: string; placeholder: boolean } {
  if (!data) {
    const text = el.content ?? DEFAULT_TEXT[el.type] ?? '';
    const placeholder = el.type === 'ozel-metin' && (!el.content || el.content === DEFAULT_TEXT['ozel-metin']);
    return { text, placeholder };
  }
  const now = new Date();
  const tarih = now.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const map: Partial<Record<ElementType, string>> = {
    'siparis-no': data.orderNo,
    'alici-adi': (data.customerName || '').toUpperCase(),
    'alici-telefon': data.phone,
    'alici-adres': data.address,
    'sehir-ilce': data.city && data.district ? `${data.city.toUpperCase()} / ${data.district.toUpperCase()}` : data.city?.toUpperCase(),
    'varis-noktasi': data.city ? `${data.city.toUpperCase()} TM` : undefined,
    'firma-adi': 'Demo Mağaza',
    'tarih': tarih,
    'takip-no': data.trackingNo,
    'urun-adi': data.productName,
    'paket-sirasi': '001/001',
    'desi-kg': '1 DS/KG',
    'odeme-tipi': 'STD | ADRESE TESLİM',
    'kategori-kodu': 'C24',
    'ozel-metin': el.content,
  };
  const text = map[el.type] ?? el.content ?? DEFAULT_TEXT[el.type] ?? '';
  return { text, placeholder: false };
}

// ─── Visual primitives ────────────────────────────────────────────────────────
export function BarcodeBars() {
  const bars = [3,2,4,2,3,1,4,2,3,1,4,2,3,5,2,4,1,3,2,5,1,4,2,3,4,2,1,5,2,3,4,1,3,2,5,1,4,2,3];
  let x = 0; const rects: React.ReactNode[] = [];
  bars.forEach((w, i) => { if (i % 2 === 0) rects.push(<rect key={i} x={x} y={0} width={w} height={40} fill="#000" />); x += w + (i % 2 === 0 ? 2 : 1); });
  return <svg viewBox={`0 0 ${x} 40`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>{rects}</svg>;
}
export function QRMock() {
  const cells = 9; const r: React.ReactNode[] = [];
  for (let i = 0; i < cells; i++) for (let j = 0; j < cells; j++) {
    const corner = (i < 3 && j < 3) || (i < 3 && j > 5) || (i > 5 && j < 3);
    const on = corner ? !(i > 0 && i < 2 && j > 0 && j < 2) && !(i > 0 && i < 2 && j > 6 && j < 8) && !(i > 6 && i < 8 && j > 0 && j < 2) : (i * 7 + j * 3) % 3 === 0;
    if (on) r.push(<rect key={`${i}-${j}`} x={j} y={i} width={1} height={1} fill="#000" />);
  }
  return <svg viewBox={`0 0 ${cells} ${cells}`} style={{ width: '100%', height: '100%', display: 'block' }}>{r}</svg>;
}

// ─── Single element renderer ──────────────────────────────────────────────────
export function ElementContent({ el, data }: { el: CanvasElement; data?: OrderData }) {
  if (el.type === 'ana-barkod') return <div style={{ width: '100%', height: '100%' }}><BarcodeBars /></div>;
  if (el.type === 'qr-kod') return <div style={{ width: '100%', height: '100%' }}><QRMock /></div>;
  if (el.type === 'firma-logo') return <div style={{ width: '100%', height: '100%', background: '#E5E7EB', color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>LOGO</div>;
  if (LINE_TYPES.includes(el.type)) return <div style={{ width: '100%', height: '100%' }} />;

  const { text, placeholder } = resolveContent(el, data);
  const baseText: React.CSSProperties = {
    width: '100%', height: '100%', fontSize: el.fontSize, fontWeight: el.fontWeight,
    textAlign: el.textAlign, color: placeholder ? '#9CA3AF' : el.color, lineHeight: 1.15, overflow: 'hidden',
    textTransform: el.uppercase ? 'uppercase' : 'none', display: 'flex', alignItems: 'center',
    justifyContent: el.textAlign === 'center' ? 'center' : el.textAlign === 'right' ? 'flex-end' : 'flex-start',
    padding: el.bgColor ? '2px 4px' : 0, boxSizing: 'border-box', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
    fontStyle: placeholder ? 'italic' : 'normal',
  };
  return <div style={baseText}>{text}</div>;
}

// ─── Static full-canvas renderer (preview / print) ──────────────────────────────
export default function BarcodeCanvas({ elements, labelSize, data, scale = 1, id }: {
  elements: CanvasElement[]; labelSize: LabelSize; data?: OrderData; scale?: number; id?: string;
}) {
  const size = SIZES[labelSize];
  return (
    <div id={id} style={{ position: 'relative', width: size.w, height: size.h, background: '#fff', border: '1px solid #D1D5DB', transform: scale !== 1 ? `scale(${scale})` : undefined, transformOrigin: 'top left' }}>
      {[...elements].sort((a, b) => (a.zIndex || 1) - (b.zIndex || 1)).map(el => (
        <div key={el.id} style={{
          position: 'absolute', left: el.x, top: el.y, width: el.width, height: el.height,
          transform: el.rotate ? `rotate(${el.rotate}deg)` : undefined, transformOrigin: 'top left',
          background: el.bgColor || 'transparent',
          border: el.borderWidth ? `${el.borderWidth}px solid ${el.borderColor || '#000'}` : 'none', boxSizing: 'border-box',
        }}>
          <ElementContent el={el} data={data} />
        </div>
      ))}
    </div>
  );
}
