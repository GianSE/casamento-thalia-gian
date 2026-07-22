import { useEffect, useRef, useState } from 'react';
import { api, imgUrl } from '../lib/api';
import { compressMany } from '../lib/imageCompress';
import { Loader } from '../components/Loader/Loader';
import { Icon } from '../components/Icon/Icon';
import type { Photo } from '../types';
import styles from './GalleryAdmin.module.css';

export default function GalleryAdmin() {
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  function load() {
    api.get<Photo[]>('/admin/photos').then(setPhotos).catch(() => setPhotos([]));
  }
  useEffect(load, []);

  async function upload(files: File[]) {
    const imgs = files.filter((f) => f.type.startsWith('image/'));
    if (imgs.length === 0) return;
    setBusy(true);
    try {
      const compressed = await compressMany(imgs);
      const form = new FormData();
      compressed.forEach((f) => form.append('files', f));
      await api.post('/admin/photos', form);
      load();
    } catch (err) {
      alert('Erro ao enviar: ' + (err as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function approve(id: number) {
    await api.put(`/admin/photos/${id}`, { status: 'approved' });
    setPhotos((p) => (p ?? []).map((x) => (x.id === id ? { ...x, status: 'approved' } : x)));
  }
  async function hide(id: number) {
    await api.put(`/admin/photos/${id}`, { status: 'pending' });
    setPhotos((p) => (p ?? []).map((x) => (x.id === id ? { ...x, status: 'pending' } : x)));
  }
  async function remove(id: number) {
    if (!confirm('Excluir esta foto? Ela será removida do Cloudinary.')) return;
    await api.del(`/admin/photos/${id}`);
    setPhotos((p) => (p ?? []).filter((x) => x.id !== id));
  }

  if (!photos) return <Loader />;

  const pending = photos.filter((p) => p.status === 'pending').length;
  const shown = filter === 'pending' ? photos.filter((p) => p.status === 'pending') : photos;

  return (
    <div className="a-page">
      <div className="a-page-head">
        <div>
          <h1>Galeria</h1>
          <p>
            {photos.length} foto(s){pending > 0 ? ` · ${pending} aguardando aprovação` : ''}
          </p>
        </div>
        <button className="a-btn a-btn-primary" onClick={() => inputRef.current?.click()} disabled={busy}>
          <Icon name="upload" size={16} /> {busy ? 'Enviando…' : 'Adicionar fotos'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => upload(Array.from(e.target.files ?? []))}
        />
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        {(['all', 'pending'] as const).map((f) => (
          <button
            key={f}
            className={`a-btn a-btn-sm ${filter === f ? 'a-btn-primary' : 'a-btn-outline'}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Todas' : `Pendentes${pending ? ` (${pending})` : ''}`}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="a-empty">Nenhuma foto {filter === 'pending' ? 'pendente' : 'ainda'}.</div>
      ) : (
        <div className={styles.grid}>
          {shown.map((p) => (
            <figure key={p.id} className={styles.item}>
              <img src={imgUrl(p.image_id, 400)} alt={p.caption ?? ''} loading="lazy" />
              <figcaption className={styles.meta}>
                {p.status === 'pending' && <span className="a-badge a-badge-pending">Pendente</span>}
                {p.source === 'guest' && (
                  <span className={styles.uploader}>
                    <Icon name="users" size={13} /> {p.uploader_name || 'Convidado'}
                  </span>
                )}
              </figcaption>
              <div className={styles.actions}>
                {p.status === 'pending' ? (
                  <button className="a-btn a-btn-primary a-btn-sm" onClick={() => approve(p.id)}>
                    <Icon name="check" size={14} /> Aprovar
                  </button>
                ) : (
                  <button className="a-btn a-btn-outline a-btn-sm" onClick={() => hide(p.id)}>
                    <Icon name="eyeOff" size={14} /> Ocultar
                  </button>
                )}
                <button className="a-btn a-btn-ghost" onClick={() => remove(p.id)} aria-label="Excluir">
                  <Icon name="trash" size={16} />
                </button>
              </div>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
