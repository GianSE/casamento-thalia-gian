-- ============================================================
-- Seed inicial — Casamento Gian & Thalia
-- Conteúdo de exemplo (tudo editável depois pelo painel /admin).
-- ============================================================

-- ---------- Configurações padrão ----------
INSERT INTO settings (key, value) VALUES
  ('site_title',        'Gian & Thalia'),
  ('couple_name_1',     'Gian'),
  ('couple_name_2',     'Thalia'),
  ('hero_tagline',      'Uma história de amor, um dia para celebrar.'),
  -- Data/hora do casamento em ISO (usada na contagem regressiva). Ajuste no /admin.
  ('wedding_date',      '2025-11-25T16:00:00'),
  ('wedding_date_label','25 de Novembro, 2025'),
  ('location_name',     'Espaço a definir'),
  ('location_city',     'Brasil'),
  ('story_title',       'Nossa História'),
  ('story_body',        'O que começou como um encontro casual floresceu em uma conexão profunda. Através de aventuras compartilhadas, momentos tranquilos e um amor em comum, construímos uma vida juntos que é ao mesmo tempo ampla e profundamente íntima. Estamos muito felizes em convidar você para celebrar o próximo capítulo da nossa jornada.'),
  ('journey_title',     'Nossa Jornada'),
  ('journey_subtitle',  'De um encontro casual a uma vida inteira de aventuras, esta é a história de como nos encontramos.'),
  ('rsvp_title',        'Confirme sua Presença'),
  ('rsvp_subtitle',     'Gostaríamos muito de contar com a sua presença neste dia tão especial. Por favor, confirme preenchendo o formulário abaixo.'),
  ('rsvp_deadline_label','Confirme até 15 de Outubro'),
  ('gifts_title',       'Presentes'),
  ('gifts_subtitle',    'Sua presença no nosso casamento já é o maior presente. Mas, se desejar nos honrar com uma lembrança, reunimos algumas opções com muito carinho.'),
  ('gallery_title',     'Compartilhe Memórias'),
  ('gallery_subtitle',  'Uma coleção de momentos que levam ao nosso grande dia. Adoraríamos que você contribuísse com suas fotos favoritas conosco.'),
  ('messages_title',    'Mural de Recados'),
  ('messages_subtitle', 'Deixe uma mensagem, um conselho ou um desejo para o nosso futuro juntos.'),
  -- PIX (cota de lua de mel)
  ('pix_key',           ''),
  ('pix_name',          'Gian & Thalia'),
  ('pix_city',          ''),
  -- Contato / redes
  ('instagram',         ''),
  ('contact_email',     ''),
  ('contact_whatsapp',  ''),
  -- Moderação (os noivos ligam/desligam no /admin).
  -- '1' = precisa aprovar antes de aparecer no site; '0' = publica na hora.
  ('moderate_photos',   '1'),
  ('moderate_messages', '1');

-- ---------- Timeline de exemplo ----------
INSERT INTO timeline (date_label, title, body, sort_order) VALUES
  ('Outubro 2018', 'Como nos conhecemos', 'Tudo começou com um café derramado e uma risada compartilhada em uma cafeteria movimentada do centro. O que deveria ser um pedido de desculpas rápido virou horas de conversa.', 1),
  ('Novembro 2018', 'Primeiro encontro', 'Uma noite fresca de outono caminhando à beira da água, seguida de um jantar em um lugar tranquilo onde descobrimos nosso amor em comum por música.', 2),
  ('Dezembro 2023', 'O pedido', 'Em um mirante com vista para o pôr do sol, cercados pelo som do mar, o "sim" mais fácil foi dito.', 3);

-- ---------- Detalhes do grande dia ----------
INSERT INTO events (kind, title, info, info2, sort_order) VALUES
  ('cerimonia', 'Quando', 'Sábado, 25 de Novembro de 2025', 'Cerimônia às 16h · Recepção a seguir', 1);
INSERT INTO events (kind, title, subtitle, info, map_url, sort_order) VALUES
  ('local', 'Onde', 'Espaço a definir', 'Cidade, Brasil', '', 2);

-- ---------- Presentes de exemplo ----------
INSERT INTO gifts (title, description, kind, cta_label, sort_order) VALUES
  ('Cota da Lua de Mel', 'Ajude-nos a criar memórias inesquecíveis na nossa viagem dos sonhos.', 'pix', 'Contribuir via PIX', 1);
INSERT INTO gifts (title, description, kind, link_url, cta_label, sort_order) VALUES
  ('Lista de Presentes', 'Uma seleção de itens para começarmos nossa nova casa.', 'link', '', 'Ver lista', 2);
