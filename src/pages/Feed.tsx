import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Loader, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import ErrorFeedback from '../components/ErrorFeedback';

interface Post {
  id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
  user_full_name: string;
  user_avatar_url: string | null;
  likes_count: number;
  is_liked: boolean;
  comments_count: number;
  latest_comment?: {
    user_full_name: string;
    content: string;
  };
}

interface SearchResult {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

function Feed() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (user) {
      loadPosts(true);
    }
  }, [user]);

  async function loadPosts(refresh = false) {
    try {
      if (!user || (!hasMore && !refresh)) return;

      if (refresh) {
        setPage(1);
        setPosts([]);
        setHasMore(true);
      }

      setLoading(true);
      setError(null);

      // Chamar a função RPC diretamente
      const { data, error } = await supabase.rpc('get_user_feed', {
        p_user_id: user.id
      });

      if (error) throw error;
      if (data) {
        setPosts(prev => refresh ? data : [...prev, ...data]);
        setHasMore(data.length === 10);
        if (!refresh) setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Erro ao carregar feed:', error);
      setError('Não foi possível carregar o feed. Tente novamente mais tarde.');
      toast.error('Erro ao carregar feed');
    } finally {
      setLoading(false);
    }
  }

  const handleToggleLike = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post || !user) return;

      if (post.is_liked) {
        // Remover like
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);

        if (error) throw error;
      } else {
        // Adicionar like
        const { error } = await supabase
          .from('post_likes')
          .insert({ user_id: user.id, post_id: postId });

        if (error) throw error;
      }

      // Atualizar estado local
      setPosts(prev => prev.map(p => 
        p.id === postId ? {
          ...p,
          is_liked: !p.is_liked,
          likes_count: p.likes_count + (p.is_liked ? -1 : 1)
        } : p
      ));
    } catch (error) {
      console.error('Erro ao atualizar like:', error);
    }
  };

  const handleDoubleClick = async (postId: string) => {
    if (!posts.find(p => p.id === postId)?.is_liked) {
      await handleToggleLike(postId);
    }
  };

  const handleSearch = async (query: string) => {
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
        .limit(10);

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      {/* Header do Feed */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-screen-sm mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Feed</h1>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/search')}
              className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 
                       dark:hover:bg-gray-800 rounded-full"
              aria-label="Buscar"
            >
              <Search size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="max-w-screen-sm mx-auto px-4 py-6">
        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <Loader className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin" />
          </div>
        )}

        {/* Error state */}
        {error && <ErrorFeedback message={error} />}

        {/* Empty state */}
        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              Nenhum post encontrado. Siga outros usuários para ver seus posts aqui!
            </p>
          </div>
        )}

        {/* Posts */}
        <div className="space-y-6">
          {posts.map(post => (
            <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              {/* Header do Post */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={post.user_avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user_full_name)}&background=random`}
                    alt={post.user_full_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {post.user_full_name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(post.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
                <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              {/* Imagem do Post */}
              <div className="aspect-square relative">
                <img
                  src={post.image_url}
                  alt="Post"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              {/* Ações do Post */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleToggleLike(post.id)}
                    className={`${post.is_liked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'} hover:text-red-500 dark:hover:text-red-400`}
                  >
                    <Heart size={24} />
                  </button>
                  <button className="text-gray-500 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400">
                    <MessageCircle size={24} />
                  </button>
                  <button className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                    <Share2 size={24} />
                  </button>
                </div>
                <button className="text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400">
                  <Bookmark size={24} />
                </button>
              </div>

              {/* Descrição do Post */}
              {post.caption && (
                <div className="px-4 pb-4">
                  <p className="text-gray-900 dark:text-white">
                    <span className="font-medium text-gray-900 dark:text-white mr-2">
                      {post.user_full_name}
                    </span>
                    {post.caption}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Feed;