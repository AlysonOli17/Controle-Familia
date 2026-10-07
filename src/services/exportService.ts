import {
  BankAccount,
  FamilyMember,
  FinancialBottleneck,
  PredictiveBudgetSummary,
  SavingsGoal,
  Transaction,
} from '../types/finance';

/**
 * Exporta as transações financeiras em formato CSV com compatibilidade UTF-8 para Excel / Google Sheets
 */
export function exportTransactionsToCSV(
  transactions: Transaction[],
  _accounts: any[], // unused
  members: FamilyMember[]
): void {

  const memberMap = new Map(members.map((m) => [m.id, m.name]));

  const headers = [
    'ID',
    'Data',
    'Descrição',
    'Tipo',
    'Categoria',
    'Valor (R$)',
    'Forma de Pagamento',

    'Membro Responsável',
    'Status',
    'Recorrente',
    'Notas',
  ];

  const escapeCSV = (value: string | number | undefined | null) => {
    if (value === undefined || value === null) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = transactions.map((t) => [
    escapeCSV(t.id),
    escapeCSV(t.date),
    escapeCSV(t.description),
    escapeCSV(t.type === 'income' ? 'Receita' : 'Despesa'),
    escapeCSV(t.category),
    escapeCSV(t.amount.toFixed(2).replace('.', ',')),
    escapeCSV(t.paymentMethod),

    escapeCSV(memberMap.get(t.memberId) || 'Família'),
    escapeCSV(t.status === 'completed' ? 'Concluída' : 'Pendente'),
    escapeCSV(t.isRecurring ? 'Sim' : 'Não'),
    escapeCSV(t.notes || ''),
  ]);

  // Incluir BOM \uFEFF para forçar o Excel a abrir com codificação UTF-8
  const csvContent =
    '\uFEFF' +
    [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const now = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `FinFamily_Extrato_Financeiro_${now}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Dispara a impressão/geração de PDF nativa do relatório financeiro consolidado
 */
export function printFinancialReportPDF(
  summary: PredictiveBudgetSummary,
  bottlenecks: FinancialBottleneck[],
  goals: SavingsGoal[],
  transactions: Transaction[],
  members: FamilyMember[]
): void {
  // Cria uma janela dedicada formatada para impressão profissional em PDF
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const memberMap = new Map(members.map((m) => [m.id, m.name]));

  const completedTxs = transactions.filter((t) => t.status === 'completed');
  const recentExpenses = completedTxs
    .filter((t) => t.type === 'expense')
    .slice(0, 15);

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório Financeiro Familiar - FinFamily</title>
  <style>
    @page { margin: 15mm; size: A4; }
    body {
      font-family: 'Segoe UI', -apple-system, Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      line-height: 1.4;
      margin: 0;
      padding: 20px;
    }
    .header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .brand { font-size: 24px; font-weight: 800; color: #0f172a; }
    .brand span { color: #059669; }
    .doc-info { font-size: 12px; color: #64748b; text-align: right; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
    .metric-card {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px;
      background: #f8fafc;
    }
    .metric-title { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; }
    .metric-value { font-size: 18px; font-weight: 700; margin-top: 4px; font-family: monospace; }
    .text-green { color: #059669; }
    .text-red { color: #dc2626; }
    .text-blue { color: #2563eb; }
    .section-title {
      font-size: 15px;
      font-weight: 700;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 6px;
      margin: 24px 0 12px 0;
      color: #1e293b;
    }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px; }
    th { background: #f1f5f9; text-align: left; padding: 8px; border-bottom: 1px solid #cbd5e1; font-weight: 600; }
    td { padding: 8px; border-bottom: 1px solid #f1f5f9; }
    .td-num { text-align: right; font-family: monospace; }
    .bottleneck-box {
      border-left: 4px solid #f59e0b;
      background: #fffbeb;
      padding: 10px 14px;
      margin-bottom: 10px;
      border-radius: 4px;
      font-size: 12px;
    }
    .goal-progress {
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 4px;
    }
    .goal-fill { height: 100%; background: #059669; }
    .footer {
      margin-top: 40px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      font-size: 11px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">FinFamily <span>Audit</span></div>
      <div style="font-size: 13px; color: #475569;">Relatório Orçamentário e Balanço Consolidado da Família</div>
    </div>
    <div class="doc-info">
      <div>Data de Emissão: <strong>${currentDate}</strong></div>
      <div>Autenticação: Criptografia AES-GCM Local</div>
    </div>
  </div>

  <div class="grid">
    <div class="metric-card">
      <div class="metric-title">Receita Consolidada</div>
      <div class="metric-value text-green">R$ ${summary.currentIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">Despesas Realizadas</div>
      <div class="metric-value text-red">R$ ${summary.currentExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">Projeção Fim do Mês</div>
      <div class="metric-value text-blue">R$ ${summary.projectedExpenseEndMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">Taxa de Poupança Prevista</div>
      <div class="metric-value">${summary.savingsRateForecastPercent}%</div>
    </div>
  </div>

  <div class="section-title">Gargalos e Oportunidades de Economia Detectados</div>
  ${bottlenecks
    .map(
      (b) => `
    <div class="bottleneck-box">
      <strong>${b.title}</strong> · Impacto Estimado: R$ ${b.estimatedWasteMonthly.toFixed(2)}/mês<br/>
      <span style="color: #475569;">${b.description}</span><br/>
      <em>Recomendação: ${b.suggestedAction}</em>
    </div>
  `
    )
    .join('')}

  <div class="section-title">Metas de Economia da Família</div>
  <table>
    <thead>
      <tr>
        <th>Meta / Projeto</th>
        <th>Responsável</th>
        <th class="td-num">Acumulado</th>
        <th class="td-num">Objetivo</th>
        <th class="td-num">% Concluído</th>
      </tr>
    </thead>
    <tbody>
      ${goals
        .map((g) => {
          const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
          return `
        <tr>
          <td><strong>${g.title}</strong></td>
          <td>${memberMap.get(g.assignedTo) || 'Família Toda'}</td>
          <td class="td-num">R$ ${g.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
          <td class="td-num">R$ ${g.targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
          <td class="td-num"><strong>${pct}%</strong></td>
        </tr>
      `;
        })
        .join('')}
    </tbody>
  </table>

  <div class="section-title">Amostra de Lançamentos Recentes</div>
  <table>
    <thead>
      <tr>
        <th>Data</th>
        <th>Descrição</th>
        <th>Categoria</th>
        <th>Membro</th>
        <th class="td-num">Valor (R$)</th>
      </tr>
    </thead>
    <tbody>
      ${recentExpenses
        .map(
          (t) => `
        <tr>
          <td>${t.date.split('-').reverse().join('/')}</td>
          <td>${t.description}</td>
          <td>${t.category}</td>
          <td>${memberMap.get(t.memberId) || 'Família'}</td>
          <td class="td-num" style="color: #dc2626;">- R$ ${t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="footer">
    <div>Documento gerado confidencialmente pelo FinFamily.</div>
    <div>Página 1 de 1 · Protegido por Biometria</div>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
