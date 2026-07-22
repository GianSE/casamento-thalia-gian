import { useEffect, useState } from 'react';
import { api, imgUrl } from '../lib/api';
import { Loader } from '../components/Loader/Loader';
import { Icon } from '../components/Icon/Icon';
import { ImageUploadField } from './ImageUploadField';
import type { TimelineItem } from '../types';

type Draft = Partial<TimelineItem>;
const empty: Draft = { date_label: '', title: '', body: '', published: 1 };

export default function TimelineAdmin() {
  const [items, setItems] = useState<TimelineItem[] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  function load() {
    api.get<TimelineItem[]>('/admin/timeline').then(setItems).catch(() => setItems([]));
  }
  useEffect(load, []);

  async function save() {
    if (!draft?.title?.trim()) {
      alert('Informe um título.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        date_label: draft.date_label ?? '',
        title: draft.title,
        body: draft.body ?? '',
        image_id: draft.image_id ?? null,
        published: draft.published ? true : false,
      };
      if (draft.id) await api.put(`/admin/timeline/${draft.id}`, payload);
      else await api.post('/admin/timeline', payload);
      setDraft(null);
      load();
    } catch (err) {
      alert('Erro ao salvar: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!confirm('Excluir este momento da linha do tempo?')) return;
    await api.del(`/admin/timeline/${id}`);
    setItems((p) => (p ?? []).filter((t) => t.id !== id));
  }

  async function move(index: number, dir: -1 | 1) {
    if (!items) return;
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const reordered = [...items];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setItems(reordered);
    await Promise.all(
      reordered.map((it, i) => api.put(`/admin/timeline/${it.id}`, { sort_order: i + 1 }))
    );
  }

  if (!items) return <Loader />;

  return (
    <div className="a-page">
      <div className="a-page-head">
        <div>
          <h1>Nossa Jornada</h1>
          <p>A linha do tempo que aparece na página "Nossa História".</p>
        </div>
        <button className="a-btn a-btn-primary" onClick={() => setDraft({ ...empty })}>
          <Icon name="plus" size={16} /> Novo momento
        </button>
      </div>

      {items.length === 0 ? (
        <div className="a-empty">Nenhum momento cadastrado.</div>
      ) : (
        <div className="a-list">
          {items.map((t, i) => (
            <div key={t.id} className="a-row">
              {t.image_id && (
                <img
                  src={imgUrl(t.image_id, 120)}
                  alt=""
                  style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 'var(--radius)' }}
                />
              )}
              <div className="a-row-main">
                <strong>
                  {t.title} {!t.published && <span className="a-badge a-badge-muted">Oculto</span>}
                </strong>
                <span>{t.date_label}</span>
              </div>
              <div className="a-row-actions">
                <button className="a-btn a-btn-ghost" onClick={() => move(i, -1)} aria-label="Subir">
                  <Icon name="chevronLeft" size={18} style={{ transform: 'rotate(90deg)' }} />
                </button>
                <button className="a-btn a-btn-ghost" onClick={() => move(i, 1)} aria-label="Descer">
                  <Icon name="chevronRight" size={18} style={{ transform: 'rotate(90deg)' }} />
                </button>
                <button className="a-btn a-btn-ghost" onClick={() => setDraft({ ...t })} aria-label="Editar">
                  <Icon name="edit" size={18} />
                </button>
                <button className="a-btn a-btn-ghost" onClick={() => remove(t.id)} aria-label="Excluir">
                  <Icon name="trash" size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {draft && (
        <div className="a-modal" onClick={() => setDraft(null)}>
          <div className="a-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="a-modal-head">
              <h2>{draft.id ? 'Editar momento' : 'Novo momento'}</h2>
              <button className="a-btn a-btn-ghost" onClick={() => setDraft(null)} aria-label="Fechar">
                <Icon name="close" size={20} />
              </button>
            </div>

            <div className="a-field">
              <label>Data (rótulo)</label>
              <input
                type="text"
                placeholder="Ex.: Outubro 2018"
                value={draft.date_label ?? ''}
                onChange={(e) => setDraft({ ...draft, date_label: e.target.value })}
              />
            </div>
            <div className="a-field">
              <label>Título</label>
              <input
                type="text"
                placeholder="Ex.: Como nos conhecemos"
                value={draft.title ?? ''}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </div>
            <div className="a-field">
              <label>Texto</label>
              <textarea
                value={draft.body ?? ''}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              />
            </div>

            <ImageUploadField
              label="Foto (opcional)"
              value={draft.image_id ?? null}
              onChange={(id) => setDraft({ ...draft, image_id: id })}
            />

            <label className="a-switch">
              <input
                type="checkbox"
                checked={!!draft.published}
                onChange={(e) => setDraft({ ...draft, published: e.target.checked ? 1 : 0 })}
              />
              <span className="a-switch-track" />
              <span>Visível no site</span>
            </label>

            <div className="a-modal-actions">
              <button className="a-btn a-btn-outline" onClick={() => setDraft(null)}>
                Cancelar
              </button>
              <button className="a-btn a-btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
