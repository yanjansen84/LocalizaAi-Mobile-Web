import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bell, Search, Heart, MapPin, Calendar, Plus, Loader 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { truncateText, formatDate, formatDateFeatured, simplifyLocation } from '../utils/formatters';
import { useFavorites } from '../hooks/useFavorites';
import { EventSkeleton, FeaturedEventSkeleton } from '../components/EventSkeleton';
import { useEvents } from '../hooks/useEvents';
import { useCategories } from '../hooks/useCategories';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  image_url: string;
  is_free: boolean;
  category_id: string;
  latitude: number;
  longitude: number;
}

interface Profile {
  full_name: string;
  avatar_url: string | null;
}

const FeaturedCard = React.memo(({ destaque }: { destaque: Event }) => {
  const { isFavorite, toggleFavorite, isLoading } = useFavorites();
  const navigate = useNavigate();
  const defaultImage = 'https://placehold.co/600x400/9333ea/ffffff?text=Evento';

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(destaque.id);
  }, [destaque.id, toggleFavorite]);

  const handleCardClick = useCallback(() => {
    navigate(`/evento/${destaque.id}`);
  }, [destaque.id, navigate]);

  return (
    <div 
      className="relative flex-shrink-0 w-80 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-lg cursor-pointer animate-scale-up"
      onClick={handleCardClick}
    >
      <img
        src={destaque.image_url || defaultImage}
        alt={destaque.title}
        className="w-full h-48 object-cover"
        loading="lazy"
        decoding="async"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = defaultImage;
        }}
      />
      <div className="absolute top-3 right-3">
        <button
          onClick={handleFavoriteClick}
          className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center"
          disabled={isLoading(destaque.id)}
          aria-label={isFavorite(destaque.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <Heart
            className={`w-4 h-4 ${
              isFavorite(destaque.id) ? 'fill-purple-500 text-purple-500' : 'text-white'
            }`}
          />
        </button>
      </div>
      <div className="p-4">
        <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-2">{destaque.title}</h3>
        <div className="flex items-center text-purple-600 text-sm mb-2">
          <Calendar className="w-4 h-4 mr-2" aria-hidden="true" />
          <span>{formatDateFeatured(destaque.date)}</span>
        </div>
        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
          <MapPin className="w-4 h-4 mr-2" aria-hidden="true" />
          <span>{destaque.location}</span>
        </div>
      </div>
    </div>
  );
});

FeaturedCard.displayName = 'FeaturedCard';

const PopularEventCard = React.memo(({ event }: { event: Event }) => {
  const { isFavorite, toggleFavorite, isLoading } = useFavorites();
  const navigate = useNavigate();
  const defaultImage = 'https://placehold.co/600x400/9333ea/ffffff?text=Evento';

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(event.id);
  }, [event.id, toggleFavorite]);

  const handleCardClick = useCallback(() => {
    navigate(`/evento/${event.id}`);
  }, [event.id, navigate]);

  return (
    <div 
      className="rounded-[24px] overflow-hidden bg-white dark:bg-gray-800 shadow-lg cursor-pointer animate-scale-up"
      onClick={handleCardClick}
    >
      <div className="relative">
        <img
          src={event.image_url || defaultImage}
          alt={event.title}
          className="w-full h-40 object-cover"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = defaultImage;
          }}
        />
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center"
          disabled={isLoading(event.id)}
          aria-label={isFavorite(event.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <Heart
            className={`w-4 h-4 ${
              isFavorite(event.id) ? 'fill-purple-500 text-purple-500' : 'text-white'
            }`}
          />
        </button>
      </div>
      <div className="p-3">
        <h3 className="text-gray-900 dark:text-white font-semibold text-base mb-1">
          {truncateText(event.title, 25)}
        </h3>
        <div className="flex items-center text-purple-600 text-xs mb-1">
          <Calendar className="w-3 h-3 mr-1" aria-hidden="true" />
          <span>{formatDate(event.date)}</span>
        </div>
        <div className="flex items-center text-gray-600 dark:text-gray-400 text-xs">
          <MapPin className="w-3 h-3 mr-1" aria-hidden="true" />
          <span>{simplifyLocation(event.location)}</span>
        </div>
      </div>
    </div>
  );
});

PopularEventCard.displayName = 'PopularEventCard';

function Eventos() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loadFavorites } = useFavorites();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const { 
    events,
    filteredEvents,
    loading,
    error,
    hasMore,
    loadEvents,
    loadMoreEvents,
    filterEvents
  } = useEvents({ pageSize: 10 });

  const {
    categories,
    activeCategories,
    loading: categoriesLoading,
    updateActiveCategories
  } = useCategories();

  const loadProfile = useCallback(async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('users')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      setProfile(data);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  }, [user]);

  useEffect(() => {
    filterEvents(selectedCategory, searchQuery);
  }, [filterEvents, selectedCategory, searchQuery]);

  useEffect(() => {
    if (events.length > 0) {
      const categoryIds = [...new Set(events.map(event => event.category_id))];
      updateActiveCategories(categoryIds);
    }
  }, [events, updateActiveCategories]);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadFavorites();
      loadEvents(1);
    }
  }, [user, loadProfile, loadFavorites, loadEvents]);

  const renderLoadingSkeletons = useCallback(() => {
    return (
      <>
        <div className="mb-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4" />
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[1, 2, 3].map(i => (
              <FeaturedEventSkeleton key={`featured-skeleton-${i}`} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <EventSkeleton key={`event-skeleton-${i}`} />
          ))}
        </div>
      </>
    );
  }, []);

  const renderEvents = useCallback(() => {
    if (loading && events.length === 0) {
      return renderLoadingSkeletons();
    }

    if (error) {
      return <div className="text-center text-red-500 py-8">{error}</div>;
    }

    if (events.length === 0) {
      return <div className="text-center py-8">Nenhum evento encontrado</div>;
    }

    const eventsToDisplay = filteredEvents.length > 0 ? filteredEvents : events;

    return (
      <>
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Eventos em Destaque</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {eventsToDisplay.slice(0, 3).map(event => (
              <FeaturedCard key={event.id} destaque={event} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {eventsToDisplay.map(event => (
            <PopularEventCard key={event.id} event={event} />
          ))}
        </div>

        {hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={loadMoreEvents}
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Carregando...' : 'Carregar Mais'}
            </button>
          </div>
        )}
      </>
    );
  }, [loading, error, events, filteredEvents, hasMore, loadMoreEvents, renderLoadingSkeletons]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-full"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col h-screen">
        <header className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={profile?.avatar_url || 'https://placehold.co/100/9333ea/ffffff?text=User'}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {profile?.full_name || 'Olá!'}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Encontre eventos incríveis
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/notificacoes">
                  <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </Link>
                <Link to="/criar-evento">
                  <button className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar eventos"
                className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="pb-20">
            {searchQuery ? (
              <div className="px-4 py-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Resultados da Pesquisa
                </h2>
                {loading ? (
                  <div className="flex justify-center">
                    <Loader className="w-6 h-6 text-purple-600 animate-spin" />
                  </div>
                ) : filteredEvents.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {filteredEvents.map((event) => (
                      <PopularEventCard key={event.id} event={event} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">
                      Nenhum evento encontrado para "{searchQuery}"
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="px-4 py-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Em Destaque 
                    </h2>
                    <Link
                      to="/destaques"
                      className="text-sm text-purple-600 dark:text-purple-400"
                    >
                      Ver todos
                    </Link>
                  </div>
                  {loading ? (
                    <div className="flex justify-center">
                      <Loader className="w-6 h-6 text-purple-600 animate-spin" />
                    </div>
                  ) : (
                    <div className="overflow-x-auto no-scrollbar">
                      <div className="inline-flex gap-4 px-4 pb-4">
                        {events.slice(0, 3).map(event => (
                          <FeaturedCard key={event.id} destaque={event} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-4 py-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Eventos Populares 
                    </h2>
                    <Link
                      to="/populares"
                      className="text-sm text-purple-600 dark:text-purple-400"
                    >
                      Ver todos
                    </Link>
                  </div>

                  <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
                    <button 
                      onClick={() => setSelectedCategory('all')}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === 'all'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300'
                      }`}
                    >
                      Todos
                    </button>
                    {activeCategories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {loading ? (
                      <div className="flex justify-center col-span-2">
                        <Loader className="w-6 h-6 text-purple-600 animate-spin" />
                      </div>
                    ) : filteredEvents.length > 0 ? (
                      filteredEvents.map(event => (
                        <PopularEventCard key={event.id} event={event} />
                      ))
                    ) : (
                      <div className="text-center py-8 col-span-2">
                        <p className="text-gray-600 dark:text-gray-400">
                          Nenhum evento encontrado nesta categoria.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <Navbar />
      </div>
    </div>
  );
}

export default Eventos;
