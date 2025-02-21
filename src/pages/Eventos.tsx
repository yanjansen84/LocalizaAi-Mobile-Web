import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Heart, MapPin, Calendar, Plus, Loader 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { Category, getCategories } from '../lib/categories';
import { EventBadge } from '../components/EventBadge';
import { Header } from '../components/Header';
import { useDebounce } from '../hooks/useDebounce';
import { EventSkeleton, FeaturedEventSkeleton } from '../components/EventSkeleton';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  image_url: string;
  is_free: boolean;
  price: number;
  category_id: string;
  latitude: number;
  longitude: number;
}

interface Profile {
  full_name: string;
  avatar_url: string | null;
}

function FeaturedCard({ destaque }: { destaque: Event }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const defaultImage = 'https://placehold.co/600x400/9333ea/ffffff?text=Evento';

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnimating(true);
    setIsFavorite(!isFavorite);
    
    // Animação de scale
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div 
      className="relative flex-shrink-0 w-80 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-lg cursor-pointer animate-scale-up"
      onClick={() => navigate(`/evento/${destaque.id}`)}
    >
      <img
        src={destaque.image_url || defaultImage}
        alt={destaque.title}
        className="w-full h-48 object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = defaultImage;
        }}
      />
      <div className="absolute top-3 right-3">
        <button
          onClick={handleFavoriteClick}
          className={`w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-transform ${
            isAnimating ? 'scale-125' : ''
          }`}
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          aria-pressed={isFavorite}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite ? 'fill-purple-500 text-purple-500' : 'text-white'
            }`}
            aria-hidden="true"
          />
          <span className="sr-only">
            {isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          </span>
        </button>
      </div>
      <EventBadge 
        isFree={destaque.is_free} 
        price={destaque.price}
        className="absolute top-4 left-4"
      />
      <div className="p-4">
        <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-2">{destaque.title}</h3>
        <div className="flex items-center text-purple-600 text-sm mb-2">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{new Date(destaque.date).toLocaleDateString('pt-BR', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          })}</span>
        </div>
        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
          <MapPin className="w-4 h-4 mr-2" />
          <span>{destaque.location}</span>
        </div>
      </div>
    </div>
  );
}

function PopularEventCard({ event }: { event: Event }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const defaultImage = 'https://placehold.co/600x400/9333ea/ffffff?text=Evento';

  // Função para truncar o texto
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Função para formatar a data de forma mais concisa
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Função para simplificar o endereço
  const simplifyLocation = (location: string) => {
    return location.split('-')[0].trim();
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnimating(true);
    setIsFavorite(!isFavorite);
    
    // Animação de scale
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div 
      className="rounded-[24px] overflow-hidden bg-white dark:bg-gray-800 shadow-lg cursor-pointer animate-scale-up"
      onClick={() => navigate(`/evento/${event.id}`)}
    >
      <div className="relative">
        <img
          src={event.image_url || defaultImage}
          alt={event.title}
          className="w-full h-40 object-cover"
          onError={(e) => {
            const target =e.target as HTMLImageElement;
            target.src = defaultImage;
          }}
        />
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-transform ${
            isAnimating ? 'scale-125' : ''
          }`}
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          aria-pressed={isFavorite}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite ? 'fill-purple-500 text-purple-500' : 'text-white'
            }`}
            aria-hidden="true"
          />
          <span className="sr-only">
            {isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          </span>
        </button>
        <EventBadge 
          isFree={event.is_free} 
          price={event.price}
          className="absolute top-4 left-4"
        />
      </div>
      <div className="p-3">
        <h3 className="text-gray-900 dark:text-white font-semibold text-base mb-1">
          {truncateText(event.title, 25)}
        </h3>
        <div className="flex items-center text-purple-600 text-xs mb-1">
          <Calendar className="w-3 h-3 mr-1" />
          <span>{formatDate(event.date)}</span>
        </div>
        <div className="flex items-center text-gray-600 dark:text-gray-400 text-xs">
          <MapPin className="w-3 h-3 mr-1" />
          <span>{simplifyLocation(event.location)}</span>
        </div>
      </div>
    </div>
  );
}

function Eventos() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategories, setActiveCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300); // 300ms delay

  async function loadEvents() {
    try {
      setLoading(true);
      setError(null);

      // Carregar eventos primeiro
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (eventsError) throw eventsError;

      // Filtrar eventos por data
      const now = new Date();
      let futureEvents = (eventsData || []).filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= now;
      });

      // Iniciar carregamento da localização em paralelo
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat1 = position.coords.latitude;
            const lon1 = position.coords.longitude;
            
            // Filtrar eventos por distância
            futureEvents = futureEvents.filter(event => {
              const lat2 = event.latitude;
              const lon2 = event.longitude;
              
              const R = 6371;
              const dLat = (lat2 - lat1) * Math.PI / 180;
              const dLon = (lon2 - lon1) * Math.PI / 180;
              const a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
              const distance = R * c;

              return distance <= 20;
            });

            setEvents(futureEvents);
            setFilteredEvents(futureEvents);
          },
          (error) => {
            console.warn('Erro de geolocalização:', error);
            // Se houver erro na geolocalização, ainda mostra os eventos futuros
            setEvents(futureEvents);
            setFilteredEvents(futureEvents);
          }
        );
      } else {
        // Se geolocalização não estiver disponível, mostra todos os eventos futuros
        setEvents(futureEvents);
        setFilteredEvents(futureEvents);
      }

    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      setError('Não foi possível carregar os eventos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }

  // Memoize a função de filtro para evitar recálculos desnecessários
  const filterEvents = useCallback(() => {
    let filtered = [...events];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category_id === selectedCategory);
    }

    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase().trim();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query)
      );
    }

    setFilteredEvents(filtered);
  }, [events, selectedCategory, debouncedSearch]);

  useEffect(() => {
    if (user) {
      loadEvents();
      loadCategories();
    }
  }, [user]);

  useEffect(() => {
    filterEvents();
  }, [filterEvents]);

  // Remover useEffect desnecessário
  const loadCategories = async () => {
    try {
      const categoriesList = await getCategories();
      setCategories(categoriesList);
      // Atualizar categorias ativas aqui mesmo
      const categoriesWithEvents = categoriesList.filter(category =>
        events.some(event => event.category_id === category.id)
      );
      setActiveCategories(categoriesWithEvents);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

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
      <div className="pb-16"> {/* Espaço para a Navbar fixa */}
        <Header />
        
        <div className="relative">
          {/* Search Bar */}
          <div className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-600" />
              <input
                type="text"
                placeholder="Pesquisar eventos"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          {loading ? (
            <div className="px-4 py-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Em Destaque 🌟
                </h2>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <div className="inline-flex gap-4 px-4 pb-4">
                  {[1, 2, 3].map((index) => (
                    <FeaturedEventSkeleton key={index} />
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Eventos Populares 🔥
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((index) => (
                    <EventSkeleton key={index} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Conteúdo Normal
            <>
              {/* Featured Events */}
              <div className="px-4 py-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Em Destaque 🌟
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

              {/* Popular Events */}
              <div className="px-4 py-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Eventos Populares 🔥
                  </h2>
                  <Link
                    to="/populares"
                    className="text-sm text-purple-600 dark:text-purple-400"
                  >
                    Ver todos
                  </Link>
                </div>

                {/* Categories */}
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

                {/* Event Cards */}
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

      {/* Navbar Fixa */}
      <Navbar />
    </div>
  );
}

export default Eventos;