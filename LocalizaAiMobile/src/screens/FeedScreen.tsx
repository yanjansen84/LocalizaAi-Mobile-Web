import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Share,
  Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { PostCard } from '../components/PostCard';
import { supabase } from '../services/supabase';
import { Post } from '../types/post';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { Search } from 'lucide-react-native';

export function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth();

  async function fetchPosts() {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setError(null);
      console.log('Buscando posts...');
      // Primeiro buscar os posts
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Posts recebidos:', posts?.length);
      if (postsError) {
        console.error('Erro ao buscar posts:', postsError);
        throw postsError;
      }
      if (!posts) {
        console.log('Nenhum post encontrado');
        setPosts([]);
        return;
      }

      // Depois buscar os perfis para cada post
      const userIds = [...new Set(posts.map(post => post.user_id))];
      console.log('Buscando perfis para', userIds.length, 'usuários');
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('Erro ao buscar perfis:', profilesError);
        throw profilesError;
      }

      // Buscar curtidas do usuário atual
      console.log('Buscando curtidas do usuário');
      const { data: userLikes, error: userLikesError } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id);

      if (userLikesError) {
        console.error('Erro ao buscar curtidas:', userLikesError);
        throw userLikesError;
      }

      const likedPostIds = new Set(userLikes?.map(like => like.post_id) || []);

      // Buscar todas as curtidas
      console.log('Buscando todas as curtidas');
      const { data: allLikes, error: likesError } = await supabase
        .from('post_likes')
        .select('post_id');

      if (likesError) {
        console.error('Erro ao buscar todas as curtidas:', likesError);
        throw likesError;
      }

      // Contar curtidas por post
      const likesCount = allLikes?.reduce((acc, like) => {
        acc[like.post_id] = (acc[like.post_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Buscar comentários e seus autores
      console.log('Buscando comentários');
      const { data: comments, error: commentsError } = await supabase
        .from('post_comments')
        .select('id, post_id, content, user_id, created_at')
        .order('created_at', { ascending: false });

      if (commentsError) {
        console.error('Erro ao buscar comentários:', commentsError);
        throw commentsError;
      }

      // Buscar perfis dos comentaristas
      const commentUserIds = [...new Set(comments?.map(comment => comment.user_id) || [])];
      console.log('Buscando perfis dos comentaristas:', commentUserIds.length);
      const { data: commentProfiles, error: commentProfilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', commentUserIds);

      if (commentProfilesError) {
        console.error('Erro ao buscar perfis dos comentaristas:', commentProfilesError);
        throw commentProfilesError;
      }

      // Mapa de perfis
      const profileMap = new Map(
        commentProfiles?.map(profile => [profile.id, profile]) || []
      );

      // Contar comentários e pegar o último de cada post
      const commentsByPost = comments?.reduce((acc, comment) => {
        if (!acc[comment.post_id]) {
          acc[comment.post_id] = {
            count: 1,
            latest: {
              user_full_name: profileMap.get(comment.user_id)?.full_name || '',
              content: comment.content
            }
          };
        } else {
          acc[comment.post_id].count++;
        }
        return acc;
      }, {} as Record<string, { count: number, latest: { user_full_name: string, content: string } }>);

      // Combinar todos os dados
      console.log('Processando dados dos posts');
      const processedPosts = posts.map(post => ({
        ...post,
        user: profiles?.find(profile => profile.id === post.user_id),
        is_liked: likedPostIds.has(post.id),
        likes_count: likesCount?.[post.id] || 0,
        comments_count: commentsByPost?.[post.id]?.count || 0,
        latest_comment: commentsByPost?.[post.id]?.latest
      }));

      console.log('Posts processados:', processedPosts.length);
      setPosts(processedPosts);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      setError('Não foi possível carregar o feed. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchPosts();
      }
    }, [user])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.is_liked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });
      }

      setPosts(currentPosts =>
        currentPosts.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              is_liked: !p.is_liked,
              likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1
            };
          }
          return p;
        })
      );
    } catch (error) {
      console.error('Erro ao curtir post:', error);
      Alert.alert('Erro', 'Não foi possível curtir o post. Tente novamente.');
    }
  };

  const handleShare = async (post: Post) => {
    try {
      await Share.share({
        message: `Confira esta publicação de ${post.user?.full_name}: ${post.caption}`,
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const handleComment = (postId: string) => {
    navigation.navigate('Comments', { 
      postId,
      onCommentAdded: () => {
        // Atualizar contagem de comentários localmente
        setPosts(currentPosts =>
          currentPosts.map(p => {
            if (p.id === postId) {
              return {
                ...p,
                comments_count: p.comments_count + 1,
              };
            }
            return p;
          })
        );
      },
    });
  };

  const handleSave = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      // Toggle saved state
      const { error } = await supabase
        .from('saved_posts')
        .upsert({ user_id: user.id, post_id: postId });

      if (error) throw error;

      // Update local state
      setPosts(currentPosts =>
        currentPosts.map(p => {
          if (p.id === postId) {
            return { ...p, is_saved: !p.is_saved };
          }
          return p;
        })
      );
    } catch (error) {
      console.error('Erro ao salvar post:', error);
      Alert.alert('Erro', 'Não foi possível salvar o post. Tente novamente.');
    }
  };

  const handleDelete = async (post: Post) => {
    if (!user) return;

    try {
      // Primeiro excluir as curtidas
      const { error: likesError } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', post.id);

      if (likesError) throw likesError;

      // Depois excluir os comentários
      const { error: commentsError } = await supabase
        .from('post_comments')
        .delete()
        .eq('post_id', post.id);

      if (commentsError) throw commentsError;

      // Por fim excluir o post
      const { error: postError } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id)
        .eq('user_id', user.id); // Garantir que só o dono pode excluir

      if (postError) throw postError;

      // Atualizar lista de posts localmente
      setPosts(currentPosts => currentPosts.filter(p => p.id !== post.id));
      Alert.alert('Sucesso', 'Post excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir post:', error);
      Alert.alert('Erro', 'Não foi possível excluir o post. Tente novamente.');
    }
  };

  const handleEdit = (post: Post) => {
    navigation.navigate('EditPost', { post });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPosts}>
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.centered}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Nenhuma publicação encontrada. Siga outros usuários para ver seus posts aqui!
          </Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onLike={() => handleLike(item.id)}
              onComment={() => handleComment(item.id)}
              onShare={() => handleShare(item)}
              onSave={() => handleSave(item.id)}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#9333ea"]}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 16,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 32,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 32,
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
});
