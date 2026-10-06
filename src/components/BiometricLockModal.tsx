import React, { useState } from 'react';
import { Fingerprint, Lock, ShieldCheck, KeyRound, Eye, EyeOff } from 'lucide-react';
import { verifyBiometrics } from '../services/cryptoStorage';

interface BiometricLockModalProps {
  isOpen: boolean;
  onUnlock: () => void;
  masterPin?: string;
}

export const BiometricLockModal: React.FC<BiometricLockModalProps> = ({
  isOpen,
  onUnlock,
  masterPin = '1234',
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === masterPin) {
      setError('');
      setPin('');
      onUnlock();
    } else {
      setError('PIN incorreto. Dica de acesso padrão: 1234');
    }
  };

  const handleBiometricClick = async () => {
    setIsVerifying(true);
    setError('');
    try {
      const success = await verifyBiometrics();
      if (success) {
        setTimeout(() => {
          setIsVerifying(false);
          onUnlock();
        }, 500);
      } else {
        setIsVerifying(false);
        setError('Leitura biométrica não reconhecida. Use seu PIN.');
      }
    } catch {
      setIsVerifying(false);
      setError('Erro no sensor. Utilize o PIN de 4 dígitos.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-5">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          FinFamily Protegido
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
          Seus dados financeiros familiares estão criptografados com chave local AES-GCM.
        </p>

        {/* Biometria Rápida */}
        <button
          onClick={handleBiometricClick}
          disabled={isVerifying}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-medium text-sm transition-all shadow-md mb-6 disabled:opacity-60 cursor-pointer"
        >
          <Fingerprint className={`w-5 h-5 ${isVerifying ? 'animate-pulse' : ''}`} />
          <span>{isVerifying ? 'Autenticando biometria...' : 'Desbloquear com Biometria / Face ID'}</span>
        </button>

        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
          <span className="bg-white dark:bg-slate-900 px-3 text-xs text-slate-400 uppercase font-medium">
            ou digite o PIN
          </span>
        </div>

        {/* Form PIN */}
        <form onSubmit={handlePinSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPin ? 'text' : 'password'}
              maxLength={6}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                if (error) setError('');
              }}
              placeholder="Digite seu PIN (padrão: 1234)"
              autoFocus
              className="w-full text-center tracking-widest text-lg font-mono py-2.5 px-4 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-xs placeholder:tracking-normal placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-lg bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>Confirmar PIN</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Criptografia ponta a ponta ativa no dispositivo</span>
        </div>
      </div>
    </div>
  );
};
