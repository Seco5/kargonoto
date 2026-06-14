'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import Icon, { IconName } from '../components/Icon';
import BarcodeCanvas, { OrderData, LabelSize, CanvasElement } from '../components/BarcodeCanvas';

// ─── Types ──────────────────────────────────────────────────────────────────
type MainTab = 'manuel' | 'trendyol';
type SubTab = 'tekli' | 'coklu' | 'teslimat' | 'katalog';
type View = 'tablo' | 'urun-listesi' | 'adet-gruplari' | 'siparis-kartlari';
type Platform = 'TY' | 'HB' | 'N11';

interface Row {
  id: string;            // sipariş no
  urun: string;
  ekstra?: number;       // +N additional products
  musteri: string;
  platform: Platform;
  kargo: string;
  durum: string;         // sistem durumu
  yazdirildi?: string;   // tarih saat | undefined
  ka: string;            // K/A
  teslimat: string;      // tahmini teslimat (kısa)
  iade?: boolean;
}

interface CokluRow {
  id: string;
  barkod: string;
  platform: Platform;
  durum: string;
  yazdirildi?: string;
  ka: string;
  urunler: string[];
  tarih: string;
  yazdirildiBg?: boolean;
  detay: { urun: string; barkod: string; adet: number }[];
}

interface KatalogRow {
  sku: string;
  orijinal: string;
  kisa: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const KARGOLAR = ['Sendeo', 'Aras', 'Yurtiçi', 'MNG', 'Sürat', 'PTT', 'DHL', 'UPS', 'HepsiJet', 'Kargoist'];

const PLATFORM_STYLE: Record<Platform, { bg: string; color: string; label: string }> = {
  TY: { bg: '#FEE2E0', color: '#C94E1A', label: 'TY' },
  HB: { bg: '#FEF3C7', color: '#B45309', label: 'HB' },
  N11: { bg: '#EDE9FE', color: '#6D28D9', label: 'N11' },
};

const DURUM_STYLE: Record<string, { bg: string; color: string }> = {
  'Bekliyor': { bg: '#FEF3C7', color: '#92400E' },
  'Kargoda': { bg: '#DBEAFE', color: '#1D4ED8' },
  'Teslim Edildi': { bg: '#D1FAE5', color: '#065F46' },
  'İade': { bg: '#FEE2E2', color: '#DC2626' },
  'Yeni': { bg: '#DBEAFE', color: '#1D4ED8' },
  'İşleme Alındı': { bg: '#D1FAE5', color: '#065F46' },
};

// Tekli gönderiler mock data
const TEKLI: Row[] = [
  { id: '#TY-8842901', urun: 'Kablosuz Kulaklık Pro X3', musteri: 'Ayşe Kaya', platform: 'TY', kargo: 'Sendeo', durum: 'Bekliyor', ka: '1/1', teslimat: '02 Haz' },
  { id: '#HB-5521038', urun: 'Deri Çanta, Siyah', ekstra: 1, musteri: 'Mehmet Yılmaz', platform: 'HB', kargo: 'Aras', durum: 'Bekliyor', ka: '2/2', teslimat: '01 Haz' },
  { id: '#N11-3310094', urun: 'Akıllı Saat SE 2025', musteri: 'Fatma Şahin', platform: 'N11', kargo: 'Yurtiçi', durum: 'Bekliyor', ka: '1/1', teslimat: '31 May' },
  { id: '#TY-8843212', urun: 'Gaming Mouse + Pad Set', musteri: 'Ali Rıza', platform: 'TY', kargo: 'Sendeo', durum: 'Kargoda', yazdirildi: '31.05 14:30', ka: '1/1', teslimat: '31 May' },
  { id: '#HB-5521199', urun: 'Oversize T-Shirt', musteri: 'Zeynep Ak', platform: 'HB', kargo: 'MNG', durum: 'İade', yazdirildi: '30.05 11:15', ka: '1/1', teslimat: '30 May', iade: true },
  { id: '#TY-8844001', urun: 'Spor Ayakkabı', ekstra: 2, musteri: 'Murat Demir', platform: 'TY', kargo: 'Sendeo', durum: 'Bekliyor', ka: '3/3', teslimat: '02 Haz' },
  { id: '#N11-3310201', urun: 'Masa Lambası LED', musteri: 'Selin Çelik', platform: 'N11', kargo: 'Aras', durum: 'Bekliyor', ka: '1/1', teslimat: '02 Haz' },
  { id: '#HB-5521300', urun: 'Programlama Kitabı', ekstra: 1, musteri: 'Kemal Arslan', platform: 'HB', kargo: 'Sendeo', durum: 'Kargoda', yazdirildi: '29.05 09:45', ka: '2/2', teslimat: '30 May' },
  { id: '#TY-8844102', urun: 'Bluetooth Kulaklık', musteri: 'Merve Koç', platform: 'TY', kargo: 'Yurtiçi', durum: 'Teslim Edildi', yazdirildi: '28.05 16:20', ka: '1/1', teslimat: '29 May' },
  { id: '#N11-3310388', urun: 'Ahşap Saat', musteri: 'Burak Yurt', platform: 'N11', kargo: 'MNG', durum: 'Bekliyor', ka: '1/1', teslimat: '03 Haz' },
];

// Teslimat listesi: tahmini + gerçek teslimat
const TESLIMAT_EXTRA: Record<string, { tahmini: string; gercek?: string; gecikme?: boolean }> = {
  '#TY-8842901': { tahmini: '02 Haz 2026' },
  '#HB-5521038': { tahmini: '01 Haz 2026' },
  '#N11-3310094': { tahmini: '31 May 2026', gecikme: true },
  '#TY-8843212': { tahmini: '02 Haz 2026' },
  '#HB-5521199': { tahmini: '31 May 2026', gecikme: true },
  '#TY-8844001': { tahmini: '03 Haz 2026' },
  '#N11-3310201': { tahmini: '03 Haz 2026' },
  '#HB-5521300': { tahmini: '31 May 2026', gecikme: true },
  '#TY-8844102': { tahmini: '29 May 2026', gercek: '29 May 14:32' },
  '#N11-3310388': { tahmini: '04 Haz 2026' },
};

// Çoklu gönderiler mock data
const COKLU: CokluRow[] = [
  { id: '11213062228', barkod: '8880032560827500', platform: 'TY', durum: 'Yeni', ka: '2/2', urunler: ['1x Kadın Kemeri...', '1x Bel Zinciri...'], tarih: '08.05.2026 12:45',
    detay: [{ urun: 'Gold Yılan Tokalı Kadın Kemeri...', barkod: 'FK1828STE', adet: 1 }, { urun: 'Güneş Gold Detaylı Bel Zinciri...', barkod: 'FK2450GLD', adet: 1 }] },
  { id: '11255663978', barkod: '8880032926920135', platform: 'TY', durum: 'Yeni', yazdirildi: '21.05 12:30', yazdirildiBg: true, ka: '2/2', urunler: ['1x Köprü Toka...', '1x Köprü Toka...'], tarih: '21.05.2026 06:16',
    detay: [{ urun: 'Köprü Toka Detaylı Kemer Siyah...', barkod: 'KP1100BLK', adet: 1 }, { urun: 'Köprü Toka Detaylı Kemer Taba...', barkod: 'KP1100TAB', adet: 1 }] },
  { id: '11255689525', barkod: '8880032927294495', platform: 'TY', durum: 'Yeni', yazdirildi: '21.05 12:30', yazdirildiBg: true, ka: '3/4', urunler: ['1x İnce Lastikli...', '2x İnce Lastikli...'], tarih: '21.05.2026 07:36',
    detay: [{ urun: 'İnce Lastikli Bel Kemeri Siyah...', barkod: 'IL2200BLK', adet: 1 }, { urun: 'İnce Lastikli Bel Kemeri Bej...', barkod: 'IL2200BEJ', adet: 2 }] },
  { id: '11301445521', barkod: '8880033102445521', platform: 'HB', durum: 'İşleme Alındı', ka: '2/2', urunler: ['1x Spor Çanta...', '1x Laptop Kılıfı...'], tarih: '25.05.2026 14:22',
    detay: [{ urun: 'Spor Çanta Su Geçirmez Siyah...', barkod: 'SC3300BLK', adet: 1 }, { urun: 'Laptop Kılıfı 15 inç...', barkod: 'LK1500GRY', adet: 1 }] },
  { id: '11389201847', barkod: '8880033389201847', platform: 'N11', durum: 'Yeni', ka: '2/3', urunler: ['2x Bluetooth Kulaklık...'], tarih: '28.05.2026 09:11',
    detay: [{ urun: 'Bluetooth Kulaklık Mini TWS...', barkod: 'BK4400WHT', adet: 2 }] },
];

// Ürün listesi (Trendyol'dan Çek sonrası)
const URUN_LISTE = [
  { sku: 'SKU-00441', ad: 'Kablosuz Kulaklık Pro X3', barkod: 'SKU00441KP', adet: 70, siparis: 68 },
  { sku: 'SKU-00892', ad: 'Gaming Mouse + Pad Set RGB', barkod: 'SKU00892GM', adet: 12, siparis: 12 },
  { sku: 'SKU-01123', ad: 'Deri Çanta Siyah El Çantası', barkod: 'SKU01123DC', adet: 8, siparis: 8 },
  { sku: 'SKU-02201', ad: 'Akıllı Saat SE 2025 GPS', barkod: 'SKU02201AS', adet: 25, siparis: 24 },
  { sku: 'SKU-02389', ad: 'Bluetooth Hoparlör Mini', barkod: 'SKU02389BH', adet: 5, siparis: 5 },
  { sku: 'SKU-02541', ad: 'Laptop Çantası 15 inç', barkod: 'SKU02541LC', adet: 3, siparis: 3 },
];

// Adet grupları (SKU-00441 için)
const ADET_GRUPLARI = [
  { label: '1 Adet İçeren Siparişler', adet: 66 },
  { label: '2 Adet İçeren Siparişler', adet: 2 },
];

// Sipariş kartları
const SIPARIS_KARTLARI = [
  { id: '8880032928294135', tarih: '2026-05-21', tutar: '₺166,06', adet: 1 },
  { id: '8880032928308870', tarih: '2026-05-21', tutar: '₺181,06', adet: 1 },
  { id: '8880032928326188', tarih: '2026-05-21', tutar: '₺181,06', adet: 1 },
  { id: '8880032928479761', tarih: '2026-05-21', tutar: '₺181,06', adet: 1 },
  { id: '8880032928804211', tarih: '2026-05-21', tutar: '₺166,06', adet: 1 },
  { id: '8880032928980182', tarih: '2026-05-21', tutar: '₺181,06', adet: 1 },
  { id: '8880032929063785', tarih: '2026-05-21', tutar: '₺181,06', adet: 1 },
  { id: '8880032929071001', tarih: '2026-05-21', tutar: '₺166,06', adet: 1 },
];

// Ürün kataloğu
const KATALOG_INIT: KatalogRow[] = [
  { sku: 'SKU-00441', orijinal: 'Kablosuz Kulaklık Pro X3 Premium Ses Bluetooth 5.0 40 Saat Pil', kisa: 'Kulaklık Pro X3' },
  { sku: 'SKU-00892', orijinal: 'Gaming Mouse + Pad Set RGB Aydınlatmalı Profesyonel 12.000 DPI', kisa: '' },
  { sku: 'SKU-01123', orijinal: 'Deri Çanta Siyah El Çantası Omuz Kadın Şık Günlük Kullanım', kisa: 'Deri Çanta S' },
  { sku: 'SKU-02201', orijinal: 'Akıllı Saat SE 2025 Kalp Ritmi Adım Sayar GPS Su Geçirmez', kisa: '' },
  { sku: 'SKU-02389', orijinal: 'Bluetooth Hoparlör Mini 360° Su Geçirmez Taşınabilir 20W', kisa: '' },
  { sku: 'SKU-02541', orijinal: 'Laptop Çantası 15 inç Su Geçirmez Notebook Sırt Çantası USB', kisa: 'Laptop Çnt 15' },
];

const RECENT_UPLOADS = [
  { name: 'siparisler_haziran.xlsx', info: '47 sipariş · 02 Haz 2026 14:30' },
  { name: 'siparisler_mayis.xlsx', info: '128 sipariş · 31 May 2026 09:15' },
  { name: 'siparisler_ozel.csv', info: '12 sipariş · 28 May 2026 16:45' },
];

// derive printable order data from a row (mock contact/address fields)
const CITY_POOL = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'];
const DISTRICT_POOL = ['Kadıköy', 'Çankaya', 'Konak', 'Nilüfer', 'Muratpaşa'];
function orderToData(r: Row): OrderData {
  const i = Math.max(0, TEKLI.findIndex(x => x.id === r.id));
  return {
    orderNo: r.id,
    customerName: r.musteri,
    phone: `0555 ${100 + i} ${10 + i} ${20 + i}`,
    address: `Moda Cad. No:${10 + i} Daire ${i + 1}`,
    city: CITY_POOL[i % CITY_POOL.length],
    district: DISTRICT_POOL[i % DISTRICT_POOL.length],
    productName: r.urun,
    trackingNo: `${r.kargo.slice(0, 3).toUpperCase()}-${r.id.replace(/\D/g, '').slice(0, 7)}`,
  };
}

const todayMinus = (d: number) => {
  const dt = new Date(2026, 5, 14 - d);
  return dt.toISOString().slice(0, 10);
};

// ─── Small components ──────────────────────────────────────────────────────────
function Spinner({ light = true }: { light?: boolean }) {
  return <span style={{ display: 'inline-block', width: 14, height: 14, border: `2px solid ${light ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)'}`, borderTopColor: light ? '#fff' : '#1A1915', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />;
}

function PlatformBadge({ p }: { p: Platform }) {
  const s = PLATFORM_STYLE[p];
  return <span style={{ background: s.bg, color: s.color, borderRadius: 999, fontSize: 10, fontWeight: 700, padding: '2px 8px' }}>{s.label}</span>;
}

function StatusPill({ s }: { s: string }) {
  const st = DURUM_STYLE[s] || { bg: '#F3F4F6', color: '#6B7280' };
  return <span style={{ background: st.bg, color: st.color, borderRadius: 999, fontSize: 12, fontWeight: 600, padding: '3px 10px', whiteSpace: 'nowrap' }}>{s}</span>;
}

function ImgBox({ size = 48 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 8, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon name="image" size={size * 0.42} color="#9CA3AF" strokeWidth={1.6} />
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function SiparislerPage() {
  const router = useRouter();
  const [mainTab, setMainTab] = useState<MainTab>('trendyol');
  const [subTab, setSubTab] = useState<SubTab>('tekli');
  const [view, setView] = useState<View>('tablo');
  const [selectedUrun, setSelectedUrun] = useState<(typeof URUN_LISTE)[0] | null>(null);
  const [selectedGrup, setSelectedGrup] = useState<(typeof ADET_GRUPLARI)[0] | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [accordionOpen, setAccordionOpen] = useState<string[]>([]);
  const [showHata, setShowHata] = useState(false);
  const [barkodPreview, setBarkodPreview] = useState<{ elements: CanvasElement[]; labelSize: LabelSize; data?: OrderData; orderNo: string } | null>(null);
  const [noTpl, setNoTpl] = useState(false);
  const [cekiliyor, setCekiliyor] = useState(false);
  const [katalog, setKatalog] = useState<KatalogRow[]>(KATALOG_INIT);
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);

  // filters (inline)
  const [fSiparis, setFSiparis] = useState('');
  const [fMusteri, setFMusteri] = useState('');
  const [fPlatform, setFPlatform] = useState('Tümü');
  const [fKargo, setFKargo] = useState('');
  const [fDurum, setFDurum] = useState('Tümü');
  const [fYazdirma, setFYazdirma] = useState('Tümü');
  const [arama, setArama] = useState('');

  // pagination
  const [perPage, setPerPage] = useState(50);

  const toast = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);

  // filtered tekli rows
  const tekliFiltered = useMemo(() => TEKLI.filter(r => {
    if (fSiparis && !(`${r.id} ${r.urun}`.toLowerCase().includes(fSiparis.toLowerCase()))) return false;
    if (fMusteri && !r.musteri.toLowerCase().includes(fMusteri.toLowerCase())) return false;
    if (fPlatform !== 'Tümü') {
      const map: Record<string, Platform> = { Trendyol: 'TY', Hepsiburada: 'HB', N11: 'N11' };
      if (r.platform !== map[fPlatform]) return false;
    }
    if (fKargo && !r.kargo.toLowerCase().includes(fKargo.toLowerCase())) return false;
    if (fDurum === 'Bekliyor' && r.durum !== 'Bekliyor') return false;
    if (fDurum === 'İşleme Alındı' && r.durum !== 'İşleme Alındı') return false;
    if (fYazdirma === 'Yazdırıldı' && !r.yazdirildi) return false;
    if (fYazdirma === 'Yazdırılmadı' && r.yazdirildi) return false;
    if (arama && !(`${r.id} ${r.urun} ${r.musteri}`.toLowerCase().includes(arama.toLowerCase()))) return false;
    return true;
  }), [fSiparis, fMusteri, fPlatform, fKargo, fDurum, fYazdirma, arama]);

  const toggleRow = (id: string) => setSelectedRows(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAccordion = (id: string) => setAccordionOpen(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const clearSel = () => setSelectedRows([]);

  const handleOzelBarkod = () => {
    if (selectedRows.length === 0) return;
    let raw: string | null = null;
    try { raw = localStorage.getItem('kargonoto_active_template'); } catch {}
    if (!raw) { setNoTpl(true); setTimeout(() => setNoTpl(false), 7000); return; }
    try {
      const tpl = JSON.parse(raw);
      if (!tpl?.elements?.length) { setNoTpl(true); setTimeout(() => setNoTpl(false), 7000); return; }
      const row = TEKLI.find(r => r.id === selectedRows[0]);
      setBarkodPreview({ elements: tpl.elements, labelSize: tpl.labelSize || '100x150', data: row ? orderToData(row) : undefined, orderNo: selectedRows[0] });
    } catch { setNoTpl(true); setTimeout(() => setNoTpl(false), 7000); }
  };

  const handleCek = () => {
    setCekiliyor(true);
    setTimeout(() => {
      setCekiliyor(false);
      setView('urun-listesi');
      toast('47 sipariş çekildi');
    }, 1500);
  };

  const fontFamily = "'Plus Jakarta Sans', sans-serif";

  // shared styles
  const card: React.CSSProperties = { background: '#fff', borderRadius: 14, border: '1px solid #EFEDE8', boxShadow: '0 1px 6px rgba(26,25,21,0.04)' };
  const inputSm: React.CSSProperties = { fontSize: 12, padding: '6px 8px', borderRadius: 6, border: '1px solid #E5E7EB', outline: 'none', fontFamily, width: '100%', boxSizing: 'border-box' };
  const selSm: React.CSSProperties = { ...inputSm, cursor: 'pointer', background: '#fff' };
  const actionBtn = (bg: string, disabled = false): React.CSSProperties => ({
    padding: '8px 14px', borderRadius: 8, border: 'none', background: disabled ? 'rgba(26,25,21,0.12)' : bg,
    color: disabled ? '#9E9B93' : '#fff', fontSize: 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily, display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
  });

  const hasSel = selectedRows.length > 0;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily, background: '#F7F6F2' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes slideDown { from { opacity:0; transform: translateY(-8px) } to { opacity:1; transform: translateY(0) } }
        @keyframes modalIn { from { opacity:0; transform: scale(0.96) } to { opacity:1; transform: scale(1) } }
        .acc { overflow: hidden; transition: max-height 0.3s ease; }
        @media print { body * { visibility: hidden; } #barcode-print-area, #barcode-print-area * { visibility: visible; } #barcode-print-area { position: fixed; top: 0; left: 0; } }
      `}</style>
      <Sidebar />
      <TopBar title="Siparişler" />

      <main style={{ marginLeft: 240, flex: 1, padding: '88px 36px 32px', minWidth: 0 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1915', marginBottom: 16 }}>Siparişler</h1>

        {/* ── Ana sekmeler ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 28, borderBottom: '1px solid #E5E7EB', marginBottom: 20 }}>
          {([
            { key: 'manuel' as MainTab, label: 'Manuel / Excel Yükle', icon: 'upload' as IconName },
            { key: 'trendyol' as MainTab, label: 'Trendyol', icon: 'store' as IconName },
          ]).map(t => {
            const active = mainTab === t.key;
            return (
              <button key={t.key} onClick={() => { setMainTab(t.key); setView('tablo'); }}
                style={{ background: 'none', border: 'none', borderBottom: active ? '2px solid #1A1915' : '2px solid transparent', padding: '0 0 12px', marginBottom: -1, cursor: 'pointer', fontFamily, fontSize: 15, fontWeight: active ? 700 : 500, color: active ? '#1A1915' : '#9E9B93', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Icon name={t.icon} size={17} color={active ? '#1A1915' : '#9E9B93'} /> {t.label}
              </button>
            );
          })}
        </div>

        {mainTab === 'manuel' && <ManuelTab toast={toast} card={card} fontFamily={fontFamily} />}

        {mainTab === 'trendyol' && (
          <>
            {/* ── Alt sekmeler ─────────────────────────────────────── */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              {([
                { key: 'tekli' as SubTab, label: 'Tekli Gönderiler' },
                { key: 'coklu' as SubTab, label: 'Çoklu Gönderiler' },
                { key: 'teslimat' as SubTab, label: 'Teslimat Listesi' },
                { key: 'katalog' as SubTab, label: 'Ürün Kataloğu' },
              ]).map(t => {
                const active = subTab === t.key;
                return (
                  <button key={t.key} onClick={() => { setSubTab(t.key); setView('tablo'); clearSel(); }}
                    style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily, fontSize: 13, fontWeight: active ? 700 : 500, background: active ? '#1A1915' : 'transparent', color: active ? '#fff' : '#9E9B93' }}>
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Katalog tab has its own banner; others share filter card */}
            {subTab === 'katalog' ? (
              <KatalogTab katalog={katalog} setKatalog={setKatalog} toast={toast} card={card} fontFamily={fontFamily} />
            ) : view !== 'tablo' && subTab === 'tekli' ? (
              <ProductFlow
                view={view} setView={setView}
                selectedUrun={selectedUrun} setSelectedUrun={setSelectedUrun}
                selectedGrup={selectedGrup} setSelectedGrup={setSelectedGrup}
                toast={toast} card={card} fontFamily={fontFamily}
              />
            ) : (
              <>
                {/* ── Filtre kartı ─────────────────────────────────── */}
                <div style={{ ...card, padding: '16px 20px', marginBottom: 16 }}>
                  {/* Satır 1 */}
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
                    <select defaultValue="Sendeo" style={{ ...selSm, width: 160 }}>
                      {KARGOLAR.map(k => <option key={k}>{k}</option>)}
                    </select>
                    <select defaultValue="Yeni Siparişler" style={{ ...selSm, width: 180 }}>
                      <option>Yeni Siparişler</option><option>İşleme Alındı</option><option>Faturalandı</option><option>Tümü</option>
                    </select>
                    <input type="date" defaultValue={todayMinus(1)} style={{ ...inputSm, width: 150 }} />
                    <span style={{ color: '#9E9B93' }}>—</span>
                    <input type="date" defaultValue={todayMinus(0)} style={{ ...inputSm, width: 150 }} />
                    <button onClick={handleCek} disabled={cekiliyor}
                      style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#1A1915', color: '#fff', fontSize: 14, fontWeight: 700, cursor: cekiliyor ? 'wait' : 'pointer', fontFamily, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      {cekiliyor ? <><Spinner /> Çekiliyor...</> : <><Icon name="download" size={16} /> Trendyol&apos;dan Çek</>}
                    </button>
                  </div>
                  {/* Satır 2 */}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <input value={arama} onChange={e => setArama(e.target.value)} placeholder="Ürün adı / barkod / sipariş no ara..."
                      style={{ flex: 1, fontSize: 14, padding: '9px 16px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#F7F6F2', outline: 'none', fontFamily }} />
                    <button onClick={() => toast('Sonuçlar getirildi')} style={actionBtn('#F59E0B')}>Getir</button>
                    <button onClick={() => hasSel && toast(`${selectedRows.length} sipariş işleme alındı`)} disabled={!hasSel}
                      style={{ ...actionBtn('#6366F1', !hasSel), opacity: hasSel ? 1 : 0.5 }}>İşleme Al</button>
                    <button onClick={() => hasSel && toast(`${selectedRows.length} barkod kuyruğa alındı`)} disabled={!hasSel}
                      style={{ ...actionBtn('#22C55E', !hasSel), opacity: hasSel ? 1 : 0.5 }}><Icon name="printer" size={15} /> Yazdır</button>
                    <button onClick={handleOzelBarkod} disabled={!hasSel} title={!hasSel ? 'Önce sipariş seçin' : undefined} style={{ ...actionBtn('#A78BFA', !hasSel), opacity: hasSel ? 1 : 0.5 }}><Icon name="plus" size={15} /> Özel Barkod</button>
                  </div>
                </div>

                {/* ── Toplu işlem banner ───────────────────────────── */}
                {hasSel && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 16px', background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 12, marginBottom: 12, animation: 'slideDown 0.2s ease' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#92400E' }}>{selectedRows.length} sipariş seçildi</span>
                    <button onClick={() => toast(`${selectedRows.length} sipariş işleme alındı`)} style={{ ...actionBtn('#6366F1'), padding: '6px 12px' }}>İşleme Al</button>
                    <button onClick={() => toast(`${selectedRows.length} barkod kuyruğa alındı`)} style={{ ...actionBtn('#22C55E'), padding: '6px 12px' }}>Yazdır</button>
                    <button onClick={() => setShowHata(true)} style={{ ...actionBtn('#EF4444'), padding: '6px 12px' }}>İptal</button>
                    <button onClick={clearSel} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#92400E', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily, textDecoration: 'underline' }}>Seçimi Temizle</button>
                  </div>
                )}

                {/* ── Tablolar ─────────────────────────────────────── */}
                {subTab === 'tekli' && (
                  <TekliTable rows={tekliFiltered} selectedRows={selectedRows} toggleRow={toggleRow}
                    allRows={tekliFiltered.map(r => r.id)} setSelectedRows={setSelectedRows}
                    fSiparis={fSiparis} setFSiparis={setFSiparis} fMusteri={fMusteri} setFMusteri={setFMusteri}
                    fPlatform={fPlatform} setFPlatform={setFPlatform} fKargo={fKargo} setFKargo={setFKargo}
                    fDurum={fDurum} setFDurum={setFDurum} fYazdirma={fYazdirma} setFYazdirma={setFYazdirma}
                    inputSm={inputSm} selSm={selSm} toast={toast} router={router} />
                )}
                {subTab === 'coklu' && (
                  <CokluTable selectedRows={selectedRows} toggleRow={toggleRow} accordionOpen={accordionOpen} toggleAccordion={toggleAccordion} toast={toast} />
                )}
                {subTab === 'teslimat' && (
                  <TeslimatTable rows={tekliFiltered} selectedRows={selectedRows} toggleRow={toggleRow}
                    allRows={tekliFiltered.map(r => r.id)} setSelectedRows={setSelectedRows} router={router} toast={toast} />
                )}

                {/* ── Sayfalama ────────────────────────────────────── */}
                <Pagination perPage={perPage} setPerPage={setPerPage} total={tekliFiltered.length} fontFamily={fontFamily} />
              </>
            )}
          </>
        )}
      </main>

      {/* ── Özel Barkod Önizleme Modal ─────────────────────────────── */}
      {barkodPreview && (
        <div onClick={() => setBarkodPreview(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: 32, maxWidth: 680, width: '100%', maxHeight: '92vh', overflow: 'auto', animation: 'modalIn 0.2s ease', boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A1915' }}>Özel Barkod Önizlemesi</h2>
                <div style={{ fontSize: 13, color: '#9E9B93', marginTop: 2 }}>{barkodPreview.orderNo}</div>
              </div>
              <button onClick={() => setBarkodPreview(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9E9B93', display: 'flex' }}><Icon name="x" size={20} /></button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', padding: 24, borderRadius: 14, background: '#E8E5DF', backgroundImage: 'radial-gradient(#0000001a 1px, transparent 1px)', backgroundSize: '16px 16px', marginBottom: 20 }}>
              <BarcodeCanvas id="barcode-print-area" elements={barkodPreview.elements} labelSize={barkodPreview.labelSize} data={barkodPreview.data} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setBarkodPreview(null)} style={{ padding: '10px 18px', borderRadius: 10, border: '1.5px solid #E5E7EB', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily, color: '#5A574F', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="x" size={15} /> Kapat</button>
              <button onClick={() => router.push('/barkod-tasarim')} style={{ padding: '10px 18px', borderRadius: 10, border: '1.5px solid #1A1915', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily, color: '#1A1915', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="palette" size={15} /> Tasarımı Düzenle</button>
              <button onClick={() => { window.print(); toast('Yazdırma işlemi başlatıldı'); }} style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: '#1A1915', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily, display: 'inline-flex', alignItems: 'center', gap: 7 }}><Icon name="printer" size={16} /> Yazdır</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Şablon yok uyarısı (amber toast) ───────────────────────── */}
      {noTpl && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 200, background: '#FFFBEB', border: '1px solid #F59E0B', borderRadius: 14, padding: '16px 18px', maxWidth: 340, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', animation: 'slideDown 0.25s ease' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <Icon name="alert" size={20} color="#B45309" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#92400E' }}>Henüz barkod tasarımı oluşturmadınız.</div>
              <div style={{ fontSize: 13, color: '#B45309', marginTop: 4, lineHeight: 1.4 }}>Barkod Tasarımı sayfasından bir şablon oluşturun.</div>
              <button onClick={() => router.push('/barkod-tasarim')} style={{ marginTop: 12, padding: '8px 14px', borderRadius: 8, border: 'none', background: '#1A1915', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily, display: 'inline-flex', alignItems: 'center', gap: 6 }}>Tasarıma Git <Icon name="arrow-right" size={14} /></button>
            </div>
            <button onClick={() => setNoTpl(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B45309', display: 'flex', alignSelf: 'flex-start' }}><Icon name="x" size={16} /></button>
          </div>
        </div>
      )}

      {/* ── Hata Modal ────────────────────────────────────────────── */}
      {showHata && (
        <div onClick={() => setShowHata(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: 32, width: 440, textAlign: 'center', animation: 'modalIn 0.2s ease', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', border: '2.5px solid #DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icon name="x" size={30} color="#DC2626" strokeWidth={2.5} />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1A1915', marginBottom: 8 }}>Hata</h2>
            <p style={{ fontSize: 14, color: '#9E9B93', marginBottom: 18 }}>Hiçbir barkod oluşturulamadı.</p>
            <div style={{ textAlign: 'left', background: '#F7F6F2', borderRadius: 10, padding: '14px 16px', marginBottom: 22 }}>
              <div style={{ fontSize: 13, color: '#6366F1', lineHeight: 1.5 }}>
                • <b>{selectedRows[0] || '#TY-8844001'}</b> Sendeo&apos;dan barkod alınamadı.<br />
                <span style={{ color: '#9E9B93', fontSize: 12 }}>(İş emri gönderiye dönüştüğü için işlem gerçekleştirilemez.)</span>
              </div>
            </div>
            <button onClick={() => setShowHata(false)} style={{ padding: '10px 40px', borderRadius: 10, border: 'none', background: '#6366F1', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily }}>OK</button>
          </div>
        </div>
      )}

      {/* ── Toasts ────────────────────────────────────────────────── */}
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

// ─── Tekli table ────────────────────────────────────────────────────────────
const COLS_TEKLI = '36px 56px 1.6fr 1fr 70px 90px 110px 130px 50px 90px';
function TekliTable(props: {
  rows: Row[]; selectedRows: string[]; toggleRow: (id: string) => void; allRows: string[]; setSelectedRows: (v: string[]) => void;
  fSiparis: string; setFSiparis: (v: string) => void; fMusteri: string; setFMusteri: (v: string) => void;
  fPlatform: string; setFPlatform: (v: string) => void; fKargo: string; setFKargo: (v: string) => void;
  fDurum: string; setFDurum: (v: string) => void; fYazdirma: string; setFYazdirma: (v: string) => void;
  inputSm: React.CSSProperties; selSm: React.CSSProperties; toast: (m: string) => void; router: ReturnType<typeof useRouter>;
}) {
  const { rows, selectedRows, toggleRow, allRows, setSelectedRows, inputSm, selSm, toast, router } = props;
  const allSel = allRows.length > 0 && allRows.every(id => selectedRows.includes(id));
  const head = ['', 'GÖRSEL', 'SİPARİŞ / ÜRÜNLER', 'MÜŞTERİ', 'PLATFORM', 'KARGO', 'SİSTEM DURUMU', 'YAZDIRMA', 'K/A', 'TESLİMAT'];
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #EFEDE8', overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: COLS_TEKLI, padding: '10px 16px', borderBottom: '1px solid #F3F4F6', alignItems: 'center' }}>
        <input type="checkbox" checked={allSel} onChange={() => setSelectedRows(allSel ? [] : allRows)} style={{ width: 16, height: 16, accentColor: '#1A6B46', cursor: 'pointer' }} />
        {head.slice(1).map((h, i) => <div key={i} style={{ fontSize: 11, fontWeight: 600, color: '#9E9B93', textTransform: 'uppercase' }}>{h}</div>)}
      </div>
      {/* inline filter row */}
      <div style={{ display: 'grid', gridTemplateColumns: COLS_TEKLI, padding: '8px 16px', background: '#F9FAFB', borderBottom: '1px solid #F3F4F6', alignItems: 'center', gap: 6 }}>
        <span /><span />
        <input value={props.fSiparis} onChange={e => props.setFSiparis(e.target.value)} placeholder="Ara..." style={inputSm} />
        <input value={props.fMusteri} onChange={e => props.setFMusteri(e.target.value)} placeholder="Ara..." style={inputSm} />
        <select value={props.fPlatform} onChange={e => props.setFPlatform(e.target.value)} style={selSm}><option>Tümü</option><option>Trendyol</option><option>Hepsiburada</option><option>N11</option></select>
        <input value={props.fKargo} onChange={e => props.setFKargo(e.target.value)} placeholder="Ara..." style={inputSm} />
        <select value={props.fDurum} onChange={e => props.setFDurum(e.target.value)} style={selSm}><option>Tümü</option><option>Bekliyor</option><option>İşleme Alındı</option></select>
        <select value={props.fYazdirma} onChange={e => props.setFYazdirma(e.target.value)} style={selSm}><option>Tümü</option><option>Yazdırıldı</option><option>Yazdırılmadı</option></select>
        <span /><span />
      </div>

      {rows.length === 0 && <div style={{ padding: 48, textAlign: 'center', color: '#9E9B93', fontSize: 14 }}>Eşleşen sipariş bulunamadı.</div>}
      {rows.map((r, idx) => {
        const sel = selectedRows.includes(r.id);
        const bg = sel ? '#EBF5EF' : r.iade ? '#FEF2F2' : r.yazdirildi ? '#F0FDF4' : '#fff';
        return (
          <div key={r.id} onClick={() => toggleRow(r.id)}
            style={{ display: 'grid', gridTemplateColumns: COLS_TEKLI, padding: '14px 16px', alignItems: 'center', cursor: 'pointer', background: bg, borderBottom: idx < rows.length - 1 ? '1px solid #F3F4F6' : 'none', borderLeft: sel ? '3px solid #1A6B46' : '3px solid transparent', transition: 'background 0.15s' }}>
            <input type="checkbox" checked={sel} onChange={() => toggleRow(r.id)} onClick={e => e.stopPropagation()} style={{ width: 16, height: 16, accentColor: '#1A6B46', cursor: 'pointer' }} />
            <ImgBox />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1915' }}>{r.id}</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{r.urun}{r.ekstra ? <span style={{ marginLeft: 6, background: '#DBEAFE', color: '#1D4ED8', borderRadius: 999, fontSize: 10, fontWeight: 700, padding: '1px 6px' }}>+{r.ekstra}</span> : null}</div>
            </div>
            <div style={{ fontSize: 13, color: '#1A1915' }}>{r.musteri}</div>
            <div><PlatformBadge p={r.platform} /></div>
            <div style={{ fontSize: 13, color: '#1A1915' }}>{r.kargo}</div>
            <div><StatusPill s={r.durum} /></div>
            <div style={{ fontSize: 12 }}>
              {r.yazdirildi
                ? <span style={{ color: '#16A34A', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="check" size={13} color="#16A34A" /> {r.yazdirildi}</span>
                : <span style={{ color: '#9E9B93' }}>Yazdırılmadı</span>}
            </div>
            <div style={{ fontSize: 13, color: '#1A1915' }}>{r.ka}</div>
            <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              {r.yazdirildi ? (
                <>
                  <button title="Yazdırıldı" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #1A1915', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={15} color="#1A1915" /></button>
                  <button title="İade başlat" onClick={() => router.push('/iade')} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #D1D5DB', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="undo" size={15} color="#6B7280" /></button>
                </>
              ) : (
                <>
                  <button title="Barkod yazdır" onClick={() => toast('Barkod yazdırılıyor...')} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#1A1915', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="printer" size={15} color="#fff" /></button>
                  <button title="İşlemler" onClick={() => toast('İşleme alındı')} style={{ width: 24, height: 32, borderRadius: 8, border: 'none', background: '#1A1915', borderLeft: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chevron-down" size={14} color="#fff" /></button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Çoklu table ────────────────────────────────────────────────────────────
const COLS_COKLU = '36px 70px 90px 1.4fr 70px 120px 130px 50px 1.4fr 130px';
function CokluTable({ selectedRows, toggleRow, accordionOpen, toggleAccordion, toast }: {
  selectedRows: string[]; toggleRow: (id: string) => void; accordionOpen: string[]; toggleAccordion: (id: string) => void; toast: (m: string) => void;
}) {
  const head = ['', 'İŞLEM', 'GÖRSELLER', 'SİPARİŞ / KARGO', 'PLATFORM', 'SİSTEM DURUMU', 'YAZDIRMA', 'K/A', 'ÜRÜNLER', 'SİPARİŞ TARİHİ'];
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #EFEDE8', overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: COLS_COKLU, padding: '10px 16px', borderBottom: '1px solid #F3F4F6', alignItems: 'center' }}>
        <span />
        {head.slice(1).map((h, i) => <div key={i} style={{ fontSize: 11, fontWeight: 600, color: '#9E9B93', textTransform: 'uppercase' }}>{h}</div>)}
      </div>
      {COKLU.map((r, idx) => {
        const sel = selectedRows.includes(r.id);
        const open = accordionOpen.includes(r.id);
        const bg = sel ? '#EBF5EF' : r.yazdirildiBg ? '#F0FDF4' : '#fff';
        return (
          <div key={r.id} style={{ borderBottom: idx < COKLU.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
            <div style={{ display: 'grid', gridTemplateColumns: COLS_COKLU, padding: '14px 16px', alignItems: 'center', background: bg, borderLeft: sel ? '3px solid #1A6B46' : '3px solid transparent' }}>
              <input type="checkbox" checked={sel} onChange={() => toggleRow(r.id)} style={{ width: 16, height: 16, accentColor: '#1A6B46', cursor: 'pointer' }} />
              <div style={{ display: 'flex', gap: 5 }}>
                <button title="İşleme al" onClick={() => toast('İşleme alındı')} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: '#6366F1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={14} color="#fff" /></button>
                <button title="Detay" onClick={() => toggleAccordion(r.id)} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: '#3B82F6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="plus" size={14} color="#fff" /></button>
              </div>
              <div style={{ display: 'flex', gap: 3 }}>{Array.from({ length: Math.min(3, r.detay.length + 1) }).map((_, i) => <ImgBox key={i} size={32} />)}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1915' }}>{r.id}</div>
                <div style={{ fontSize: 11, color: r.yazdirildiBg ? '#16A34A' : '#9E9B93', fontFamily: 'monospace', marginTop: 2 }}>{r.barkod}</div>
              </div>
              <div><PlatformBadge p={r.platform} /></div>
              <div><StatusPill s={r.durum} /></div>
              <div style={{ fontSize: 12 }}>
                {r.yazdirildi
                  ? <span style={{ color: '#16A34A' }}><Icon name="check" size={12} color="#16A34A" /> Yazdırıldı<br /><span style={{ fontSize: 11 }}>{r.yazdirildi}</span></span>
                  : <span style={{ color: '#9E9B93' }}>Yazdırılmadı</span>}
              </div>
              <div style={{ fontSize: 13, color: '#1A1915' }}>{r.ka}</div>
              <div style={{ fontSize: 12, color: '#7C3AED' }}>{r.urunler.map((u, i) => <div key={i}>{u}</div>)}</div>
              <div style={{ fontSize: 12, color: r.yazdirildiBg ? '#16A34A' : '#9E9B93', display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="clock" size={13} color={r.yazdirildiBg ? '#16A34A' : '#9E9B93'} /> {r.tarih}</div>
            </div>
            <div className="acc" style={{ maxHeight: open ? 400 : 0 }}>
              <div style={{ padding: '4px 16px 16px 122px', background: '#F9FAFB' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
                  <thead><tr style={{ background: '#F3F4F6' }}>
                    {['ÜRÜN', 'BARKOD', 'ADET'].map(h => <th key={h} style={{ textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#9E9B93', padding: '8px 12px' }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {r.detay.map((d, i) => (
                      <tr key={i} style={{ borderTop: '1px solid #F3F4F6' }}>
                        <td style={{ fontSize: 13, color: '#1A1915', padding: '10px 12px' }}>{d.urun}</td>
                        <td style={{ fontSize: 13, color: '#6B7280', fontFamily: 'monospace', padding: '10px 12px' }}>{d.barkod}</td>
                        <td style={{ fontSize: 13, color: '#1A1915', padding: '10px 12px' }}>{d.adet}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Teslimat table ──────────────────────────────────────────────────────────
const COLS_TES = '36px 56px 1.5fr 1fr 70px 90px 110px 110px 50px 120px 120px';
function TeslimatTable({ rows, selectedRows, toggleRow, allRows, setSelectedRows, router, toast }: {
  rows: Row[]; selectedRows: string[]; toggleRow: (id: string) => void; allRows: string[]; setSelectedRows: (v: string[]) => void; router: ReturnType<typeof useRouter>; toast: (m: string) => void;
}) {
  void router; void toast;
  const allSel = allRows.length > 0 && allRows.every(id => selectedRows.includes(id));
  const head = ['', 'GÖRSEL', 'SİPARİŞ / ÜRÜNLER', 'MÜŞTERİ', 'PLATFORM', 'KARGO', 'SİSTEM DURUMU', 'YAZDIRMA', 'K/A', 'TAHMİNİ TESLİMAT', 'GERÇEK TESLİMAT'];
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #EFEDE8', overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: COLS_TES, padding: '10px 16px', borderBottom: '1px solid #F3F4F6', alignItems: 'center' }}>
        <input type="checkbox" checked={allSel} onChange={() => setSelectedRows(allSel ? [] : allRows)} style={{ width: 16, height: 16, accentColor: '#1A6B46', cursor: 'pointer' }} />
        {head.slice(1).map((h, i) => <div key={i} style={{ fontSize: 11, fontWeight: 600, color: '#9E9B93', textTransform: 'uppercase' }}>{h}</div>)}
      </div>
      {rows.map((r, idx) => {
        const sel = selectedRows.includes(r.id);
        const ext = TESLIMAT_EXTRA[r.id];
        const bg = sel ? '#EBF5EF' : r.yazdirildi ? '#F0FDF4' : '#fff';
        return (
          <div key={r.id} onClick={() => toggleRow(r.id)} style={{ display: 'grid', gridTemplateColumns: COLS_TES, padding: '14px 16px', alignItems: 'center', cursor: 'pointer', background: bg, borderBottom: idx < rows.length - 1 ? '1px solid #F3F4F6' : 'none', borderLeft: sel ? '3px solid #1A6B46' : '3px solid transparent' }}>
            <input type="checkbox" checked={sel} onChange={() => toggleRow(r.id)} onClick={e => e.stopPropagation()} style={{ width: 16, height: 16, accentColor: '#1A6B46', cursor: 'pointer' }} />
            <ImgBox />
            <div><div style={{ fontSize: 14, fontWeight: 700, color: '#1A1915' }}>{r.id}</div><div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{r.urun}</div></div>
            <div style={{ fontSize: 13, color: '#1A1915' }}>{r.musteri}</div>
            <div><PlatformBadge p={r.platform} /></div>
            <div style={{ fontSize: 13, color: '#1A1915' }}>{r.kargo}</div>
            <div><StatusPill s={r.durum} /></div>
            <div style={{ fontSize: 12 }}>{r.yazdirildi ? <span style={{ color: '#16A34A' }}><Icon name="check" size={12} color="#16A34A" /> {r.yazdirildi}</span> : <span style={{ color: '#9E9B93' }}>Yazdırılmadı</span>}</div>
            <div style={{ fontSize: 13, color: '#1A1915' }}>{r.ka}</div>
            <div style={{ fontSize: 13, color: ext?.gecikme ? '#DC2626' : '#6B7280', fontWeight: ext?.gecikme ? 600 : 400 }}>{ext?.tahmini}</div>
            <div style={{ fontSize: 13, color: ext?.gercek ? '#16A34A' : '#9E9B93', fontWeight: ext?.gercek ? 600 : 400 }}>{ext?.gercek || '—'}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Pagination ──────────────────────────────────────────────────────────────
function Pagination({ perPage, setPerPage, total, fontFamily }: { perPage: number; setPerPage: (v: number) => void; total: number; fontFamily: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#fff', borderTop: '1px solid #F3F4F6', borderRadius: '0 0 14px 14px', marginTop: -1, border: '1px solid #EFEDE8', borderTopColor: '#F3F4F6' }}>
      <div style={{ fontSize: 13, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 8 }}>
        Sayfada
        <select value={perPage} onChange={e => setPerPage(Number(e.target.value))} style={{ fontSize: 13, padding: '4px 8px', borderRadius: 6, border: '1px solid #E5E7EB', fontFamily, background: '#fff', cursor: 'pointer' }}>
          {[10, 25, 50, 100].map(n => <option key={n}>{n}</option>)}
        </select>
        kayıt göster
      </div>
      <div style={{ fontSize: 13, color: '#9E9B93' }}>{total} kayıttan 1–{Math.min(perPage, total)} arası gösteriliyor</div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily, color: '#6B7280' }}>← Önceki</button>
        <button style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: '#1A1915', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily }}>1</button>
        <button style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily, color: '#6B7280' }}>Sonraki →</button>
      </div>
    </div>
  );
}

// ─── Ürün listesi → adet grupları → sipariş kartları akışı ──────────────────────
function ProductFlow({ view, setView, selectedUrun, setSelectedUrun, selectedGrup, setSelectedGrup, toast, card, fontFamily }: {
  view: View; setView: (v: View) => void;
  selectedUrun: (typeof URUN_LISTE)[0] | null; setSelectedUrun: (v: (typeof URUN_LISTE)[0] | null) => void;
  selectedGrup: (typeof ADET_GRUPLARI)[0] | null; setSelectedGrup: (v: (typeof ADET_GRUPLARI)[0] | null) => void;
  toast: (m: string) => void; card: React.CSSProperties; fontFamily: string;
}) {
  const backLink = (label: string, onClick: () => void) => (
    <button onClick={onClick} style={{ background: 'none', border: 'none', color: '#6366F1', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily, marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 4 }}>← {label}</button>
  );
  const btn = (bg: string): React.CSSProperties => ({ padding: '7px 14px', borderRadius: 8, border: 'none', background: bg, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily });

  if (view === 'urun-listesi') {
    return (
      <>
        {backLink('Sipariş Listesine Dön', () => setView('tablo'))}
        <div style={{ ...card, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '130px 60px 1fr 160px', padding: '10px 16px', borderBottom: '1px solid #F3F4F6' }}>
            {['İŞLEM', 'GÖRSEL', 'ÜRÜN ADI', 'TOPLAM ADET'].map(h => <div key={h} style={{ fontSize: 11, fontWeight: 600, color: '#9E9B93', textTransform: 'uppercase' }}>{h}</div>)}
          </div>
          {URUN_LISTE.map((u, idx) => (
            <div key={u.sku} style={{ display: 'grid', gridTemplateColumns: '130px 60px 1fr 160px', padding: '14px 16px', alignItems: 'center', borderBottom: idx < URUN_LISTE.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
              <button onClick={() => { setSelectedUrun(u); setView('adet-gruplari'); }} style={btn('#6366F1')}>Sepetleri Gör</button>
              <ImgBox />
              <div><div style={{ fontSize: 14, fontWeight: 700, color: '#1A1915' }}>{u.ad}</div><div style={{ fontSize: 12, color: '#9E9B93', marginTop: 2 }}>BARKOD: {u.barkod}</div></div>
              <div><span style={{ background: '#D1FAE5', color: '#065F46', borderRadius: 999, fontSize: 16, fontWeight: 800, padding: '4px 16px' }}>{u.adet} Adet</span><div style={{ fontSize: 12, color: '#9E9B93', marginTop: 4 }}>{u.siparis} Siparişte</div></div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (view === 'adet-gruplari' && selectedUrun) {
    return (
      <>
        {backLink('Ürün Listesine Dön', () => setView('urun-listesi'))}
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1915', marginBottom: 16 }}>BARKOD: {selectedUrun.sku}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {ADET_GRUPLARI.map(g => (
            <div key={g.label} style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" defaultChecked style={{ width: 16, height: 16, accentColor: '#3B82F6', cursor: 'pointer' }} />
                <button onClick={() => { setSelectedGrup(g); setView('siparis-kartlari'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily, color: '#065F46', fontWeight: 700, fontSize: 15 }}>{g.label}</button>
                <span style={{ background: '#22C55E', color: '#fff', borderRadius: 999, fontSize: 13, fontWeight: 700, padding: '3px 12px', cursor: 'pointer' }} onClick={() => { setSelectedGrup(g); setView('siparis-kartlari'); }}>{g.adet} Adet</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => toast('Grup işleme alındı')} style={btn('#6366F1')}>Tümünü İşleme Al</button>
                <button onClick={() => toast('Grup barkodları kuyruğa alındı')} style={btn('#22C55E')}>Tümünü Yazdır</button>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (view === 'siparis-kartlari' && selectedUrun && selectedGrup) {
    return (
      <>
        {backLink('Sepet Gruplarına Dön', () => setView('adet-gruplari'))}
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1915', marginBottom: 16 }}>BARKOD: {selectedUrun.sku} — {selectedGrup.label}</div>
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ color: '#065F46', fontWeight: 700, fontSize: 15 }}>{selectedGrup.label} <span style={{ background: '#22C55E', color: '#fff', borderRadius: 999, fontSize: 13, fontWeight: 700, padding: '3px 12px', marginLeft: 8 }}>{selectedGrup.adet} Adet</span></span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => toast('Grup işleme alındı')} style={btn('#6366F1')}>Tümünü İşleme Al</button>
            <button onClick={() => toast('Grup barkodları kuyruğa alındı')} style={btn('#22C55E')}>Tümünü Yazdır</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {SIPARIS_KARTLARI.map(s => (
            <div key={s.id} style={{ ...card, overflow: 'hidden' }}>
              <div style={{ background: '#22C55E', color: '#fff', fontWeight: 700, fontSize: 13, textAlign: 'center', padding: '5px 0' }}>Adet: {s.adet}</div>
              <div style={{ padding: 16 }}>
                <div style={{ color: '#6366F1', fontWeight: 700, fontSize: 13, cursor: 'pointer', wordBreak: 'break-all' }}>{s.id}</div>
                <div style={{ fontSize: 12, color: '#9E9B93', marginTop: 4 }}>{s.tarih}</div>
                <div style={{ fontSize: 10, color: '#9E9B93', textTransform: 'uppercase', marginTop: 10 }}>Tutar</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1915' }}>{s.tutar}</div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }
  return null;
}

// ─── Katalog tab ───────────────────────────────────────────────────────────────
function KatalogTab({ katalog, setKatalog, toast, card, fontFamily }: {
  katalog: KatalogRow[]; setKatalog: (v: KatalogRow[]) => void; toast: (m: string) => void; card: React.CSSProperties; fontFamily: string;
}) {
  const [search, setSearch] = useState('');
  const filtered = katalog.filter(k => `${k.sku} ${k.orijinal} ${k.kisa}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <>
      {/* info banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, background: '#FFFBEB', borderLeft: '4px solid #F59E0B', borderRadius: 10, padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: '#92400E', lineHeight: 1.5 }}>
          Barkod etiketinde görünecek <b>Kısa Ürün Adlarını</b> buradan düzenleyin.<br />
          Alan dışına çıkınca otomatik kaydedilir.
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ürünlerde ara..." style={{ width: 200, fontSize: 13, padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E7EB', outline: 'none', fontFamily }} />
          <button onClick={() => toast('124 ürün güncellendi')} style={{ padding: '8px 14px', borderRadius: 8, border: '1.5px solid #F59E0B', background: '#fff', color: '#F59E0B', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="refresh" size={15} color="#F59E0B" /> Trendyol ile Eşitle</button>
        </div>
      </div>
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '60px 140px 1fr 280px', padding: '10px 16px', borderBottom: '1px solid #F3F4F6' }}>
          {['GÖRSEL', 'BARKOD', 'ORİJİNAL ÜRÜN ADI', 'KISA AD (ETİKET İÇİN)'].map(h => <div key={h} style={{ fontSize: 11, fontWeight: 600, color: '#9E9B93', textTransform: 'uppercase' }}>{h}</div>)}
        </div>
        {filtered.map((k, idx) => (
          <div key={k.sku} style={{ display: 'grid', gridTemplateColumns: '60px 140px 1fr 280px', padding: '14px 16px', alignItems: 'center', borderBottom: idx < filtered.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
            <ImgBox />
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1915', fontFamily: 'monospace' }}>{k.sku}</div>
            <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.4, paddingRight: 16 }}>{k.orijinal}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                defaultValue={k.kisa}
                placeholder="Kısa ad gir..."
                onBlur={e => { setKatalog(katalog.map(x => x.sku === k.sku ? { ...x, kisa: e.target.value } : x)); toast('Kaydedildi'); }}
                style={{ width: 220, fontSize: 13, padding: '6px 10px', borderRadius: 8, border: '1px solid #E5E7EB', outline: 'none', fontFamily }} />
              <button title="Düzenle" onClick={e => { (e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement)?.focus(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9E9B93', display: 'flex' }}><Icon name="edit" size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Manuel / Excel tab ──────────────────────────────────────────────────────
function ManuelTab({ toast, card, fontFamily }: { toast: (m: string) => void; card: React.CSSProperties; fontFamily: string }) {
  const [file, setFile] = useState<{ name: string; size: string } | null>(null);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      {/* Sol — Excel yükle */}
      <div style={{ ...card, padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1915', marginBottom: 16 }}>Excel / CSV ile Sipariş Yükle</h3>
        <label style={{ display: 'block', border: '2px dashed #D1D5DB', borderRadius: 16, padding: 40, textAlign: 'center', cursor: 'pointer', background: file ? '#F0FDF4' : '#FAFAF9' }}>
          <input type="file" accept=".xlsx,.csv" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) setFile({ name: f.name, size: (f.size / 1024 / 1024).toFixed(1) + ' MB' }); }} />
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Icon name="folder" size={36} color="#9CA3AF" /></div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1915', marginBottom: 4 }}>Dosyayı buraya sürükleyin</div>
          <div style={{ fontSize: 13, color: '#9E9B93', marginBottom: 12 }}>veya</div>
          <span style={{ display: 'inline-block', padding: '8px 18px', borderRadius: 8, border: '1.5px solid #1A1915', background: '#fff', fontSize: 13, fontWeight: 600, color: '#1A1915' }}>Dosya Seç</span>
          <div style={{ fontSize: 12, color: '#9E9B93', marginTop: 12 }}>.xlsx, .csv desteklenir</div>
        </label>
        {file && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#16A34A', fontWeight: 600, marginBottom: 12 }}><Icon name="check" size={16} color="#16A34A" /> {file.name} · {file.size}</div>
            <button onClick={() => { toast('47 sipariş içe aktarıldı'); setFile(null); }} style={{ width: '100%', padding: '11px', borderRadius: 10, border: 'none', background: '#1A1915', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily }}>Yükle ve İçe Aktar</button>
          </div>
        )}
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button onClick={() => toast('Şablon indiriliyor...')} style={{ background: 'none', border: 'none', color: '#1A6B46', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily, textDecoration: 'underline' }}>Örnek Şablon İndir</button>
        </div>
      </div>

      {/* Sağ — Son yüklemeler */}
      <div style={{ ...card, padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1915', marginBottom: 16 }}>Son Yüklemeler</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {RECENT_UPLOADS.map(u => (
            <div key={u.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: '1px solid #EFEDE8', borderRadius: 10 }}>
              <Icon name="file" size={22} color="#6B7280" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1915' }}>{u.name}</div>
                <div style={{ fontSize: 12, color: '#9E9B93', marginTop: 2 }}>{u.info}</div>
              </div>
              <button onClick={() => toast('Yükleme görüntüleniyor')} style={{ background: 'none', border: 'none', color: '#6366F1', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily }}>Görüntüle</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
