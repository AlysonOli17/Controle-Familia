import React, { useState } from 'react';
import {
  TrendingUp,
  Plus,
  Shield,
  PieChart,
  Calendar,
  Percent,
  CheckCircle,
} from 'lucide-react';
import { InvestmentAsset } from '../types/finance';

interface InvestmentsManagerProps {
  assets: InvestmentAsset[];
  onAddAsset: (newAsset: Omit<InvestmentAsset, 'id' | 'lastUpdate'>) => void;
}

export const InvestmentsManager: React.FC<InvestmentsManagerProps> = ({
  assets,
  onAddAsset,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<InvestmentAsset['type']>('CDB / Renda Fixa');
  const [institution, setInstitution] = useState('XP Investimentos');
  const [investedAmount, setInvestedAmount] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [benchmark, setBenchmark] = useState('100% CDI');

  const totalInvested = assets.reduce((sum, a) => sum + a.investedAmount, 0);
  const totalCurrent = assets.reduce((sum, a) => sum + a.currentValue, 0);
  const totalGain = totalCurrent - totalInvested;
  const totalGainPercent =
    totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : '0.00';

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inv = parseFloat(investedAmount);
    const curr = parseFloat(currentValue) || inv;
    if (!name.trim() || isNaN(inv) || inv <= 0) return;

    const gainPct = inv > 0 ? ((curr - inv) / inv) * 100 : 0;

    onAddAsset({
      name: name.trim(),
      type,
      institution: institution.trim(),
      investedAmount: inv,
      currentValue: curr,
      profitabilityPercent: Math.round(gainPct * 100) / 100,
      benchmark: benchmark.trim(),
    });

    setName('');
    setInvestedAmount('');
    setCurrentValue('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Investimentos & Patrimônio Familiar</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Relatórios detalhados sobre o progresso, rentabilidade e diversificação da família
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Ativo</span>
        </button>
      </div>

      {/* KPI Cards de Rentabilidade */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Patrimônio Líquido Acumulado
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white">
            R$ {totalCurrent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Posição consolidada atual</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Capital Aportado
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-600 dark:text-slate-300">
            R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Total aportado pela família</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Rendimento Líquido Acumulado
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            + R$ {totalGain.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <Percent className="w-3.5 h-3.5" />
            <span>+{totalGainPercent}% de retorno histórico</span>
          </span>
        </div>
      </div>

      {/* Tabela de Ativos Detalhada */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Carteira de Ativos da Família
          </h3>
          <span className="text-xs text-slate-400 font-mono">{assets.length} posições ativas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">Ativo & Classe</th>
                <th className="py-3 px-4">Instituição / Custodiante</th>
                <th className="py-3 px-4">Benchmark / Indexador</th>
                <th className="py-3 px-4 text-right">Valor Aportado</th>
                <th className="py-3 px-4 text-right">Valor Atual</th>
                <th className="py-3 px-4 text-right">Rentabilidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {assets.map((asset) => {
                const isPositive = asset.profitabilityPercent >= 0;

                return (
                  <tr
                    key={asset.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {asset.name}
                      </div>
                      <span className="text-[11px] text-slate-400">{asset.type}</span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {asset.institution}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-sm">
                        {asset.benchmark}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-500">
                      R$ {asset.investedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                      R$ {asset.currentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>

                    <td
                      className={`py-3.5 px-4 text-right font-mono font-bold tabular-nums ${
                        isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {asset.profitabilityPercent.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Adicionar Ativo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Cadastrar Novo Investimento
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
              Adicione posições de renda fixa, títulos públicos, ações ou fundos.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Ativo
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Tesouro Selic 2031, CDB 115% CDI Inter"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Classe do Ativo
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Tesouro Direto">Tesouro Direto</option>
                    <option value="CDB / Renda Fixa">CDB / Renda Fixa</option>
                    <option value="Fundos Imobiliários">Fundos Imobiliários</option>
                    <option value="Ações BR">Ações BR</option>
                    <option value="Previdência Privada">Previdência Privada</option>
                    <option value="Criptoativos">Criptoativos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Instituição
                  </label>
                  <input
                    type="text"
                    required
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="Ex: XP, Nubank, Itaú"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Valor Aportado (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={investedAmount}
                    onChange={(e) => setInvestedAmount(e.target.value)}
                    placeholder="10000"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Valor Atual Bruto (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    placeholder="10800"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Benchmark / Indexador
                </label>
                <input
                  type="text"
                  value={benchmark}
                  onChange={(e) => setBenchmark(e.target.value)}
                  placeholder="Ex: 100% Selic, IPCA + 6.2%, 110% CDI"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  Salvar Posição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
