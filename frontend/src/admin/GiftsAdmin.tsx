import { useEffect, useState } from 'react';
import { api, imgUrl } from '../lib/api';
import { Loader } from '../components/Loader/Loader';
import { Icon } from '../components/Icon/Icon';
import { ImageUploadField } from './ImageUploadField';
import type { Gift } from '../types';

type Draft = Partial<Gift>;

const empty: Draft = { title: '', description: '', kind: 'link', link_url: '', cta_label: '', published: 1 };

export default function GiftsAdmin() {
  const [gifts, setGifts] = useState<Gift[] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  function load() {
    api.get<Gift[]>('/admin/gifts').then(setGifts).catch(() => setGifts([]));
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
        title: draft.title,
        description: draft.description ?? '',
        kind: draft.kind ?? 'link',
        link_url: draft.link_url ?? '',
        cta_label: draft.cta_label ?? '',
        image_id: draft.image_id ?? null,
        published: draft.published ? true : false,
      };
      if (draft.id) await api.put(`/admin/gifts/${draft.id}`, payload);
      else await api.post('/admin/gifts', payload);
      setDraft(null);
      load();
    } catch (err) {
      alert('Erro ao salvar: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!confirm('Excluir este presente?')) return;
    await api.del(`/admin/gifts/${id}`);
    setGifts((p) => (p ?? []).filter((g) => g.id !== id));
  }

  if (!gifts) return <Loader />;

  return (
    <div className="a-page">
      <div className="a-page-head">
        <div>
          <h1>Presentes</h1>
          <p>Cota da lua de mel (PIX) e links para listas externas.</p>
        </div>
        <button className="a-btn a-btn-primary" onClick={() => setDraft({ ...empty })}>
          <Icon name="plus" size={16} /> Novo presente
        </button>
      </div>

      {gifts.length === 0 ? (
        <div className="a-empty">Nenhum presente cadastrado.</div>
      ) : (
        <div className="a-list">
          {gifts.map((g) => (
            <div key={g.id} className="a-row">
              {g.image_id && (
                <img
                  src={imgUrl(g.image_id, 120)}
                  alt=""
                  style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 'var(--radius)' }}
                />
              )}
              <div className="a-row-main">
                <strong>
                  {g.title}{' '}
                  <span className={`a-badge ${g.kind === 'pix' ? 'a-badge-ok' : 'a-badge-muted'}`}>
                    {g.kind === 'pix' ? 'PIX' : 'Link'}
                  </span>
                  {!g.published && <span className="a-badge a-badge-muted">Oculto</span>}
                </strong>
                <span>{g.description}</span>
              </div>
              <div className="a-row-actions">
                <button className="a-btn a-btn-ghost" onClick={() => setDraft({ ...g })} aria-label="Editar">
                  <Icon name="edit" size={18} />
                </button>
                <button className="a-btn a-btn-ghost" onClick={() => remove(g.id)} aria-label="Excluir">
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
              <h2>{draft.id ? 'Editar presente' : 'Novo presente'}</h2>
              <button className="a-btn a-btn-ghost" onClick={() => setDraft(null)} aria-label="Fechar">
                <Icon name="close" size={20} />
              </button>
            </div>

            <div className="a-field">
              <label>Título</label>
              <input
                type="text"
                value={draft.title ?? ''}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </div>
            <div className="a-field">
              <label>Descrição</label>
              <textarea
                value={draft.description ?? ''}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </div>
            <div className="a-field">
              <label>Tipo</label>
              <select
                value={draft.kind ?? 'link'}
                onChange={(e) => setDraft({ ...draft, kind: e.target.value as Gift['kind'] })}
              >
                <option value="pix">PIX (cota da lua de mel)</option>
                <option value="link">Link externo</option>
              </select>
            </div>
            {draft.kind === 'link' && (
              <div className="a-field">
                <label>Link (URL)</label>
                <input
                  type="url"
                  placeholder="https://…"
                  value={draft.link_url ?? ''}
                  onChange={(e) => setDraft({ ...draft, link_url: e.target.value })}
                />
              </div>
            )}
            <div className="a-field">
              <label>Texto do botão</label>
              <input
                type="text"
                placeholder={draft.kind === 'pix' ? 'Contribuir via PIX' : 'Ver lista'}
                value={draft.cta_label ?? ''}
                onChange={(e) => setDraft({ ...draft, cta_label: e.target.value })}
              />
            </div>

            <ImageUploadField
              label="Imagem (opcional)"
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
