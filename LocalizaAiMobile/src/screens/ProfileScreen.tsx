import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Avatar } from '../components/Avatar';
import { PostCard } from '../components/PostCard';
import { MapPin, Calendar, Camera } from 'lucide-react-native';

const { width } = Dimensions.get('window');

type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  followers_count: number;
  following_count: number;
  events_count: number;
  is_following?: boolean;
};

type Event = {
  id: string;
  title: string;
  date: string;
  location: string;
  image_url: string;
  is_free: boolean;
};

export function ProfileScreen() {
  const { colors } = useTheme();
  const { session } = useAuth();
  const route = useRoute<any>();
  const navigation = useNavigation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'eventos' | 'colecoes' | 'sobre'>('eventos');
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const userId = route.params?.userId || session?.user?.id;
  const isOwnProfile = userId === session?.user?.id;

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    if (!userId) return;
    setIsLoading(true);

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Buscar contagem de seguidores e seguindo
      const [followersCount, followingCount] = await Promise.all([
        supabase
          .from('followers')
          .select('*', { count: 'exact', head: true })
          .eq('followed_id', userId),
        supabase
          .from('followers')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', userId),
      ]);

      // Verificar se o usuário atual segue este perfil
      const { data: isFollowing } = await supabase
        .from('followers')
        .select('*')
        .eq('follower_id', session.user.id)
        .eq('followed_id', userId)
        .single();

      setProfile({
        ...profileData,
        followers_count: followersCount.count || 0,
        following_count: followingCount.count || 0,
        events_count: 0,
        is_following: !!isFollowing
      });

    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!session?.user?.id || !profile || followLoading || isOwnProfile) return;
    
    try {
      setFollowLoading(true);

      if (profile.is_following) {
        // Deixar de seguir
        await supabase
          .from('followers')
          .delete()
          .eq('follower_id', session.user.id)
          .eq('followed_id', profile.id);

        setProfile(prev => ({
          ...prev,
          is_following: false,
          followers_count: Math.max(0, prev.followers_count - 1)
        }));
      } else {
        // Seguir
        await supabase
          .from('followers')
          .insert({ follower_id: session.user.id, followed_id: profile.id });

        setProfile(prev => ({
          ...prev,
          is_following: true,
          followers_count: prev.followers_count + 1
        }));
      }
    } catch (error) {
      console.error('Erro ao seguir/deixar de seguir:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const getPhotoUrl = () => {
    if (!profile?.avatar_url) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'User')}&background=6366f1&color=fff`;
    }
    return profile.avatar_url;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Perfil não encontrado</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          {/* Avatar com botão de câmera */}
          <View style={styles.avatarContainer}>
            {uploadingPhoto ? (
              <View style={[styles.avatarLoading, { backgroundColor: colors.card }]}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : (
              <Image
                source={{ uri: getPhotoUrl() }}
                style={styles.avatar}
              />
            )}
            {isOwnProfile && (
              <TouchableOpacity style={styles.cameraButton}>
                <Camera size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>

          <Text style={[styles.name, { color: colors.text }]}>{profile.full_name}</Text>

          {/* Botão Seguir - só aparece se não for o próprio perfil */}
          {!isOwnProfile && (
            <TouchableOpacity
              onPress={handleFollow}
              disabled={followLoading}
              style={[
                styles.followButton,
                profile.is_following 
                  ? { backgroundColor: colors.card }
                  : { backgroundColor: colors.primary }
              ]}
            >
              {followLoading ? (
                <ActivityIndicator size="small" color={profile.is_following ? colors.text : 'white'} />
              ) : (
                <Text style={[
                  styles.followButtonText,
                  { color: profile.is_following ? colors.text : 'white' }
                ]}>
                  {profile.is_following ? 'Seguindo' : 'Seguir'}
                </Text>
              )}
            </TouchableOpacity>
          )}

          {/* Estatísticas */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {profile.events_count || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Eventos
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => navigation.navigate('FollowersScreen', { 
                userId: profile.id,
                type: 'followers'
              })}
            >
              <Text style={[styles.statValue, { color: colors.text }]}>
                {profile.followers_count || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Seguidores
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => navigation.navigate('FollowersScreen', { 
                userId: profile.id,
                type: 'following'
              })}
            >
              <Text style={[styles.statValue, { color: colors.text }]}>
                {profile.following_count || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Seguindo
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'eventos' && styles.activeTab]}
              onPress={() => setActiveTab('eventos')}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === 'eventos' ? colors.primary : colors.textSecondary }
              ]}>
                Eventos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'colecoes' && styles.activeTab]}
              onPress={() => setActiveTab('colecoes')}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === 'colecoes' ? colors.primary : colors.textSecondary }
              ]}>
                Coleções
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'sobre' && styles.activeTab]}
              onPress={() => setActiveTab('sobre')}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === 'sobre' ? colors.primary : colors.textSecondary }
              ]}>
                Sobre
              </Text>
            </TouchableOpacity>
          </View>

          {/* Conteúdo da Tab */}
          {activeTab === 'eventos' && (
            <View style={styles.eventsContainer}>
              {events.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    Nenhum evento encontrado
                  </Text>
                  <TouchableOpacity 
                    style={[styles.exploreButton, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate('Explore' as never)}
                  >
                    <Text style={styles.exploreButtonText}>Explorar Eventos</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                events.map(event => (
                  <TouchableOpacity
                    key={event.id}
                    style={[styles.eventCard, { backgroundColor: colors.card }]}
                    onPress={() => navigation.navigate('Event' as never, { id: event.id } as never)}
                  >
                    <View style={styles.eventImageContainer}>
                      <Image
                        source={{ uri: event.image_url }}
                        style={styles.eventImage}
                      />
                      {event.is_free && (
                        <View style={styles.freeTag}>
                          <Text style={styles.freeTagText}>Grátis</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.eventInfo}>
                      <Text 
                        style={[styles.eventTitle, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {event.title}
                      </Text>
                      <View style={styles.eventDetail}>
                        <Calendar size={12} color={colors.textSecondary} />
                        <Text 
                          style={[styles.eventDetailText, { color: colors.textSecondary }]}
                          numberOfLines={1}
                        >
                          {event.date}
                        </Text>
                      </View>
                      <View style={styles.eventDetail}>
                        <MapPin size={12} color={colors.textSecondary} />
                        <Text 
                          style={[styles.eventDetailText, { color: colors.textSecondary }]}
                          numberOfLines={1}
                        >
                          {event.location}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
              {loadingEvents && (
                <ActivityIndicator 
                  style={styles.loadingMore} 
                  color={colors.primary} 
                />
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 20,
  },
  avatarContainer: {
    position: 'relative',
    width: 96,
    height: 96,
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarLoading: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    backgroundColor: '#7C3AED',
    borderRadius: 20,
    padding: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  followButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  tabs: {
    flexDirection: 'row',
    width: '100%',
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#7C3AED',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  eventsContainer: {
    width: '100%',
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 16,
  },
  exploreButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  eventCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
  },
  eventImageContainer: {
    position: 'relative',
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  freeTag: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  freeTagText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
  },
  eventInfo: {
    flex: 1,
    marginLeft: 12,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  eventDetailText: {
    fontSize: 12,
    marginLeft: 4,
  },
  loadingMore: {
    marginVertical: 16,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});
