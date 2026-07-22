import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Loader } from '../components/Loader/Loader';
import { Icon } from '../components/Icon/Icon';
import type { Message } from '../types';

export default function MessagesAdmin() {
  const [items, setItems] = useState<Message[] | null>(null);

  useEffect(() => {
    api.get<Message[]>('/admin/messages').then(setItems).catch(() => setItems([]));
  }, []);

  async function setStatus(id: number, status: 'approved' | 'pending') {
    await api.put(`/admin/messages/${id}`, { status });
    setItems((prev) => (prev ?? []).map((m) => (m.id === id ? { ...m, status } : m)));
  }

  async function remove(id: number) {
    if (!confirm('Excluir este recado?')) return;
    await api.del(`/admin/messages/${id}`);
    setItems((prev) => (prev ?? []).filter((m) => m.id !== id));
  }

  if (!items) return <Loader />;

  const pending = items.filter((m) => m.status === 'pending').length;

  return (
    <div className="a-page">
      <div className="a-page-head">
        <div>
          <h1>Mural de recados</h1>
          <p>
            {items.length} recado(s){pending > 0 ? ` · ${pending} aguardando aprovação` : ''}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="a-empty">Nenhum recado ainda.</div>
      ) : (
        <div className="a-list">
          {items.map((m) => (
            <div key={m.id} className="a-row">
              <div className="a-row-main">
                <strong>
                  {m.name}{' '}
                  {m.status === 'pending' ? (
                    <span className="a-badge a-badge-pending">Pendente</span>
                  ) : (
                    <span className="a-badge a-badge-ok">Publicado</span>
                  )}
                </strong>
                <span>{m.message}</span>
              </div>
              <div className="a-row-actions">
                {m.status === 'pending' ? (
                  <button className="a-btn a-btn-primary a-btn-sm" onClick={() => setStatus(m.id, 'approved')}>
                    <Icon name="check" size={15} /> Aprovar
                  </button>
                ) : (
                  <button className="a-btn a-btn-outline a-btn-sm" onClick={() => setStatus(m.id, 'pending')}>
                    <Icon name="eyeOff" size={15} /> Ocultar
                  </button>
                )}
                <button className="a-btn a-btn-ghost" onClick={() => remove(m.id)} aria-label="Excluir">
                  <Icon name="trash" size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
