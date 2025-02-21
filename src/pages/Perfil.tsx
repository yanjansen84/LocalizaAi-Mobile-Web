import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, MoreHorizontal, Heart, MapPin, Calendar, Moon, Sun,
  Settings, ChevronRight, Shield, Languages, HelpCircle, Users, Star,
  LogOut, Ticket, Loader, Camera, X
} from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';

interface UserProfile {
  full_name: string;
  avatar_url: string | null;
  bio?: string;
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
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'eventos' | 'colecoes' | 'sobre'>('eventos');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoKey, setPhotoKey] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    loadProfile();
  }, [user]);

  async function loadProfile() {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('full_name, avatar_url, bio')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setPhotoKey(Date.now()); // Force image update
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
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
      const { error: updateError } = await supabase.from('users').update({ avatar_url: data.publicUrl }).eq('id', user.id);
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
          <button 
            onClick={() => navigate('/configuracoes')}
            className="text-gray-700 dark:text-gray-300"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-16">
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
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {profile?.full_name}
              </h2>

              {/* Stats */}
              <div className="flex justify-center gap-8 mb-6">
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">12</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Eventos</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">7.389</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Seguidores</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">125</p>
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
                {staticData.events.map(event => (
                  <div
                    key={event.id}
                    className="flex gap-3 items-center bg-gray-100 dark:bg-gray-800 p-3 rounded-xl"
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      {event.isFree && (
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
                    <button className="p-2 text-gray-400 dark:text-gray-600 hover:text-purple-600 dark:hover:text-purple-500">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'colecoes' && (
              <div className="grid grid-cols-3 gap-1">
                {staticData.collections.map(collection => (
                  <div key={collection.id} className="relative aspect-square">
                    <img
                      src={collection.image}
                      alt="Coleção"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                      <div className="flex items-center text-white">
                        <Heart className="w-4 h-4 fill-white text-white mr-1" />
                        <span className="text-sm">{collection.likes}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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