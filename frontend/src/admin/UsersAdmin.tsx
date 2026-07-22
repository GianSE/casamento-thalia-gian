import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';
import { Loader } from '../components/Loader/Loader';
import { Icon } from '../components/Icon/Icon';
import type { AdminUser } from '../types';

export default function UsersAdmin() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get<AdminUser[]>('/admin/users').then(setUsers).catch(() => setUsers([]));
  }
  useEffect(load, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post('/admin/users', form);
      setForm({ name: '', email: '', password: '' });
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    if (!confirm('Remover este acesso?')) return;
    try {
      await api.del(`/admin/users/${id}`);
      setUsers((p) => (p ?? []).filter((u) => u.id !== id));
    } catch (err) {
      alert((err as Error).message);
    }
  }

  if (!users) return <Loader />;

  return (
    <div className="a-page">
      <div className="a-page-head">
        <div>
          <h1>Usuários</h1>
          <p>Quem pode acessar este painel.</p>
        </div>
      </div>

      <div className="a-list">
        {users.map((u) => (
          <div key={u.id} className="a-row">
            <div className="a-row-main">
              <strong>
                {u.name}{' '}
                {u.is_primary && <span className="a-badge a-badge-ok">Principal</span>}
                {u.id === user?.id && <span className="a-badge a-badge-muted">Você</span>}
              </strong>
              <span>{u.email}</span>
            </div>
            <div className="a-row-actions">
              {!u.is_primary && u.id !== user?.id && (
                <button className="a-btn a-btn-ghost" onClick={() => remove(u.id)} aria-label="Remover">
                  <Icon name="trash" size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <form className="a-card" onSubmit={add}>
        <strong>Adicionar acesso</strong>
        <div style={{ marginTop: 'var(--space-4)' }}>
          {error && <div className="a-toast a-toast-err" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>}
          <div className="a-field-row">
            <div className="a-field">
              <label>Nome</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="a-field">
              <label>E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="a-field">
            <label>Senha (mínimo 8 caracteres)</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              minLength={8}
              required
            />
          </div>
          <button type="submit" className="a-btn a-btn-primary" disabled={busy}>
            <Icon name="plus" size={16} /> {busy ? 'Adicionando…' : 'Adicionar'}
          </button>
        </div>
      </form>
    </div>
  );
}
