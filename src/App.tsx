import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppShell } from './components/layout/AppShell';

import { OverviewView } from './modules/overview/OverviewView';
import { ProjectListView } from './modules/projects/ProjectListView';
import { ProjectDetailView } from './modules/projects/ProjectDetailView';
import { TasksView } from './modules/tasks/TasksView';
import { GlobalRoomsView } from './modules/rooms/GlobalRoomsView';
import { CalendarView } from './modules/calendar/CalendarView';
import { TeamDirectoryView } from './modules/team/TeamDirectoryView';
import { ClientDirectoryView } from './modules/clients/ClientDirectoryView';
import { ClientPortalView } from './modules/client-portal/ClientPortalView';
import { HRView } from './modules/hr/HRView';
import { ReportsView } from './modules/reports/ReportsView';
import { SettingsView } from './modules/settings/SettingsView';
import { ProfileView } from './modules/profile/ProfileView';

import { CreateProjectModal } from './modules/projects/CreateProjectModal';
import { CallSheetModal } from './modules/call-sheet/CallSheetModal';
import { AgencyInviteModal } from './components/shared/AgencyInviteModal';
import { EditPhoneModal } from './components/shared/EditPhoneModal';
import { FirebaseModal } from './components/firebase/FirebaseModal';
import { AuthPage } from './modules/auth/AuthPage';

const AppContent: React.FC = () => {
  const { currentView, isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return <OverviewView />;
      case 'projects':
        return <ProjectListView />;
      case 'project_detail':
        return <ProjectDetailView />;
      case 'tasks':
        return <TasksView />;
      case 'rooms':
        return <GlobalRoomsView />;
      case 'calendar':
        return <CalendarView />;
      case 'team':
        return <TeamDirectoryView />;
      case 'clients':
        return <ClientDirectoryView />;
      case 'client_portal':
        return <ClientPortalView />;
      case 'hr':
        return <HRView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <AppShell>
      {renderView()}
      <CreateProjectModal />
      <CallSheetModal />
      <AgencyInviteModal />
      <EditPhoneModal />
    </AppShell>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
