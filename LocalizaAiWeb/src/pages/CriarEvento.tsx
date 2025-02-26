import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Upload, X, DollarSign, Clock, Tag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import DatePicker, { registerLocale } from 'react-datepicker';
import { Loader } from '@googlemaps/js-api-loader';
import ptBR from 'date-fns/locale/pt-BR';
import { Category, getCategories } from '../lib/categories';
import "react-datepicker/dist/react-datepicker.css";

// Registrar localização pt-BR
registerLocale('pt-BR', ptBR);

interface FormData {
  title: string;
  description: string;
  date: Date;
  time: Date;
  location: string;
  latitude: number | null;
  longitude: number | null;
  image: File | null;
  image_preview: string;
  is_free: boolean;
  price: string;
  category_id: string;
}

interface PlaceSuggestion {
  place_id: string;
  description: string;
}

function CriarEvento() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<PlaceSuggestion[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const timePickerRef = useRef<HTMLDivElement>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    date: new Date(),
    time: new Date(),
    location: '',
    latitude: null,
    longitude: null,
    image: null,
    image_preview: '',
    is_free: false,
    price: '',
    category_id: ''
  });

  useEffect(() => {
    const initializeMap = async () => {
      const loader = new Loader({
        apiKey: 'AIzaSyAXeo9hYy2hNYRVdFqp1B2w5leGayJECaY',
        version: 'weekly',
        libraries: ['places']
      });

      try {
        const google = await loader.load();
        const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
        const { AutocompleteService, PlacesService } = await google.maps.importLibrary("places") as google.maps.PlacesLibrary;

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
              }
            ],
            light: [] // Tema claro usa o estilo padrão do Google Maps
          };

          const mapInstance = new Map(mapRef.current, {
            center: { lat: -23.550520, lng: -46.633308 }, // São Paulo
            zoom: 12,
            styles: document.documentElement.classList.contains('dark') ? mapStyles.dark : mapStyles.light
          });

          setMap(mapInstance);
          setAutocompleteService(new AutocompleteService());
          setPlacesService(new PlacesService(mapInstance));
        }
      } catch (error) {
        console.error('Erro ao carregar o Google Maps:', error);
      }
    };

    initializeMap();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      const cats = await getCategories();
      setCategories(cats);
    };
    loadCategories();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
      if (timePickerRef.current && !timePickerRef.current.contains(event.target as Node)) {
        setShowTimePicker(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class' && map) {
          const isDark = document.documentElement.classList.contains('dark');
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
              }
            ],
            light: [] // Tema claro usa o estilo padrão do Google Maps
          };
          map.setOptions({
            styles: isDark ? mapStyles.dark : mapStyles.light
          });
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, [map]);

  const handleLocationSearch = async (input: string) => {
    if (!autocompleteService || input.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const result = await autocompleteService.getPlacePredictions({
        input,
        componentRestrictions: { country: 'br' },
        types: ['geocode', 'establishment']
      });

      setLocationSuggestions(result.predictions.map(prediction => ({
        place_id: prediction.place_id,
        description: prediction.description
      })));
      setShowSuggestions(true);
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
    }
  };

  const handleLocationSelect = async (suggestion: PlaceSuggestion) => {
    if (!placesService || !map) return;

    try {
      const result = await new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
        placesService.getDetails(
          {
            placeId: suggestion.place_id,
            fields: ['formatted_address', 'geometry']
          },
          (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && place) {
              resolve(place);
            } else {
              reject(new Error('Erro ao obter detalhes do local'));
            }
          }
        );
      });

      if (result.geometry?.location) {
        const location = {
          lat: result.geometry.location.lat(),
          lng: result.geometry.location.lng()
        };

        // Atualizar o mapa
        map.setCenter(location);
        map.setZoom(15);

        // Atualizar ou criar marcador
        if (marker) {
          marker.setPosition(location);
        } else {
          const newMarker = new google.maps.Marker({
            position: location,
            map,
            animation: google.maps.Animation.DROP
          });
          setMarker(newMarker);
        }

        // Atualizar form data
        setFormData(prev => ({
          ...prev,
          location: suggestion.description,
          latitude: location.lat,
          longitude: location.lng
        }));
      }
    } catch (error) {
      console.error('Erro ao selecionar local:', error);
    }

    setShowSuggestions(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        image: file,
        image_preview: reader.result as string
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Você precisa estar logado para criar um evento');
      return;
    }

    if (!formData.category_id) {
      alert('Por favor, selecione uma categoria para o evento');
      return;
    }

    if (!formData.location || !formData.latitude || !formData.longitude) {
      alert('Por favor, selecione um local válido para o evento');
      return;
    }

    setLoading(true);
    try {
      let image_url = '';

      if (formData.image) {
        const fileExt = formData.image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(filePath, formData.image);

        if (uploadError) {
          throw new Error('Erro ao fazer upload da imagem: ' + uploadError.message);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('event-images')
          .getPublicUrl(filePath);

        image_url = publicUrl;
      }

      const eventDate = new Date(formData.date);
      eventDate.setHours(formData.time.getHours());
      eventDate.setMinutes(formData.time.getMinutes());

      const { error } = await supabase.from('events').insert({
        title: formData.title,
        description: formData.description,
        date: eventDate.toISOString(),
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        image_url,
        is_free: formData.is_free,
        price: formData.is_free ? null : parseFloat(formData.price.replace(',', '.')),
        category_id: formData.category_id,
        organizer_id: user.id
      });

      if (error) {
        throw new Error('Erro ao criar evento: ' + error.message);
      }

      alert('Evento criado com sucesso!');
      navigate('/eventos');
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      alert(error instanceof Error ? error.message : 'Erro ao criar evento. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newDate: Date | null) => {
    if (!newDate) return;
    
    const updatedDate = new Date(newDate);
    updatedDate.setHours(formData.time.getHours());
    updatedDate.setMinutes(formData.time.getMinutes());
    
    setFormData(prev => ({
      ...prev,
      date: updatedDate
    }));
    setShowDatePicker(false);
  };

  const handleTimeChange = (newTime: Date | null) => {
    if (!newTime) return;
    
    const updatedDate = new Date(formData.date);
    updatedDate.setHours(newTime.getHours());
    updatedDate.setMinutes(newTime.getMinutes());
    
    setFormData(prev => ({
      ...prev,
      time: newTime,
      date: updatedDate
    }));
    setShowTimePicker(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setFormData(prev => ({
      ...prev,
      category_id: category.id
    }));
    setShowCategoryDropdown(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center">
          <Link
            to="/eventos"
            className="mr-4 rounded-full p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Criar Evento</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
              Título do Evento
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white"
              placeholder="Digite o título do evento"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white h-32 resize-none"
              placeholder="Descreva seu evento"
              required
            />
          </div>

          {/* Data e Horário */}
          <div className="space-y-3">
            <label className="text-sm text-gray-600 dark:text-gray-400 block">
              Data e Horário
            </label>
            
            {/* Data */}
            <div className="relative" ref={datePickerRef}>
              <button
                type="button"
                onClick={() => {
                  setShowTimePicker(false);
                  setShowDatePicker(!showDatePicker);
                }}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-left flex items-center"
              >
                <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-900 dark:text-white">
                  {formatDate(formData.date)}
                </span>
              </button>
              {showDatePicker && (
                <div className="absolute left-0 right-0 mt-2 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                  <DatePicker
                    selected={formData.date}
                    onChange={handleDateChange}
                    inline
                    locale="pt-BR"
                    minDate={new Date()}
                    dateFormat="P"
                    calendarClassName="bg-white dark:bg-gray-800"
                  />
                </div>
              )}
            </div>

            {/* Horário */}
            <div className="relative" ref={timePickerRef}>
              <button
                type="button"
                onClick={() => {
                  setShowDatePicker(false);
                  setShowTimePicker(!showTimePicker);
                }}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-left flex items-center"
              >
                <Clock className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-900 dark:text-white">
                  {formatTime(formData.time)}
                </span>
              </button>
              {showTimePicker && (
                <div className="absolute left-0 right-0 mt-2 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                  <DatePicker
                    selected={formData.time}
                    onChange={handleTimeChange}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    inline
                    locale="pt-BR"
                    timeCaption="Horário"
                    dateFormat="HH:mm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Local */}
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
              Local
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.location}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, location: e.target.value }));
                  handleLocationSearch(e.target.value);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white"
                placeholder="Busque por um local..."
                required
              />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              
              {showSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-h-60 overflow-auto">
                  {locationSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.place_id}
                      type="button"
                      onClick={() => handleLocationSelect(suggestion)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      {suggestion.description}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mapa */}
          <div 
            ref={mapRef} 
            className="w-full h-48 rounded-xl overflow-hidden"
          />

          {/* Imagem */}
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
              Imagem do Evento
            </label>
            <div 
              className="relative w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {formData.image_preview ? (
                <>
                  <img
                    src={formData.image_preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData(prev => ({ ...prev, image: null, image_preview: '' }));
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Clique para adicionar uma imagem
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Categoria */}
          <div className="relative">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Categoria
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="flex w-full items-center justify-between rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-left text-gray-900 dark:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {selectedCategory ? (
                  <span>{selectedCategory.name}</span>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">Selecione uma categoria</span>
                )}
                <Tag className="w-5 h-5 text-gray-400" />
              </button>

              {showCategoryDropdown && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-1 shadow-lg">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleCategorySelect(category)}
                      className="flex w-full items-center px-4 py-2 text-left text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Preço */}
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
              Preço
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_free}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_free: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">Evento gratuito</span>
              </label>

              {!formData.is_free && (
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white"
                    placeholder="0,00"
                    required={!formData.is_free}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Botão de Publicar */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block" />
                  <span>Publicando...</span>
                </>
              ) : (
                'Publicar Evento'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default CriarEvento;