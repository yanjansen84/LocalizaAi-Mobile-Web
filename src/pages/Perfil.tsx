import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, MoreHorizontal, Heart, MapPin, Calendar, Moon, Sun,
  Settings, ChevronRight, Shield, Languages, HelpCircle, Users, Star,
  LogOut, Ticket, Loader, Camera, X, Bell
} from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import { toast } from 'react-hot-toast';

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  followers_count: number;
  following_count: number;
  events_count: number;
  is_following?: boolean;
}

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  image_url: string;
  is_free: boolean;
}

interface Post {
  id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
  likes_count: number;
  is_liked: boolean;
}

function LogoutModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center sm:items-center p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl overflow-hidden animate-slide-up">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-4">
            Sair da conta
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            Tem certeza que deseja sair?
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-medium"
            >
              Sim, sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Perfil() {
  const { id: profileId } = useParams(); // ID do perfil sendo visualizado
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'eventos' | 'colecoes' | 'sobre'>('eventos');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoKey, setPhotoKey] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postsPage, setPostsPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  // Static data for events and collections
  const staticData = {
    events: [
      {
        id: 1,
        title: 'Festival de Música e Shows',
        date: 'Dom, 23 Dez • 19:00 - 23:00',
        location: 'Parque Central, São Paulo',
        image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=500&h=300&fit=crop',
        isFree: true
      },
      {
        id: 2,
        title: 'Competição de DJs',
        date: 'Ter, 16 Dez • 18:00 - 22:00',
        location: 'Avenida Nova, São Paulo',
        image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500&h=300&fit=crop',
        isFree: false
      }
    ],
    collections: [
      {
        id: 1,
        image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=300&h=300&fit=crop',
        likes: 1234
      },
      {
        id: 2,
        image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=300&h=300&fit=crop',
        likes: 856
      },
      {
        id: 3,
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop',
        likes: 654
      },
      {
        id: 4,
        image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=300&h=300&fit=crop',
        likes: 432
      },
      {
        id: 5,
        image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=300&h=300&fit=crop',
        likes: 321
      },
      {
        id: 6,
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=300&fit=crop',
        likes: 234
      }
    ]
  };

  const isOwnProfile = !profileId || (user && profileId === user.id);

  useEffect(() => {
    loadProfile();
  }, [user, profileId]); // Recarrega quando o profileId mudar

  async function loadProfile() {
    try {
      if (!user) return;
      
      const targetId = profileId || user.id;
      
      // Carregar dados do perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', targetId)
        .maybeSingle();

      if (profileError) {
        console.error('Erro ao carregar perfil:', profileError);
        return;
      }

      // Carregar contadores
      const [followersCount, followingCount] = await Promise.all([
        // Contar seguidores
        supabase
          .from('followers')
          .select('id', { count: 'exact' })
          .eq('followed_id', targetId)
          .then(({ count }) => count || 0),
        
        // Contar seguindo
        supabase
          .from('followers')
          .select('id', { count: 'exact' })
          .eq('follower_id', targetId)
          .then(({ count }) => count || 0)
      ]);

      if (!profileData) {
        // Se o perfil não existe, cria um novo
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: targetId,
              full_name: user.user_metadata?.full_name || 'Usuário',
              avatar_url: null
            }
          ])
          .select('id, full_name, avatar_url')
          .maybeSingle();

        if (insertError) {
          console.error('Erro ao criar perfil:', insertError);
          return;
        }

        // Verificar se está seguindo
        if (!isOwnProfile) {
          const { data: followData } = await supabase
            .from('followers')
            .select('id')
            .eq('follower_id', user.id)
            .eq('followed_id', targetId)
            .maybeSingle();

          setProfile({
            ...(newProfile || {}),
            followers_count: followersCount,
            following_count: followingCount,
            events_count: 0,
            is_following: !!followData
          });
        } else {
          setProfile({
            ...(newProfile || {}),
            followers_count: followersCount,
            following_count: followingCount,
            events_count: 0
          });
        }
        return;
      }

      // Se encontrou o perfil, verificar se está seguindo
      if (!isOwnProfile) {
        const { data: followData } = await supabase
          .from('followers')
          .select('id')
          .eq('follower_id', user.id)
          .eq('followed_id', targetId)
          .maybeSingle();

        setProfile({
          ...profileData,
          followers_count: followersCount,
          following_count: followingCount,
          events_count: 0,
          is_following: !!followData
        });
      } else {
        setProfile({
          ...profileData,
          followers_count: followersCount,
          following_count: followingCount,
          events_count: 0
        });
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (activeTab === 'eventos' && profile && events.length === 0) {
      loadEvents(true);
    }
  }, [activeTab, profile]);

  useEffect(() => {
    if (activeTab === 'colecoes' && profile && posts.length === 0) {
      loadPosts(true);
    }
  }, [activeTab, profile]);

  async function loadEvents(refresh = false) {
    try {
      if (!profile || loadingEvents || (!hasMore && !refresh)) return;

      if (refresh) {
        setPage(1);
        setEvents([]);
        setHasMore(true);
      }

      setLoadingEvents(true);
      
      // Buscar eventos do usuário
      const { data, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          date,
          location,
          image_url,
          is_free
        `)
        .eq('user_id', profile.id)
        .range((page - 1) * 10, page * 10 - 1)
        .order('date', { ascending: false });

      if (error) throw error;

      if (data) {
        setEvents(prev => refresh ? data : [...prev, ...data]);
        setHasMore(data.length === 10);
        if (!refresh) setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoadingEvents(false);
    }
  }

  async function loadPosts(refresh = false) {
    try {
      if (!profile || loadingPosts || (!hasMorePosts && !refresh)) return;

      if (refresh) {
        setPostsPage(1);
        setPosts([]);
        setHasMorePosts(true);
      }

      setLoadingPosts(true);
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          image_url,
          caption,
          created_at,
          likes_count,
          post_likes!inner(id)
        `)
        .eq('user_id', profile.id)
        .eq('post_likes.user_id', user?.id)
        .range((postsPage - 1) * 12, postsPage * 12 - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const postsWithLikes = data?.map(post => ({
        ...post,
        is_liked: post.post_likes?.length > 0
      })) || [];

      setPosts(prev => refresh ? postsWithLikes : [...prev, ...postsWithLikes]);
      setHasMorePosts(data?.length === 12);
      if (!refresh) setPostsPage(prev => prev + 1);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const handleUploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || !event.target.files[0] || !user) return;
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      setUploadingPhoto(true);

      // Remove old avatar if exists
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('avatars').remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      // Obter a URL pública corretamente
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      if (!data.publicUrl) throw new Error('Erro ao obter URL pública');

      // Atualizar o perfil com a URL pública
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id);
      if (updateError) throw updateError;

      // Atualizar o estado do perfil
      setProfile(prev => prev ? { ...prev, avatar_url: data.publicUrl } : null);
      setPhotoKey(Date.now()); // Forçar atualização da imagem no front
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      alert('Erro ao fazer upload da foto. Por favor, tente novamente.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleFollow = async () => {
    if (!user || !profile || followLoading || isOwnProfile) return;
    
    try {
      setFollowLoading(true);
      
      if (profile.is_following) {
        // Deixar de seguir
        const { error } = await supabase
          .from('followers')
          .delete()
          .eq('follower_id', user.id)
          .eq('followed_id', profile.id);

        if (error) {
          console.error('Erro ao deixar de seguir:', error);
          toast.error('Erro ao deixar de seguir usuário');
          return;
        }

        toast.success('Deixou de seguir');
        setProfile(prev => prev ? {
          ...prev,
          is_following: false,
          followers_count: Math.max(0, prev.followers_count - 1)
        } : null);
      } else {
        // Seguir
        const { error } = await supabase
          .from('followers')
          .insert({
            follower_id: user.id,
            followed_id: profile.id
          });

        if (error) {
          console.error('Erro ao seguir:', error);
          toast.error('Erro ao seguir usuário');
          return;
        }

        toast.success('Seguindo!');
        setProfile(prev => prev ? {
          ...prev,
          is_following: true,
          followers_count: prev.followers_count + 1
        } : null);
      }
    } catch (error) {
      console.error('Erro ao atualizar follow:', error);
      toast.error('Erro ao atualizar seguidor');
    } finally {
      setFollowLoading(false);
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

  const getPhotoUrl = () => {
    if (!profile?.avatar_url) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'User')}&background=6366f1&color=fff`;
    }
    return `${profile.avatar_url}?v=${photoKey}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <Loader className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="p-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Perfil
          </h1>
          <div className="flex items-center gap-4 absolute top-4 right-4">
            <button
              onClick={() => navigate('/notificacoes')}
              className="text-gray-700 dark:text-gray-300"
            >
              <Bell className="w-6 h-6" />
            </button>
            <button 
              onClick={() => navigate('/configuracoes')}
              className="text-gray-700 dark:text-gray-300"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-16" 
          onScroll={(e) => {
            const target = e.target as HTMLDivElement;
            const bottom = target.scrollHeight - target.scrollTop === target.clientHeight;
            if (bottom && !loadingEvents && hasMore && activeTab === 'eventos') {
              loadEvents();
            }
            if (bottom && !loadingPosts && hasMorePosts && activeTab === 'colecoes') {
              loadPosts();
            }
          }}
        >
          {/* Profile Info */}
          <div className="px-6 pt-4">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
                  {uploadingPhoto ? (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Loader className="w-8 h-8 text-purple-600 animate-spin" />
                    </div>
                  ) : (
                    <img
                      src={getPhotoUrl()}
                      alt="Perfil"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'User')}&background=6366f1&color=fff`;
                      }}
                    />
                  )}
                </div>
                {isOwnProfile && (
                  <label className="absolute bottom-4 right-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadAvatar}
                      disabled={uploadingPhoto}
                      className="hidden"
                    />
                    <Camera className="w-4 h-4 text-white" />
                  </label>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {profile?.full_name}
              </h2>

              {/* Botão Seguir - só aparece se não for o próprio perfil */}
              {!isOwnProfile && profile && (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`mb-6 px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                    profile.is_following
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {followLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : profile.is_following ? (
                    'Seguindo'
                  ) : (
                    'Seguir'
                  )}
                </button>
              )}

              {/* Stats */}
              <div className="flex justify-center gap-8 mb-6">
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{profile?.events_count || 0}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Eventos</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{profile?.followers_count}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Seguidores</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{profile?.following_count}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Seguindo</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex w-full border-b border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setActiveTab('eventos')}
                  className={`flex-1 py-3 text-sm font-medium ${
                    activeTab === 'eventos'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Eventos
                </button>
                <button
                  onClick={() => setActiveTab('colecoes')}
                  className={`flex-1 py-3 text-sm font-medium ${
                    activeTab === 'colecoes'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Coleções
                </button>
                <button
                  onClick={() => setActiveTab('sobre')}
                  className={`flex-1 py-3 text-sm font-medium ${
                    activeTab === 'sobre'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Sobre
                </button>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="px-4 pt-4">
            {activeTab === 'eventos' && (
              <div className="space-y-4">
                {events.map(event => (
                  <div
                    key={event.id}
                    className="flex gap-3 items-center bg-gray-100 dark:bg-gray-800 p-3 rounded-xl transform transition-transform active:scale-98 cursor-pointer"
                    onClick={() => navigate(`/evento/${event.id}`)}
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      {event.is_free && (
                        <span className="absolute top-1 left-1 bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                          Grátis
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1 truncate">
                        {event.title}
                      </h3>
                      <div className="flex items-center text-gray-600 dark:text-gray-400 text-xs mb-1">
                        <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{event.date}</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400 text-xs">
                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {loadingEvents && (
                  <div className="flex justify-center py-4">
                    <Loader className="w-6 h-6 text-purple-600 animate-spin" />
                  </div>
                )}

                {!loadingEvents && events.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Nenhum evento encontrado
                    </p>
                    <button
                      onClick={() => navigate('/eventos')}
                      className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm hover:bg-purple-700 transition-colors"
                    >
                      Explorar Eventos
                    </button>
                  </div>
                )}

                {!loadingEvents && !hasMore && events.length > 0 && (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                    Não há mais eventos para carregar
                  </p>
                )}
              </div>
            )}

            {activeTab === 'colecoes' && (
              <>
                {isOwnProfile && (
                  <button
                    onClick={() => navigate('/novo-post')}
                    className="mx-4 mb-4 py-2 bg-purple-600 text-white rounded-full text-sm font-medium hover:bg-purple-700 transition-colors"
                  >
                    Criar Nova Postagem
                  </button>
                )}
                
                <div className="grid grid-cols-3 gap-[2px]">
                  {posts.map(post => (
                    <div 
                      key={post.id}
                      className="relative aspect-square group cursor-pointer"
                      onClick={() => navigate(`/post/${post.id}`)}
                    >
                      <img
                        src={post.image_url}
                        alt="Post"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex items-center text-white">
                          <Heart className={`w-5 h-5 ${post.is_liked ? 'fill-white' : ''} text-white mr-1`} />
                          <span className="text-sm font-medium">{post.likes_count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {loadingPosts && (
                  <div className="flex justify-center py-4">
                    <Loader className="w-6 h-6 text-purple-600 animate-spin" />
                  </div>
                )}

                {!loadingPosts && posts.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Nenhuma postagem encontrada
                    </p>
                    {isOwnProfile && (
                      <button
                        onClick={() => navigate('/novo-post')}
                        className="bg-purple-600 text-white px-6 py-2 rounded-full text-sm hover:bg-purple-700 transition-colors"
                      >
                        Criar Primeira Postagem
                      </button>
                    )}
                  </div>
                )}

                {!loadingPosts && !hasMorePosts && posts.length > 0 && (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                    Não há mais postagens para carregar
                  </p>
                )}
              </>
            )}

            {activeTab === 'sobre' && (
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p>
                  {profile?.bio || 'Nenhuma biografia adicionada.'}
                </p>
                <div>
                  <h3 className="text-gray-900 dark:text-white font-medium mb-2">Interesses</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Música', 'Arte', 'Festivais', 'Cultura', 'Fotografia'].map((interesse) => (
                      <span
                        key={interesse}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm"
                      >
                        {interesse}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navbar */}
        <Navbar />
      </div>

      {showLogoutModal && (
        <LogoutModal
          onClose={() => setShowLogoutModal(false)}
          onConfirm={handleSignOut}
        />
      )}
    </div>
  );
}

export default Perfil;