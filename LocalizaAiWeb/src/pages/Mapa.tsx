import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { HeartIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { Loader } from '@googlemaps/js-api-loader';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  latitude: number;
  longitude: number;
  image_url: string;
  organizer: {
    full_name: string;
    avatar_url: string | null;
  };
}

function Mapa() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationRadius, setLocationRadius] = useState<google.maps.Circle | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          date,
          location,
          latitude,
          longitude,
          image_url,
          organizer:users!events_organizer_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      setError('Erro ao carregar eventos. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const initialize = async () => {
      try {
        setLoading(true);
        const loader = new Loader({
          apiKey: 'AIzaSyAXeo9hYy2hNYRVdFqp1B2w5leGayJECaY',
          version: 'weekly',
          libraries: ['places']
        });

        // Carregar a API do Google Maps
        await loader.load();

        // Carregar eventos
        await loadEvents();

        // Inicializar mapa apenas se o componente ainda estiver montado
        if (isMounted && mapRef.current && !map) {
          const mapStyles = {
            dark: [
              { elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
              { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a1a" }] },
              { elementType: "labels.text.fill", stylers: [{ color: "#919191" }] },
              {
                featureType: "administrative",
                elementType: "geometry",
                stylers: [{ visibility: "off" }]
              },
              {
                featureType: "poi",
                stylers: [{ visibility: "off" }]
              },
              {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#2c2c2c" }]
              },
              {
                featureType: "road",
                elementType: "labels",
                stylers: [{ visibility: "simplified" }]
              },
              {
                featureType: "road.arterial",
                elementType: "geometry",
                stylers: [{ color: "#373737" }]
              },
              {
                featureType: "road.highway",
                elementType: "geometry",
                stylers: [{ color: "#424242" }]
              },
              {
                featureType: "road.local",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              },
              {
                featureType: "transit",
                stylers: [{ visibility: "off" }]
              },
              {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#151515" }]
              }
            ],
            light: [
              { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
              { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
              { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
              {
                featureType: "administrative",
                elementType: "geometry",
                stylers: [{ visibility: "off" }]
              },
              {
                featureType: "poi",
                stylers: [{ visibility: "off" }]
              },
              {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#ffffff" }]
              },
              {
                featureType: "road",
                elementType: "labels",
                stylers: [{ visibility: "simplified" }]
              },
              {
                featureType: "road.arterial",
                elementType: "geometry",
                stylers: [{ color: "#f0f0f0" }]
              },
              {
                featureType: "road.highway",
                elementType: "geometry",
                stylers: [{ color: "#e6e6e6" }]
              },
              {
                featureType: "road.local",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              },
              {
                featureType: "transit",
                stylers: [{ visibility: "off" }]
              },
              {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#e9e9e9" }]
              }
            ]
          };

          const isDark = document.documentElement.classList.contains('dark');
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: { lat: -23.550520, lng: -46.633308 },
            zoom: 13,
            disableDefaultUI: true,
            zoomControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            mapTypeControl: false,
            gestureHandling: 'greedy',
            minZoom: 3,
            maxZoom: 18,
            scaleControl: false,
            rotateControl: false,
            panControl: false,
            backgroundColor: 'transparent',
            clickableIcons: false,
            tilt: 0,
            styles: [
              ...(isDark ? mapStyles.dark : mapStyles.light),
              {
                featureType: "all",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              },
              {
                featureType: "administrative",
                elementType: "all",
                stylers: [{ visibility: "off" }]
              },
              {
                featureType: "poi",
                elementType: "all",
                stylers: [{ visibility: "off" }]
              },
              {
                featureType: "transit",
                elementType: "all",
                stylers: [{ visibility: "off" }]
              }
            ]
          });

          const additionalStyles = [
            {
              featureType: "all",
              elementType: "labels.text.fill",
              stylers: [{ visibility: "off" }]
            },
            {
              featureType: "all",
              elementType: "labels.icon",
              stylers: [{ visibility: "off" }]
            }
          ];

          const currentStyles = isDark ? mapStyles.dark : mapStyles.light;
          mapInstance.setOptions({
            styles: [...currentStyles, ...additionalStyles]
          });

          setMap(mapInstance);

          // Observer para mudanças de tema
          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if (mutation.attributeName === 'class') {
                const isDark = document.documentElement.classList.contains('dark');
                const currentStyles = isDark ? mapStyles.dark : mapStyles.light;
                mapInstance.setOptions({
                  styles: [...currentStyles, ...additionalStyles]
                });
              }
            });
          });

          observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
          });

          // Obter localização do usuário
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                if (!isMounted) return;
                
                const location = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
                };
                
                setUserLocation(location);
                mapInstance.setCenter(location);
                mapInstance.setZoom(14);

                const circle = new google.maps.Circle({
                  strokeColor: isDark ? '#6366F1' : '#4F46E5',
                  strokeOpacity: 0.15,
                  strokeWeight: 1,
                  fillColor: isDark ? '#6366F1' : '#4F46E5',
                  fillOpacity: 0.05,
                  map: mapInstance,
                  center: location,
                  radius: 3000,
                  clickable: false
                });
                
                setLocationRadius(circle);
              },
              (error) => {
                console.error('Erro ao obter localização:', error);
              }
            );
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar o mapa:', error);
        if (isMounted) {
          setError('Falha ao carregar o mapa');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initialize();

    // Cleanup function
    return () => {
      isMounted = false;
      if (map) {
        // Limpar marcadores
        markers.forEach(marker => marker.setMap(null));
        // Limpar círculo de localização
        if (locationRadius) {
          locationRadius.setMap(null);
        }
      }
    };
  }, []); // Executar apenas uma vez na montagem

  // Função para calcular o centro dos eventos filtrados
  const centerMapOnFilteredEvents = (filteredEvents: Event[]) => {
    if (!map || !filteredEvents.length) return;

    // Se só tem um evento, centraliza nele
    if (filteredEvents.length === 1) {
      const event = filteredEvents[0];
      map.panTo({ lat: event.latitude, lng: event.longitude });
      map.setZoom(15);
      return;
    }

    // Calcula os limites para múltiplos eventos
    const bounds = new google.maps.LatLngBounds();
    filteredEvents.forEach(event => {
      if (event.latitude && event.longitude) {
        bounds.extend({ lat: event.latitude, lng: event.longitude });
      }
    });

    // Ajusta o mapa para mostrar todos os eventos
    map.fitBounds(bounds);
    
    // Ajusta o zoom se estiver muito próximo
    const zoom = map.getZoom();
    if (zoom && zoom > 15) {
      map.setZoom(15);
    }
  };

  useEffect(() => {
    if (!map || !events.length) return;

    // Limpar marcadores existentes
    markers.forEach(marker => marker.setMap(null));
    
    // Filtrar eventos
    const filteredEvents = events.filter(event =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Centralizar mapa nos eventos filtrados
    centerMapOnFilteredEvents(filteredEvents);

    // Criar novos marcadores
    const newMarkers = filteredEvents.map(event => {
      if (!event.latitude || !event.longitude) return null;

      const marker = new google.maps.Marker({
        position: { lat: event.latitude, lng: event.longitude },
        map,
        title: event.title,
        animation: google.maps.Animation.DROP,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: document.documentElement.classList.contains('dark') ? '#6366F1' : '#4F46E5',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 8
        }
      });

      marker.addListener('click', () => {
        setSelectedEvent(event);
        map.panTo({ lat: event.latitude, lng: event.longitude });
      });

      return marker;
    }).filter(Boolean) as google.maps.Marker[];

    setMarkers(newMarkers);
  }, [map, events, searchQuery]);

  const handleFavorite = (eventId: string) => {
    if (favorites.includes(eventId)) {
      setFavorites(favorites.filter(id => id !== eventId));
    } else {
      setFavorites([...favorites, eventId]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      
      {/* Search Bar */}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md z-50">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar eventos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <div className="absolute inset-y-0 right-3 flex items-center">
            <svg 
              className="w-5 h-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-[calc(100vh-64px)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
        </div>
      ) : (
        <div className="h-[calc(100vh-64px)] relative">
          {/* Map */}
          <div ref={mapRef} className="w-full h-full" />
          
          {/* Selected Event Card */}
          {selectedEvent && (
            <div 
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden cursor-pointer flex items-center p-2"
              onClick={() => navigate(`/event/${selectedEvent.id}`)}
            >
              <img 
                src={selectedEvent.image_url || '/event-placeholder.jpg'} 
                alt={selectedEvent.title}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div className="flex-1 ml-3">
                <h3 className="text-base font-medium text-gray-900 dark:text-white line-clamp-1">
                  {selectedEvent.title}
                </h3>
                <p className="text-sm text-indigo-600 dark:text-indigo-400">
                  {format(parseISO(selectedEvent.date), "EEE, MMM dd • HH:mm", { locale: ptBR })}
                </p>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <MapPinIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="line-clamp-1">{selectedEvent.location}</span>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleFavorite(selectedEvent.id);
                }}
                className="ml-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {favorites.includes(selectedEvent.id) ? (
                  <HeartIcon className="w-6 h-6 text-red-500" />
                ) : (
                  <HeartIcon className="w-6 h-6 text-gray-400" />
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Mapa;