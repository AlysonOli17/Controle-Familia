import React from 'react';
import {
  Bell,
  Lock,
  Moon,
  Sun,
  Plus,
  Wifi,
  WifiOff,
  Menu,
  X,
} from 'lucide-react';
import { SmartNotification } from '../types/finance';

export type NavTab =
  | 'overview'
  | 'transactions'
  | 'goals'
  | 'banks'
  | 'members'
  | 'investments'
  | 'bottlenecks';

interface HeaderNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  notifications: SmartNotification[];
  onOpenNotifications: () => void;
  onOpenAddModal: () => void;
  onLockApp: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isOnline: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentTab,
  onSelectTab,
  notifications,
  onOpenNotifications,
  onOpenAddModal,
  onLockApp,
  theme,
  onToggleTheme,
  isOnline,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems: { id: NavTab; label: string }[] = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'transactions', label: 'Lançamentos' },
    { id: 'goals', label: 'Metas' },
    { id: 'members', label: 'Família' },
    { id: 'investments', label: 'Investimentos' },
    { id: 'bottlenecks', label: 'Gargalos & IA' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onSelectTab('overview');
                setMobileMenuOpen(false);
              }}
              className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                F
              </span>
              <span>FinFamily</span>
            </button>

            {/* Offline status badge */}
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${
                isOnline
                  ? 'text-slate-400 dark:text-slate-500'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
              }`}
              title={isOnline ? 'Online - Sincronizado' : 'Modo Offline Ativo - Dados salvos localmente com criptografia'}
            >
              {isOnline ? <Wifi className="w-3 h-3 text-emerald-500" /> : <WifiOff className="w-3 h-3 text-amber-500" />}
              <span className="text-[11px] font-medium">{isOnline ? 'Online' : 'Offline'}</span>
            </span>
          </div>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary actions */}
          <div className="flex items-center gap-2">
            {/* Quick Add Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-lg transition-all shadow-xs cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Lançamento</span>
              <span className="sm:hidden">Novo</span>
            </button>

            {/* Notifications Button */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Notificações e Contas a Vencer"
              aria-label="Notificações"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Lock / Security */}
            <button
              onClick={onLockApp}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Bloquear aplicativo (Biometria / PIN)"
              aria-label="Bloquear aplicativo"
            >
              <Lock className="w-4 h-4" />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
