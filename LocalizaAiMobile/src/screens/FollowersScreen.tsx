import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../services/supabase';
import { useNavigation, useRoute } from '@react-navigation/native';

type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
};

type RouteParams = {
  userId: string;
  type: 'followers' | 'following';
};

export function FollowersScreen() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { userId, type } = route.params as RouteParams;

  useEffect(() => {
    fetchProfiles();
  }, []);

  async function fetchProfiles() {
    try {
      setLoading(true);
      let query;

      if (type === 'followers') {
        // Buscar usuários que seguem o perfil atual
        const { data: followersData, error: followersError } = await supabase
          .from('followers')
          .select('follower_id')
          .eq('followed_id', userId);

        if (followersError) throw followersError;

        const followerIds = followersData.map(f => f.follower_id);

        // Buscar os perfis dos seguidores
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', followerIds);

        if (profilesError) throw profilesError;
        setProfiles(profiles || []);

      } else {
        // Buscar usuários que o perfil atual segue
        const { data: followingData, error: followingError } = await supabase
          .from('followers')
          .select('followed_id')
          .eq('follower_id', userId);

        if (followingError) throw followingError;

        const followingIds = followingData.map(f => f.followed_id);

        // Buscar os perfis dos usuários seguidos
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', followingIds);

        if (profilesError) throw profilesError;
        setProfiles(profiles || []);
      }
    } catch (error) {
      console.error('Erro ao buscar perfis:', error);
    } finally {
      setLoading(false);
    }
  }

  const renderProfileItem = ({ item }: { item: Profile }) => (
    <TouchableOpacity
      style={[styles.profileItem, { backgroundColor: colors.card }]}
      onPress={() => {
        navigation.navigate('Profile', { userId: item.id });
      }}
    >
      {item.avatar_url ? (
        <Image
          source={{ uri: item.avatar_url }}
          style={styles.profileImage}
        />
      ) : (
        <View style={[styles.profileIcon, { backgroundColor: colors.primary + '20' }]}>
          <Text style={{ color: colors.primary, fontSize: 20 }}>
            {item.full_name[0].toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.profileInfo}>
        <Text style={[styles.profileName, { color: colors.text }]}>
          {item.full_name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={profiles}
        renderItem={renderProfileItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {type === 'followers' ? 'Nenhum seguidor ainda' : 'Não está seguindo ninguém'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: 16,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 16,
  },
});
