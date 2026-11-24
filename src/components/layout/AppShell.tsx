import React from 'react';
import { useApp } from '../../context/AppContext';
import { DesktopSidebar } from './DesktopSidebar';
import { TopBar } from './TopBar';
import { MobileBottomNav } from './MobileBottomNav';
import { GlobalSearchModal } from '../shared/GlobalSearchModal';
import { ToastContainer } from '../shared/ToastContainer';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { pendingInvite, acceptAgencyInvite, rejectAgencyInvite } = useApp();

  return (
    <div className="flex min-h-screen bg-[#F4F7FB] text-[#102A43] antialiased">
      {/* Persistent Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <TopBar />

        {/* Global Pending Invitation Banner */}
        {pendingInvite && (
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white px-3 sm:px-6 py-2.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-base sm:text-lg">{pendingInvite.agencyLogo || '🎬'}</span>
              <p className="font-medium text-white truncate">
                Join <strong className="font-bold underline underline-offset-2">{pendingInvite.agencyName}</strong> as <strong className="font-extrabold text-blue-100">{pendingInvite.role}</strong>?
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => rejectAgencyInvite(pendingInvite)}
                className="px-3 py-1 rounded-lg bg-black/25 hover:bg-black/35 text-white font-semibold text-xs transition-colors"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => acceptAgencyInvite(pendingInvite)}
                className="px-3.5 py-1 rounded-lg bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-xs shadow-xs transition-colors"
              >
                Confirm & Join
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 p-3 sm:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Persistent Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Global Modals & Toast System */}
      <GlobalSearchModal />
      <ToastContainer />
    </div>
  );
};

