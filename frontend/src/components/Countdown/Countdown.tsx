import { useEffect, useState } from 'react';
import styles from './Countdown.module.css';

interface Props {
  /** Data-alvo em ISO (ex.: "2025-11-25T16:00:00"). */
  target: string;
  tone?: 'light' | 'dark';
}

function diff(target: number) {
  const total = Math.max(0, target - Date.now());
  const days = Math.floor(total / 86400000);
  const hours = Math.floor((total % 86400000) / 3600000);
  const mins = Math.floor((total % 3600000) / 60000);
  const secs = Math.floor((total % 60000) / 1000);
  return { days, hours, mins, secs, total };
}

export function Countdown({ target, tone = 'light' }: Props) {
  const targetMs = new Date(target).getTime();
  const valid = !Number.isNaN(targetMs);
  const [t, setT] = useState(() => diff(targetMs));

  useEffect(() => {
    if (!valid) return;
    const id = setInterval(() => setT(diff(targetMs)), 1000);
    return () => clearInterval(id);
  }, [targetMs, valid]);

  if (!valid) return null;

  const units = [
    { value: t.days, label: 'Dias' },
    { value: t.hours, label: 'Horas' },
    { value: t.mins, label: 'Min' },
    { value: t.secs, label: 'Seg' },
  ];

  if (t.total === 0) {
    return <p className={`${styles.today} ${tone === 'dark' ? styles.dark : ''}`}>É hoje! 🤍</p>;
  }

  return (
    <div className={`${styles.grid} ${tone === 'dark' ? styles.dark : ''}`} role="timer" aria-live="off">
      {units.map((u) => (
        <div key={u.label} className={styles.unit}>
          <span className={styles.value}>{String(u.value).padStart(2, '0')}</span>
          <span className={styles.label}>{u.label}</span>
        </div>
      ))}
    </div>
  );
}
