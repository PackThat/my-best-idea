// src/components/AppLayout.tsx
import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import PackingHeader from './PackingHeader';
import PackingSidebar from './PackingSidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { sidebarOpen, toggleSidebar } = useAppContext();

  return (
    <div className="flex h-screen bg-background">
      <div className="flex flex-col flex-1">
  <PackingHeader />
  <main className="flex-1 overflow-auto p-6 max-w-screen-2xl mx-auto">
          {children}
        </main>
      </div>
      <Sheet open={sidebarOpen} onOpenChange={toggleSidebar}>
        <SheetContent side="left" className="w-64 p-0">
          <PackingSidebar />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AppLayout;