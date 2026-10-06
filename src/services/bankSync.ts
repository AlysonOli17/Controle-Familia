import { BankAccount, Transaction } from '../types/finance';
import { autoCategorizeByText } from './predictiveEngine';

export interface SupportedBank {
  code: string;
  name: string;
  brandColor: string;
  popular: boolean;
  type: 'bank' | 'fintech' | 'investment';
}

export const supportedOpenFinanceBanks: SupportedBank[] = [
  { code: '260', name: 'Nubank', brandColor: '#820ad1', popular: true, type: 'fintech' },
  { code: '341', name: 'Itaú Unibanco', brandColor: '#ec7000', popular: true, type: 'bank' },
  { code: '237', name: 'Bradesco', brandColor: '#cc092f', popular: true, type: 'bank' },
  { code: '077', name: 'Banco Inter', brandColor: '#ff7a00', popular: true, type: 'fintech' },
  { code: '033', name: 'Santander', brandColor: '#e00000', popular: true, type: 'bank' },
  { code: '104', name: 'Caixa Econômica', brandColor: '#005ca9', popular: true, type: 'bank' },
  { code: '102', name: 'XP Investimentos', brandColor: '#000000', popular: true, type: 'investment' },
  { code: '336', name: 'C6 Bank', brandColor: '#242424', popular: true, type: 'fintech' },
  { code: '208', name: 'BTG Pactual', brandColor: '#001e62', popular: false, type: 'investment' },
];

/**
 * Simula a sincronização automática de novas transações bancárias através do Open Finance Brasil
 */
export async function simulateOpenFinanceSync(
  accounts: BankAccount[],
  existingTransactions: Transaction[]
): Promise<{
  updatedAccounts: BankAccount[];
  newTransactions: Transaction[];
  totalSyncedCount: number;
}> {
  // Simular delay de rede de API bancária
  await new Promise((resolve) => setTimeout(resolve, 1400));

  const sampleBankFeed = [
    {
      desc: 'POSTO SHELL AV PAULISTA',
      amount: 185.5,
      method: 'credit_card' as const,
      accountCode: '260',
    },
    {
      desc: 'SUPERMERCADO CARREFOUR EXPRESS',
      amount: 142.3,
      method: 'debit_card' as const,
      accountCode: '341',
    },
    {
      desc: 'PIX RECEBIDO JOAO CONSULTORIA',
      amount: 850.0,
      method: 'pix' as const,
      accountCode: '077',
    },
    {
      desc: 'FARMACIA DROGASIL CENTRO',
      amount: 74.9,
      method: 'pix' as const,
      accountCode: '260',
    },
    {
      desc: 'PADARIA REAL MATINAL',
      amount: 48.0,
      method: 'debit_card' as const,
      accountCode: '341',
    },
  ];

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const newTransactions: Transaction[] = [];

  // Verificar quais transações ainda não foram importadas
  for (const item of sampleBankFeed) {
    const isAlreadyImported = existingTransactions.some(
      (t) => t.description === item.desc && t.amount === item.amount
    );

    if (!isAlreadyImported) {
      const matchAccount =
        accounts.find((a) => a.institutionCode === item.accountCode) || accounts[0];
      const categorization = autoCategorizeByText(item.desc);

      const newTx: Transaction = {
        id: `tx-sync-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        description: item.desc,
        amount: item.amount,
        type: categorization.type,
        category: categorization.category,
        date: dateStr,
        paymentMethod: item.method,
        accountId: matchAccount.id,
        memberId: 'family',
        status: 'completed',
        notes: 'Importado e reconciliado via Open Finance Brasil',
        tags: ['OpenFinance', 'Conciliado'],
        createdAt: now.toISOString(),
      };
      newTransactions.push(newTx);
    }
  }

  // Atualizar lastSyncAt das contas
  const updatedAccounts = accounts.map((acc) => {
    // recalcular saldo ligeiramente baseado em transações se houver novas
    let balanceDelta = 0;
    newTransactions
      .filter((t) => t.accountId === acc.id)
      .forEach((t) => {
        balanceDelta += t.type === 'income' ? t.amount : -t.amount;
      });

    return {
      ...acc,
      balance: Math.round((acc.balance + balanceDelta) * 100) / 100,
      lastSyncAt: new Date().toISOString(),
      syncStatus: 'synced' as const,
    };
  });

  return {
    updatedAccounts,
    newTransactions,
    totalSyncedCount: newTransactions.length,
  };
}
