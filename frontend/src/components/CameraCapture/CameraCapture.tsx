import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '../Icon/Icon';
import styles from './CameraCapture.module.css';

interface Props {
  /** Recebe as fotos tiradas quando o convidado toca em "Enviar". */
  onSend: (files: File[]) => void;
  onClose: () => void;
  /** Teto de fotos por sessão — o backend também aceita no máximo 10. */
  max?: number;
}

type Facing = 'environment' | 'user';

/** A câmera só existe em contexto seguro (HTTPS ou localhost). */
export function cameraSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof window !== 'undefined' &&
    window.isSecureContext
  );
}

function messageForError(err: unknown): string {
  const name = (err as { name?: string })?.name;
  if (name === 'NotAllowedError' || name === 'SecurityError')
    return 'Permissão de câmera negada. Libere o acesso nas configurações do navegador ou use "Escolher da galeria".';
  if (name === 'NotFoundError' || name === 'OverconstrainedError')
    return 'Nenhuma câmera encontrada neste aparelho.';
  if (name === 'NotReadableError')
    return 'A câmera está em uso por outro aplicativo. Feche-o e tente de novo.';
  return 'Não foi possível abrir a câmera. Use "Escolher da galeria".';
}

/**
 * Câmera dentro da página: preview ao vivo, disparo, revisão e envio — sem
 * sair do site para o app de câmera e voltar para escolher o arquivo.
 *
 * Cada foto vira um File JPEG; a compressão de sempre (imageCompress) roda
 * depois, no fluxo de upload da galeria.
 */
export function CameraCapture({ onSend, onClose, max = 10 }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facing, setFacing] = useState<Facing>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  /** Foto recém-tirada, aguardando "Refazer" ou "Usar". */
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null);
  /** Fotos já aceitas nesta sessão de câmera. */
  const [shots, setShots] = useState<{ file: File; url: string }[]>([]);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  // (Re)abre o stream sempre que a câmera escolhida muda.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      stopStream();
      setReady(false);
      setError(null);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing }, width: { ideal: 1920 } },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setReady(true);

        // Só mostra o botão de virar se houver mesmo mais de uma câmera.
        // (enumerateDevices só revela os rótulos depois da permissão.)
        const devices = await navigator.mediaDevices.enumerateDevices().catch(() => []);
        if (!cancelled) {
          setHasMultipleCameras(devices.filter((d) => d.kind === 'videoinput').length > 1);
        }
      } catch (err) {
        if (!cancelled) setError(messageForError(err));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [facing, stopStream]);

  // Encerra a câmera ao desmontar — sem isso a luz do sensor fica acesa.
  useEffect(() => stopStream, [stopStream]);

  // Trava o scroll do fundo e fecha no Esc.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  // Libera as URLs de objeto que sobraram.
  useEffect(
    () => () => {
      shots.forEach((s) => URL.revokeObjectURL(s.url));
      if (preview) URL.revokeObjectURL(preview.url);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  function capture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // O preview da câmera frontal é espelhado por CSS (parece um espelho),
    // mas o arquivo salvo fica na orientação real, como no app nativo.
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `foto-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setPreview({ file, url: URL.createObjectURL(file) });
      },
      'image/jpeg',
      0.92
    );
  }

  function retake() {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
  }

  function keep() {
    if (!preview) return;
    setShots((prev) => [...prev, preview]);
    setPreview(null);
  }

  function remove(index: number) {
    setShots((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  }

  function send() {
    const files = shots.map((s) => s.file);
    if (files.length === 0) return;
    stopStream();
    onSend(files);
  }

  const full = shots.length >= max;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Câmera">
      <header className={styles.top}>
        <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Fechar câmera">
          <Icon name="close" size={24} />
        </button>

        <span className={styles.counter}>
          {shots.length > 0 ? `${shots.length} de ${max}` : 'Tire uma foto'}
        </span>

        {hasMultipleCameras && !preview ? (
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => setFacing((f) => (f === 'environment' ? 'user' : 'environment'))}
            aria-label="Virar câmera"
          >
            <Icon name="cameraFlip" size={24} />
          </button>
        ) : (
          <span className={styles.iconSlot} aria-hidden="true" />
        )}
      </header>

      <div className={styles.stage}>
        {error ? (
          <p className={styles.error}>{error}</p>
        ) : (
          <>
            <video
              ref={videoRef}
              className={`${styles.video} ${facing === 'user' ? styles.mirrored : ''} ${
                preview ? styles.hidden : ''
              }`}
              playsInline
              muted
              autoPlay
            />
            {preview && <img className={styles.preview} src={preview.url} alt="Foto tirada" />}
            {!ready && !preview && <p className={styles.hint}>Abrindo a câmera…</p>}
          </>
        )}
      </div>

      {shots.length > 0 && !preview && (
        <div className={styles.tray}>
          {shots.map((s, i) => (
            <button
              key={s.url}
              type="button"
              className={styles.thumb}
              onClick={() => remove(i)}
              aria-label={`Remover foto ${i + 1}`}
            >
              <img src={s.url} alt="" />
              <span className={styles.thumbRemove} aria-hidden="true">
                <Icon name="close" size={14} />
              </span>
            </button>
          ))}
        </div>
      )}

      <footer className={`${styles.bottom} ${preview ? styles.bottomReview : ''}`}>
        {preview ? (
          <>
            <button type="button" className={styles.textBtn} onClick={retake}>
              <Icon name="refresh" size={18} />
              Refazer
            </button>
            <button type="button" className={styles.primaryBtn} onClick={keep} disabled={full}>
              {full ? `Máximo de ${max}` : 'Usar esta foto'}
            </button>
          </>
        ) : (
          <>
            <span className={styles.spacer} />
            <button
              type="button"
              className={styles.shutter}
              onClick={capture}
              disabled={!ready || full}
              aria-label="Tirar foto"
            >
              <span className={styles.shutterInner} />
            </button>
            {shots.length > 0 ? (
              <button type="button" className={styles.sendBtn} onClick={send}>
                Enviar {shots.length}
              </button>
            ) : (
              <span className={styles.spacer} />
            )}
          </>
        )}
      </footer>
    </div>
  );
}
