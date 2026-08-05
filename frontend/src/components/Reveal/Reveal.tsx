import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import styles from './Reveal.module.css';

interface Props {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}

/**
 * Um único IntersectionObserver para todos os Reveal da página.
 * A galeria renderiza dezenas de tiles — criar um observer por elemento é
 * desperdício, e o browser já agrupa os callbacks de um observer só.
 */
let observer: IntersectionObserver | null = null;
const onEnterByElement = new WeakMap<Element, () => void>();

function observe(el: Element, onEnter: () => void): () => void {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          onEnterByElement.get(entry.target)?.();
          onEnterByElement.delete(entry.target);
          observer?.unobserve(entry.target);
        }
      },
      // Espelha o `viewport.margin` que o framer-motion usava: dispara um
      // pouco depois do elemento encostar na borda da tela.
      { rootMargin: '-60px' }
    );
  }

  onEnterByElement.set(el, onEnter);
  observer.observe(el);

  return () => {
    onEnterByElement.delete(el);
    observer?.unobserve(el);
  };
}

/** Fade + slide suave quando o elemento entra na viewport (respeita reduce-motion). */
export function Reveal({ children, delay = 0, y = 24, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    return observe(el, () => setVisible(true));
  }, []);

  return (
    <div
      ref={ref}
      className={[styles.reveal, visible ? styles.visible : '', className]
        .filter(Boolean)
        .join(' ')}
      style={{ '--reveal-delay': `${delay}s`, '--reveal-y': `${y}px` } as CSSProperties}
    >
      {children}
    </div>
  );
}
