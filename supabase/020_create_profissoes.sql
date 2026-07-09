-- Cria tabela profissoes (referenciada em migrations anteriores mas nunca criada)
CREATE TABLE IF NOT EXISTS profissoes (
  id     serial primary key,
  nome   text not null unique,
  ativo  boolean not null default true,
  ordem  int not null default 99
);

-- Popula com as profissões padrão
INSERT INTO profissoes (nome, ativo, ordem) VALUES
  ('Cabeleireiro(a)',                 true,  1),
  ('Manicure/Pedicure',               true,  2),
  ('Esteticista',                     true,  3),
  ('Maquiador(a)',                    true,  4),
  ('Barbeiro',                        true,  5),
  ('Massoterapeuta',                  true,  6),
  ('Designer de sobrancelha/cílios',  true,  7),
  ('Depilador(a)',                    true,  8),
  ('Podólogo(a)',                     true,  9),
  ('Recepcionista',                   true, 10),
  ('Auxiliar/assistente',             true, 11),
  ('Micropigmentista',                true, 12)
ON CONFLICT (nome) DO NOTHING;
