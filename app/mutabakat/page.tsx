'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import Icon from '../components/Icon';

type Platform = 'trendyol' | 'hepsiburada';
type TxType = 'sale' | 'return' | 'adjust';
type TxFilter = 'all' | TxType;
type DateRange = 'month' | 'lastMonth' | 'last3';

const TL = (n: number) =>
  (n < 0 ? '-₺' : '₺') +
  Math.abs(n).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const TLshort = (n: number) => '₺' + Math.round(n).toLocaleString('tr-TR');

interface SummaryCard {
  label: string;
  value: string;
  sub?: string;
  color: string;
  subColor?: string;
}
interface CategoryRow {
  category: string;
  sales: number;
  rate: number;
  commission: number;
  total?: boolean;
}
interface TrendBar {
  month: string;
  value: number;
  current?: boolean;
}
interface Tx {
  orderId: string;
  product: string;
  date: string;
  sale: number | null;
  commission: number | null;
  commissionPct?: number;
  net: number;
  type: TxType;
}

interface PlatformData {
  summary: SummaryCard[];
  categories: CategoryRow[];
  trend: TrendBar[];
  transactions: Tx[];
}

const TY_DATA: PlatformData = {
  summary: [
    { label: 'Toplam Satış', value: '₺284.750,00', sub: '↑ %12 geçen aya göre', color: '#1A1915', subColor: '#1A6B46' },
    { label: 'Toplam Komisyon', value: '₺42.712,50', sub: '%15 ortalama', color: '#1A1915', subColor: '#9E9B93' },
    { label: 'Net Kazanç', value: '₺242.037,50', sub: 'Hesabınıza yatacak tutar', color: '#1A6B46', subColor: '#9E9B93' },
    { label: 'Bekleyen Ödeme', value: '₺38.450,00', sub: 'Trendyol ödeme döngüsünde', color: '#C47A00', subColor: '#9E9B93' },
  ],
  categories: [
    { category: 'Elektronik', sales: 142300, rate: 15, commission: 21345 },
    { category: 'Bilgisayar', sales: 89450, rate: 14, commission: 12523 },
    { category: 'Spor & Outdoor', sales: 32600, rate: 18, commission: 5868 },
    { category: 'Ev & Yaşam', sales: 20400, rate: 16, commission: 3264 },
    { category: 'TOPLAM', sales: 284750, rate: 15, commission: 42712, total: true },
  ],
  trend: [
    { month: 'Ocak', value: 198400 },
    { month: 'Şubat', value: 211200 },
    { month: 'Mart', value: 224800 },
    { month: 'Nisan', value: 215600 },
    { month: 'Mayıs', value: 231900 },
    { month: 'Haziran', value: 242037, current: true },
  ],
  transactions: [
    { orderId: '#TY-8842901', product: 'Kablosuz Kulaklık Pro X3', date: '01 Haz', sale: 1299, commission: 194.85, commissionPct: 15, net: 1104.15, type: 'sale' },
    { orderId: '#TY-8843212', product: 'Gaming Mouse Set', date: '01 Haz', sale: 459.9, commission: 64.39, commissionPct: 14, net: 395.51, type: 'sale' },
    { orderId: '#TY-8844001', product: 'Akıllı Saat SE 2025', date: '31 May', sale: 2199, commission: 329.85, commissionPct: 15, net: 1869.15, type: 'sale' },
    { orderId: '#TY-8844102', product: 'Bluetooth Hoparlör', date: '31 May', sale: 389.9, commission: 58.49, commissionPct: 15, net: 331.41, type: 'sale' },
    { orderId: '#TY-8842500', product: 'Laptop Çantası 15"', date: '30 May', sale: -649.9, commission: 97.49, net: -552.41, type: 'return' },
    { orderId: '#TY-8844388', product: 'USB-C Hub 7 Port', date: '30 May', sale: 299.9, commission: 41.99, commissionPct: 14, net: 257.91, type: 'sale' },
    { orderId: '#TY-8844501', product: 'Mousepad XL Gaming', date: '29 May', sale: 149.9, commission: 26.98, commissionPct: 18, net: 122.92, type: 'sale' },
    { orderId: '#TY-8844612', product: 'Mekanik Klavye TKL', date: '29 May', sale: 1899, commission: 284.85, commissionPct: 15, net: 1614.15, type: 'sale' },
    { orderId: '#TY-8844789', product: 'Şarj Aleti 65W', date: '28 May', sale: 549.9, commission: 82.49, commissionPct: 15, net: 467.41, type: 'sale' },
    { orderId: 'KOMİSYON DÜZ', product: '—', date: '28 May', sale: null, commission: -124.5, net: -124.5, type: 'adjust' },
  ],
};

const HB_DATA: PlatformData = {
  summary: [
    { label: 'Toplam Satış', value: '₺148.920,00', sub: '↑ %8 geçen aya göre', color: '#1A1915', subColor: '#1A6B46' },
    { label: 'Toplam Komisyon', value: '₺23.827,20', sub: '%16 ortalama — HB biraz yüksek', color: '#1A1915', subColor: '#9E9B93' },
    { label: 'Net Kazanç', value: '₺125.092,80', sub: 'Hesabınıza yatacak tutar', color: '#1A6B46', subColor: '#9E9B93' },
    { label: 'Bekleyen Ödeme', value: '₺22.180,00', sub: 'Hepsiburada ödeme döngüsünde', color: '#C47A00', subColor: '#9E9B93' },
  ],
  categories: [
    { category: 'Elektronik', sales: 89400, rate: 15, commission: 13410 },
    { category: 'Moda', sales: 34200, rate: 18, commission: 6156 },
    { category: 'Ev & Yaşam', sales: 25320, rate: 17, commission: 4304 },
    { category: 'TOPLAM', sales: 148920, rate: 16, commission: 23827, total: true },
  ],
  trend: [
    { month: 'Ocak', value: 102300 },
    { month: 'Şubat', value: 110800 },
    { month: 'Mart', value: 116400 },
    { month: 'Nisan', value: 113900 },
    { month: 'Mayıs', value: 118600 },
    { month: 'Haziran', value: 125092, current: true },
  ],
  transactions: [
    { orderId: '#HB-5521038', product: 'Deri Çanta Siyah', date: '01 Haz', sale: 1299, commission: 207.84, commissionPct: 16, net: 1091.16, type: 'sale' },
    { orderId: '#HB-5521199', product: 'Şarj Aleti 65W GaN', date: '01 Haz', sale: 899, commission: 134.85, commissionPct: 15, net: 764.15, type: 'sale' },
    { orderId: '#HB-5521300', product: 'Bluetooth Hoparlör Mini', date: '31 May', sale: 649, commission: 110.33, commissionPct: 17, net: 538.67, type: 'sale' },
    { orderId: '#HB-5521401', product: 'USB-C Hub 7 Port', date: '31 May', sale: 389, commission: 58.35, commissionPct: 15, net: 330.65, type: 'sale' },
    { orderId: '#HB-5520900', product: 'Webcam Full HD', date: '30 May', sale: -799, commission: 127.84, net: -671.16, type: 'return' },
    { orderId: '#HB-5521589', product: 'Mousepad XL Gaming', date: '30 May', sale: 259, commission: 46.62, commissionPct: 18, net: 212.38, type: 'sale' },
    { orderId: '#HB-5521601', product: 'Mekanik Klavye', date: '29 May', sale: 899, commission: 143.84, commissionPct: 16, net: 755.16, type: 'sale' },
    { orderId: '#HB-5521712', product: 'Ring Light 10 inç', date: '29 May', sale: 449, commission: 76.33, commissionPct: 17, net: 372.67, type: 'sale' },
    { orderId: 'KOMİSYON DÜZ', product: '—', date: '28 May', sale: null, commission: -86.2, net: -86.2, type: 'adjust' },
  ],
};

const PLATFORM_DOT: Record<Platform, string> = { trendyol: '#C94E1A', hepsiburada: '#FF8C00' };

const TX_META: Record<TxType, { label: string; rowBg: string }> = {
  sale: { label: 'Satış', rowBg: '#fff' },
  return: { label: 'İade', rowBg: '#FFF5F5' },
  adjust: { label: 'Komisyon Düzeltme', rowBg: '#FFFAF2' },
};

export default function MutabakatPage() {
  const [platform, setPlatform] = useState<Platform>('trendyol');
  const [range, setRange] = useState<DateRange>('month');
  const [txFilter, setTxFilter] = useState<TxFilter>('all');
  const [search, setSearch] = useState('');
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);

  const data = platform === 'trendyol' ? TY_DATA : HB_DATA;

  const showToast = (msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  const transactions = data.transactions.filter((t) => {
    const matchSearch =
      !search ||
      t.orderId.toLowerCase().includes(search.toLowerCase()) ||
      t.product.toLowerCase().includes(search.toLowerCase());
    const matchType = txFilter === 'all' || t.type === txFilter;
    return matchSearch && matchType;
  });

  const trendMax = Math.max(...data.trend.map((b) => b.value));

  const TABS: { key: Platform; label: string }[] = [
    { key: 'trendyol', label: 'Trendyol' },
    { key: 'hepsiburada', label: 'Hepsiburada' },
  ];
  const RANGES: { key: DateRange; label: string }[] = [
    { key: 'month', label: 'Bu Ay' },
    { key: 'lastMonth', label: 'Geçen Ay' },
    { key: 'last3', label: 'Son 3 Ay' },
  ];
  const TX_FILTERS: { key: TxFilter; label: string }[] = [
    { key: 'all', label: 'Tümü' },
    { key: 'sale', label: 'Satış' },
    { key: 'return', label: 'İade' },
    { key: 'adjust', label: 'Komisyon Düzeltme' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#F7F6F2' }}>
      <style>{`@keyframes slideIn { from { transform: translateX(100%);} to { transform: translateX(0);} }`}</style>
      <Sidebar />
      <TopBar title="Finansal Mutabakat" />

      <main style={{ marginLeft: 240, flex: 1, padding: '88px 36px 32px' }}>
        <div style={{ marginBottom: 18 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1915' }}>Finansal Mutabakat</h1>
          <p style={{ fontSize: 13, color: '#9E9B93', marginTop: 4 }}>
            Trendyol ve Hepsiburada komisyon, satış ve net kazançlarınızı takip edin.
          </p>
        </div>

        {/* Toplam net kazanç banner */}
        <div style={{ background: '#EBF5EF', border: '1px solid #BFE0CC', borderRadius: 12, padding: '14px 18px', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>🏦</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1A6B46' }}>
            Bu Ay Toplam Net Kazanç: ₺367.130,30
          </span>
          <span style={{ fontSize: 12.5, color: '#5A8A6E', fontWeight: 600 }}>(₺242.037 TY + ₺125.092 HB)</span>
        </div>

        {/* Platform sekmeleri */}
        <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid #E5E7EB', marginBottom: 20 }}>
          {TABS.map((t) => {
            const active = platform === t.key;
            return (
              <button key={t.key} onClick={() => setPlatform(t.key)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 0 12px', background: 'none', border: 'none', borderBottom: '2px solid ' + (active ? '#1A1915' : 'transparent'), cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: active ? 700 : 600, color: active ? '#1A1915' : '#9E9B93', marginBottom: -1 }}>
                <span style={{ width: 9, height: 9, borderRadius: 999, background: PLATFORM_DOT[t.key] }} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tarih filtresi + Excel */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {RANGES.map((r) => {
              const active = range === r.key;
              return (
                <button key={r.key} onClick={() => setRange(r.key)}
                  style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid ' + (active ? '#1A1915' : 'rgba(26,25,21,0.14)'), background: active ? '#1A1915' : '#fff', color: active ? '#fff' : '#5A574F', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {r.label}
                </button>
              );
            })}
          </div>
          <button onClick={() => showToast('Rapor hazırlanıyor...')}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(26,25,21,0.16)', background: '#fff', color: '#1A1915', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Icon name="download" size={15} /> Excel İndir
          </button>
        </div>

        {/* Özet kartlar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          {data.summary.map((c) => (
            <div key={c.label} style={{ background: '#fff', borderRadius: 14, padding: '18px 22px', boxShadow: '0 1px 8px rgba(26,25,21,0.06)', border: '1px solid rgba(26,25,21,0.08)' }}>
              <div style={{ fontSize: 13, color: '#9E9B93', fontWeight: 600, marginBottom: 8 }}>{c.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: c.color, letterSpacing: '-1px' }}>{c.value}</div>
              {c.sub && <div style={{ fontSize: 12, color: c.subColor, marginTop: 6, fontWeight: 600 }}>{c.sub}</div>}
            </div>
          ))}
        </div>

        {/* Komisyon dağılımı: kategori tablosu + trend */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, marginBottom: 24 }}>
          {/* Kategori tablosu */}
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 8px rgba(26,25,21,0.06)', border: '1px solid rgba(26,25,21,0.08)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(26,25,21,0.08)' }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1A1915' }}>Kategori Bazlı Komisyon Oranları</h2>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(26,25,21,0.08)' }}>
                  {['Kategori', 'Satış', 'Komisyon Oranı', 'Komisyon'].map((h, i) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: i === 0 ? 'left' : 'right', fontSize: 11, fontWeight: 700, color: '#9E9B93', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.categories.map((c) => (
                  <tr key={c.category} style={{ background: c.total ? '#1A1915' : '#fff', borderBottom: c.total ? 'none' : '1px solid rgba(26,25,21,0.06)' }}>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: c.total ? 800 : 600, color: c.total ? '#fff' : '#1A1915' }}>{c.category}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, textAlign: 'right', color: c.total ? '#fff' : '#5A574F' }}>{TLshort(c.sales)}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, textAlign: 'right', color: c.total ? '#fff' : '#5A574F' }}>%{c.rate}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, textAlign: 'right', fontWeight: 700, color: c.total ? '#fff' : '#1A1915' }}>{TLshort(c.commission)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Trend bar chart */}
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 8px rgba(26,25,21,0.06)', border: '1px solid rgba(26,25,21,0.08)', padding: '16px 20px' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1A1915', marginBottom: 18 }}>Net Kazanç Trendi</h2>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10, height: 200 }}>
              {data.trend.map((b) => {
                const h = Math.round((b.value / trendMax) * 150);
                return (
                  <div key={b.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: b.current ? '#1A6B46' : '#9E9B93', marginBottom: 6, whiteSpace: 'nowrap' }}>{TLshort(b.value / 1000)}k</div>
                    <div style={{ width: '100%', maxWidth: 34, height: h, borderRadius: '6px 6px 0 0', background: b.current ? '#1A6B46' : '#D8D5CD' }} />
                    <div style={{ fontSize: 11, color: b.current ? '#1A1915' : '#9E9B93', fontWeight: b.current ? 700 : 500, marginTop: 8 }}>{b.month.slice(0, 3)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* İşlem detayları */}
        <div style={{ marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1A1915' }}>İşlem Detayları</h2>
          <p style={{ fontSize: 12.5, color: '#9E9B93', marginTop: 2 }}>Her sipariş için komisyon ve net kazanç</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 300 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9E9B93', display: 'flex' }}>
              <Icon name="search" size={16} />
            </span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Sipariş no veya ürün ara..."
              style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: 9, border: '1px solid rgba(26,25,21,0.14)', fontSize: 13, fontFamily: 'inherit', background: '#fff', color: '#1A1915', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TX_FILTERS.map((f) => {
              const active = txFilter === f.key;
              return (
                <button key={f.key} onClick={() => setTxFilter(f.key)}
                  style={{ padding: '8px 13px', borderRadius: 8, border: '1px solid ' + (active ? '#1A1915' : 'rgba(26,25,21,0.14)'), background: active ? '#1A1915' : '#fff', color: active ? '#fff' : '#5A574F', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* İşlem tablosu */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 8px rgba(26,25,21,0.06)', border: '1px solid rgba(26,25,21,0.08)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(26,25,21,0.08)' }}>
                  {['Sipariş No', 'Ürün', 'Tarih', 'Satış Tutarı', 'Komisyon', 'Net Tutar', 'İşlem Tipi'].map((h, i) => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: i >= 3 && i <= 5 ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: '#9E9B93', letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: '40px 16px', textAlign: 'center', color: '#9E9B93', fontSize: 14 }}>Sonuç yok.</td></tr>
                )}
                {transactions.map((t, i) => {
                  const neg = t.type !== 'sale';
                  return (
                    <tr key={t.orderId + i} style={{ background: TX_META[t.type].rowBg, borderBottom: i < transactions.length - 1 ? '1px solid rgba(26,25,21,0.06)' : 'none' }}>
                      <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 700, color: '#1A1915', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{t.orderId}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: '#1A1915' }}>{t.product}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: '#9E9B93', whiteSpace: 'nowrap' }}>{t.date}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, textAlign: 'right', whiteSpace: 'nowrap', color: t.sale === null ? '#9E9B93' : t.sale < 0 ? '#D63B3B' : '#1A1915', fontWeight: 600 }}>
                        {t.sale === null ? '—' : TL(t.sale)}
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 13, textAlign: 'right', whiteSpace: 'nowrap', color: neg ? '#C47A00' : '#5A574F' }}>
                        {t.commission === null
                          ? '—'
                          : t.type === 'return'
                          ? '+' + TL(t.commission)
                          : TL(t.commission)}
                        {t.commissionPct ? <span style={{ color: '#9E9B93', fontSize: 12 }}> (%{t.commissionPct})</span> : null}
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 13, textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap', color: t.net < 0 ? '#D63B3B' : '#1A6B46' }}>{TL(t.net)}</td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ display: 'inline-flex', fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 999, whiteSpace: 'nowrap',
                          background: t.type === 'sale' ? '#EBF5EF' : t.type === 'return' ? '#FBEAEA' : '#FDF4E7',
                          color: t.type === 'sale' ? '#1A6B46' : t.type === 'return' ? '#D63B3B' : '#C47A00' }}>
                          {TX_META[t.type].label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Sayfalama */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 16px', borderTop: '1px solid rgba(26,25,21,0.06)' }}>
            <button style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid rgba(26,25,21,0.14)', background: '#fff', color: '#9E9B93', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Önceki</button>
            <span style={{ padding: '6px 12px', borderRadius: 7, background: '#1A1915', color: '#fff', fontSize: 12.5, fontWeight: 700 }}>1</span>
            <button style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid rgba(26,25,21,0.14)', background: '#fff', color: '#5A574F', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Sonraki</button>
          </div>
        </div>
      </main>

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
