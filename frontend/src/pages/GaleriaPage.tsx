import { useRef, useState, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useSeo } from '../hooks/useSeo';
import { api, imgUrl } from '../lib/api';
import { compressMany } from '../lib/imageCompress';
import { SectionHeader } from '../components/SectionHeader/SectionHeader';
import { Reveal } from '../components/Reveal/Reveal';
import { Icon } from '../components/Icon/Icon';
import { EmptyState } from '../components/EmptyState/EmptyState';
import type { Photo } from '../types';
import styles from './GaleriaPage.module.css';

export default function GaleriaPage() {
  const s = useSettings();
  useSeo({ title: 'Compartilhe Memórias', description: s.gallery_subtitle });

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get<Photo[]>('/photos').then(setPhotos).catch(() => {});
  }, []);

  async function handleFiles(files: File[]) {
    const images = files.filter((f) => f.type.startsWith('image/')).slice(0, 10);
    if (images.length === 0) return;
    setBusy(true);
    setFeedback(null);
    try {
      const compressed = await compressMany(images);
      const form = new FormData();
      compressed.forEach((f) => form.append('files', f));
      const res = await api.post<{ uploaded: number; status: string }>('/photos', form);
      if (res.status === 'pending') {
        setFeedback(
          'Obrigado! Suas fotos foram enviadas e aparecerão na galeria após a aprovação dos noivos. 🤍'
        );
      } else {
        setFeedback('Obrigado por compartilhar! Suas fotos já estão na galeria. 🤍');
        const fresh = await api.get<Photo[]>('/photos').catch(() => photos);
        setPhotos(fresh);
      }
    } catch (err) {
      setFeedback('Não foi possível enviar: ' + (err as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className={styles.page}>
      <section className={`container ${styles.section}`}>
        <SectionHeader
          eyebrow="Galeria"
          title={s.gallery_title}
          subtitle={s.gallery_subtitle}
        />

        {/* Dropzone de upload */}
        <div
          className={`${styles.dropzone} ${dragOver ? styles.dragOver : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(Array.from(e.dataTransfer.files));
          }}
        >
          <div className={styles.dropIcon}>
            <Icon name="upload" size={30} />
          </div>
          <h3 className={styles.dropTitle}>Compartilhe seus momentos</h3>
          <p className={styles.dropHint}>
            Arraste suas fotos aqui ou clique para selecionar.
          </p>
          <button
            type="button"
            className={styles.dropBtn}
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            {busy ? 'Enviando…' : 'Selecionar fotos'}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => handleFiles(Array.from(e.target.files ?? []))}
          />
        </div>

        {feedback && <p className={styles.feedback}>{feedback}</p>}

        {/* Grid de fotos */}
        {photos.length === 0 ? (
          <EmptyState
            icon="image"
            title="Ainda não há fotos por aqui"
            description="Seja o primeiro a compartilhar um momento especial."
          />
        ) : (
          <div className={styles.grid}>
            {photos.map((p, i) => (
              <Reveal
                key={p.id}
                delay={(i % 6) * 0.04}
                className={`${styles.tile} ${i % 5 === 0 ? styles.wide : ''}`}
              >
                <button
                  type="button"
                  className={styles.tileBtn}
                  onClick={() => setLightbox(p)}
                  aria-label={p.caption ?? 'Ver foto'}
                >
                  <img src={imgUrl(p.image_id, 700)} alt={p.caption ?? ''} loading="lazy" />
                </button>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div className={styles.lightbox} onClick={() => setLightbox(null)} role="dialog" aria-modal="true">
          <button className={styles.lightboxClose} aria-label="Fechar">
            <Icon name="close" size={26} />
          </button>
          <figure className={styles.lightboxFig} onClick={(e) => e.stopPropagation()}>
            <img src={imgUrl(lightbox.image_id, 1600)} alt={lightbox.caption ?? ''} />
            {(lightbox.caption || lightbox.uploader_name) && (
              <figcaption>
                {lightbox.caption}
                {lightbox.uploader_name && (
                  <span className={styles.by}> — {lightbox.uploader_name}</span>
                )}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </div>
  );
}
