import React from 'react';
import { Bell, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  subtitle?: string;
}

export function Header({ subtitle = 'Encontre eventos incríveis' }: HeaderProps) {
  const { user } = useAuth();
  const defaultAvatar = 'https://placehold.co/48/9333ea/ffffff?text=U';

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center overflow-hidden">
          <img
            src={user?.user_metadata?.avatar_url || defaultAvatar}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h1 className="text-gray-900 dark:text-white text-lg font-semibold">Olá!</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link 
          to="/notificacoes"
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Bell className="w-6 h-6" />
        </Link>
        <Link
          to="/criar-evento"
          className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center text-white transition-colors"
        >
          <Plus className="w-6 h-6" />
        </Link>
      </div>
    </div>
  );
}
