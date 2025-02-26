import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface SearchResult {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

function Search() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  // Foca o input automaticamente quando a página carrega
  useEffect(() => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.focus();
    }
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .ilike('full_name', `%${query}%`)
        .limit(20);

      if (error) throw error;

      setSearchResults(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Erro ao buscar usuários');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-screen-sm mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 
                     dark:hover:bg-gray-800 rounded-full"
          >
            <ArrowLeft size={24} />
          </button>
          
          <div className="flex-1 relative">
            <input
              id="searchInput"
              type="text"
              placeholder="Buscar usuários..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full py-2 px-4 pl-10 bg-gray-100 dark:bg-gray-800 
                        text-gray-900 dark:text-gray-100 rounded-full
                        focus:outline-none focus:ring-2 focus:ring-purple-500 
                        dark:focus:ring-purple-400"
            />
            <SearchIcon 
              size={18} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" 
            />
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="max-w-screen-sm mx-auto px-4 py-4">
        {searching ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-gray-400 dark:text-gray-600">
              Buscando...
            </div>
          </div>
        ) : searchQuery && searchResults.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              Nenhum usuário encontrado
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {searchResults.map(user => (
              <div
                key={user.id}
                onClick={() => navigate(`/perfil/${user.id}`)}
                className="flex items-center gap-3 py-3 hover:bg-gray-50 
                         dark:hover:bg-gray-800 cursor-pointer -mx-4 px-4"
              >
                <img
                  src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=random`}
                  alt={user.full_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {user.full_name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
