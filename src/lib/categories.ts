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

const CUSTOM_CATEGORIES_KEY = "piggy_custom_categories";

export function getCustomCategories(): CategoryDef[] {
  try {
    const data = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveCustomCategory(label: string, emoji: string) {
  const custom = getCustomCategories();
  // Evita duplicata local
  if (!custom.some(c => c.label.toLowerCase() === label.toLowerCase())) {
    custom.push({ label, emoji, keywords: [] });
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(custom));
  }
}

export function getAllCategories(tipo: 'receita' | 'despesa'): CategoryDef[] {
  const base = tipo === 'receita' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const custom = getCustomCategories();
  return [...base, ...custom];
}

export function detectCategory(text: string, tipo: 'receita' | 'despesa'): string {
  const lower = text.toLowerCase();
  const categories = getAllCategories(tipo);

  for (const cat of categories) {
    if (cat.keywords && cat.keywords.some(k => lower.includes(k))) return cat.label;
  }
  return 'Outros';
}

export function getCategoryEmoji(categoria: string): string {
  const all = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES, ...getCustomCategories()];
  return all.find(c => c.label.toLowerCase() === categoria.toLowerCase())?.emoji || '📦';
}
