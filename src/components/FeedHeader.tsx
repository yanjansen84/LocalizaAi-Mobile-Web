import React, { useState } from 'react';
import { MessageSquare, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeedHeaderProps {
  onSearch: (query: string) => void;
}

export function FeedHeader({ onSearch }: FeedHeaderProps) {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo ou Título */}
        <div className="flex-1">
          <h1 className="text-xl font-bold text-purple-600 dark:text-purple-400">
            LocalizaAí
          </h1>
        </div>

        {/* Barra de Busca */}
        <div className="flex-1 max-w-md px-4">
          {showSearch ? (
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Buscar usuários..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 px-4 pr-10 rounded-full bg-gray-100 dark:bg-gray-800 
                          text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 
                          focus:ring-purple-500 dark:focus:ring-purple-400"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 
                         dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
              >
                <Search size={20} />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="w-full py-2 px-4 rounded-full bg-gray-100 dark:bg-gray-800 
                       text-left text-gray-500 dark:text-gray-400 hover:bg-gray-200 
                       dark:hover:bg-gray-700 focus:outline-none"
            >
              <span className="flex items-center gap-2">
                <Search size={20} />
                <span>Buscar usuários...</span>
              </span>
            </button>
          )}
        </div>

        {/* Ícones */}
        <div className="flex-1 flex items-center justify-end gap-4">
          <button
            onClick={() => navigate('/direct')}
            className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 
                     dark:hover:bg-gray-800 rounded-full focus:outline-none"
            aria-label="Mensagens"
          >
            <MessageSquare size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}
