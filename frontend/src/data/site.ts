/**
 * Configuração do site de casamento.
 * Os textos abaixo são apenas defaults/fallback — o conteúdo real vem do painel
 * /admin (endpoint /api/settings). Ver hooks/useSettings.
 */

/**
 * Nome da conta Cloudinary (cloud name) — não é segredo.
 * Reaproveitando a mesma conta do site-capela.
 */
export const CLOUDINARY_CLOUD = 'ohqk1n9a';

/** E-mail da conta principal (dona do painel) — não removível no /admin. */
export const PRIMARY_ADMIN_EMAIL = 'gianpedrodev@gmail.com';

/** Defaults de configuração — espelham o seed do banco (0002_seed.sql). */
export const SETTINGS_DEFAULTS = {
  site_title: 'Gian & Thalia',
  couple_name_1: 'Gian',
  couple_name_2: 'Thalia',
  hero_tagline: 'Uma história de amor, um dia para celebrar.',
  wedding_date: '2028-05-18T16:00:00',
  wedding_date_label: '18 de Maio de 2028',
  location_name: 'Espaço a definir',
  location_city: 'Brasil',
  story_title: 'Nossa História',
  story_body:
    'O que começou como um encontro casual floresceu em uma conexão profunda. Estamos muito felizes em convidar você para celebrar o próximo capítulo da nossa jornada.',
  journey_title: 'Nossa Jornada',
  journey_subtitle:
    'De um encontro casual a uma vida inteira de aventuras, esta é a história de como nos encontramos.',
  rsvp_title: 'Confirme sua Presença',
  rsvp_subtitle:
    'Gostaríamos muito de contar com a sua presença neste dia tão especial. Por favor, confirme preenchendo o formulário abaixo.',
  rsvp_deadline_label: 'Confirme até 15 de Outubro',
  gifts_title: 'Presentes',
  gifts_subtitle:
    'Sua presença no nosso casamento já é o maior presente. Mas, se desejar nos honrar com uma lembrança, reunimos algumas opções com carinho.',
  gallery_title: 'Compartilhe Memórias',
  gallery_subtitle:
    'Uma coleção de momentos que levam ao nosso grande dia. Adoraríamos que você contribuísse com suas fotos favoritas.',
  messages_title: 'Mural de Recados',
  messages_subtitle: 'Deixe uma mensagem, um conselho ou um desejo para o nosso futuro juntos.',
  pix_key: '',
  pix_name: 'Gian & Thalia',
  pix_city: '',
  instagram: '',
  contact_email: '',
  contact_whatsapp: '',
  moderate_photos: '1',
  moderate_messages: '1',
} as const;

export type SettingsKey = keyof typeof SETTINGS_DEFAULTS;
export type Settings = Record<SettingsKey, string> & Record<string, string>;

/** Navegação principal do site público. */
export const NAV_LINKS = [
  { label: 'Início', to: '/' },
  { label: 'Nossa História', to: '/historia' },
  { label: 'Galeria', to: '/galeria' },
  { label: 'Presentes', to: '/presentes' },
] as const;

/** Itens da barra inferior (mobile) — ícone + rótulo curto. */
export const TAB_LINKS = [
  { label: 'Início', to: '/', icon: 'home' },
  { label: 'História', to: '/historia', icon: 'book' },
  { label: 'Fotos', to: '/galeria', icon: 'image' },
  { label: 'Presentes', to: '/presentes', icon: 'gift' },
  { label: 'RSVP', to: '/rsvp', icon: 'heart' },
] as const;
