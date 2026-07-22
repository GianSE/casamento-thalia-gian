/** Tipos compartilhados do frontend. */

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  is_primary?: boolean;
  created_at?: string;
}

export interface TimelineItem {
  id: number;
  date_label: string | null;
  title: string;
  body: string | null;
  image_id: string | null;
  sort_order: number;
  published?: number;
}

export type EventKind = 'cerimonia' | 'recepcao' | 'local' | 'viagem' | 'detalhe';

export interface EventItem {
  id: number;
  kind: EventKind;
  title: string;
  subtitle: string | null;
  info: string | null;
  info2: string | null;
  address: string | null;
  map_url: string | null;
  image_id: string | null;
  sort_order: number;
  published?: number;
}

export type GiftKind = 'pix' | 'link';

export interface Gift {
  id: number;
  title: string;
  description: string | null;
  image_id: string | null;
  kind: GiftKind;
  link_url: string | null;
  cta_label: string | null;
  sort_order: number;
  published?: number;
}

export type ModStatus = 'pending' | 'approved';

export interface Message {
  id: number;
  name: string;
  message: string;
  status?: ModStatus;
  created_at: string;
}

export interface Rsvp {
  id: number;
  name: string;
  attending: number;
  companions: number;
  message: string | null;
  created_at: string;
}

export interface Photo {
  id: number;
  image_id: string;
  caption: string | null;
  uploader_name: string | null;
  source: 'curated' | 'guest';
  status?: ModStatus;
  width: number | null;
  height: number | null;
  sort_order: number;
  created_at: string;
}

export interface Stats {
  rsvps_yes: number;
  rsvps_no: number;
  guests_total: number;
  pending_photos: number;
  pending_messages: number;
  photos: number;
}
