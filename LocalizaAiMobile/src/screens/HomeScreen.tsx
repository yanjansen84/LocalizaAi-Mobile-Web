import React, { useEffect, useState } from 'react';
import { View, FlatList, RefreshControl, Text, StyleSheet, Platform } from 'react-native';
import { supabase } from '../services/supabase';
import { PostCard } from '../components/PostCard';
import { useTheme } from '../contexts/ThemeContext';
import MapView from 'react-native-maps';

interface Post {
  id: string;
  image_url: string;
  caption: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
}

export function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (Platform.OS === 'web') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ fontSize: 18, color: colors.text, textAlign: 'center' }}>Mapa disponível apenas no aplicativo mobile</Text>
      </View>
    );
  }

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: colors.background,
      width: '100%'
    }}>
      <MapView style={{ width: '100%', height: '100%' }} />
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.text}
          />
        }
        contentContainerStyle={{
          width: '100%'
        }}
      />
    </View>
  );
}
