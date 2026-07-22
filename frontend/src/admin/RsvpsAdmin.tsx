import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Loader } from '../components/Loader/Loader';
import { Icon } from '../components/Icon/Icon';
import type { Rsvp } from '../types';

export default function RsvpsAdmin() {
  const [rsvps, setRsvps] = useState<Rsvp[] | null>(null);
  const [filter, setFilter] = useState<'all' | 'yes' | 'no'>('all');

  useEffect(() => {
    api.get<Rsvp[]>('/admin/rsvps').then(setRsvps).catch(() => setRsvps([]));
  }, []);

  async function remove(id: number) {
    if (!confirm('Remover esta confirmação?')) return;
    await api.del(`/admin/rsvps/${id}`);
    setRsvps((prev) => (prev ?? []).filter((r) => r.id !== id));
  }

  function exportCsv() {
    if (!rsvps) return;
    const rows = [
      ['Nome', 'Presença', 'Acompanhantes', 'Mensagem', 'Data'],
      ...rsvps.map((r) => [
        r.name,
        r.attending ? 'Sim' : 'Não',
        String(r.companions),
        (r.message ?? '').replace(/\n/g, ' '),
        r.created_at,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'confirmacoes.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!rsvps) return <Loader />;

  const yes = rsvps.filter((r) => r.attending);
  const no = rsvps.filter((r) => !r.attending);
  const guests = yes.reduce((sum, r) => sum + 1 + r.companions, 0);
  const shown = filter === 'yes' ? yes : filter === 'no' ? no : rsvps;

  return (
    <div className="a-page">
      <div className="a-page-head">
        <div>
          <h1>Confirmações de presença</h1>
          <p>
            {yes.length} confirmaram · {guests} convidados no total · {no.length} não poderão ir
          </p>
        </div>
        {rsvps.length > 0 && (
          <button className="a-btn a-btn-outline" onClick={exportCsv}>
            <Icon name="upload" size={16} /> Exportar CSV
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        {(['all', 'yes', 'no'] as const).map((f) => (
          <button
            key={f}
            className={`a-btn a-btn-sm ${filter === f ? 'a-btn-primary' : 'a-btn-outline'}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Todos' : f === 'yes' ? 'Vão' : 'Não vão'}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="a-empty">Nenhuma confirmação ainda.</div>
      ) : (
        <div className="a-list">
          {shown.map((r) => (
            <div key={r.id} className="a-row">
              <div className="a-row-main">
                <strong>{r.name}</strong>
                <span>
                  {r.attending ? (
                    <span className="a-badge a-badge-ok">
                      <Icon name="check" size={12} /> Vai
                      {r.companions > 0 ? ` · +${r.companions}` : ''}
                    </span>
                  ) : (
                    <span className="a-badge a-badge-muted">Não vai</span>
                  )}
                  {r.message ? ` — ${r.message}` : ''}
                </span>
              </div>
              <div className="a-row-actions">
                <button className="a-btn a-btn-ghost" onClick={() => remove(r.id)} aria-label="Remover">
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
