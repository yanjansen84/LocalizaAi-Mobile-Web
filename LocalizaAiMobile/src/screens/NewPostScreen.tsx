import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useTheme } from '../theme';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

export function NewPostScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const { session } = useAuth();
  const navigation = useNavigation();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setImage(result.assets[0].uri);
      setImageBase64(result.assets[0].base64);
    }
  };

  const handlePost = async () => {
    if (!image || !imageBase64 || !session) return;

    setLoading(true);
    try {
      // Upload da imagem
      const imageName = `${session.user.id}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('posts')
        .upload(imageName, decode(imageBase64), {
          contentType: 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      // Criar o post
      const { data: publicUrl } = supabase.storage
        .from('posts')
        .getPublicUrl(imageName);

      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: session.user.id,
          image_url: publicUrl.publicUrl,
          caption: caption.trim() || null,
        });

      if (postError) throw postError;

      navigation.goBack();
    } catch (error) {
      console.error('Erro ao criar post:', error);
      alert('Erro ao criar post. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={[styles.imageContainer, { borderColor: theme.colors.border }]}
            onPress={pickImage}
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.image} />
            ) : (
              <View style={styles.placeholder}>
                <Feather name="image" size={32} color={theme.colors.text} />
                <Text style={[styles.placeholderText, { color: theme.colors.text }]}>
                  Toque para selecionar uma foto
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TextInput
            placeholder="Escreva uma legenda..."
            placeholderTextColor={theme.colors.textSecondary}
            value={caption}
            onChangeText={setCaption}
            multiline
            style={[
              styles.input,
              {
                color: theme.colors.text,
                backgroundColor: theme.colors.surface,
              },
            ]}
          />

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: theme.colors.primary,
                opacity: loading || !image ? 0.5 : 1,
              },
            ]}
            onPress={handlePost}
            disabled={loading || !image}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Publicar</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderText: {
    fontSize: 16,
  },
  input: {
    minHeight: 100,
    maxHeight: 200,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  button: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
