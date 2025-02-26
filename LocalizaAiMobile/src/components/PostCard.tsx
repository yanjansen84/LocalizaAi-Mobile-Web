import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical, Edit2, Trash2 } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Post } from '../types/post';
import { useAuth } from '../contexts/AuthContext';
import { NavigationProp, useNavigation } from '@react-navigation/native';

interface PostCardProps {
  post: Post;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
  onEdit?: (post: Post) => void;
  onDelete?: (post: Post) => void;
}

type RootStackParamList = {
  Comments: {
    postId: string;
    onCommentAdded: () => void;
    postUserId: string;
  };
};

export function PostCard({ 
  post, 
  onLike, 
  onComment, 
  onShare, 
  onSave,
  onEdit,
  onDelete 
}: PostCardProps) {
  const { colors } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const [showOptions, setShowOptions] = useState(false);
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const isPostOwner = user?.id === post.user_id;

  const handleLikePress = async () => {
    onLike();
  };

  const handleDelete = () => {
    setShowOptions(false);
    Alert.alert(
      'Excluir post',
      'Tem certeza que deseja excluir este post?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => onDelete?.(post),
        },
      ],
    );
  };

  const handleEdit = () => {
    setShowOptions(false);
    onEdit?.(post);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {post.user?.avatar_url ? (
            <Image
              source={{ uri: post.user.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: colors.placeholder }]} />
          )}
          <Text style={[styles.username, { color: colors.text }]}>
            {post.user?.full_name}
          </Text>
        </View>
        {isPostOwner && (
          <TouchableOpacity onPress={() => setShowOptions(true)}>
            <MoreVertical size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      {/* Image */}
      {post.image_url && (
        <Image
          source={{ uri: post.image_url }}
          style={[styles.image, { width: screenWidth }]}
          resizeMode="cover"
        />
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <TouchableOpacity onPress={handleLikePress} style={styles.actionButton}>
            <Heart
              size={24}
              color={post.is_liked ? '#e11d48' : colors.text}
              fill={post.is_liked ? '#e11d48' : 'transparent'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Comments', {
                postId: post.id,
                onCommentAdded: () => {},
                postUserId: post.user_id,
              })
            }
            style={styles.actionButton}
          >
            <MessageCircle size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onShare} style={styles.actionButton}>
            <Share2 size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={onSave}>
          <Bookmark
            size={24}
            color={colors.text}
            fill={post.is_saved ? colors.text : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      {/* Likes count */}
      {post.likes_count > 0 && (
        <Text style={[styles.likesCount, { color: colors.text }]}>
          {post.likes_count} {post.likes_count === 1 ? 'curtida' : 'curtidas'}
        </Text>
      )}

      {/* Caption */}
      {post.caption && (
        <View style={styles.captionContainer}>
          <Text style={[styles.username, { color: colors.text }]}>
            {post.user?.full_name}
          </Text>
          <Text style={[styles.caption, { color: colors.text }]}>
            {post.caption}
          </Text>
        </View>
      )}

      {/* Comments */}
      {post.comments_count > 0 && (
        <TouchableOpacity 
          onPress={() =>
            navigation.navigate('Comments', {
              postId: post.id,
              onCommentAdded: () => {},
              postUserId: post.user_id,
            })
          }
          style={styles.commentsContainer}
        >
          <Text style={[styles.commentsCount, { color: colors.textSecondary }]}>
            Ver {post.comments_count === 1 ? 'comentário' : `todos os ${post.comments_count} comentários`}
          </Text>
          {post.latest_comment && (
            <View style={styles.latestComment}>
              <Text style={[styles.commentUsername, { color: colors.text }]}>
                {post.latest_comment.user_full_name}
              </Text>
              <Text style={[styles.commentText, { color: colors.text }]}>
                {post.latest_comment.content}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* Timestamp */}
      <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
        {formatDistanceToNow(new Date(post.created_at), {
          addSuffix: true,
          locale: ptBR,
        })}
      </Text>

      {/* Options Modal */}
      <Modal
        visible={showOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptions(false)}
        >
          <View style={[styles.optionsContainer, { backgroundColor: colors.cardBackground }]}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleEdit}
            >
              <Edit2 size={20} color={colors.text} />
              <Text style={[styles.optionText, { color: colors.text }]}>Editar post</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, styles.deleteButton]}
              onPress={handleDelete}
            >
              <Trash2 size={20} color="#ef4444" />
              <Text style={[styles.optionText, { color: "#ef4444" }]}>Excluir post</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  username: {
    fontWeight: '600',
    fontSize: 14,
  },
  image: {
    height: 400,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: 16,
  },
  likesCount: {
    fontWeight: '600',
    fontSize: 14,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  captionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  caption: {
    marginLeft: 4,
    flex: 1,
  },
  commentsContainer: {
    paddingHorizontal: 12,
    marginTop: 4,
  },
  commentsCount: {
    fontSize: 14,
    marginBottom: 4,
  },
  latestComment: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentUsername: {
    fontWeight: '600',
    marginRight: 4,
  },
  commentText: {
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    paddingHorizontal: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsContainer: {
    width: '80%',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
});
