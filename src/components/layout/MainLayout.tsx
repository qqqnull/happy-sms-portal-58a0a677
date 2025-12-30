import { ReactNode } from 'react';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';

interface MainLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

const MainLayout = ({ children, showSidebar = true }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden">
      <AppHeader />
      <div className="flex flex-1 w-full max-w-full overflow-hidden">
        {showSidebar && <AppSidebar />}
        <main className="flex-1 min-w-0 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
