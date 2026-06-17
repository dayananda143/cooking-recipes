import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backdropClosing, setBackdropClosing] = useState(false);

  function closeSidebar() {
    setBackdropClosing(true);
    setSidebarOpen(false);
    setTimeout(() => setBackdropClosing(false), 200);
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        {(sidebarOpen || backdropClosing) && (
          <div
            className={`fixed inset-0 z-30 bg-black/50 lg:hidden transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={closeSidebar}
          />
        )}
        <div className={`
          fixed inset-y-0 left-0 z-40 lg:static lg:translate-x-0 lg:z-auto
          transition-transform duration-200 ease-drawer
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <Sidebar onClose={closeSidebar} />
        </div>
        <main className="flex-1 overflow-auto p-3 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
