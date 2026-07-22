import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useFetch } from '../hooks/useFetch';
import { Loader } from '../components/Loader/Loader';
import { Icon } from '../components/Icon/Icon';
import type { Stats } from '../types';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, loading } = useFetch<Stats>('/admin/stats');

  return (
    <div className="a-page">
      <div className="a-page-head">
        <div>
          <h1>Olá, {user?.name?.split(' ')[0]} 👋</h1>
          <p>Visão geral do site de casamento.</p>
        </div>
        <Link to="/" target="_blank" className="a-btn a-btn-outline">
          <Icon name="arrowRight" size={16} /> Ver site
        </Link>
      </div>

      {loading || !stats ? (
        <Loader />
      ) : (
        <>
          <div className="a-stats">
            <div className="a-stat">
              <span className="a-stat-value">{stats.rsvps_yes}</span>
              <span className="a-stat-label">Confirmaram presença</span>
            </div>
            <div className="a-stat">
              <span className="a-stat-value">{stats.guests_total}</span>
              <span className="a-stat-label">Total de convidados (com acompanhantes)</span>
            </div>
            <div className="a-stat">
              <span className="a-stat-value">{stats.rsvps_no}</span>
              <span className="a-stat-label">Não poderão ir</span>
            </div>
            <div className="a-stat">
              <span className="a-stat-value">{stats.photos}</span>
              <span className="a-stat-label">Fotos na galeria</span>
            </div>
          </div>

          {(stats.pending_photos > 0 || stats.pending_messages > 0) && (
            <div className="a-card">
              <strong>Aguardando sua aprovação</strong>
              <div className="a-list" style={{ marginTop: 'var(--space-4)' }}>
                {stats.pending_photos > 0 && (
                  <div className="a-row">
                    <div className="a-row-main">
                      <strong>{stats.pending_photos} foto(s) pendente(s)</strong>
                      <span>Enviadas por convidados</span>
                    </div>
                    <Link to="/admin/galeria" className="a-btn a-btn-primary a-btn-sm">
                      Revisar
                    </Link>
                  </div>
                )}
                {stats.pending_messages > 0 && (
                  <div className="a-row">
                    <div className="a-row-main">
                      <strong>{stats.pending_messages} recado(s) pendente(s)</strong>
                      <span>Aguardando moderação</span>
                    </div>
                    <Link to="/admin/mensagens" className="a-btn a-btn-primary a-btn-sm">
                      Revisar
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
