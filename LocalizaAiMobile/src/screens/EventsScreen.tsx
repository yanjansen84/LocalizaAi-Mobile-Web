import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  TextInput,
  ScrollView,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { EventBadge } from '../components/EventBadge';
import { EventSkeleton, FeaturedEventSkeleton } from '../components/EventSkeleton';
import { getCategories } from '../lib/categories';

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

interface Category {
  id: string;
  name: string;
  icon: string;
}

function FeaturedCard({ event }: { event: Event }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigation = useNavigation();
  const { colors } = useTheme();
  const defaultImage = 'https://placehold.co/600x400/9333ea/ffffff?text=Evento';

  const handleFavoriteClick = () => {
    setIsAnimating(true);
    setIsFavorite(!isFavorite);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  return (
    <TouchableOpacity 
      style={[styles.featuredCard, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('EventDetails', { id: event.id })}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: event.image_url || defaultImage }}
        style={styles.featuredImage}
        defaultSource={{ uri: defaultImage }}
      />
      <View style={styles.favoriteButton}>
        <TouchableOpacity
          onPress={handleFavoriteClick}
          style={[
            styles.favoriteIconButton,
            isAnimating && styles.favoriteIconButtonAnimated
          ]}
        >
          <Feather
            name={isFavorite ? "heart" : "heart"}
            size={16}
            color={isFavorite ? "#9333ea" : "white"}
          />
        </TouchableOpacity>
      </View>
      <EventBadge 
        isFree={event.is_free} 
        price={event.price}
        style={styles.eventBadge}
      />
      <View style={styles.featuredContent}>
        <Text style={[styles.featuredTitle, { color: colors.text }]} numberOfLines={2}>
          {event.title}
        </Text>
        <View style={styles.featuredInfo}>
          <Feather name="calendar" size={16} color="#9333ea" />
          <Text style={[styles.featuredInfoText, { color: "#9333ea" }]}>
            {new Date(event.date).toLocaleDateString('pt-BR', {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
        <View style={styles.featuredInfo}>
          <Feather name="map-pin" size={16} color={colors.textSecondary} />
          <Text style={[styles.featuredInfoText, { color: colors.textSecondary }]} numberOfLines={1}>
            {event.location}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function PopularEventCard({ event }: { event: Event }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigation = useNavigation();
  const { colors } = useTheme();
  const defaultImage = 'https://placehold.co/600x400/9333ea/ffffff?text=Evento';

  const handleFavoriteClick = () => {
    setIsAnimating(true);
    setIsFavorite(!isFavorite);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  return (
    <TouchableOpacity 
      style={[styles.popularCard, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('EventDetails', { id: event.id })}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: event.image_url || defaultImage }}
          style={styles.popularImage}
          defaultSource={{ uri: defaultImage }}
        />
        <TouchableOpacity
          onPress={handleFavoriteClick}
          style={[
            styles.favoriteIconButton,
            styles.popularFavoriteButton,
            isAnimating && styles.favoriteIconButtonAnimated
          ]}
        >
          <Feather
            name={isFavorite ? "heart" : "heart"}
            size={16}
            color={isFavorite ? "#9333ea" : "white"}
          />
        </TouchableOpacity>
        <EventBadge 
          isFree={event.is_free} 
          price={event.price}
          style={styles.eventBadge}
        />
      </View>
      <View style={styles.popularContent}>
        <Text style={[styles.popularTitle, { color: colors.text }]} numberOfLines={2}>
          {event.title}
        </Text>
        <View style={styles.popularInfo}>
          <Feather name="calendar" size={12} color="#9333ea" />
          <Text style={[styles.popularInfoText, { color: "#9333ea" }]}>
            {new Date(event.date).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
        <View style={styles.popularInfo}>
          <Feather name="map-pin" size={12} color={colors.textSecondary} />
          <Text style={[styles.popularInfoText, { color: colors.textSecondary }]} numberOfLines={1}>
            {event.location.split('-')[0].trim()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function EventsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategories, setActiveCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  async function loadEvents() {
    try {
      setLoading(true);
      setError(null);

      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (eventsError) throw eventsError;

      const now = new Date();
      let futureEvents = (eventsData || []).filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= now;
      });

      setEvents(futureEvents);
      setFilteredEvents(futureEvents);

    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      setError('Não foi possível carregar os eventos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const filterEvents = useCallback(() => {
    let filtered = [...events];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category_id === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query)
      );
    }

    setFilteredEvents(filtered);
  }, [events, selectedCategory, searchQuery]);

  const loadCategories = async () => {
    try {
      const categoriesList = await getCategories();
      setCategories(categoriesList);
      const categoriesWithEvents = categoriesList.filter(category =>
        events.some(event => event.category_id === category.id)
      );
      setActiveCategories(categoriesWithEvents);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      loadCategories();
    }
  }, [events]);

  useEffect(() => {
    filterEvents();
  }, [filterEvents]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadEvents();
  }, []);

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#9333ea" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadEvents()}
        >
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#9333ea"]}
        />
      }
    >
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Pesquisar eventos"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[styles.searchInput, { backgroundColor: colors.card, color: colors.text }]}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {searchQuery ? (
        // Resultados da pesquisa
        <View style={styles.searchResults}>
          <Text style={[styles.searchResultsTitle, { color: colors.text }]}>
            Resultados da pesquisa
          </Text>
          <View style={styles.popularGrid}>
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => (
                <TouchableOpacity 
                  key={event.id} 
                  onPress={() => navigation.navigate('EventDetails', { id: event.id })}
                >
                  <PopularEventCard event={event} />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noEventsContainer}>
                <Text style={[styles.noEventsText, { color: colors.textSecondary }]}>
                  Nenhum evento encontrado para "{searchQuery}"
                </Text>
              </View>
            )}
          </View>
        </View>
      ) : (
        // Conteúdo normal quando não há pesquisa
        <>
          {/* Featured Events */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Em Destaque 🌟
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Featured')}>
                <Text style={styles.seeAllText}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
            >
              {loading ? (
                <>
                  <FeaturedEventSkeleton />
                  <FeaturedEventSkeleton />
                  <FeaturedEventSkeleton />
                </>
              ) : (
                events.slice(0, 3).map(event => (
                  <TouchableOpacity 
                    key={event.id} 
                    onPress={() => navigation.navigate('EventDetails', { id: event.id })}
                  >
                    <FeaturedCard event={event} />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>

          {/* Popular Events */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Eventos Populares 🔥
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Popular')}>
                <Text style={styles.seeAllText}>Ver todos</Text>
              </TouchableOpacity>
            </View>

            {/* Categories */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
            >
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  { backgroundColor: colors.background, borderColor: '#9333ea' },
                  selectedCategory === 'all' && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory('all')}
              >
                <Text style={[
                  styles.categoryButtonText,
                  { color: selectedCategory === 'all' ? '#ffffff' : '#9333ea' }
                ]}>
                  Todos
                </Text>
              </TouchableOpacity>
              {activeCategories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    { backgroundColor: colors.background, borderColor: '#9333ea' },
                    selectedCategory === category.id && styles.categoryButtonActive
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    { color: selectedCategory === category.id ? '#ffffff' : '#9333ea' }
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Event Cards */}
            <View style={styles.popularGrid}>
              {loading ? (
                <>
                  <EventSkeleton />
                  <EventSkeleton />
                  <EventSkeleton />
                  <EventSkeleton />
                </>
              ) : filteredEvents.length > 0 ? (
                filteredEvents.map(event => (
                  <TouchableOpacity 
                    key={event.id} 
                    onPress={() => navigation.navigate('EventDetails', { id: event.id })}
                  >
                    <PopularEventCard event={event} />
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.noEventsContainer}>
                  <Text style={[styles.noEventsText, { color: colors.textSecondary }]}>
                    Nenhum evento encontrado nesta categoria.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    padding: 8,
    borderRadius: 8,
    fontSize: 16,
  },
  section: {
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 14,
    color: '#9333ea',
  },
  featuredList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  featuredCard: {
    width: 320,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featuredImage: {
    width: '100%',
    height: 192,
  },
  featuredContent: {
    padding: 16,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  featuredInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featuredInfoText: {
    fontSize: 14,
    marginLeft: 8,
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#9333ea',
    borderColor: '#9333ea',
  },
  categoryButtonText: {
    fontSize: 14,
  },
  popularGrid: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  popularCard: {
    width: (Dimensions.get('window').width - 48) / 2,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
  },
  popularImage: {
    width: '100%',
    height: 160,
  },
  popularContent: {
    padding: 12,
  },
  popularTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  popularInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  popularInfoText: {
    fontSize: 12,
    marginLeft: 4,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  favoriteIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteIconButtonAnimated: {
    transform: [{ scale: 1.25 }],
  },
  popularFavoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  eventBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#9333ea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  noEventsContainer: {
    width: '100%',
    padding: 32,
    alignItems: 'center',
  },
  noEventsText: {
    textAlign: 'center',
  },
  searchResults: {
    paddingTop: 8,
  },
  searchResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
});
