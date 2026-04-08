import { motion } from 'framer-motion';
import { useTransactions } from '@/hooks/useTransactions';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = [
  'hsl(160, 60%, 45%)', 'hsl(260, 50%, 60%)', 'hsl(200, 70%, 50%)',
  'hsl(40, 85%, 55%)', 'hsl(0, 65%, 55%)', 'hsl(320, 50%, 55%)',
  'hsl(180, 50%, 45%)', 'hsl(30, 70%, 50%)',
];

const CATEGORY_LABELS: Record<string, string> = {
  'alimentação': '🍔 Alimentação',
  'transporte': '🚗 Transporte',
  'moradia': '🏠 Moradia',
  'saúde': '💊 Saúde',
  'educação': '📚 Educação',
  'lazer': '🎮 Lazer',
  'vestuário': '👕 Vestuário',
  'outros': '📦 Outros',
};

export default function CategoryChart() {
  const { categoryTotals } = useTransactions();

  const data = Object.entries(categoryTotals).map(([name, value]) => ({
    name: CATEGORY_LABELS[name] || name,
    value,
  }));

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card p-5 text-center"
      >
        <p className="text-muted-foreground text-sm">Nenhuma despesa registrada este mês</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-5"
    >
      <h3 className="font-heading font-semibold text-sm text-muted-foreground mb-4">Gastos por Categoria</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => `R$ ${value.toFixed(2)}`}
            contentStyle={{
              background: 'hsl(225, 20%, 14%)',
              border: '1px solid hsl(225, 15%, 20%)',
              borderRadius: '12px',
              fontSize: '12px',
              color: 'hsl(220, 15%, 92%)',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-2 mt-3">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="text-muted-foreground truncate">{item.name}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
