-- Corrige nomes das habilidades para bater exatamente com profissoes.nome
UPDATE habilidades SET profissao = 'Cabeleireiro(a)'  WHERE profissao = 'Cabeleireiro';
UPDATE habilidades SET profissao = 'Manicure/Pedicure' WHERE profissao = 'Manicure / Pedicure';
UPDATE habilidades SET profissao = 'Maquiador(a)'     WHERE profissao = 'Maquiador';

-- Adiciona profissoes que existem nas habilidades mas não na tabela
INSERT INTO profissoes (nome, ativo, ordem)
VALUES
  ('Barbeiro',          true, 20),
  ('Podólogo(a)',       true, 21),
  ('Micropigmentista',  true, 22)
ON CONFLICT (nome) DO NOTHING;

-- Corrige habilidades para usar o nome exato das novas profissões
UPDATE habilidades SET profissao = 'Podólogo(a)' WHERE profissao = 'Podólogo';
