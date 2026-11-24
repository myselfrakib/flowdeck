import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Phone, CheckCircle2, X, AlertCircle } from 'lucide-react';

export const EditPhoneModal: React.FC = () => {
  const { 
    currentUser, 
    isPhoneModalOpen, 
    setIsPhoneModalOpen, 
    updateUserPhone 
  } = useApp();

  const [phoneInput, setPhoneInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.phone) {
      const raw = currentUser.phone.replace(/^\+91\s*/, '');
      setPhoneInput(raw);
    }
  }, [currentUser?.phone, isPhoneModalOpen]);

  if (!isPhoneModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const digitsOnly = phoneInput.replace(/\D/g, '');
    if (!digitsOnly) {
      setError('Please enter a phone number.');
      return;
    }

    if (digitsOnly.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const formatted = `+91 ${digitsOnly.slice(-10)}`;
    updateUserPhone(formatted);
    setIsPhoneModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 max-w-md w-full space-y-4 animate-in zoom-in-95 duration-200 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Update Phone Number
              </h3>
              <p className="text-xs text-slate-500">
                Used for shoot call sheets & production alerts
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPhoneModalOpen(false)}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Snapshot */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover border border-white shadow-2xs shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
            <p className="text-[10px] text-blue-600 font-mono mt-0.5 font-semibold">
              Current: {currentUser.phone || 'None'}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
              New Mobile Number (Auto-prefixed with +91)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-xs font-bold text-slate-500 select-none font-mono">
                +91
              </span>
              <input
                type="tel"
                required
                autoFocus
                placeholder="98765 43210"
                value={phoneInput}
                onChange={(e) => {
                  setPhoneInput(e.target.value.replace(/^\+91\s*/, ''));
                  setError(null);
                }}
                className="w-full text-xs sm:text-sm pl-14 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 font-mono tracking-wide"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Indian country code (+91) is automatically applied.
            </p>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsPhoneModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Phone Number</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

