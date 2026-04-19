

# Onda 1 — Vida ao Porquinho

Vou começar pela onda de mais impacto visual. Quando aprovar, implemento e seguimos para Onda 2 e 3 nas mensagens seguintes.

## O que muda

**1. Piscar natural**
- Pálpebras animadas fechando a cada 4-7s (intervalo aleatório)
- Piscadas duplas ocasionais (10% de chance) para dar naturalidade

**2. Olhos que seguem o toque/cursor**
- Pupilas se deslocam ~3px na direção do mouse/dedo
- Listener global em `mousemove`/`touchmove` no `PiggyAvatar`
- Suavização com `framer-motion` (`useSpring`)

**3. Novos humores**
Adicionar ao tipo `PiggyMood`:
- `sleepy` — após 22h, olhos semi-fechados, balanço lento
- `excited` — primeira abertura do dia pela manhã, pulinhos
- `thinking` — durante chamada da IA, mãozinha no queixo
- `proud` — streak ≥ 7 dias, peito estufado com brilho dourado

**4. Reações especiais (efeitos sobrepostos)**
Novo componente `PiggyEffects.tsx` que renderiza por cima do avatar:
- **Confete dourado** quando registra receita > R$500
- **Lágrimas** caindo quando saldo fica negativo
- **Corações** flutuando ao bater meta de economia
- **Tremor** + ícone de alerta em gasto acima da média da categoria

**5. Frases dinâmicas contextuais**
Nova função `getContextualMessage()` em `piggyState.ts`:
- Manhã: "Bom dia! Pronto pra cuidar do dinheiro hoje?"
- Tarde: "Como tá indo o dia? Já gastou algo?"
- Noite: "Hora de revisar o dia, né?"
- Madrugada: "Ué, ainda acordado? Cuidado com compras impulsivas..."
- Sexta: "Sextou! Só não estoura o orçamento, hein 👀"
- Saldo alto: "Tô orgulhoso de você! 💚"
- Streak alto: "{N} dias seguidos! Você é incrível!"

## Arquivos afetados

- `src/components/PiggyAvatar.tsx` — piscar, olhos rastreadores, novos humores, animações
- `src/components/PiggyEffects.tsx` — **novo** — confete/lágrimas/corações
- `src/lib/piggyState.ts` — `getContextualMessage()`, detecção de "gasto acima da média"
- `src/pages/Index.tsx` — usar novo humor `thinking` durante análise, disparar efeitos em eventos
- `src/hooks/useTransactions.ts` — expor "última transação" para acionar efeitos

## Detalhes técnicos rápidos

- Piscar: novo elemento `<rect>` SVG sobre os olhos com `scaleY` animado de 1→0→1
- Rastreamento de olhos: `useEffect` global com `requestAnimationFrame` throttle
- Confete: 20-30 partículas SVG com `framer-motion` (rotação + queda)
- Sem libs novas — tudo em `framer-motion` que já existe

Após esta onda, na próxima eu faço a **Onda 2 (sensação nativa: haptic, swipe-to-delete, pull-to-refresh)**.

