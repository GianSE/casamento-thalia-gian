import { useState, type FormEvent } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useSeo } from '../hooks/useSeo';
import { api } from '../lib/api';
import { Icon } from '../components/Icon/Icon';
import styles from './RsvpPage.module.css';

export default function RsvpPage() {
  const s = useSettings();
  useSeo({ title: 'Confirmar Presença', description: s.rsvp_subtitle });

  const [name, setName] = useState('');
  const [attending, setAttending] = useState<boolean | null>(null);
  const [companions, setCompanions] = useState(0);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || attending === null) {
      setError('Preencha seu nome e diga se poderá comparecer.');
      return;
    }
    setSending(true);
    setError(null);
    try {
      await api.post('/rsvp', {
        name: name.trim(),
        attending,
        companions: attending ? companions : 0,
        message: message.trim(),
      });
      setDone(true);
    } catch (err) {
      setError('Não foi possível enviar: ' + (err as Error).message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <header className={styles.head}>
          <span className="eyebrow">Confirmação de presença</span>
          <h1 className={styles.title}>{s.rsvp_title}</h1>
          <p className={styles.subtitle}>{s.rsvp_subtitle}</p>
          {s.rsvp_deadline_label && (
            <p className={styles.deadline}>
              <Icon name="clock" size={15} /> {s.rsvp_deadline_label}
            </p>
          )}
        </header>

        {done ? (
          <div className={styles.success}>
            <div className={styles.successIcon}>
              <Icon name={attending ? 'checkCircle' : 'heart'} size={44} />
            </div>
            <h2>{attending ? 'Presença confirmada!' : 'Sentiremos sua falta'}</h2>
            <p>
              {attending
                ? `Que alegria, ${name.split(' ')[0]}! Mal podemos esperar para celebrar com você.`
                : `Obrigado por avisar, ${name.split(' ')[0]}. Você estará em nossos corações.`}
            </p>
          </div>
        ) : (
          <form className={styles.card} onSubmit={handleSubmit}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.field}>
              <label htmlFor="name">Nome completo</label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite seu nome completo"
                maxLength={160}
                required
              />
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Você virá?</span>
              <div className={styles.choices}>
                <button
                  type="button"
                  className={`${styles.choice} ${attending === true ? styles.choiceOn : ''}`}
                  onClick={() => setAttending(true)}
                >
                  <Icon name="checkCircle" size={20} /> Sim, com certeza!
                </button>
                <button
                  type="button"
                  className={`${styles.choice} ${attending === false ? styles.choiceOff : ''}`}
                  onClick={() => setAttending(false)}
                >
                  <Icon name="xCircle" size={20} /> Infelizmente não poderei
                </button>
              </div>
            </div>

            {attending && (
              <div className={styles.field}>
                <label htmlFor="companions">Quantos acompanhantes?</label>
                <div className={styles.selectWrap}>
                  <select
                    id="companions"
                    value={companions}
                    onChange={(e) => setCompanions(Number(e.target.value))}
                  >
                    <option value={0}>Vou sozinho(a)</option>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'acompanhante' : 'acompanhantes'}
                      </option>
                    ))}
                  </select>
                  <Icon name="chevronDown" size={18} className={styles.selectIcon} />
                </div>
              </div>
            )}

            <div className={styles.field}>
              <label htmlFor="message">
                Restrições alimentares / mensagem <span className={styles.optional}>(opcional)</span>
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="Alguma restrição alimentar ou recado para os noivos?"
              />
            </div>

            <button type="submit" className={styles.submit} disabled={sending}>
              {sending ? 'Enviando…' : 'Enviar confirmação'}
              {!sending && <Icon name="arrowRight" size={18} />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
