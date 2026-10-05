import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Bars3Icon,
  XMarkIcon,
  EnvelopeIcon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';
import Dropdown, { DropdownItem } from '../components/ui/Dropdown';
import NotificationsDropdown from '../components/NotificationsDropdown';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { menuConfig } from '../config/menu';
import type { MenuItem } from '../config/menu';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const userDroits = user?.droits || [];
  const userRoles = user?.roles || [];
  const isAdmin = userRoles.includes('ADMIN');

  const moduleMap: Record<string, string> = {
    'AGENT': 'AGENTS', 'GRADE': 'GRADES', 'FONCTION': 'FONCTIONS', 'DIRECTION': 'DIRECTIONS',
    'CONGE': 'CONGES', 'ABSENCE': 'ABSENCES', 'PRESENCE': 'PRESENCES', 'PERMISSION': 'PERMISSIONS',
    'SANCTION': 'SANCTIONS', 'FORMATION': 'FORMATIONS', 'CONTRAT': 'CONTRATS', 'EVALUATION': 'EVALUATIONS',
    'MISSION': 'MISSIONS', 'PRIME': 'PRIMES', 'RETRAITE': 'RETRAITES', 'NOTIFICATION': 'NOTIFICATIONS',
    'UTILISATEUR': 'USERS', 'ROLE': 'ROLES', 'DROIT': 'DROITS', 'LOG': 'LOGS',
    'ZONE': 'CONFIGURATION', 'HORAIRE': 'CONFIGURATION', 'JOURS_FERIE': 'CONFIGURATION',
    'INSCRIPTION': 'FORMATIONS', 'CATALOGUE': 'FORMATIONS',
  };

  const hasDroit = (itemDroits: string[]) => {
    if (isAdmin) return true;
    const allModules = userDroits.filter(d => d.startsWith('ALL_')).map(d => d.slice(4));
    return itemDroits.some(d => {
      if (userDroits.includes(d)) return true;
      const parts = d.split('_');
      const resource = parts.slice(1).join('_');
      const mapped = moduleMap[resource] || resource;
      return allModules.includes(mapped);
    });
  };

  const filterMenuByRole = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter((item) => hasDroit(item.droits))
      .map((item) => {
        if (item.children) {
          const filteredChildren = filterMenuByRole(item.children);
          return { ...item, children: filteredChildren };
        }
        return { ...item };
      })
      .filter((item) => !item.children || item.children.length > 0);
  };

  const filteredMenu = filterMenuByRole(menuConfig);

  const getCurrentPageName = (): string => {
    const path = location.pathname;
    for (const item of filteredMenu) {
      if (item.href && path === item.href) return item.name;
      if (item.children) {
        for (const child of item.children) {
          if (child.href && path === child.href) return child.name;
          if (child.href && path.startsWith(child.href)) return child.name;
        }
      }
      if (item.href && path.startsWith(item.href) && item.href !== '/') return item.name;
    }
    return 'Tableau de bord';
  };
  const currentPageName = getCurrentPageName();

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    const handleSessionExpired = () => {
      navigate('/login', { replace: true });
    };
    window.addEventListener('auth:logout', handleSessionExpired);
    return () => window.removeEventListener('auth:logout', handleSessionExpired);
  }, [navigate]);

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const getUserName = () => (user ? user.username?.split('@')[0] || 'Utilisateur' : 'Admin User');
  const getUserInitials = () => getUserName().substring(0, 2).toUpperCase();

  // Rendu du menu
  const MenuItemRenderer = ({ item }: { item: MenuItem }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isChildActive = hasChildren && item.children!.some((child) => isActive(child.href));
    const [isOpen, setIsOpen] = useState(isChildActive);

    if (hasChildren) {
      return (
        <div className="mb-1 px-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
              isChildActive
                ? 'text-white bg-slate-800/60'
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
            }`}
          >
            <item.icon
              className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                isChildActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300'
              }`}
            />
            <span className="flex-1 text-left tracking-wide">{item.name}</span>
            <ChevronDownIcon
              className={`ml-2 h-4 w-4 text-slate-500 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-slate-300' : ''
              }`}
            />
          </button>

          {isOpen && (
            <div className="mt-1 ml-4 pl-3 border-l border-slate-800 space-y-1">
              {item.children!.map((child, idx) => (
                <MenuItemRenderer key={idx} item={child} />
              ))}
            </div>
          )}
        </div>
      );
    }

    const active = isActive(item.href);
    return (
      <div className="px-2">
        <Link
          to={item.href!}
          className={`group relative flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 ${
            active
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
              : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
          }`}
        >
          {active && <span className="absolute left-0 top-2 bottom-2 w-1 bg-white rounded-r" />}
          <item.icon
            className={`mr-3 h-5 w-5 flex-shrink-0 ${
              active ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'
            }`}
          />
          <span className="tracking-wide">{item.name}</span>
        </Link>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
      {/* --- SIDEBAR MOBILE --- */}
      <div
        className={`fixed inset-0 z-50 flex lg:hidden ${
          sidebarOpen ? 'visible' : 'invisible'
        }`}
      >
        <div
          className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        <div
          className={`relative flex w-68 flex-col bg-slate-900 text-slate-200 transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="absolute top-4 right-0 -mr-12">
            <button
              onClick={() => setSidebarOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/80 text-white focus:outline-none"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center px-6 h-20 border-b border-slate-800/60">
            <div className="flex items-center space-x-3 pt-2">
              <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20 flex items-center justify-center w-10 h-10 flex-shrink-0">
                <span className="font-black text-lg tracking-wider">GS</span>
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-bold text-base text-white leading-none tracking-tight mb-1.5">
                  GS-RH
                </span>
                <span className="text-[11px] text-slate-500 font-medium leading-none">
                  Ressources Humaines
                </span>
              </div>
            </div>
          </div>

          <nav className="flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            {filteredMenu.map((item, idx) => (
              <MenuItemRenderer key={idx} item={item} />
            ))}
          </nav>
        </div>
      </div>

      {/* --- SIDEBAR DESKTOP --- */}
      <div className="hidden lg:flex lg:flex-shrink-0 shadow-xl shadow-slate-900/10 z-20">
        <div className="flex w-68 flex-col bg-slate-900 text-slate-200">
          <div className="flex items-center px-6 h-20 border-b border-slate-800/50">
            <div className="flex items-center space-x-3 pt-2">
              <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-500/20 flex items-center justify-center w-10 h-10 flex-shrink-0">
                <span className="font-black text-lg tracking-wider">GS</span>
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-bold text-base text-white leading-none tracking-tight mb-1.5">
                  GS-RH
                </span>
                <span className="text-[11px] text-slate-500 font-medium leading-none">
                  Tableau de bord
                </span>
              </div>
            </div>
          </div>

          <nav className="flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            {filteredMenu.map((item, idx) => (
              <MenuItemRenderer key={idx} item={item} />
            ))}
          </nav>
        </div>
      </div>

      {/* --- MAIN CONTENT & HEADER --- */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-20 items-center justify-between px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm z-10">
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>

          <div className="hidden sm:block text-sm font-medium text-slate-400">
            Espace sécurisé <span className="text-slate-300 dark:text-slate-600 mx-2">/</span>{' '}
            <span className="text-slate-700 dark:text-slate-200">{currentPageName}</span>
          </div>

          <div className="flex-1 flex justify-end items-center space-x-2">
            {/* --- BASCULE THEME --- */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:text-slate-200 rounded-xl transition-colors"
              title={theme === 'dark' ? 'Passer au theme clair' : 'Passer au theme sombre'}
              aria-label="Basculer le theme"
            >
              {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>

            {/* --- NOTIFICATIONS DROPDOWN (composant dédié) --- */}
            
            <NotificationsDropdown iconSize={22} badgeSize={18} dropdownWidth={320} />

            {/* --- ENVELOPPE (exemple) --- */}
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:text-slate-200 rounded-xl relative transition-colors">
              <EnvelopeIcon className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
            </button>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-2" />

            {/* --- PROFIL DROPDOWN --- */}
            <Dropdown
              trigger={
                <button className="flex items-center space-x-3 p-1.5 pr-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none group">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {getUserInitials()}
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      {getUserName()}
                    </span>
                    <span className="text-xs text-slate-400 font-medium capitalize">
                      {user?.roles?.[0]?.toLowerCase() || 'utilisateur'}
                    </span>
                  </div>
                  <ChevronDownIcon className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:text-slate-600" />
                </button>
              }
              align="right"
            >
              <DropdownItem onClick={() => navigate('/profile')}>Mon Profil</DropdownItem>
              <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
              <DropdownItem onClick={handleLogout} className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10">
                Déconnexion
              </DropdownItem>
            </Dropdown>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8 bg-slate-50/50 dark:bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;