-- Adiciona coluna profissao em habilidades
ALTER TABLE habilidades ADD COLUMN IF NOT EXISTS profissao text;

-- Mapeia habilidades existentes para profissões
UPDATE habilidades SET profissao = 'Cabeleireiro' WHERE nome IN (
  'Corte feminino', 'Corte masculino', 'Colorimetria', 'Mechas', 'Balayage',
  'Escova', 'Progressiva / Alisamento', 'Botox capilar', 'Tratamento capilar',
  'Penteados', 'Tranças', 'Extensão capilar'
);

UPDATE habilidades SET profissao = 'Manicure / Pedicure' WHERE nome IN (
  'Manicure', 'Pedicure', 'Unhas em gel', 'Unhas acrílicas', 'Nail art',
  'Esmaltação em gel', 'Alongamento de unhas', 'Fibra de vidro'
);

UPDATE habilidades SET profissao = 'Esteticista' WHERE nome IN (
  'Limpeza de pele', 'Peeling', 'Microagulhamento',
  'Design de sobrancelha', 'Extensão de cílios', 'Lifting de cílios',
  'Massagem relaxante', 'Massagem modeladora', 'Drenagem linfática',
  'Depilação a cera', 'Depilação a laser', 'Pressoterapia', 'Aromaterapia'
);

UPDATE habilidades SET profissao = 'Maquiador' WHERE nome IN (
  'Maquiagem social', 'Maquiagem para noivas', 'Airbrush'
);

UPDATE habilidades SET profissao = 'Barbeiro' WHERE nome IN ('Barboterapia');
UPDATE habilidades SET profissao = 'Podólogo' WHERE nome IN ('Podologia', 'Spa dos pés');
UPDATE habilidades SET profissao = 'Micropigmentista' WHERE nome IN ('Micropigmentação');
