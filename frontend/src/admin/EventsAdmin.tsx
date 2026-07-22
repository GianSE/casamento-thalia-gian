import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Loader } from '../components/Loader/Loader';
import { Icon } from '../components/Icon/Icon';
import type { EventItem } from '../types';

type Draft = Partial<EventItem>;
const empty: Draft = { kind: 'detalhe', title: '', subtitle: '', info: '', info2: '', address: '', map_url: '', published: 1 };

const KIND_LABELS: Record<string, string> = {
  cerimonia: 'Cerimônia',
  recepcao: 'Recepção',
  local: 'Local',
  viagem: 'Viagem',
  detalhe: 'Detalhe',
};

export default function EventsAdmin() {
  const [items, setItems] = useState<EventItem[] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  function load() {
    api.get<EventItem[]>('/admin/events').then(setItems).catch(() => setItems([]));
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
        kind: draft.kind ?? 'detalhe',
        title: draft.title,
        subtitle: draft.subtitle ?? '',
        info: draft.info ?? '',
        info2: draft.info2 ?? '',
        address: draft.address ?? '',
        map_url: draft.map_url ?? '',
        published: draft.published ? true : false,
      };
      if (draft.id) await api.put(`/admin/events/${draft.id}`, payload);
      else await api.post('/admin/events', payload);
      setDraft(null);
      load();
    } catch (err) {
      alert('Erro ao salvar: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!confirm('Excluir este cartão de detalhes?')) return;
    await api.del(`/admin/events/${id}`);
    setItems((p) => (p ?? []).filter((e) => e.id !== id));
  }

  if (!items) return <Loader />;

  return (
    <div className="a-page">
      <div className="a-page-head">
        <div>
          <h1>Detalhes do dia</h1>
          <p>Os cartões "O Grande Dia" (Quando, Onde…) na página "Nossa História".</p>
        </div>
        <button className="a-btn a-btn-primary" onClick={() => setDraft({ ...empty })}>
          <Icon name="plus" size={16} /> Novo cartão
        </button>
      </div>

      {items.length === 0 ? (
        <div className="a-empty">Nenhum detalhe cadastrado.</div>
      ) : (
        <div className="a-list">
          {items.map((ev) => (
            <div key={ev.id} className="a-row">
              <div className="a-row-main">
                <strong>
                  {ev.title}{' '}
                  <span className="a-badge a-badge-muted">{KIND_LABELS[ev.kind] ?? ev.kind}</span>
                  {!ev.published && <span className="a-badge a-badge-muted">Oculto</span>}
                </strong>
                <span>{[ev.subtitle, ev.info].filter(Boolean).join(' · ')}</span>
              </div>
              <div className="a-row-actions">
                <button className="a-btn a-btn-ghost" onClick={() => setDraft({ ...ev })} aria-label="Editar">
                  <Icon name="edit" size={18} />
                </button>
                <button className="a-btn a-btn-ghost" onClick={() => remove(ev.id)} aria-label="Excluir">
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
              <h2>{draft.id ? 'Editar cartão' : 'Novo cartão'}</h2>
              <button className="a-btn a-btn-ghost" onClick={() => setDraft(null)} aria-label="Fechar">
                <Icon name="close" size={20} />
              </button>
            </div>

            <div className="a-field-row">
              <div className="a-field">
                <label>Tipo</label>
                <select
                  value={draft.kind ?? 'detalhe'}
                  onChange={(e) => setDraft({ ...draft, kind: e.target.value as EventItem['kind'] })}
                >
                  {Object.entries(KIND_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div className="a-field">
                <label>Título</label>
                <input
                  type="text"
                  placeholder="Ex.: Quando / Onde"
                  value={draft.title ?? ''}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
              </div>
            </div>

            <div className="a-field">
              <label>Subtítulo (opcional)</label>
              <input
                type="text"
                placeholder="Ex.: Villa Balbiano"
                value={draft.subtitle ?? ''}
                onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
              />
            </div>
            <div className="a-field">
              <label>Linha de informação</label>
              <input
                type="text"
                placeholder="Ex.: Sábado, 25 de Novembro de 2025"
                value={draft.info ?? ''}
                onChange={(e) => setDraft({ ...draft, info: e.target.value })}
              />
            </div>
            <div className="a-field">
              <label>Segunda linha (opcional)</label>
              <input
                type="text"
                placeholder="Ex.: Cerimônia às 16h"
                value={draft.info2 ?? ''}
                onChange={(e) => setDraft({ ...draft, info2: e.target.value })}
              />
            </div>
            <div className="a-field">
              <label>Endereço (opcional)</label>
              <input
                type="text"
                value={draft.address ?? ''}
                onChange={(e) => setDraft({ ...draft, address: e.target.value })}
              />
            </div>
            <div className="a-field">
              <label>Link do mapa (opcional)</label>
              <input
                type="url"
                placeholder="https://maps.google.com/…"
                value={draft.map_url ?? ''}
                onChange={(e) => setDraft({ ...draft, map_url: e.target.value })}
              />
            </div>

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
