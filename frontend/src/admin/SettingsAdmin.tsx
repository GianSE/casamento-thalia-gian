import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { SETTINGS_DEFAULTS } from '../data/site';
import { Loader } from '../components/Loader/Loader';
import { Icon } from '../components/Icon/Icon';

type Map = Record<string, string>;

// Campos de texto agrupados por seção
const GROUPS: { title: string; fields: { key: string; label: string; type?: 'text' | 'textarea' | 'datetime'; hint?: string }[] }[] = [
  {
    title: 'Identidade',
    fields: [
      { key: 'site_title', label: 'Título do site (ex.: Gian & Thalia)' },
      { key: 'couple_name_1', label: 'Nome 1' },
      { key: 'couple_name_2', label: 'Nome 2' },
      { key: 'hero_tagline', label: 'Frase de abertura' },
      { key: 'wedding_date', label: 'Data e hora do casamento', type: 'datetime', hint: 'Usada na contagem regressiva.' },
      { key: 'wedding_date_label', label: 'Data por extenso (ex.: 25 de Novembro, 2025)' },
      { key: 'location_name', label: 'Local' },
      { key: 'location_city', label: 'Cidade' },
    ],
  },
  {
    title: 'Nossa História (início)',
    fields: [
      { key: 'story_title', label: 'Título' },
      { key: 'story_body', label: 'Texto', type: 'textarea' },
      { key: 'journey_title', label: 'Título da jornada' },
      { key: 'journey_subtitle', label: 'Subtítulo da jornada', type: 'textarea' },
    ],
  },
  {
    title: 'RSVP',
    fields: [
      { key: 'rsvp_title', label: 'Título' },
      { key: 'rsvp_subtitle', label: 'Subtítulo', type: 'textarea' },
      { key: 'rsvp_deadline_label', label: 'Prazo (ex.: Confirme até 15 de Outubro)' },
    ],
  },
  {
    title: 'Presentes e Galeria',
    fields: [
      { key: 'gifts_title', label: 'Título dos presentes' },
      { key: 'gifts_subtitle', label: 'Subtítulo dos presentes', type: 'textarea' },
      { key: 'gallery_title', label: 'Título da galeria' },
      { key: 'gallery_subtitle', label: 'Subtítulo da galeria', type: 'textarea' },
      { key: 'messages_title', label: 'Título do mural' },
      { key: 'messages_subtitle', label: 'Subtítulo do mural', type: 'textarea' },
    ],
  },
  {
    title: 'PIX (cota da lua de mel)',
    fields: [
      { key: 'pix_key', label: 'Chave PIX', hint: 'CPF, e-mail, telefone ou chave aleatória.' },
      { key: 'pix_name', label: 'Nome do beneficiário' },
      { key: 'pix_city', label: 'Cidade' },
    ],
  },
  {
    title: 'Contato e redes',
    fields: [
      { key: 'instagram', label: 'Instagram (URL)' },
      { key: 'contact_whatsapp', label: 'WhatsApp (só números, com DDD)' },
      { key: 'contact_email', label: 'E-mail de contato' },
    ],
  },
];

export default function SettingsAdmin() {
  const [values, setValues] = useState<Map | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Map>('/settings')
      .then((data) => setValues({ ...SETTINGS_DEFAULTS, ...data }))
      .catch(() => setValues({ ...SETTINGS_DEFAULTS }));
  }, []);

  function set(key: string, v: string) {
    setValues((prev) => ({ ...(prev ?? {}), [key]: v }));
  }

  async function save() {
    if (!values) return;
    setSaving(true);
    setToast(null);
    try {
      await api.put('/admin/settings', values);
      setToast('Configurações salvas!');
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast('Erro ao salvar: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (!values) return <Loader />;

  // datetime-local aceita "YYYY-MM-DDTHH:MM"
  const dtValue = (values.wedding_date ?? '').slice(0, 16);

  return (
    <div className="a-page">
      <div className="a-page-head">
        <div>
          <h1>Configurações</h1>
          <p>Textos, data, PIX, contato e moderação.</p>
        </div>
        <button className="a-btn a-btn-primary" onClick={save} disabled={saving}>
          <Icon name="check" size={16} /> {saving ? 'Salvando…' : 'Salvar tudo'}
        </button>
      </div>

      {toast && <div className={`a-toast ${toast.startsWith('Erro') ? 'a-toast-err' : 'a-toast-ok'}`}>{toast}</div>}

      {/* Moderação — destaque */}
      <div className="a-card">
        <strong>Moderação de envios dos convidados</strong>
        <p style={{ color: 'var(--text-soft)', fontSize: 'var(--fs-sm)', margin: 'var(--space-2) 0 var(--space-4)' }}>
          Ligado: fotos/recados só aparecem no site depois da sua aprovação. Desligado: aparecem na hora.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <label className="a-switch">
            <input
              type="checkbox"
              checked={values.moderate_photos === '1'}
              onChange={(e) => set('moderate_photos', e.target.checked ? '1' : '0')}
            />
            <span className="a-switch-track" />
            <span>Aprovar fotos antes de publicar</span>
          </label>
          <label className="a-switch">
            <input
              type="checkbox"
              checked={values.moderate_messages === '1'}
              onChange={(e) => set('moderate_messages', e.target.checked ? '1' : '0')}
            />
            <span className="a-switch-track" />
            <span>Aprovar recados antes de publicar</span>
          </label>
        </div>
      </div>

      {GROUPS.map((group) => (
        <div key={group.title} className="a-card">
          <strong>{group.title}</strong>
          <div style={{ marginTop: 'var(--space-4)' }}>
            {group.fields.map((f) => (
              <div key={f.key} className="a-field">
                <label htmlFor={f.key}>{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea id={f.key} value={values[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)} />
                ) : f.type === 'datetime' ? (
                  <input
                    id={f.key}
                    type="datetime-local"
                    value={dtValue}
                    onChange={(e) => set('wedding_date', e.target.value)}
                  />
                ) : (
                  <input id={f.key} type="text" value={values[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)} />
                )}
                {f.hint && (
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-faint)' }}>{f.hint}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div>
        <button className="a-btn a-btn-primary" onClick={save} disabled={saving}>
          <Icon name="check" size={16} /> {saving ? 'Salvando…' : 'Salvar tudo'}
        </button>
      </div>
    </div>
  );
}
