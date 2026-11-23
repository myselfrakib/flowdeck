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
  return (
    <div className="flex min-h-screen bg-[#F4F7FB] text-[#102A43] antialiased">
      {/* Persistent Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <TopBar />
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

