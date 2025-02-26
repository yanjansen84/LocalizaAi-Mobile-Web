import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { Post } from '../types/post';

type RouteParams = {
  post: Post;
};

export function EditPostScreen() {
  const route = useRoute();
  const { post } = route.params as RouteParams;
  const [caption, setCaption] = useState(post.caption || '');
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const navigation = useNavigation();

  const handleSave = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('posts')
        .update({ caption })
        .eq('id', post.id);

      if (error) throw error;

      Alert.alert('Sucesso', 'Post atualizado com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao atualizar post:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o post. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {post.image_url && (
        <Image
          source={{ uri: post.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      <TextInput
        style={[styles.input, { 
          backgroundColor: colors.cardBackground,
          color: colors.text,
        }]}
        value={caption}
        onChangeText={setCaption}
        placeholder="Escreva uma legenda..."
        placeholderTextColor={colors.textSecondary}
        multiline
        maxLength={2200}
      />

      <TouchableOpacity
        style={[styles.button, { opacity: loading ? 0.7 : 1 }]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Salvar alterações</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#9333ea',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
