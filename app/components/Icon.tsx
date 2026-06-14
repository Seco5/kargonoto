'use client';

import React from 'react';

export type IconName =
  | 'dashboard' | 'orders' | 'shipping' | 'stock' | 'invoice'
  | 'integrations' | 'settings' | 'logout' | 'eye' | 'eye-off' | 'lock'
  | 'search' | 'alert' | 'check' | 'check-circle' | 'printer'
  | 'edit' | 'refresh' | 'clock' | 'undo' | 'calculator'
  | 'zap' | 'folder' | 'download' | 'mail' | 'chart' | 'bulb'
  | 'coins' | 'phone' | 'arrow-right'
  | 'plus' | 'trash' | 'grip' | 'x' | 'power'
  | 'camera' | 'card' | 'gift' | 'store' | 'home'
  | 'chevron-down' | 'file' | 'upload' | 'image';

const PATHS: Record<IconName, React.ReactNode> = {
  // Layout / grid dashboard
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  // Clipboard list
  orders: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="M9 10h6M9 14h6M9 18h3" />
    </>
  ),
  // Truck
  shipping: (
    <>
      <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H14a1 1 0 0 1 1 1v9H3z" />
      <path d="M15 9h3.2a1 1 0 0 1 .86.5L21 13v2h-6z" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17.5" cy="17.5" r="1.8" />
    </>
  ),
  // Box / package (stock)
  stock: (
    <>
      <path d="M21 8.5 12 3 3 8.5v7L12 21l9-5.5z" />
      <path d="M3 8.5 12 14l9-5.5" />
      <path d="M12 14v7" />
    </>
  ),
  // Invoice / receipt
  invoice: (
    <>
      <path d="M6 3h12v18l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3L6 21z" />
      <path d="M9.5 8h5M9.5 12h5" />
    </>
  ),
  // Plug
  integrations: (
    <>
      <path d="M9 2v5M15 2v5" />
      <path d="M6 7h12v3a6 6 0 0 1-12 0z" />
      <path d="M12 16v6" />
    </>
  ),
  // Gear
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v2.5M12 19v2.5M4.2 7l2.2 1.3M17.6 15.7l2.2 1.3M4.2 17l2.2-1.3M17.6 8.3l2.2-1.3" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  'eye-off': (
    <>
      <path d="M3 3l18 18" />
      <path d="M10.6 6.2A9.7 9.7 0 0 1 12 5c6.5 0 10 7 10 7a16.9 16.9 0 0 1-3.4 4.1" />
      <path d="M6.4 7.4A16.8 16.8 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 4-.9" />
      <path d="M9.5 9.6a3 3 0 0 0 4.2 4.2" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  alert: (
    <>
      <path d="M10.3 3.2 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.2a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  'check-circle': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
  printer: (
    <>
      <path d="M6 9V3h12v6" />
      <rect x="4" y="9" width="16" height="8" rx="2" />
      <path d="M7 17h10v4H7z" />
      <path d="M17 12.5h.01" />
    </>
  ),
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </>
  ),
  refresh: (
    <>
      <path d="M21 12a9 9 0 1 1-2.6-6.4" />
      <path d="M21 4v4h-4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  undo: (
    <>
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h11a5 5 0 0 1 0 10h-3" />
    </>
  ),
  calculator: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 7h8" />
      <path d="M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15v3M8 18h4" />
    </>
  ),
  zap: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  folder: (
    <>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M5 21h14" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v18h18" />
      <path d="M7 14v3M12 9v8M17 5v12" />
    </>
  ),
  bulb: (
    <>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.2 1 2.5h6c0-1.3.3-1.8 1-2.5A6 6 0 0 0 12 3z" />
    </>
  ),
  coins: (
    <>
      <ellipse cx="8" cy="6" rx="5" ry="2.5" />
      <path d="M3 6v5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V6" />
      <path d="M3 11v5c0 1.4 2.2 2.5 5 2.5 1 0 1.9-.1 2.7-.4" />
      <ellipse cx="16" cy="15" rx="5" ry="2.5" />
      <path d="M11 15v3c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-3" />
    </>
  ),
  phone: (
    <path d="M5 3h3l2 5-2.5 1.5a11 11 0 0 0 5 5L18 14l5 2v3a2 2 0 0 1-2 2A18 18 0 0 1 3 5a2 2 0 0 1 2-2z" />
  ),
  'arrow-right': (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6 7v13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  grip: (
    <>
      <circle cx="9" cy="6" r="1" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="9" cy="18" r="1" />
      <circle cx="15" cy="6" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="15" cy="18" r="1" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6 6 18" />,
  power: (
    <>
      <path d="M12 3v9" />
      <path d="M6.3 6.3a8 8 0 1 0 11.4 0" />
    </>
  ),
  camera: (
    <>
      <path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L17 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <circle cx="12" cy="12.5" r="3.2" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
    </>
  ),
  gift: (
    <>
      <path d="M20 12v9H4v-9" />
      <path d="M2 7h20v5H2z" />
      <path d="M12 21V7" />
      <path d="M12 7S10.5 3 8 4.5 9 7 12 7zM12 7s1.5-4 4-2.5S15 7 12 7z" />
    </>
  ),
  store: (
    <>
      <path d="M4 9h16v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
      <path d="M3 9 5 4h14l2 5a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z" />
    </>
  ),
  home: (
    <>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v10h14V10" />
    </>
  ),
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  file: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 20h14" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m4 18 5-5 4 4 3-3 4 4" />
    </>
  ),
};

export default function Icon({ name, size = 18, color = 'currentColor', strokeWidth = 1.8, style }: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
