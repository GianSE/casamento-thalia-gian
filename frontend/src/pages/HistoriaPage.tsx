import { useSettings } from '../hooks/useSettings';
import { useSeo } from '../hooks/useSeo';
import { useFetch } from '../hooks/useFetch';
import { imgUrl, imgSrcSet } from '../lib/api';
import { SectionHeader } from '../components/SectionHeader/SectionHeader';
import { Reveal } from '../components/Reveal/Reveal';
import { Loader } from '../components/Loader/Loader';
import { Icon } from '../components/Icon/Icon';
import type { TimelineItem, EventItem } from '../types';
import styles from './HistoriaPage.module.css';

function eventIcon(kind: string) {
  if (kind === 'local') return 'mapPin' as const;
  if (kind === 'viagem') return 'star' as const;
  if (kind === 'recepcao') return 'heart' as const;
  return 'calendar' as const;
}

export default function HistoriaPage() {
  const s = useSettings();
  useSeo({ title: 'Nossa História', description: s.journey_subtitle });

  const { data: timeline, loading } = useFetch<TimelineItem[]>('/timeline', []);
  const { data: events } = useFetch<EventItem[]>('/events', []);

  return (
    <div className={styles.page}>
      {/* ---------- Nossa Jornada ---------- */}
      <section className={`container ${styles.section}`}>
        <SectionHeader eyebrow="Nossa jornada" title={s.journey_title} subtitle={s.journey_subtitle} />

        {loading ? (
          <Loader />
        ) : (
          <ol className={styles.timeline}>
            {(timeline ?? []).map((item, i) => (
              <li key={item.id} className={styles.tItem}>
                <span className={styles.tDot} aria-hidden="true" />
                <Reveal className={styles.tCard} delay={i * 0.05}>
                  {item.image_id && (
                    <div className={styles.tMedia}>
                      <img
                        src={imgUrl(item.image_id, 700)}
                        srcSet={imgSrcSet(item.image_id, [360, 540, 700])}
                        sizes="(max-width: 768px) 92vw, 620px"
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  )}
                  <div className={styles.tBody}>
                    {item.date_label && <span className="eyebrow">{item.date_label}</span>}
                    <h3 className={styles.tTitle}>{item.title}</h3>
                    {item.body && <p>{item.body}</p>}
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* ---------- O Grande Dia ---------- */}
      {(events ?? []).length > 0 && (
        <section className={styles.bigDay}>
          <div className="container">
            <SectionHeader eyebrow="Save the date" title="O Grande Dia" />
            <div className={styles.dayGrid}>
              {(events ?? []).map((ev, i) => (
                <Reveal key={ev.id} delay={i * 0.08}>
                  <article className={styles.dayCard}>
                    <div className={styles.dayIcon}>
                      <Icon name={eventIcon(ev.kind)} size={26} />
                    </div>
                    <h3 className={styles.dayTitle}>{ev.title}</h3>
                    {ev.subtitle && <p className={styles.daySubtitle}>{ev.subtitle}</p>}
                    {ev.info && <p className={styles.dayInfo}>{ev.info}</p>}
                    {ev.info2 && <p className={styles.dayInfo}>{ev.info2}</p>}
                    {ev.address && <p className={styles.dayAddress}>{ev.address}</p>}
                    {ev.map_url && (
                      <a
                        href={ev.map_url}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.dayMap}
                      >
                        <Icon name="mapPin" size={16} /> Ver no mapa
                      </a>
                    )}
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
