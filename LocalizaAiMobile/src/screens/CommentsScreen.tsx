import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useRoute } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Send, Edit2, Trash2, MoreVertical } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user: {
    id: string;
    full_name: string;
  };
};

type RouteParams = {
  postId: string;
  onCommentAdded?: () => void;
  postUserId: string; // ID do dono do post
};

export function CommentsScreen() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const { colors } = useTheme();
  const route = useRoute();
  const { postId, onCommentAdded, postUserId } = route.params as RouteParams;
  const { user } = useAuth();

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      // Primeiro buscar os comentários
      const { data: commentsData, error: commentsError } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      // Depois buscar os perfis dos usuários
      const userIds = [...new Set(commentsData.map(comment => comment.user_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Combinar os dados
      const formattedComments = commentsData.map(comment => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        user_id: comment.user_id,
        user: profiles?.find(profile => profile.id === comment.user_id) || {
          id: comment.user_id,
          full_name: 'Usuário',
        },
      }));

      setComments(formattedComments);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
      Alert.alert('Erro', 'Não foi possível carregar os comentários.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!user || !newComment.trim() || sending) return;

    setSending(true);
    try {
      // Primeiro inserir o comentário
      const { data: comment, error: commentError } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment.trim(),
        })
        .select()
        .single();

      if (commentError) throw commentError;

      // Buscar o perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Combinar os dados
      const newCommentFormatted = {
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        user_id: comment.user_id,
        user: {
          id: profile.id,
          full_name: profile.full_name,
        },
      };

      setComments(prev => [...prev, newCommentFormatted]);
      setNewComment('');
      onCommentAdded?.();
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
      Alert.alert('Erro', 'Não foi possível enviar o comentário.');
    } finally {
      setSending(false);
    }
  };

  const handleEditComment = async (comment: Comment, newContent: string) => {
    try {
      const { error } = await supabase
        .from('post_comments')
        .update({ content: newContent })
        .eq('id', comment.id)
        .eq('user_id', user?.id); // Garantir que só o dono pode editar

      if (error) throw error;

      setComments(prev =>
        prev.map(c =>
          c.id === comment.id
            ? { ...c, content: newContent }
            : c
        )
      );
      setEditingComment(null);
    } catch (error) {
      console.error('Erro ao editar comentário:', error);
      Alert.alert('Erro', 'Não foi possível editar o comentário.');
    }
  };

  const handleDeleteComment = async (commentId: string, commentUserId: string) => {
    try {
      // Verificar se é o dono do comentário ou o dono do post
      if (user?.id !== commentUserId && user?.id !== postUserId) {
        Alert.alert('Erro', 'Você não tem permissão para excluir este comentário.');
        return;
      }

      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId)
        .or(`user_id.eq.${commentUserId},post_id.eq.${postId}`);

      if (error) throw error;

      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      Alert.alert('Erro', 'Não foi possível excluir o comentário.');
    }
  };

  const renderComment = ({ item }: { item: Comment }) => {
    const isCommentOwner = user?.id === item.user_id;
    const isPostOwner = user?.id === postUserId;
    const canEdit = isCommentOwner;
    const canDelete = isCommentOwner || isPostOwner;

    return (
      <View style={[styles.commentContainer, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.commentHeader}>
          <Text style={[styles.username, { color: colors.text }]}>
            {item.user.full_name}
          </Text>
          {(canEdit || canDelete) && (
            <View style={styles.commentActions}>
              {canEdit && (
                <TouchableOpacity
                  onPress={() => setEditingComment(item)}
                  style={styles.actionButton}
                >
                  <Edit2 size={16} color={colors.text} />
                </TouchableOpacity>
              )}
              {canDelete && (
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      'Excluir comentário',
                      'Tem certeza que deseja excluir este comentário?',
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Excluir',
                          style: 'destructive',
                          onPress: () => handleDeleteComment(item.id, item.user_id),
                        },
                      ],
                    );
                  }}
                  style={styles.actionButton}
                >
                  <Trash2 size={16} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        <Text style={[styles.commentText, { color: colors.text }]}>
          {item.content}
        </Text>
        <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
          {formatDistanceToNow(new Date(item.created_at), {
            addSuffix: true,
            locale: ptBR,
          })}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#9333ea" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.commentsList}
      />

      <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Escreva um comentário..."
          placeholderTextColor={colors.textSecondary}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { opacity: !newComment.trim() || sending ? 0.5 : 1 }
          ]}
          onPress={handleSendComment}
          disabled={!newComment.trim() || sending}
        >
          <Send size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Modal de Edição */}
      <Modal
        visible={!!editingComment}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingComment(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Editar comentário
            </Text>
            <TextInput
              style={[styles.modalInput, { color: colors.text, backgroundColor: colors.background }]}
              value={editingComment?.content}
              onChangeText={(text) => 
                setEditingComment(prev => prev ? { ...prev, content: text } : null)
              }
              multiline
              maxLength={500}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditingComment(null)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => {
                  if (editingComment) {
                    handleEditComment(editingComment, editingComment.content);
                  }
                }}
              >
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentsList: {
    padding: 16,
  },
  commentContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontWeight: '600',
    fontSize: 14,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  commentText: {
    fontSize: 14,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  input: {
    flex: 1,
    marginRight: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#9333ea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  modalInput: {
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#6b7280',
  },
  saveButton: {
    backgroundColor: '#9333ea',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
