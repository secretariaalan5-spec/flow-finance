export interface CategoryDef {
  label: string;
  emoji: string;
  keywords: string[];
}

export const EXPENSE_CATEGORIES: CategoryDef[] = [
  { label: 'Alimentação', emoji: '🍔', keywords: ['comida', 'almoço', 'jantar', 'café', 'lanche', 'restaurante', 'padaria', 'pizza', 'hamburguer', 'ifood', 'delivery', 'sushi', 'marmita', 'açaí'] },
  { label: 'Transporte', emoji: '🚗', keywords: ['gasolina', 'combustível', 'uber', 'ônibus', 'metrô', 'estacionamento', 'pedágio', 'táxi', '99', 'carro', 'moto', 'passagem', 'trem'] },
  { label: 'Mercado', emoji: '🛒', keywords: ['mercado', 'supermercado', 'feira', 'açougue', 'hortifruti', 'atacadão', 'atacado'] },
  { label: 'Moradia', emoji: '🏠', keywords: ['aluguel', 'condomínio', 'iptu', 'reforma', 'móveis', 'decoração'] },
  { label: 'Contas', emoji: '📄', keywords: ['luz', 'energia', 'água', 'gás', 'internet', 'telefone', 'celular', 'conta', 'boleto', 'fatura'] },
  { label: 'Lazer', emoji: '🎮', keywords: ['cinema', 'show', 'festa', 'viagem', 'bar', 'balada', 'jogo', 'parque', 'teatro', 'museu', 'passeio'] },
  { label: 'Compras', emoji: '🛍️', keywords: ['roupa', 'sapato', 'tênis', 'calçado', 'camisa', 'calça', 'vestido', 'loja', 'shopping', 'presente', 'eletrônico'] },
  { label: 'Saúde', emoji: '💊', keywords: ['farmácia', 'remédio', 'médico', 'dentista', 'hospital', 'consulta', 'exame', 'plano de saúde', 'academia', 'psicólogo'] },
  { label: 'Educação', emoji: '📚', keywords: ['escola', 'faculdade', 'curso', 'livro', 'material', 'mensalidade', 'apostila', 'aula'] },
  { label: 'Assinaturas', emoji: '📺', keywords: ['netflix', 'spotify', 'streaming', 'amazon prime', 'disney', 'hbo', 'youtube premium', 'assinatura', 'plano'] },
  { label: 'Outros', emoji: '📦', keywords: [] },
];

export const INCOME_CATEGORIES: CategoryDef[] = [
  { label: 'Salário', emoji: '💰', keywords: ['salário', 'salario', 'pagamento', 'holerite', 'contracheque'] },
  { label: 'Freelance', emoji: '💻', keywords: ['freelance', 'freela', 'projeto', 'serviço', 'bico'] },
  { label: 'Extra', emoji: '🤑', keywords: ['extra', 'bônus', 'comissão', 'hora extra', 'gratificação'] },
  { label: 'Presente', emoji: '🎁', keywords: ['presente', 'doação', 'mesada', 'herança'] },
  { label: 'Investimento', emoji: '📈', keywords: ['investimento', 'dividendo', 'rendimento', 'juros', 'ações', 'renda fixa'] },
  { label: 'Outros', emoji: '📦', keywords: [] },
];

export function detectCategory(text: string, tipo: 'receita' | 'despesa'): string {
  const lower = text.toLowerCase();
  const categories = tipo === 'receita' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  for (const cat of categories) {
    if (cat.keywords.some(k => lower.includes(k))) return cat.label;
  }
  return 'Outros';
}

export function getCategoryEmoji(categoria: string): string {
  const all = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
  return all.find(c => c.label === categoria)?.emoji || '📦';
}
