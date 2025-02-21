import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader as IconLoader, MapPin, Search, X } from 'lucide-react';
import { Loader } from '@googlemaps/js-api-loader';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';

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

  const initializeMap = async () => {
    const loader = new Loader({
      apiKey: 'AIzaSyAXeo9hYy2hNYRVdFqp1B2w5leGayJECaY',
      version: 'weekly',
      libraries: ['places'] // Carregar apenas as bibliotecas necessárias
    });

    try {
      const google = await loader.load();
      const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;

      if (mapRef.current) {
        const mapStyles = {
          dark: [
            {
              "elementType": "geometry",
              "stylers": [{ "color": "#242f3e" }]
            },
            {
              "elementType": "labels.text.stroke",
              "stylers": [{ "color": "#242f3e" }]
            },
            {
              "elementType": "labels.text.fill",
              "stylers": [{ "color": "#746855" }]
            },
            {
              "featureType": "poi",
              "stylers": [{ "visibility": "off" }]
            },
            {
              "featureType": "transit",
              "stylers": [{ "visibility": "off" }]
            }
          ],
          light: [
            {
              "featureType": "poi",
              "stylers": [{ "visibility": "off" }]
            },
            {
              "featureType": "transit",
              "stylers": [{ "visibility": "off" }]
            }
          ]
        };

        const isDark = document.documentElement.classList.contains('dark');
        const mapInstance = new Map(mapRef.current, {
          center: { lat: -23.550520, lng: -46.633308 },
          zoom: 13,
          styles: isDark ? mapStyles.dark : mapStyles.light,
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeControl: false
        });

        setMap(mapInstance);

        // Observer para mudanças de tema
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
              const isDark = document.documentElement.classList.contains('dark');
              mapInstance.setOptions({
                styles: isDark ? mapStyles.dark : mapStyles.light
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
              const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              setUserLocation(location);
              mapInstance.setCenter(location);

              // Criar círculo de raio com cores adaptativas
              const circle = new google.maps.Circle({
                strokeColor: '#6366F1',
                strokeOpacity: 0.2,
                strokeWeight: 2,
                fillColor: '#6366F1',
                fillOpacity: 0.1,
                map: mapInstance,
                center: location,
                radius: 3000 // 3km em metros
              });
              setLocationRadius(circle);
            },
            () => {
              console.log('Erro ao obter localização do usuário');
            }
          );
        }

        return () => observer.disconnect();
      }
    } catch (error) {
      console.error('Erro ao carregar o Google Maps:', error);
      setError('Erro ao carregar o mapa. Por favor, tente novamente.');
    }
  };

  useEffect(() => {
    if (user) {
      loadEvents();
      initializeMap();
    }
  }, [user]);

  useEffect(() => {
    if (map && events.length > 0) {
      // Limpar marcadores existentes
      markers.forEach(marker => marker.setMap(null));
      const newMarkers: google.maps.Marker[] = [];

      // Filtrar eventos
      const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Criar marcadores personalizados
      filteredEvents.forEach(event => {
        if (event.latitude && event.longitude) {
          const marker = new google.maps.Marker({
            position: { lat: event.latitude, lng: event.longitude },
            map,
            title: event.title,
            animation: google.maps.Animation.DROP,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#6366F1',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: 10
            }
          });

          marker.addListener('click', () => {
            setSelectedEvent(event);
            map.panTo({ lat: event.latitude, lng: event.longitude });
          });

          newMarkers.push(marker);
        }
      });

      setMarkers(newMarkers);
    }
  }, [map, events, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <IconLoader className="w-8 h-8 text-purple-600 animate-spin" />
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
      <div className="h-screen flex flex-col">
        {/* Search Bar */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar eventos próximos..."
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 shadow-lg"
            />
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <div ref={mapRef} className="absolute inset-0" />
          
          {/* Selected Event Card */}
          {selectedEvent && (
            <div className="absolute bottom-20 left-4 right-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg animate-slide-up">
              <div className="flex gap-4">
                <img
                  src={selectedEvent.image_url}
                  alt={selectedEvent.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {selectedEvent.title}
                  </h3>
                  <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{selectedEvent.location}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <img
                      src={selectedEvent.organizer.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedEvent.organizer.full_name)}&background=6366f1&color=fff`}
                      alt={selectedEvent.organizer.full_name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedEvent.organizer.full_name}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => navigate(`/evento/${selectedEvent.id}`)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-full text-sm"
                  >
                    Ver Detalhes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navbar */}
        <Navbar />
      </div>
    </div>
  );
}

export default Mapa;