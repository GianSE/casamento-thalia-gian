import { useSettings } from '../hooks/useSettings';
import { useSeo } from '../hooks/useSeo';
import { useFetch } from '../hooks/useFetch';
import { imgUrl, imgSrcSet, imgDims } from '../lib/api';
import { Countdown } from '../components/Countdown/Countdown';
import { Reveal } from '../components/Reveal/Reveal';
import { Button } from '../components/Button/Button';
import { Icon } from '../components/Icon/Icon';
import type { Photo } from '../types';
import styles from './HomePage.module.css';

export default function HomePage() {
  const s = useSettings();
  useSeo({
    title: 'Início',
    description: `${s.site_title} vão se casar em ${s.wedding_date_label}. Confirme sua presença.`,
  });

  // Só a primeira foto interessa aqui — sem `limit` a home baixava a galeria
  // inteira (com centenas de fotos de convidado, um JSON enorme à toa).
  const { data: photos } = useFetch<Photo[]>('/photos?limit=1', []);
  const storyPhoto = photos?.[0];

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={`eyebrow ${styles.heroEyebrow}`}>Vamos nos casar</span>
          <h1 className={styles.names}>
            {s.couple_name_1} <span className={styles.amp}>&amp;</span> {s.couple_name_2}
          </h1>
          <p className={styles.tagline}>{s.hero_tagline}</p>

          <div className={`glass ${styles.dateCard}`}>
            <span className={styles.dateLabel}>{s.wedding_date_label}</span>
            <span className={styles.dateLocation}>
              {s.location_name}
              {s.location_city ? ` · ${s.location_city}` : ''}
            </span>
          </div>

          <div className={styles.countdown}>
            <Countdown target={s.wedding_date} />
          </div>

          <a href="#historia" className={styles.scrollCue}>
            <span>Descubra</span>
            <Icon name="chevronDown" size={20} />
          </a>
        </div>
      </section>

      {/* ---------------- NOSSA HISTÓRIA ---------------- */}
      <section id="historia" className={styles.story}>
        <div className={`container ${styles.storyGrid}`}>
          <Reveal className={styles.storyMediaWrap}>
            <div className={styles.storyMedia}>
              {storyPhoto ? (
                <img
                  src={imgUrl(storyPhoto.image_id, 900)}
                  srcSet={imgSrcSet(storyPhoto.image_id, [400, 600, 900])}
                  sizes="(max-width: 900px) 92vw, 440px"
                  alt="Gian e Thalia"
                  loading="lazy"
                  decoding="async"
                  {...imgDims(storyPhoto.width, storyPhoto.height, 900)}
                />
              ) : (
                <div className={styles.storyPlaceholder} aria-hidden="true">
                  <Icon name="heart" size={48} />
                </div>
              )}
            </div>
          </Reveal>

          <Reveal className={styles.storyText} delay={0.1}>
            <span className="eyebrow">Nós dois</span>
            <h2 className={styles.storyTitle}>{s.story_title}</h2>
            <p>{s.story_body}</p>
            <div className={styles.storyActions}>
              <Button to="/historia" variant="secondary">
                Nossa jornada
                <Icon name="arrowRight" size={18} />
              </Button>
              <Button to="/rsvp" variant="ghost">
                Confirmar presença
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
