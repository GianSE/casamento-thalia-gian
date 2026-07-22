import { Link } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';
import { NAV_LINKS } from '../../data/site';
import { Icon } from '../../components/Icon/Icon';
import styles from './Footer.module.css';

export function Footer() {
  const s = useSettings();
  const year = new Date().getFullYear();

  const social = [
    s.instagram && { href: s.instagram, icon: 'instagram' as const, label: 'Instagram' },
    s.contact_whatsapp && {
      href: `https://wa.me/${s.contact_whatsapp.replace(/\D/g, '')}`,
      icon: 'whatsapp' as const,
      label: 'WhatsApp',
    },
    s.contact_email && {
      href: `mailto:${s.contact_email}`,
      icon: 'mail' as const,
      label: 'E-mail',
    },
  ].filter(Boolean) as { href: string; icon: 'instagram' | 'whatsapp' | 'mail'; label: string }[];

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          {s.site_title}
        </Link>

        <nav className={styles.links} aria-label="Rodapé">
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to}>
              {l.label}
            </Link>
          ))}
          <Link to="/rsvp">RSVP</Link>
        </nav>

        {social.length > 0 && (
          <div className={styles.social}>
            {social.map((item) => (
              <a
                key={item.icon}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={item.label}
                className={styles.socialBtn}
              >
                <Icon name={item.icon} size={20} />
              </a>
            ))}
          </div>
        )}

        <p className={styles.copy}>
          {s.site_title} — {year} · Feito com <Icon name="heart" size={13} className={styles.heart} /> para o
          nosso grande dia.
        </p>
      </div>
    </footer>
  );
}
