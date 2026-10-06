import {
  CategoryBudget,
  FinancialBottleneck,
  PredictiveBudgetSummary,
  Transaction,
  TransactionCategory,
} from '../types/finance';

/**
 * Calcula a análise preditiva do orçamento mensal com base na queima diária (Burn Rate)
 */
export function calculatePredictiveBudgetSummary(
  transactions: Transaction[],
  targetMonthlyIncome?: number
): PredictiveBudgetSummary {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Dias no mês atual
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysPassed = Math.max(1, now.getDate());
  const daysRemaining = Math.max(0, totalDaysInMonth - daysPassed);

  // Filtrar transações deste mês
  const monthlyTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date);
    return tDate.getFullYear() === currentYear && tDate.getMonth() === currentMonth;
  });

  const currentIncome = monthlyTransactions
    .filter((t) => t.type === 'income' && t.status === 'completed')
    .reduce((acc, t) => acc + t.amount, 0);

  const completedExpenses = monthlyTransactions
    .filter((t) => t.type === 'expense' && t.status === 'completed')
    .reduce((acc, t) => acc + t.amount, 0);

  const pendingExpenses = monthlyTransactions
    .filter((t) => t.type === 'expense' && t.status === 'pending')
    .reduce((acc, t) => acc + t.amount, 0);

  const currentExpense = completedExpenses;
  const currentBalance = currentIncome - currentExpense;

  // Queima diária de despesas variáveis/concluídas
  const dailyBurnRate = daysPassed > 0 ? completedExpenses / daysPassed : 0;

  // Projeção: Despesas concluídas + projeção de gastos futuros diários + contas pendentes fixadas
  // Reduzimos o peso do burn rate futuro em 30% para não duplicar com contas fixas que já estão pendentes
  const projectedVariableExpenses = dailyBurnRate * daysRemaining * 0.7;
  const projectedExpenseEndMonth = completedExpenses + pendingExpenses + projectedVariableExpenses;

  const baselineIncome = currentIncome > 0 ? currentIncome : targetMonthlyIncome || 25000;
  const projectedBalanceEndMonth = baselineIncome - projectedExpenseEndMonth;
  const isOverBudgetRisk = projectedExpenseEndMonth > baselineIncome;
  const budgetDeficitForecast = isOverBudgetRisk ? projectedExpenseEndMonth - baselineIncome : 0;

  const savingsRateForecastPercent =
    baselineIncome > 0
      ? Math.max(0, Math.round(((baselineIncome - projectedExpenseEndMonth) / baselineIncome) * 100))
      : 0;

  return {
    currentExpense,
    currentIncome,
    currentBalance,
    daysPassed,
    daysRemaining,
    totalDaysInMonth,
    dailyBurnRate: Math.round(dailyBurnRate * 100) / 100,
    projectedExpenseEndMonth: Math.round(projectedExpenseEndMonth * 100) / 100,
    projectedBalanceEndMonth: Math.round(projectedBalanceEndMonth * 100) / 100,
    isOverBudgetRisk,
    budgetDeficitForecast: Math.round(budgetDeficitForecast * 100) / 100,
    savingsRateForecastPercent,
  };
}

/**
 * Detecta gargalos financeiros e vazamentos ocultos de dinheiro na família
 */
export function detectFinancialBottlenecks(
  transactions: Transaction[],
  budgets: CategoryBudget[]
): FinancialBottleneck[] {
  const bottlenecks: FinancialBottleneck[] = [];

  // 1. Gargalo: Assinaturas e Recorrências Duplicadas
  const subTransactions = transactions.filter(
    (t) => t.category === 'Assinaturas & Serviços' && t.type === 'expense'
  );
  const hasSmartfit = subTransactions.some((t) =>
    t.description.toLowerCase().includes('smartfit')
  );
  const hasGympass = subTransactions.some((t) =>
    t.description.toLowerCase().includes('gympass')
  );

  if (hasSmartfit && hasGympass) {
    bottlenecks.push({
      id: 'bot-gym-duplicate',
      title: 'Planos Fitness Duplicados (SmartFit + Gympass)',
      description:
        'A família possui pagamentos ativos e simultâneos de plano corporativo Gympass e mensalidade avulsa SmartFit.',
      severity: 'alta',
      category: 'Assinaturas & Serviços',
      estimatedWasteMonthly: 149.9,
      suggestedAction:
        'Cancelar a assinatura avulsa da SmartFit e utilizar o Gympass corporativo já contratado pela empresa.',
      affectedTransactionsCount: 2,
    });
  }

  // 2. Gargalo: Estouro em Delivery e Alimentação Fora de Casa
  const foodOutTransactions = transactions.filter(
    (t) =>
      t.type === 'expense' &&
      (t.category === 'Alimentação' ||
        t.description.toLowerCase().includes('ifood') ||
        t.description.toLowerCase().includes('restaurante'))
  );
  const totalFoodOut = foodOutTransactions.reduce((acc, t) => acc + t.amount, 0);
  const foodBudget = budgets.find((b) => b.category === 'Alimentação')?.limitAmount || 1400;

  if (totalFoodOut > foodBudget * 0.75) {
    const waste = Math.max(0, totalFoodOut - foodBudget * 0.6);
    bottlenecks.push({
      id: 'bot-food-delivery',
      title: 'Pico de Gastos em Aplicativos de Delivery',
      description: `Os pedidos em aplicativos e jantares fora já somam R$ ${totalFoodOut.toFixed(2)}, consumindo quase o teto total planejado antes da metade do ciclo.`,
      severity: 'alta',
      category: 'Alimentação',
      estimatedWasteMonthly: Math.round(waste),
      suggestedAction:
        'Estabelecer a regra de no máximo 1 delivery aos fins de semana e planejar cardápio semanal familiar antecipado no supermercado.',
      affectedTransactionsCount: foodOutTransactions.length,
    });
  }

  // 3. Gargalo: Múltiplas Plataformas de Streaming Concorrentes
  const streamingCount = subTransactions.filter((t) =>
    ['netflix', 'spotify', 'amazon', 'disney', 'hbo', 'max', 'apple'].some((s) =>
      t.description.toLowerCase().includes(s)
    )
  ).length;

  if (streamingCount >= 3) {
    const totalStreaming = subTransactions.reduce((acc, t) => acc + t.amount, 0);
    bottlenecks.push({
      id: 'bot-streaming-cluster',
      title: 'Sobrecarga de Assinaturas de Streaming e Mídia',
      description: `Foram identificados ${streamingCount} serviços de entretenimento digital ativos debitados mensalmente no cartão.`,
      severity: 'media',
      category: 'Assinaturas & Serviços',
      estimatedWasteMonthly: 90.0,
      suggestedAction:
        'Adotar modelo de rodízio de catálogos: assinar apenas 1 plataforma de vídeo por mês conforme as séries que a família estiver assistindo.',
      affectedTransactionsCount: streamingCount,
    });
  }

  // 4. Gargalo: Categorias com Estouro Iminente ou Realizado
  budgets.forEach((b) => {
    const catSpent = transactions
      .filter((t) => t.category === b.category && t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const percent = b.limitAmount > 0 ? (catSpent / b.limitAmount) * 100 : 0;
    if (percent >= 90 && b.category !== 'Alimentação' && b.category !== 'Investimentos') {
      bottlenecks.push({
        id: `bot-budget-overrun-${b.category}`,
        title: `Teto Orçamentário Ameaçado: ${b.category}`,
        description: `Gastos em ${b.category} atingiram ${percent.toFixed(0)}% do limite planejado (R$ ${catSpent.toFixed(2)} de R$ ${b.limitAmount.toFixed(2)}).`,
        severity: percent > 100 ? 'alta' : 'media',
        category: b.category,
        estimatedWasteMonthly: Math.max(0, catSpent - b.limitAmount),
        suggestedAction: `Congelar gastos discricionários em ${b.category} até a virada da próxima fatura/mês.`,
        affectedTransactionsCount: transactions.filter((t) => t.category === b.category).length,
      });
    }
  });

  return bottlenecks;
}

/**
 * Categorização automática inteligente baseada em palavras-chave bancárias
 */
export function autoCategorizeByText(description: string): {
  category: TransactionCategory;
  type: 'income' | 'expense';
} {
  const d = description.toLowerCase();

  // Receitas
  if (
    d.includes('salario') ||
    d.includes('salário') ||
    d.includes('pro-labore') ||
    d.includes('folha de pag')
  ) {
    return { category: 'Salário', type: 'income' };
  }
  if (
    d.includes('rendimento') ||
    d.includes('dividendo') ||
    d.includes('juros s/ cap') ||
    d.includes('cdb rend')
  ) {
    return { category: 'Rendimentos', type: 'income' };
  }
  if (d.includes('freelance') || d.includes('consultoria') || d.includes('pix recebido extra')) {
    return { category: 'Freelance / Extra', type: 'income' };
  }

  // Despesas
  if (
    d.includes('pao de acucar') ||
    d.includes('carrefour') ||
    d.includes('supermercado') ||
    d.includes('hortifruti') ||
    d.includes('assaí') ||
    d.includes('atacadão')
  ) {
    return { category: 'Supermercado', type: 'expense' };
  }
  if (
    d.includes('ifood') ||
    d.includes('restaurante') ||
    d.includes('mcdonald') ||
    d.includes('burger') ||
    d.includes('padaria') ||
    d.includes('cafeteria')
  ) {
    return { category: 'Alimentação', type: 'expense' };
  }
  if (
    d.includes('posto') ||
    d.includes('combustivel') ||
    d.includes('gasolina') ||
    d.includes('uber') ||
    d.includes('99app') ||
    d.includes('estacionamento') ||
    d.includes('sem parar') ||
    d.includes('veloe')
  ) {
    return { category: 'Transporte', type: 'expense' };
  }
  if (
    d.includes('farmacia') ||
    d.includes('droga raia') ||
    d.includes('drogasil') ||
    d.includes('hospital') ||
    d.includes('laboratorio') ||
    d.includes('sulamerica') ||
    d.includes('unimed') ||
    d.includes('bradesco saude')
  ) {
    return { category: 'Saúde', type: 'expense' };
  }
  if (
    d.includes('colegio') ||
    d.includes('escola') ||
    d.includes('faculdade') ||
    d.includes('curso') ||
    d.includes('material escolar') ||
    d.includes('ingles')
  ) {
    return { category: 'Educação', type: 'expense' };
  }
  if (
    d.includes('netflix') ||
    d.includes('spotify') ||
    d.includes('amazon prime') ||
    d.includes('disney') ||
    d.includes('smartfit') ||
    d.includes('gympass') ||
    d.includes('youtube premium') ||
    d.includes('icloud')
  ) {
    return { category: 'Assinaturas & Serviços', type: 'expense' };
  }
  if (
    d.includes('condominio') ||
    d.includes('enel') ||
    d.includes('sabesp') ||
    d.includes('aluguel') ||
    d.includes('iptu') ||
    d.includes('gas natural') ||
    d.includes('vivo fibra') ||
    d.includes('claro')
  ) {
    return { category: 'Moradia', type: 'expense' };
  }
  if (
    d.includes('cinema') ||
    d.includes('ingresso') ||
    d.includes('hotel') ||
    d.includes('resort') ||
    d.includes('parque') ||
    d.includes('teatro')
  ) {
    return { category: 'Lazer & Viagem', type: 'expense' };
  }
  if (
    d.includes('tesouro') ||
    d.includes('cdb') ||
    d.includes('fii') ||
    d.includes('xp invest') ||
    d.includes('previdencia')
  ) {
    return { category: 'Investimentos', type: 'expense' };
  }
  if (
    d.includes('zara') ||
    d.includes('riachuelo') ||
    d.includes('renner') ||
    d.includes('centauro') ||
    d.includes('decathlon') ||
    d.includes('shein')
  ) {
    return { category: 'Compras & Vestuário', type: 'expense' };
  }

  return { category: 'Outros', type: 'expense' };
}
