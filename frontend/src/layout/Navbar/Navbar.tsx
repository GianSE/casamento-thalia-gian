import { NavLink, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { NAV_LINKS } from '../../data/site';
import styles from './Navbar.module.css';

export function Navbar() {
  const settings = useSettings();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`${styles.bar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          {settings.site_title}
        </Link>

        <nav className={styles.nav} aria-label="Navegação principal">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <Link to="/rsvp" className={styles.cta}>
          RSVP
        </Link>
      </div>
    </header>
  );
}
