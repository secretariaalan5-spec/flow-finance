import type { Transaction } from './storage';
import { generateId } from './storage';

const CATEGORY_MAP: Record<string, string[]> = {
  'alimentação': ['mercado', 'supermercado', 'comida', 'almoço', 'jantar', 'café', 'lanche', 'restaurante', 'padaria', 'feira', 'açougue', 'pizza', 'hamburguer', 'ifood', 'delivery'],
  'transporte': ['gasolina', 'combustível', 'uber', 'ônibus', 'metrô', 'estacionamento', 'pedágio', 'táxi', '99', 'carro', 'moto', 'passagem'],
  'moradia': ['aluguel', 'condomínio', 'iptu', 'luz', 'energia', 'água', 'gás', 'internet', 'telefone'],
  'saúde': ['farmácia', 'remédio', 'médico', 'dentista', 'hospital', 'consulta', 'exame', 'plano de saúde'],
  'educação': ['escola', 'faculdade', 'curso', 'livro', 'material', 'mensalidade'],
  'lazer': ['cinema', 'show', 'festa', 'viagem', 'bar', 'balada', 'jogo', 'streaming', 'netflix', 'spotify'],
  'vestuário': ['roupa', 'sapato', 'tênis', 'calçado', 'camisa', 'calça', 'vestido'],
  'salário': ['salário', 'salario', 'pagamento', 'freelance', 'freela'],
  'investimento': ['investimento', 'dividendo', 'rendimento', 'juros'],
};

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some(k => lower.includes(k))) return category;
  }
  return 'outros';
}

function extractValue(text: string): number | null {
  // Match patterns like "25", "25.50", "25,50", "R$ 25", "R$25.50"
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
  const categoria = detectCategory(text);

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
