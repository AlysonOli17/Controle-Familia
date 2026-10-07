import React, { useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Filter,
} from 'lucide-react';
import {
  BankAccount,
  FamilyMember,
  Transaction,
  TransactionCategory,
  TransactionType,
} from '../types/finance';
import { exportTransactionsToCSV } from '../services/exportService';

interface TransactionsManagerProps {
  transactions: Transaction[];
  members: FamilyMember[];
  onAddTransactionClick: () => void;
  onDeleteTransaction: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const TransactionsManager: React.FC<TransactionsManagerProps> = ({
  transactions,
  members,
  onAddTransactionClick,
  onDeleteTransaction,
  onToggleStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense' | 'pending'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<string>('all');


  const memberMap = new Map(members.map((m) => [m.id, m]));

  const filtered = transactions.filter((t) => {
    // Busca por texto
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      const matchDesc = t.description.toLowerCase().includes(query);
      const matchCat = t.category.toLowerCase().includes(query);
      const matchNotes = t.notes?.toLowerCase().includes(query);
      if (!matchDesc && !matchCat && !matchNotes) return false;
    }

    // Filtro por tipo
    if (selectedType === 'income' && t.type !== 'income') return false;
    if (selectedType === 'expense' && t.type !== 'expense') return false;
    if (selectedType === 'pending' && t.status !== 'pending') return false;

    // Filtro por categoria
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;

    // Filtro por membro
    if (selectedMember !== 'all' && t.memberId !== selectedMember) return false;

    return true;
  });

  const categoriesList: TransactionCategory[] = [
    'Moradia',
    'Alimentação',
    'Supermercado',
    'Transporte',
    'Saúde',
    'Educação',
    'Lazer & Viagem',
    'Assinaturas & Serviços',
    'Compras & Vestuário',
    'Investimentos',
    'Salário',
    'Rendimentos',
    'Freelance / Extra',
    'Outros',
  ];

  return (
    <div className="space-y-5">
      {/* Header bar com título e ação primária */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Extrato de Lançamentos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Histórico completo de receitas, despesas e faturas conciliadas da família
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportTransactionsToCSV(transactions, [], members)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={onAddTransactionClick}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Lançamento</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Busca textual */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por descrição, mercado, boleto ou tag..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Segmented Control Tipo (Allowed functional buttons as per Constitution 1.A) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                selectedType === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setSelectedType('income')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                selectedType === 'income'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Receitas
            </button>
            <button
              onClick={() => setSelectedType('expense')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                selectedType === 'expense'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Despesas
            </button>
            <button
              onClick={() => setSelectedType('pending')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                selectedType === 'pending'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Pendentes
            </button>
          </div>
        </div>

        {/* Filtros secundários: Categoria & Membro */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtrar:</span>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">Todas as Categorias</option>
            {categoriesList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">Todos os Membros</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.role})
              </option>
            ))}
          </select>

          <span className="text-slate-400 ml-auto tabular-nums">
            {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* High-Density Data Grid (Compliant with SaaS Guidelines: Tabular figures, compact rows, clean alignment) */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Descrição & Categoria</th>
                <th className="py-3 px-4">Responsável</th>
                <th className="py-3 px-4 text-right">Valor</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Nenhuma transação encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const member = memberMap.get(tx.memberId);
                  const isExpense = tx.type === 'expense';
                  const isPending = tx.status === 'pending';

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Data */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {tx.date.split('-').reverse().join('/')}
                      </td>

                      {/* Descrição & Categoria (Zero-Pill Metadata Discipline: unboxed text with · separator) */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {tx.description}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span>{tx.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="capitalize">{tx.paymentMethod.replace('_', ' ')}</span>
                          {tx.isRecurring && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-indigo-600 dark:text-indigo-400">Recorrente</span>
                            </>
                          )}
                          {tx.notes && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="truncate max-w-[150px]">{tx.notes}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Responsável */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {member && (
                            <span
                              className={`w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0 ${member.avatarColor}`}
                            >
                              {member.avatarInitials}
                            </span>
                          )}
                          <span className="text-slate-700 dark:text-slate-300">
                            {member ? member.name.split(' ')[0] : 'Família'}
                          </span>
                        </div>
                      </td>


                      {/* Valor (Tabular Figures) */}
                      <td
                        className={`py-3 px-4 text-right font-mono font-bold whitespace-nowrap tabular-nums text-sm ${
                          isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {isExpense ? '- ' : '+ '}
                        R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => onToggleStatus(tx.id)}
                          className={`inline-flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer ${
                            isPending
                              ? 'text-amber-600 dark:text-amber-400 hover:text-amber-700'
                              : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700'
                          }`}
                          title={isPending ? 'Clique para marcar como pago' : 'Concluído'}
                        >
                          {isPending ? (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              <span>Pendente</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Concluído</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Excluir lançamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
