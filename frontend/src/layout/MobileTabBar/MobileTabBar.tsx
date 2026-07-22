import { NavLink } from 'react-router-dom';
import { Icon, type IconName } from '../../components/Icon/Icon';
import { TAB_LINKS } from '../../data/site';
import styles from './MobileTabBar.module.css';

/** Barra de navegação inferior — só aparece no mobile. */
export function MobileTabBar() {
  return (
    <nav className={styles.bar} aria-label="Navegação">
      {TAB_LINKS.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.to === '/'}
          className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
        >
          <Icon name={l.icon as IconName} size={22} />
          <span>{l.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
