-- Substitui a timeline de exemplo do 0002 pela história real do Gian e da Thalia.
--
-- Só remove as três linhas que vieram do seed (identificadas pelo título
-- original). Qualquer item criado ou renomeado pelos noivos no /admin
-- sobrevive — a migração não apaga o que não foi ela que escreveu.

DELETE FROM timeline
 WHERE title IN ('Como nos conhecemos', 'Primeiro encontro', 'O pedido');

INSERT INTO timeline (date_label, title, body, sort_order) VALUES
  (
    '11 de abril de 2024',
    'Onde tudo começou',
    'Um churrasco de amigos da faculdade, justo na véspera do primeiro dia de aula da Thalia. A conversa foi fácil desde o começo, os números foram trocados e ficou combinado de sair qualquer dia desses. A nossa amiga Maria deu aquele empurrãozinho de que a gente precisava.',
    1
  ),
  (
    '18 de maio de 2024',
    'Quer namorar comigo?',
    'A Thalia gosta de jogos simples, então o Gian fez um só para ela. Ela jogou sem desconfiar de nada até completar a última fase — e foi ali, na tela, que a pergunta apareceu. No mesmo dia ele conheceu a família dela na igreja.',
    2
  ),
  (
    '11 de julho de 2024',
    'A aliança na caixa de bombom',
    'Às vésperas do fim de semana do Cursilho — o mesmo que a Thalia já havia feito e que levou o Gian a buscar Cristo mais de perto —, a aliança de namoro chegou escondida dentro de uma caixa de bombom, lacrada por ele mesmo.',
    3
  ),
  (
    'Ao longo do namoro',
    'Duas famílias, uma história',
    'Ubatuba-SP conheceu a Thalia. Cornélio Procópio-PR virou a segunda casa do Gian, fim de semana após fim de semana. Entre conversas difíceis e muitos momentos felizes, cada um foi virando parte do outro sem que precisasse ser dito.',
    4
  ),
  (
    NULL, -- data do pedido: preencher em /admin/historia
    'O pedido de noivado',
    'Quando ele veio, não foi surpresa para ninguém — muito menos para nós. Não havia outro caminho: o coração já tinha escolhido bem antes de a pergunta ser feita.',
    5
  );

-- Subtítulo da seção, agora falando desta história e não de uma genérica.
UPDATE settings
   SET value = 'De um churrasco na véspera do primeiro dia de aula até o sim que nos trouxe até aqui.'
 WHERE key = 'journey_subtitle';
