import React from 'react';
import { Home, Map, Ticket, User, Calendar } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { icon: Calendar, label: 'Eventos', path: '/eventos' },
    { icon: Home, label: 'Feed', path: '/feed' },
    { icon: Map, label: 'Mapa', path: '/mapa' },
    { icon: Ticket, label: 'Ingressos', path: '/ingressos' },
    { icon: User, label: 'Perfil', path: '/perfil' },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="flex justify-around items-center py-2">
        {navItems.map(({ icon: Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center px-3 py-2 text-xs ${
              isActive(path)
                ? 'text-purple-600'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Icon className="w-6 h-6 mb-1" />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default Navbar