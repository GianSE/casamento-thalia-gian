import { useState, useEffect, type FormEvent } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useSeo } from '../hooks/useSeo';
import { api, imgUrl, imgSrcSet } from '../lib/api';
import { SectionHeader } from '../components/SectionHeader/SectionHeader';
import { Reveal } from '../components/Reveal/Reveal';
import { Icon } from '../components/Icon/Icon';
import { EmptyState } from '../components/EmptyState/EmptyState';
import type { Gift, Message } from '../types';
import styles from './PresentesPage.module.css';

export default function PresentesPage() {
  const s = useSettings();
  useSeo({ title: 'Presentes', description: s.gifts_subtitle });

  const [gifts, setGifts] = useState<Gift[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pixOpen, setPixOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Formulário do mural
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    api.get<Gift[]>('/gifts').then(setGifts).catch(() => {});
    api.get<Message[]>('/messages').then(setMessages).catch(() => {});
  }, []);

  async function copyPix() {
    try {
      await navigator.clipboard.writeText(s.pix_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard indisponível */
    }
  }

  async function submitMessage(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    setSending(true);
    setFeedback(null);
    try {
      const res = await api.post<{ status: string }>('/messages', {
        name: name.trim(),
        message: text.trim(),
      });
      if (res.status === 'pending') {
        setFeedback('Recado enviado! Ele aparecerá no mural após a aprovação dos noivos. 🤍');
      } else {
        setFeedback('Obrigado pelo seu recado! 🤍');
        // `_` fura o cache de borda (60s): sem isso o convidado recarregava o
        // mural e não encontrava o próprio recado.
        const fresh = await api
          .get<Message[]>(`/messages?_=${Date.now()}`)
          .catch(() => messages);
        setMessages(fresh);
      }
      setName('');
      setText('');
    } catch (err) {
      setFeedback('Não foi possível enviar: ' + (err as Error).message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={styles.page}>
      {/* ---------- Presentes ---------- */}
      <section className={`container ${styles.section}`}>
        <SectionHeader eyebrow="Lista" title={s.gifts_title} subtitle={s.gifts_subtitle} />

        <div className={styles.giftGrid}>
          {gifts.map((g, i) => (
            <Reveal key={g.id} delay={i * 0.06}>
              <article className={styles.giftCard}>
                {g.image_id ? (
                  <div className={styles.giftMedia}>
                    <img
                      src={imgUrl(g.image_id, 640)}
                      srcSet={imgSrcSet(g.image_id, [320, 480, 640])}
                      sizes="(max-width: 768px) 92vw, 360px"
                      alt={g.title}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ) : (
                  <div className={`${styles.giftMedia} ${styles.giftMediaEmpty}`} aria-hidden="true">
                    <Icon name={g.kind === 'pix' ? 'heart' : 'gift'} size={40} />
                  </div>
                )}
                <div className={styles.giftBody}>
                  <h3 className={styles.giftTitle}>{g.title}</h3>
                  {g.description && <p className={styles.giftDesc}>{g.description}</p>}
                  {g.kind === 'pix' ? (
                    <button
                      type="button"
                      className={styles.giftCta}
                      onClick={() => setPixOpen(true)}
                    >
                      {g.cta_label || 'Contribuir via PIX'} <Icon name="arrowRight" size={16} />
                    </button>
                  ) : (
                    g.link_url && (
                      <a
                        href={g.link_url}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.giftCta}
                      >
                        {g.cta_label || 'Ver lista'} <Icon name="arrowRight" size={16} />
                      </a>
                    )
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- Mural de Recados ---------- */}
      <section className={styles.wall}>
        <div className="container">
          <SectionHeader
            eyebrow="Deixe seu carinho"
            title={s.messages_title}
            subtitle={s.messages_subtitle}
            tone="dark"
          />

          <form className={styles.wallForm} onSubmit={submitMessage}>
            <div className={styles.field}>
              <label htmlFor="msg-name">Seu nome</label>
              <input
                id="msg-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={120}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="msg-text">Sua mensagem</label>
              <textarea
                id="msg-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                maxLength={800}
                required
              />
            </div>
            <button type="submit" className={styles.wallSubmit} disabled={sending}>
              {sending ? 'Enviando…' : 'Deixar recado'}
              {!sending && <Icon name="heart" size={16} />}
            </button>
            {feedback && <p className={styles.feedback}>{feedback}</p>}
          </form>

          {messages.length === 0 ? (
            <EmptyState
              icon="quote"
              title="Nenhum recado ainda"
              description="Seja o primeiro a deixar uma mensagem carinhosa para os noivos."
            />
          ) : (
            <div className={styles.msgGrid}>
              {messages.map((m, i) => (
                <Reveal key={m.id} delay={(i % 6) * 0.04}>
                  <blockquote className={styles.msgCard}>
                    <Icon name="quote" size={22} className={styles.msgQuote} />
                    <p>{m.message}</p>
                    <cite>— {m.name}</cite>
                  </blockquote>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- Modal PIX ---------- */}
      {pixOpen && (
        <div className={styles.modal} onClick={() => setPixOpen(false)} role="dialog" aria-modal="true">
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setPixOpen(false)} aria-label="Fechar">
              <Icon name="close" size={22} />
            </button>
            <div className={styles.modalIcon}>
              <Icon name="heart" size={28} />
            </div>
            <h3 className={styles.modalTitle}>Cota da Lua de Mel</h3>
            {s.pix_key ? (
              <>
                <p className={styles.modalHint}>Use a chave PIX abaixo para contribuir:</p>
                <div className={styles.pixKey}>
                  <span>{s.pix_key}</span>
                  <button type="button" onClick={copyPix} aria-label="Copiar chave PIX">
                    <Icon name={copied ? 'check' : 'copy'} size={18} />
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <p className={styles.pixName}>
                  {s.pix_name}
                  {s.pix_city ? ` · ${s.pix_city}` : ''}
                </p>
              </>
            ) : (
              <p className={styles.modalHint}>
                A chave PIX ainda não foi configurada. Em breve os noivos disponibilizarão os dados.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
