import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FollowUser {
  id: string;
  full_name: string;
  avatar_url: string | null;
  is_following: boolean;
}

function Followers() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'followers';
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, [userId, type]);

  async function loadUsers() {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc(
        type === 'followers' ? 'get_user_followers' : 'get_user_following',
        { p_user_id: userId }
      );

      if (error) throw error;

      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setError('Não foi possível carregar a lista. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleFollow(targetUserId: string) {
    try {
      const userToUpdate = users.find(u => u.id === targetUserId);
      if (!userToUpdate) return;

      if (userToUpdate.is_following) {
        // Deixar de seguir
        await supabase
          .from('followers')
          .delete()
          .eq('follower_id', userId)
          .eq('followed_id', targetUserId);
      } else {
        // Seguir
        await supabase
          .from('followers')
          .insert({ follower_id: userId, followed_id: targetUserId });
      }

      // Atualizar estado local
      setUsers(prev =>
        prev.map(user =>
          user.id === targetUserId
            ? { ...user, is_following: !user.is_following }
            : user
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar seguidor:', error);
    }
  }

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {type === 'followers' ? 'Seguidores' : 'Seguindo'}
          </h1>
          <div className="w-6" /> {/* Espaçador para centralizar o título */}
        </div>

        {/* Barra de pesquisa */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Lista de usuários */}
      <div className="pb-16">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {error}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {searchTerm
              ? 'Nenhum usuário encontrado'
              : type === 'followers'
              ? 'Nenhum seguidor ainda'
              : 'Não está seguindo ninguém ainda'}
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img
                    src={
                      user.avatar_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user.full_name
                      )}&background=6366f1&color=fff`
                    }
                    alt={user.full_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {user.full_name}
                </span>
              </div>
              <button
                onClick={() => handleToggleFollow(user.id)}
                className={`px-4 py-1 rounded-full text-sm font-medium ${
                  user.is_following
                    ? 'text-purple-600 dark:text-purple-400 border border-purple-600 dark:border-purple-400'
                    : 'bg-purple-600 text-white'
                }`}
              >
                {user.is_following ? 'Seguindo' : 'Seguir'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Followers;
