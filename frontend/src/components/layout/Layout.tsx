import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useThemeStore } from '../../stores/theme';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout: React.FC = () => {
  const { initializeTheme } = useThemeStore();

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Background noise texture for dark mode */}
      <div className="fixed inset-0 bg-noise opacity-10 pointer-events-none dark:opacity-20" />
      
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          
          <main className="flex-1 overflow-y-auto bg-white dark:bg-gray-900/50 backdrop-blur-sm">
            <div className="container mx-auto px-6 py-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};