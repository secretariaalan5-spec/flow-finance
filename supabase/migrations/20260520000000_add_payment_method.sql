-- Adiciona a coluna de método de pagamento à tabela de transações
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS metodo_pagamento TEXT CHECK (metodo_pagamento IN ('credito', 'debito', 'pix', 'dinheiro')) DEFAULT 'debito';
