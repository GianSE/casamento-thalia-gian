import { useRef, useState, useEffect, useCallback } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useSeo } from '../hooks/useSeo';
import { api, imgUrl, imgSrcSet } from '../lib/api';
import { compressMany } from '../lib/imageCompress';
import { SectionHeader } from '../components/SectionHeader/SectionHeader';
import { Reveal } from '../components/Reveal/Reveal';
import { Icon } from '../components/Icon/Icon';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { CameraCapture, cameraSupported } from '../components/CameraCapture/CameraCapture';
import type { Photo } from '../types';
import styles from './GaleriaPage.module.css';

/** Fotos por página. A galeria de um casamento pode passar de mil. */
const PAGE_SIZE = 24;

export default function GaleriaPage() {
  const s = useSettings();
  useSeo({ title: 'Compartilhe Memórias', description: s.gallery_subtitle });

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  /**
   * `bust` fura o cache de borda (60s) — necessário logo após um envio, senão
   * o convidado recarrega e não vê a própria foto.
   */
  const loadPage = useCallback(async (offset: number, bust = false): Promise<Photo[]> => {
    const bustParam = bust ? `&_=${Date.now()}` : '';
    const page = await api.get<Photo[]>(
      `/photos?limit=${PAGE_SIZE}&offset=${offset}${bustParam}`
    );
    setHasMore(page.length === PAGE_SIZE);
    return page;
  }, []);

  useEffect(() => {
    loadPage(0)
      .then(setPhotos)
      .catch(() => {});
  }, [loadPage]);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const page = await loadPage(photos.length);
      setPhotos((prev) => [...prev, ...page]);
    } catch {
      /* mantém o que já está na tela */
    } finally {
      setLoadingMore(false);
    }
  }

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
        const fresh = await loadPage(0, true).catch(() => photos);
        setPhotos(fresh);
      }
    } catch (err) {
      setFeedback('Não foi possível enviar: ' + (err as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  }

  /**
   * Com getUserMedia (HTTPS), a câmera abre dentro do site. Sem ele — navegador
   * antigo, ou o site aberto por http — cai no input `capture`, que chama o app
   * de câmera do sistema e devolve a foto direto no formulário. Nos dois casos
   * o convidado não precisa salvar na galeria e procurar o arquivo depois.
   */
  function openCamera() {
    if (cameraSupported()) setCameraOpen(true);
    else cameraInputRef.current?.click();
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
            Tire uma foto agora ou escolha as que já estão no seu aparelho.
          </p>

          <div className={styles.dropActions}>
            <button
              type="button"
              className={styles.cameraBtn}
              onClick={openCamera}
              disabled={busy}
            >
              <Icon name="camera" size={18} />
              Tirar foto
            </button>
            <button
              type="button"
              className={styles.dropBtn}
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              {busy ? 'Enviando…' : 'Escolher da galeria'}
            </button>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => handleFiles(Array.from(e.target.files ?? []))}
          />
          {/* Fallback: abre o app de câmera do sistema. */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
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
          <>
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
                    <img
                      src={imgUrl(p.image_id, 700)}
                      srcSet={imgSrcSet(p.image_id, [200, 400, 700])}
                      sizes="(max-width: 768px) 50vw, 33vw"
                      alt={p.caption ?? ''}
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                </Reveal>
              ))}
            </div>

            {hasMore && (
              <div className={styles.more}>
                <button
                  type="button"
                  className={styles.dropBtn}
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Carregando…' : 'Carregar mais fotos'}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {cameraOpen && (
        <CameraCapture
          onClose={() => setCameraOpen(false)}
          onSend={(files) => {
            setCameraOpen(false);
            handleFiles(files);
          }}
        />
      )}

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
