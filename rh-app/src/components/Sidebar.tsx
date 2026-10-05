// src/components/Sidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { menuConfig} from '../config/menu';
import type{ MenuItem } from '../config/menu';
import { useAuth } from '../hooks/useAuth';
import { FaGraduationCap } from 'react-icons/fa';

interface SidebarProps {
  collapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const { user } = useAuth();
  const location = useLocation();
  const userDroits = user?.droits || [];
  const userRoles = user?.roles || [];
  const isAdmin = userRoles.includes('ADMIN');

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

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

  const filterMenu = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter(item => hasDroit(item.droits))
      .map(item => {
        if (item.children) {
          const filteredChildren = filterMenu(item.children);
          if (filteredChildren.length === 0) return null;
          return { ...item, children: filteredChildren };
        }
        return item;
      })
      .filter(Boolean) as MenuItem[];
  };

  const filteredMenus = filterMenu(menuConfig);

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const active = item.href ? isActive(item.href) : false;

    if (hasChildren) {
      return (
        <div key={item.name} className="mb-1">
          <div className={`flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white ${active ? 'bg-blue-600 text-white' : ''}`}>
            <Icon className={`mr-3 h-5 w-5 ${active ? 'text-white' : 'text-gray-400'}`} />
            <span>{item.name}</span>
          </div>
          <div className="ml-4 space-y-1">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        </div>
      );
    }

    return (
      <Link
        key={item.name}
        to={item.href || '#'}
        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
          active
            ? 'bg-blue-600 text-white'
            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`}
      >
        <Icon className={`mr-3 h-5 w-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
        {!collapsed && <span>{item.name}</span>}
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-200">
      <div className="flex items-center justify-center px-4 h-16 border-b border-gray-700">
        <FaGraduationCap className="h-8 w-8 text-blue-400 mr-2" />
        {!collapsed && <span className="font-bold text-lg text-white">GS-RH</span>}
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {filteredMenus.map(item => renderMenuItem(item))}
      </nav>
    </div>
  );
};

export default Sidebar;