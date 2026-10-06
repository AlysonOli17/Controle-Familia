import React, { useState } from 'react';
import {
  Landmark,
  RefreshCw,
  Plus,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CreditCard,
  Building,
} from 'lucide-react';
import { BankAccount } from '../types/finance';
import { supportedOpenFinanceBanks } from '../services/bankSync';

interface BankSyncManagerProps {
  accounts: BankAccount[];
  onSyncAll: () => Promise<void>;
  isSyncing: boolean;
  onAddAccount: (newAccount: Omit<BankAccount, 'id' | 'lastSyncAt' | 'syncStatus'>) => void;
}

export const BankSyncManager: React.FC<BankSyncManagerProps> = ({
  accounts,
  onSyncAll,
  isSyncing,
  onAddAccount,
}) => {
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedBankCode, setSelectedBankCode] = useState(supportedOpenFinanceBanks[0].code);
  const [accountType, setAccountType] = useState<BankAccount['accountType']>('checking');
  const [accountNumber, setAccountNumber] = useState('');
  const [initialBalance, setInitialBalance] = useState('');

  const totalChecking = accounts
    .filter((a) => a.accountType === 'checking')
    .reduce((sum, a) => sum + a.balance, 0);

  const totalInvestments = accounts
    .filter((a) => a.accountType === 'investment')
    .reduce((sum, a) => sum + a.balance, 0);

  const totalSavings = accounts
    .filter((a) => a.accountType === 'savings')
    .reduce((sum, a) => sum + a.balance, 0);

  const totalCreditDebt = accounts
    .filter((a) => a.accountType === 'credit')
    .reduce((sum, a) => sum + Math.abs(a.balance), 0);

  const handleConnectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bank = supportedOpenFinanceBanks.find((b) => b.code === selectedBankCode) || supportedOpenFinanceBanks[0];
    const bal = parseFloat(initialBalance) || 0;

    onAddAccount({
      institutionName: bank.name,
      institutionCode: bank.code,
      accountType,
      accountNumber: accountNumber.trim() || 'Conta Digital',
      balance: accountType === 'credit' ? -Math.abs(bal) : bal,
      color: bank.brandColor,
      autoSync: true,
      creditLimit: accountType === 'credit' ? 15000 : undefined,
      currentInvoice: accountType === 'credit' ? Math.abs(bal) : undefined,
    });

    setAccountNumber('');
    setInitialBalance('');
    setIsConnectModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header bar com status e ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Múltiplas Contas & Open Finance</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Sincronização automática bancária com conciliação inteligente e encriptação ponta a ponta
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsConnectModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Conectar Instituição</span>
          </button>

          <button
            onClick={onSyncAll}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando Bancos...' : 'Sincronizar Todas Agora'}</span>
          </button>
        </div>
      </div>

      {/* Consolidação Geral de Patrimônio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Contas Correntes
          </span>
          <div className="mt-2 text-xl font-bold font-mono text-slate-900 dark:text-white">
            R$ {totalChecking.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Saldo disponível para giro</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Reserva & Poupança
          </span>
          <div className="mt-2 text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            R$ {totalSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Liquidez imediata familiar</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Investimentos Conectados
          </span>
          <div className="mt-2 text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
            R$ {totalInvestments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">XP e Plataformas de Custódia</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Faturas Abertas de Cartão
          </span>
          <div className="mt-2 text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
            R$ {totalCreditDebt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Comprometimento de crédito</span>
        </div>
      </div>

      {/* Grid de Instituições Conectadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {accounts.map((acc) => {
          const isCredit = acc.accountType === 'credit';
          const isInvestment = acc.accountType === 'investment';

          return (
            <div
              key={acc.id}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Header Instituição */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0"
                      style={{ backgroundColor: acc.color }}
                    >
                      {acc.institutionName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        {acc.institutionName}
                      </h3>
                      <span className="text-xs text-slate-400 block">{acc.accountNumber}</span>
                    </div>
                  </div>

                  <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Conectado</span>
                  </span>
                </div>

                {/* Tipo de conta */}
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                  {isCredit ? (
                    <>
                      <CreditCard className="w-3.5 h-3.5 text-purple-500" />
                      <span>Cartão de Crédito Pessoal</span>
                    </>
                  ) : isInvestment ? (
                    <>
                      <Building className="w-3.5 h-3.5 text-blue-500" />
                      <span>Custódia de Investimentos</span>
                    </>
                  ) : (
                    <>
                      <Landmark className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Conta Corrente Digital</span>
                    </>
                  )}
                </div>

                {/* Saldo ou Fatura */}
                <div className="mt-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    {isCredit ? 'Fatura Atual do Cartão' : 'Saldo Disponível'}
                  </span>
                  <div
                    className={`text-xl font-bold font-mono ${
                      isCredit
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    R$ {Math.abs(acc.balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>

                  {acc.creditLimit && (
                    <span className="text-xs text-slate-400 block mt-0.5 font-mono">
                      Limite total: R$ {acc.creditLimit.toLocaleString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>

              {/* Footer com última sincronização */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Sincronizado: {new Date(acc.lastSyncAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Open Finance Brasil</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Conectar Nova Instituição */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-600" />
              <span>Conectar Instituição via Open Finance</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
              Conecte sua conta para importar extratos, boletos e transações automaticamente.
            </p>

            <form onSubmit={handleConnectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Banco / Fintech
                </label>
                <select
                  value={selectedBankCode}
                  onChange={(e) => setSelectedBankCode(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {supportedOpenFinanceBanks.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.name} ({b.type === 'fintech' ? 'Fintech' : b.type === 'investment' ? 'Investimentos' : 'Banco Múltiplo'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de Conta
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountType('checking')}
                    className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                      accountType === 'checking'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Corrente
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('credit')}
                    className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                      accountType === 'credit'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Cartão
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('investment')}
                    className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                      accountType === 'investment'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Investimento
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Identificador / Número da Conta ou Cartão
                </label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Ex: Ag 1234 C/C 56789-0 ou Final 4432"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Saldo Atual / Fatura Aberta (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  placeholder="2500,00"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  Conectar e Autenticar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
