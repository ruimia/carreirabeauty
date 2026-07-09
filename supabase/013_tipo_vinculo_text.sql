-- Libera tipo_vinculo para text (permite Estágio e Menor Aprendiz além do enum original)
ALTER TABLE jobs ALTER COLUMN tipo_vinculo TYPE text;
ALTER TABLE professionals ALTER COLUMN tipo_vinculo TYPE text;
