import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

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
