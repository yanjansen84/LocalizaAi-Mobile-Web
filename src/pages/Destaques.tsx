import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import { Category, getCategories } from '../lib/categories';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  image_url: string;
  category_id: string;
}

function Destaques() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategories, setActiveCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchEvents();
    loadFavorites();
    loadCategories();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [selectedCategory, events]);

  useEffect(() => {
    // Atualiza as categorias ativas quando os eventos mudarem
    const categoriesWithEvents = categories.filter(category =>
      events.some(event => event.category_id === category.id)
    );
    setActiveCategories(categoriesWithEvents);
  }, [categories, events]);

  const loadCategories = async () => {
    const categoriesList = await getCategories();
    setCategories(categoriesList);
  };

  const loadFavorites = () => {
    const savedFavorites = localStorage.getItem('favoriteEvents');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  };

  const toggleFavorite = (eventId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(eventId)) {
        newFavorites.delete(eventId);
      } else {
        newFavorites.add(eventId);
      }
      localStorage.setItem('favoriteEvents', JSON.stringify([...newFavorites]));
      return newFavorites;
    });
  };

  const fetchEvents = async () => {
    try {
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      
      // Filtra eventos futuros
      const now = new Date();
      const futureEvents = (data || []).filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= now;
      });
      
      setEvents(futureEvents);
      setFilteredEvents(futureEvents);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    }
  };

  const filterEvents = () => {
    if (selectedCategory === 'all') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(event => event.category_id === selectedCategory));
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Link to="/eventos" className="text-gray-700 dark:text-gray-300">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Destaques
          </h1>
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
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
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 pb-20">
        {filteredEvents.map(event => (
          <div 
            key={event.id}
            className="relative rounded-2xl overflow-hidden h-48 group cursor-pointer"
            onClick={() => navigate(`/evento/${event.id}`)}
          >
            <img
              src={event.image_url || 'https://placehold.co/600x400/9333ea/ffffff?text=Evento'}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20 p-4 flex flex-col justify-end">
              <h3 className="text-white text-lg font-semibold mb-1">
                {event.title}
              </h3>
              <p className="text-purple-300 text-sm mb-1">
                {new Date(event.date).toLocaleDateString('pt-BR')}
              </p>
              <p className="text-gray-300 text-sm mb-3">
                {event.location}
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/compra-ingresso/escolha-ingresso`);
                  }}
                  className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-full text-sm hover:bg-purple-700 transition-colors text-center"
                >
                  Reservar
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(event.id);
                  }}
                  className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center"
                >
                  <Heart 
                    className={`w-5 h-5 ${
                      favorites.has(event.id)
                        ? 'fill-purple-500 text-purple-500'
                        : 'text-white'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navbar */}
      <Navbar />
    </div>
  );
}

export default Destaques;