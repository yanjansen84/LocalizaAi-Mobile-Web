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
import CreatePostButton from '../components/CreatePostButton';
import PostCard from '../components/PostCard';

interface Post {
  id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
  user_id: string;
  likes_count: number;
  is_liked: boolean;
  comments_count: number;
  latest_comment?: {
    user_full_name: string;
    content: string;
  };
  user?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
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
      loadPosts();
    }
  }, [user]);

  const loadPosts = async () => {
    try {
      // Primeiro buscar os posts
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      if (!posts) return;

      // Depois buscar os perfis para cada post
      const userIds = [...new Set(posts.map(post => post.user_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Combinar os dados
      const postsWithProfiles = posts.map(post => ({
        ...post,
        user: profiles?.find(profile => profile.id === post.user_id)
      }));

      setPosts(postsWithProfiles);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      setError('Não foi possível carregar o feed. Tente novamente mais tarde.');
      toast.error('Erro ao carregar feed');
    } finally {
      setLoading(false);
    }
  };

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
            <CreatePostButton onPostCreated={loadPosts} />
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
            <PostCard key={post.id} post={post} onDelete={loadPosts} />
          ))}
        </div>
      </main>
    </div>
  );
}

export default Feed;