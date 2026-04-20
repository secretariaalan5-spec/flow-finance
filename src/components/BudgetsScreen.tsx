import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBudgets } from '@/hooks/useBudgets';
import { useTransactions } from '@/hooks/useTransactions';
import { EXPENSE_CATEGORIES } from '@/lib/categories';
import { getCategoryEmoji } from '@/lib/categories';
import { Plus, Trash2, Check, Target } from 'lucide-react';
import { toast } from 'sonner';

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function BudgetsScreen() {
  const { budgets, budgetStatuses, loading, upsert, remove } = useBudgets();
  const { categoryTotals } = useTransactions();
  const [showForm, setShowForm] = useState(false);
  const [selectedCat, setSelectedCat] = useState('Alimentação');
  const [limitValue, setLimitValue] = useState('');
  const [saving, setSaving] = useState(false);

  // Categorias que ainda não têm limite definido
  const usedCategories = new Set(budgets.map(b => b.categoria));
  const availableCategories = EXPENSE_CATEGORIES.filter(c => !usedCategories.has(c.label));

  const handleSave = async () => {
    const v = parseFloat(limitValue.replace(',', '.'));
    if (!v || v <= 0) { toast.error('Digite um valor válido'); return; }
    setSaving(true);
    await upsert(selectedCat, v);
    setLimitValue('');
    setShowForm(false);
    setSaving(false);
    toast.success(`Limite de R$ ${formatCurrency(v)} definido para ${selectedCat}!`);
  };

  const handleDelete = async (id: string, categoria: string) => {
    await remove(id);
    toast(`Limite de ${categoria} removido`);
  };

  return (
    <div className="space-y-5">
      {/* Título */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="font-display text-3xl font-bold text-foreground">Limites</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Defina quanto pode gastar por categoria e o porquinho te avisa quando estiver perto do limite.
        </p>
      </div>

      {/* Botão de adicionar */}
      {availableCategories.length > 0 && (
        <button
          onClick={() => {
            setSelectedCat(availableCategories[0].label);
            setShowForm(true);
          }}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-primary/30 text-primary font-semibold text-sm tap-scale hover:bg-primary/5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar Limite de Categoria
        </button>
      )}

      {/* Formulário de novo limite */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="quiet-card p-4 space-y-4">
              <p className="text-sm font-bold text-foreground">Novo Limite</p>

              {/* Seleção de categoria */}
              <div className="grid grid-cols-3 gap-2">
                {availableCategories.map(cat => (
                  <button
                    key={cat.label}
                    onClick={() => setSelectedCat(cat.label)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all tap-scale text-xs font-semibold ${
                      selectedCat === cat.label
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card border-border/50 text-muted-foreground'
                    }`}
                  >
                    <span className="text-xl">{cat.emoji}</span>
                    <span className="truncate w-full text-center leading-tight">{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Input de valor */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold">
                  R$
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={limitValue}
                  onChange={e => setLimitValue(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-muted/40 border border-border/50 text-foreground text-lg font-semibold outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              {/* Ações */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 rounded-2xl bg-muted/50 text-muted-foreground font-semibold text-sm tap-scale"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !limitValue}
                  className="flex-1 py-3 rounded-2xl gradient-primary text-primary-foreground font-bold text-sm tap-scale flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de limites existentes */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-2xl bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : budgetStatuses.length === 0 ? (
        <div className="quiet-card p-10 text-center space-y-2 border-2 border-dashed border-muted">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-sm font-bold text-foreground">Nenhum limite criado</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Escolha uma categoria acima e diga o máximo que você quer gastar. Se você exagerar, o porquinho te manda uma notificação no celular!
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {budgetStatuses.map((b, i) => {
            const budget = budgets.find(bd => bd.categoria === b.categoria);
            const barWidth = Math.min(b.percentual, 100);
            const barColor =
              b.status === 'exceeded' ? 'hsl(8 70% 52%)' :
              b.status === 'warning'  ? 'hsl(35 85% 52%)' :
                                        'hsl(145 55% 40%)';
            const statusLabel =
              b.status === 'exceeded' ? '🚨 Limite ultrapassado' :
              b.status === 'warning'  ? '⚠️ Atenção, quase lá' :
                                        '✅ Dentro do limite';

            return (
              <motion.div
                key={b.categoria}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="quiet-card p-4"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{getCategoryEmoji(b.categoria)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-foreground">{b.categoria}</p>
                      <button
                        onClick={() => budget && handleDelete(budget.id, b.categoria)}
                        className="p-1.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors tap-scale"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] mt-0.5" style={{ color: barColor }}>
                      {statusLabel}
                    </p>
                  </div>
                </div>

                {/* Barra */}
                <div className="h-2.5 rounded-full overflow-hidden bg-muted/40 mb-2">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 0.8, delay: i * 0.06 + 0.2, ease: [0.22, 1, 0.36, 1] }}
                    style={{ background: barColor }}
                  />
                </div>

                {/* Valores */}
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-muted-foreground">
                    Gasto: <span className="font-bold" style={{ color: barColor }}>
                      R$ {formatCurrency(b.gasto)}
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Limite: <span className="font-semibold text-foreground">
                      R$ {formatCurrency(b.limite)}
                    </span>
                  </span>
                </div>

                {b.status === 'exceeded' && (
                  <div className="mt-2 py-2 px-3 rounded-xl text-xs font-semibold" style={{ background: 'hsl(8 80% 96%)', color: 'hsl(8 70% 40%)' }}>
                    Você gastou R$ {formatCurrency(b.gasto - b.limite)} a mais nessa categoria este mês.
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
