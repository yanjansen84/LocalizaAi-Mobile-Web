import React, { useState } from 'react';
import { ArrowLeft, Search, Calendar, MapPin, SlidersHorizontal, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const categories = [
  { id: 'all', name: 'Todos', icon: '✓' },
  { id: 'music', name: 'Música', icon: '🎵' },
  { id: 'art', name: 'Arte', icon: '🎨' },
  { id: 'workshop', name: 'Workshop', icon: '💡' },
  { id: 'food', name: 'Gastronomia', icon: '🍽' },
  { id: 'fashion', name: 'Moda', icon: '👗' }
];

const events = [
  {
    id: 1,
    title: 'Show Bastau',
    date: '17 Dez • 19:00 - 22:00',
    location: 'Grand Avenue, São Paulo',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=500&h=300&fit=crop',
    category: 'music',
    price: 120,
    distance: 3.5,
    attendees: [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=faces'
    ]
  },
  {
    id: 2,
    title: 'DJ Concerto Rico',
    date: '18 Dez • 20:00 - 23:00',
    location: 'LA Avenue, São Paulo',
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500&h=300&fit=crop',
    category: 'music',
    price: 150,
    distance: 5.2,
    attendees: [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=faces'
    ]
  }
];

interface FilterState {
  categories: string[];
  priceRange: [number, number];
  location: string;
  distanceRange: [number, number];
}

function EventosPopulares() {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    categories: ['all'],
    priceRange: [50, 500],
    location: 'São Paulo, Brasil',
    distanceRange: [1, 50]
  });

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filters.categories.includes('all') || filters.categories.includes(event.category);
    const matchesPrice = event.price >= filters.priceRange[0] && event.price <= filters.priceRange[1];
    const matchesDistance = event.distance >= filters.distanceRange[0] && event.distance <= filters.distanceRange[1];
    
    return matchesSearch && matchesCategory && matchesPrice && matchesDistance;
  });

  const FilterPanel = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-3xl p-6 pb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Filtros</h2>
          <button 
            onClick={() => setShowFilters(false)}
            className="p-2 text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Categorias */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-medium">Categoria do Evento</h3>
            <button className="text-purple-400 text-sm">Ver Todos</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => {
                  setFilters(prev => ({
                    ...prev,
                    categories: [category.id]
                  }));
                }}
                className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 ${
                  filters.categories.includes(category.id)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Faixa de Preço */}
        <div className="mb-6">
          <h3 className="text-white font-medium mb-4">Faixa de Preço</h3>
          <div className="px-2">
            <input
              type="range"
              min="0"
              max="1000"
              step="10"
              value={filters.priceRange[1]}
              onChange={(e) => {
                setFilters(prev => ({
                  ...prev,
                  priceRange: [prev.priceRange[0], Number(e.target.value)]
                }));
              }}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between mt-2">
              <span className="text-gray-400">R$ {filters.priceRange[0]}</span>
              <span className="text-gray-400">R$ {filters.priceRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Localização */}
        <div className="mb-6">
          <h3 className="text-white font-medium mb-4">Localização</h3>
          <div className="bg-gray-800 rounded-xl p-3 flex items-center">
            <MapPin className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              value={filters.location}
              onChange={(e) => {
                setFilters(prev => ({
                  ...prev,
                  location: e.target.value
                }));
              }}
              className="bg-transparent text-white w-full outline-none"
              placeholder="Digite sua localização"
            />
          </div>
        </div>

        {/* Distância */}
        <div className="mb-8">
          <h3 className="text-white font-medium mb-4">Distância (km)</h3>
          <div className="px-2">
            <input
              type="range"
              min="1"
              max="100"
              value={filters.distanceRange[1]}
              onChange={(e) => {
                setFilters(prev => ({
                  ...prev,
                  distanceRange: [prev.distanceRange[0], Number(e.target.value)]
                }));
              }}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between mt-2">
              <span className="text-gray-400">{filters.distanceRange[0]}km</span>
              <span className="text-gray-400">{filters.distanceRange[1]}km</span>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-4">
          <button
            onClick={() => {
              setFilters({
                categories: ['all'],
                priceRange: [50, 500],
                location: 'São Paulo, Brasil',
                distanceRange: [1, 50]
              });
            }}
            className="flex-1 py-3 bg-gray-800 text-white rounded-xl"
          >
            Limpar
          </button>
          <button
            onClick={() => setShowFilters(false)}
            className="flex-1 py-3 bg-purple-600 text-white rounded-xl"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <Link to="/eventos" className="text-gray-700 dark:text-gray-300">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Em Alta
            </h1>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Pesquisar eventos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl border-0 focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
              />
            </div>
            <button
              onClick={() => setShowFilters(true)}
              className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-400"
            >
              <SlidersHorizontal className="w-6 h-6" />
            </button>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-4 mt-4 scrollbar-hide">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => {
                  setFilters(prev => ({
                    ...prev,
                    categories: [category.id]
                  }));
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap ${
                  filters.categories.includes(category.id)
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Event List */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-16">
          <div className="p-4 space-y-4">
            {filteredEvents.map(event => (
              <div
                key={event.id}
                className="bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden"
              >
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {event.title}
                  </h3>
                  <div className="flex items-center text-purple-600 text-sm mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-3">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {event.attendees.map((avatar, index) => (
                        <img
                          key={index}
                          src={avatar}
                          alt="Participante"
                          className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800"
                        />
                      ))}
                      <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-600 dark:text-gray-400 border-2 border-white dark:border-gray-800">
                        +5
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-full text-sm">
                      Reservar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && <FilterPanel />}

        {/* Navbar */}
        <Navbar />
      </div>
    </div>
  );
}

export default EventosPopulares;