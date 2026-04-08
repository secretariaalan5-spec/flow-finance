import type { Transaction } from './storage';
import { generateId } from './storage';
import { detectCategory } from './categories';

function extractValue(text: string): number | null {
  const match = text.match(/(?:R\$\s*)?(\d+[.,]?\d*)/);
  if (!match) return null;
  return parseFloat(match[1].replace(',', '.'));
}

function detectType(text: string): 'receita' | 'despesa' {
  const lower = text.toLowerCase();
  const incomeWords = ['recebi', 'ganhei', 'entrou', 'salário', 'salario', 'rendimento', 'dividendo', 'freelance', 'freela', 'pagamento'];
  if (incomeWords.some(w => lower.includes(w))) return 'receita';
  return 'despesa';
}

export function parseTransaction(text: string): Transaction | null {
  const valor = extractValue(text);
  if (!valor || valor <= 0) return null;

  const tipo = detectType(text);
  const categoria = detectCategory(text, tipo);

  return {
    id: generateId(),
    tipo,
    valor,
    categoria,
    descricao: text.trim(),
    data: new Date().toISOString(),
    synced: false,
  };
}
