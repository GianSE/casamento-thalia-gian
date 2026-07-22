import type { SVGProps } from 'react';

export type IconName =
  | 'home'
  | 'book'
  | 'image'
  | 'gift'
  | 'heart'
  | 'calendar'
  | 'clock'
  | 'mapPin'
  | 'menu'
  | 'close'
  | 'arrowRight'
  | 'chevronLeft'
  | 'chevronRight'
  | 'chevronDown'
  | 'check'
  | 'checkCircle'
  | 'xCircle'
  | 'upload'
  | 'copy'
  | 'trash'
  | 'plus'
  | 'edit'
  | 'eye'
  | 'eyeOff'
  | 'mail'
  | 'phone'
  | 'whatsapp'
  | 'instagram'
  | 'quote'
  | 'star'
  | 'users'
  | 'logout'
  | 'settings'
  | 'grip';

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

const paths: Record<IconName, JSX.Element> = {
  home: <path d="M4 11l8-7 8 7M6 9.5V20h12V9.5M10 20v-6h4v6" />,
  book: (
    <path d="M4 4h7a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-7a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h7z" />
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="M21 16l-5-5-7 7" />
    </>
  ),
  gift: (
    <>
      <rect x="4" y="9" width="16" height="12" rx="1.5" />
      <path d="M2 9h20v4H2zM12 9v12" />
      <path d="M12 9S10.5 4 8 4a2 2 0 0 0 0 5zM12 9s1.5-5 4-5a2 2 0 0 1 0 5z" />
    </>
  ),
  heart: (
    <path d="M12 21s-7-4.6-9.5-9C1 9 2.5 5.5 6 5.5c2 0 3 1.2 4 2.5 1-1.3 2-2.5 4-2.5 3.5 0 5 3.5 3.5 6.5C19 16.4 12 21 12 21z" />
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  mapPin: (
    <>
      <path d="M12 21s-6-5.7-6-10a6 6 0 0 1 12 0c0 4.3-6 10-6 10z" />
      <circle cx="12" cy="11" r="2" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  chevronLeft: <path d="M15 6l-6 6 6 6" />,
  chevronRight: <path d="M9 6l6 6-6 6" />,
  chevronDown: <path d="M6 9l6 6 6-6" />,
  check: <path d="M5 12l5 5L20 6" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12l2.5 2.5 4.5-5" />
    </>
  ),
  xCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </>
  ),
  upload: <path d="M12 16V4m0 0L7 9m5-5l5 5M4 20h16" />,
  copy: (
    <>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h8" />
    </>
  ),
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />,
  plus: <path d="M12 5v14M5 12h14" />,
  edit: <path d="M4 20h4L18 10l-4-4L4 16zM14 6l4 4" />,
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <path d="M3 3l18 18M10.5 10.7a2 2 0 0 0 2.8 2.8M6.5 6.6C3.8 8 2 12 2 12s3.5 7 10 7c1.9 0 3.5-.5 4.9-1.3M9.5 5.2A9.8 9.8 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.2 3" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M4 7l8 6 8-6" />
    </>
  ),
  phone: (
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
  ),
  whatsapp: (
    <path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3zm4.5 12.6c-.2.6-1.2 1.1-1.7 1.1-.4 0-1 .1-3-1s-3.2-3-3.3-3.2c-.1-.2-.8-1.1-.8-2s.5-1.4.7-1.6c.2-.2.4-.3.6-.3h.4c.2 0 .4 0 .6.5l.7 1.7c.1.2.1.4 0 .5l-.4.5c-.1.2-.3.3-.1.6.2.3.8 1.2 1.6 1.9 1 .9 1.8 1.1 2 1.2.2.1.4.1.5-.1l.6-.7c.2-.2.3-.2.5-.1l1.6.8c.2.1.4.2.4.3.1.2.1.6 0 .9z" />
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  quote: (
    <path d="M9 7c-2.5 0-4 2-4 4.5S6.5 16 8.5 16M9 7v9M20 7c-2.5 0-4 2-4 4.5S17.5 16 19.5 16M20 7v9" />
  ),
  star: <path d="M12 3l2.4 7.4H22l-6 4.4 2.3 7.2L12 17.6 5.7 22 8 14.8l-6-4.4h7.6z" />,
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c0-3.6 2.5-6 5.5-6s5.5 2.4 5.5 6" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M15.5 14.2c2.4.4 4 2.3 4 5.8" />
    </>
  ),
  logout: <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 12h10m0 0l-3-3m3 3l-3 3M4 4v16" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </>
  ),
  grip: (
    <>
      <circle cx="9" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="18" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="18" r="1" fill="currentColor" stroke="none" />
    </>
  ),
};

export function Icon({ name, size = 24, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
