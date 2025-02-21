import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Calendar, MapPin, Loader2 } from 'lucide-react';
import { useEvent } from '../hooks/useEvent';
import { supabase } from '../lib/supabase';

function DetalhesEvento() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { event, loading, error, toggleFollowOrganizer, addToCalendar } = useEvent(id || '');

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <p className="text-gray-900 dark:text-white text-center mb-4">
          {error || 'Evento não encontrado'}
        </p>
        <Link
          to="/eventos"
          className="px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
        >
          Voltar para Eventos
        </Link>
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You might want to show a toast notification here
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="h-screen flex flex-col">
        {/* Header Actions - Fixed */}
        <div className="fixed top-0 w-full p-4 flex justify-between items-center z-50">
          <Link
            to="/eventos"
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <div className="flex gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
              aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              <Heart
                className={`w-6 h-6 ${
                  isFavorite ? 'fill-purple-500 text-purple-500' : 'text-white'
                }`}
              />
            </button>
            <button 
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
              aria-label="Compartilhar evento"
            >
              <Share2 className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Content with Image */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* Image Slider */}
          <div className="relative h-[45vh] w-full">
            <img
              src={event.gallery[currentSlide] || '/placeholder-event.jpg'}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />

            {/* Slider Indicators */}
            {event.gallery.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {event.gallery.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full ${
                      currentSlide === index ? 'bg-purple-500' : 'bg-white/50'
                    }`}
                    aria-label={`Ir para imagem ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Event Details */}
          <div className="p-4 pb-24">
            {/* Title and Category */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 text-xs rounded-full">
                  {event.category}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {event.title}
              </h1>
            </div>

            {/* Date and Location */}
            <div className="space-y-4 mb-6">
              <div className="w-full flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-gray-900 dark:text-white font-medium">
                    {event.date}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {event.time}
                  </p>
                </div>
                <button 
                  onClick={addToCalendar}
                  className="px-3 py-1 text-sm text-purple-600 bg-purple-100 dark:bg-purple-900/30 rounded-full"
                  aria-label="Adicionar ao calendário"
                >
                  Adicionar
                </button>
              </div>

              <div className="w-full flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-gray-900 dark:text-white font-medium">
                    {event.location.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {event.location.address}
                  </p>
                </div>
                <button 
                  onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(event.location.address)}`, '_blank')}
                  className="px-3 py-1 text-sm text-purple-600 bg-purple-100 dark:bg-purple-900/30 rounded-full"
                  aria-label="Ver no mapa"
                >
                  Mapa
                </button>
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Preço
              </h2>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {event.price.min === 0 && event.price.max === 0 
                    ? 'Gratuito'
                    : `R$ ${event.price.min} ${event.price.min !== event.price.max ? `- R$ ${event.price.max}` : ''}`
                  }
                </p>
                {event.price.min !== event.price.max && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    *O preço pode variar de acordo com o pacote
                  </p>
                )}
              </div>
            </div>

            {/* About Event */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Sobre o Evento
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {event.description}
              </p>
            </div>

            {/* Organizer */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Organizador
              </h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {event.organizer.avatar ? (
                    <img
                      src={event.organizer.avatar}
                      alt={event.organizer.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <span className="text-purple-600 text-lg font-semibold">
                        {event.organizer.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {event.organizer.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Organizador
                    </p>
                  </div>
                </div>
                {currentUserId && currentUserId !== event.organizer.id && (
                  <button
                    onClick={toggleFollowOrganizer}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      event.organizer.isFollowing
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {event.organizer.isFollowing ? 'Seguindo' : 'Seguir'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetalhesEvento;