import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string | undefined;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '[Porquinho] Variáveis de ambiente do Supabase não encontradas.\n' +
    'Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no painel da Vercel:\n' +
    'Project Settings → Environment Variables'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);


export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; name: string | null; avatar_url: string | null; created_at: string };
        Insert: { id: string; name?: string | null; avatar_url?: string | null };
        Update: { name?: string | null; avatar_url?: string | null };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          tipo: 'receita' | 'despesa';
          valor: number;
          categoria: string;
          descricao: string;
          data: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          tipo: 'receita' | 'despesa';
          valor: number;
          categoria: string;
          descricao?: string;
          data?: string;
        };
        Update: {
          tipo?: 'receita' | 'despesa';
          valor?: number;
          categoria?: string;
          descricao?: string;
          data?: string;
        };
      };
    };
  };
};
