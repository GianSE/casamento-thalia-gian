import type { ReactNode } from 'react';
import styles from './SectionHeader.module.css';

interface Props {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  align?: 'center' | 'left';
  tone?: 'light' | 'dark';
}

export function SectionHeader({ eyebrow, title, subtitle, align = 'center', tone = 'light' }: Props) {
  return (
    <header
      className={`${styles.head} ${align === 'left' ? styles.left : ''} ${
        tone === 'dark' ? styles.dark : ''
      }`}
    >
      {eyebrow && <span className={`eyebrow ${styles.eyebrow}`}>{eyebrow}</span>}
      <h2 className={styles.title}>{title}</h2>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </header>
  );
}
