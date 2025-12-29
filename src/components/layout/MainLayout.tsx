import { ReactNode } from 'react';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';

interface MainLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

const MainLayout = ({ children, showSidebar = true }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <div className="flex flex-1">
        {showSidebar && <AppSidebar />}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
