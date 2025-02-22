import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

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

function Feed() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      // Tentativa 1: Usando o nome completo da função
      const { data, error } = await supabase.rpc('public.get_user_feed', {
        p_user_id: user.id  // Garantindo que o nome do parâmetro está correto
      });

      // Se a primeira tentativa falhar, tente a segunda
      if (error && error.message.includes('function not found')) {
        const { data: data2, error: error2 } = await supabase.rpc('get_user_feed', {
          p_user_id: user.id
        });
        
        if (error2) throw error2;
        if (data2) {
          setPosts(prev => refresh ? data2 : [...prev, ...data2]);
          setHasMore(data2.length === 10);
          if (!refresh) setPage(prev => prev + 1);
        }
      } else {
        if (error) throw error;
        if (data) {
          setPosts(prev => refresh ? data : [...prev, ...data]);
          setHasMore(data.length === 10);
          if (!refresh) setPage(prev => prev + 1);
        }
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

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <Navbar />

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 text-center text-red-600 dark:text-red-400">
          {error}
          <button 
            onClick={() => loadPosts(true)}
            className="ml-2 underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      <div 
        className="flex-1 overflow-y-auto no-scrollbar pb-16 max-w-xl mx-auto w-full"
        onScroll={(e) => {
          const target = e.target as HTMLDivElement;
          const bottom = target.scrollHeight - target.scrollTop === target.clientHeight;
          if (bottom && !loading && hasMore) {
            loadPosts();
          }
        }}
      >
        {loading && posts.length === 0 ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border-b border-gray-200 dark:border-gray-800 animate-pulse">
              <div className="p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
              <div className="p-3">
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          ))
        ) : (
          posts.map(post => (
            <div key={post.id} className="border-b border-gray-200 dark:border-gray-800">
              {/* Header */}
              <div className="flex items-center justify-between p-3">
                <div 
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => navigate(`/perfil/${post.id}`)}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img
                      src={post.user_avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user_full_name)}&background=6366f1&color=fff`}
                      alt={post.user_full_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-medium text-sm text-gray-900 dark:text-white">
                    {post.user_full_name}
                  </span>
                </div>
                <button className="p-2 text-gray-600 dark:text-gray-400">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Image */}
              <div 
                className="relative aspect-square"
                onDoubleClick={() => handleDoubleClick(post.id)}
              >
                <img
                  src={post.image_url}
                  alt="Post"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Actions */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleToggleLike(post.id)}
                      className={`${post.is_liked ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`}
                    >
                      <Heart className={`w-6 h-6 ${post.is_liked ? 'fill-current' : ''}`} />
                    </button>
                    <button className="text-gray-600 dark:text-gray-400">
                      <MessageCircle className="w-6 h-6" />
                    </button>
                    <button className="text-gray-600 dark:text-gray-400">
                      <Share2 className="w-6 h-6" />
                    </button>
                  </div>
                  <button className="text-gray-600 dark:text-gray-400">
                    <Bookmark className="w-6 h-6" />
                  </button>
                </div>

                {/* Likes count */}
                <p className="font-medium text-sm text-gray-900 dark:text-white mb-1">
                  {post.likes_count} curtidas
                </p>

                {/* Caption */}
                {post.caption && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-white mr-2">
                      {post.user_full_name}
                    </span>
                    {post.caption}
                  </p>
                )}

                {/* Comments preview */}
                {post.latest_comment && (
                  <div className="px-3 pb-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-900 dark:text-white mr-2">
                        {post.latest_comment.user_full_name}
                      </span>
                      {post.latest_comment.content}
                    </p>
                    {post.comments_count > 1 && (
                      <button className="text-sm text-gray-500 dark:text-gray-500">
                        Ver todos os {post.comments_count} comentários
                      </button>
                    )}
                  </div>
                )}

                {/* Date */}
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 px-3 pb-3">
                  {formatDistanceToNow(new Date(post.created_at), { 
                    addSuffix: true,
                    locale: ptBR 
                  })}
                </p>
              </div>
            </div>
          ))
        )}

        {loading && posts.length > 0 && (
          <div className="flex justify-center py-8">
            <Loader className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Nenhuma postagem encontrada no seu feed
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Siga mais pessoas para ver suas postagens aqui
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Feed;