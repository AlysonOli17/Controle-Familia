import React from 'react';
import {
  X,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  TrendingDown,
  ShieldAlert,
  Bell,
  Check,
} from 'lucide-react';
import { SmartNotification, Transaction } from '../types/finance';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: SmartNotification[];
  pendingBills: Transaction[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllRead: () => void;
  onPayBill: (billId: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  pendingBills,
  onMarkNotificationRead,
  onMarkAllRead,
  onPayBill,
  onNavigateTab,
}) => {
  if (!isOpen) return null;

  const handleRequestPushPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('FinFamily Notificações Ativadas', {
          body: 'Você receberá alertas em tempo real de contas a vencer e limites de orçamento.',
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Central de Notificações
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={handleRequestPushPermission}
            className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium cursor-pointer"
          >
            Ativar Notificações Push Web
          </button>
          <button
            onClick={onMarkAllRead}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
          >
            Marcar todas como lidas
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {/* Contas Próximas do Vencimento */}
          {pendingBills.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Contas Pendentes ({pendingBills.length})
                </span>
              </div>
              <div className="space-y-2.5">
                {pendingBills.map((bill) => (
                  <div
                    key={bill.id}
                    className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/20 flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-sm text-slate-900 dark:text-white">
                          {bill.description}
                        </div>
                        <div className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Vence em: {bill.dueDate ? bill.dueDate.split('-').reverse().join('/') : 'A definir'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm font-mono text-slate-900 dark:text-white">
                          R$ {bill.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-amber-200/50 dark:border-amber-900/40">
                      <button
                        onClick={() => onPayBill(bill.id)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Marcar como Pago</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notificações Inteligentes */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
              Alertas Inteligentes & IA
            </span>
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">Nenhum alerta recente.</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => {
                  return (
                    <div
                      key={notif.id}
                      onClick={() => onMarkNotificationRead(notif.id)}
                      className={`p-3.5 rounded-xl border text-sm transition-all cursor-pointer ${
                        notif.read
                          ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 opacity-75'
                          : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {notif.type === 'impulse_warning' && (
                          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        )}
                        {notif.type === 'bottleneck_alert' && (
                          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        {notif.type === 'bill_due' && (
                          <Calendar className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        )}
                        {notif.type === 'sync_success' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        )}
                        {notif.type === 'goal_reached' && (
                          <TrendingDown className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        )}

                        <div className="flex-1">
                          <div className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center justify-between">
                            <span>{notif.title}</span>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 ml-2" />
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                            {notif.message}
                          </p>
                          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                            <span>
                              {new Date(notif.timestamp).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {notif.actionType && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (notif.actionType === 'view_budget' || notif.actionType === 'view_bottlenecks') {
                                    onNavigateTab('bottlenecks');
                                  } else if (notif.actionType === 'view_bills') {
                                    onNavigateTab('transactions');
                                  } else if (notif.actionType === 'view_bank') {
                                    onNavigateTab('banks');
                                  } else if (notif.actionType === 'view_goals') {
                                    onNavigateTab('goals');
                                  }
                                  onClose();
                                }}
                                className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                              >
                                Ver detalhes &rarr;
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
