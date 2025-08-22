import { useEffect, useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  // === estados que no template eram "x-data / x-show" (Alpine)
  const [dark, setDark] = useState<boolean>(() => {
    // mantém preferência do usuário
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    // fallback: se sistema é dark
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });
  const [isSideMenuOpen, setSideMenuOpen] = useState(false);
  const [isNotificationsMenuOpen, setNotificationsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);

  // aplica classe "dark" no <html> (Tailwind darkMode: 'class')
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  // helpers
  const toggleTheme = () => setDark((v) => !v);
  const toggleSideMenu = () => setSideMenuOpen((v) => !v);
  const closeSideMenu = () => setSideMenuOpen(false);

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 ${isSideMenuOpen ? 'overflow-hidden' : ''}`}>
      {/* Sidebar Desktop + Mobile */}
      <Sidebar
        isOpen={isSideMenuOpen}
        onClose={closeSideMenu}
      />

      {/* Backdrop mobile */}
      {isSideMenuOpen && (
        <div
          onClick={closeSideMenu}
          className="fixed inset-0 z-10 flex items-end bg-black/50 sm:items-center sm:justify-center md:hidden"
        />
      )}

      {/* Conteúdo principal */}
      <div className="flex flex-1 flex-col">
        <Header
          dark={dark}
          onToggleTheme={toggleTheme}
          onToggleSideMenu={toggleSideMenu}
          isNotificationsMenuOpen={isNotificationsMenuOpen}
          setNotificationsMenuOpen={setNotificationsMenuOpen}
          isProfileMenuOpen={isProfileMenuOpen}
          setProfileMenuOpen={setProfileMenuOpen}
        />

        <main className="h-full overflow-y-auto pb-16 p-10">
          {/* Container interno, como no template */}
          <div className="container mx-auto grid px-6">
            {/* O template mostra um "Blank" aqui; no app real renderizamos a rota */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
