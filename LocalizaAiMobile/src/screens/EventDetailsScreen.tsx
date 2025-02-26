import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
  ActivityIndicator,
  Share
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { useTheme } from '../contexts/ThemeContext';
import { EventBadge } from '../components/EventBadge';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image_url: string;
  is_free: boolean;
  price: number;
  category_id: string;
  latitude: number;
  longitude: number;
  organizer_id: string;
}

interface Organizer {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

type RootStackParamList = {
  EventDetails: { id: string };
};

type EventDetailsRouteProp = RouteProp<RootStackParamList, 'EventDetails'>;

export function EventDetailsScreen() {
  const route = useRoute<EventDetailsRouteProp>();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [event, setEvent] = useState<Event | null>(null);
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const defaultImage = 'https://placehold.co/600x400/9333ea/ffffff?text=Evento';

  useEffect(() => {
    loadEventDetails();
  }, [route.params?.id]);

  async function loadEventDetails() {
    try {
      setLoading(true);
      setError(null);

      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', route.params?.id)
        .single();

      if (eventError) throw eventError;
      if (!eventData) throw new Error('Evento não encontrado');

      setEvent(eventData);

      // Carregar dados do organizador
      if (eventData.organizer_id) {
        const { data: organizerData, error: organizerError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', eventData.organizer_id)
          .single();

        if (!organizerError && organizerData) {
          setOrganizer(organizerData);
        }
      }

    } catch (error) {
      console.error('Erro ao carregar detalhes do evento:', error);
      setError('Não foi possível carregar os detalhes do evento.');
    } finally {
      setLoading(false);
    }
  }

  const handleFavoriteClick = () => {
    setIsAnimating(true);
    setIsFavorite(!isFavorite);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Confira este evento: ${event?.title}\nData: ${new Date(event?.date || '').toLocaleDateString('pt-BR')}\nLocal: ${event?.location}`,
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const handleOpenMap = () => {
    if (event?.latitude && event?.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`;
      Linking.openURL(url);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#9333ea" />
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          {error || 'Evento não encontrado'}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadEventDetails}
        >
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: event.image_url || defaultImage }}
          style={styles.image}
          defaultSource={{ uri: defaultImage }}
        />
        <View style={styles.imageOverlay}>
          <View style={styles.imageActions}>
            <TouchableOpacity
              onPress={handleShare}
              style={[styles.iconButton, { backgroundColor: colors.card }]}
            >
              <Feather name="share-2" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleFavoriteClick}
              style={[
                styles.iconButton,
                { backgroundColor: colors.card },
                isAnimating && styles.favoriteIconButtonAnimated
              ]}
            >
              <Feather
                name={isFavorite ? "heart" : "heart"}
                size={24}
                color={isFavorite ? "#9333ea" : colors.text}
              />
            </TouchableOpacity>
          </View>
        </View>
        <EventBadge 
          isFree={event.is_free} 
          price={event.price}
          style={styles.eventBadge}
        />
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{event.title}</Text>
        
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Feather name="calendar" size={20} color="#9333ea" />
            <Text style={[styles.infoText, { color: "#9333ea" }]}>
              {new Date(event.date).toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>

          <TouchableOpacity style={styles.infoItem} onPress={handleOpenMap}>
            <Feather name="map-pin" size={20} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {event.location}
            </Text>
          </TouchableOpacity>
        </View>

        {organizer && (
          <View style={[styles.organizerContainer, { backgroundColor: colors.card }]}>
            <Image
              source={{ 
                uri: organizer.avatar_url || 'https://placehold.co/200/9333ea/ffffff?text=Avatar'
              }}
              style={styles.organizerAvatar}
            />
            <View style={styles.organizerInfo}>
              <Text style={[styles.organizerLabel, { color: colors.textSecondary }]}>
                Organizado por
              </Text>
              <Text style={[styles.organizerName, { color: colors.text }]}>
                {organizer.full_name}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.descriptionContainer}>
          <Text style={[styles.descriptionTitle, { color: colors.text }]}>
            Sobre o evento
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {event.description}
          </Text>
        </View>

        <View style={[styles.buyContainer, { backgroundColor: colors.card }]}>
          <View>
            <Text style={[styles.priceLabel, { color: colors.text }]}>
              {event.is_free ? 'Gratuito' : 'Preço'}
            </Text>
            {!event.is_free && (
              <Text style={[styles.priceValue, { color: colors.text }]}>
                R$ {event.price.toFixed(2)}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.buyButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('TicketSelection' as never, { eventId: event.id } as never)}
          >
            <Text style={styles.buyButtonText}>
              {event.is_free ? 'Reservar' : 'Comprar Ingresso'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteIconButtonAnimated: {
    transform: [{ scale: 1.25 }],
  },
  eventBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoContainer: {
    gap: 12,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 16,
  },
  organizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  organizerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  organizerInfo: {
    flex: 1,
  },
  organizerLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionContainer: {
    gap: 8,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
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
  buyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  priceLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '600',
  },
  buyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
