import React, { useState } from 'react';
import { MoreHorizontal, Heart, MessageCircle, Share2, Bookmark, MapPin, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Post {
  id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  location?: string;
  user_id: string;
  user: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface PostCardProps {
  post: Post;
  onDelete?: () => void;
}

function PostCard({ post, onDelete }: PostCardProps) {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = React.useState(false);
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este post?')) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;

      toast.success('Post excluído com sucesso!');
      onDelete?.();
    } catch (error) {
      console.error('Erro ao excluir post:', error);
      toast.error('Erro ao excluir post');
    }
  };

  const handleLike = async () => {
    try {
      if (isLiked) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user?.id);

        if (error) throw error;
        setLikesCount(prev => prev - 1);
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert({ post_id: post.id, user_id: user?.id });

        if (error) throw error;
        setLikesCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Erro ao curtir/descurtir post:', error);
      toast.error('Erro ao curtir/descurtir post');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <img
            src={post.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user?.full_name || '')}&background=random`}
            alt={post.user?.full_name}
            className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
          />
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {post.user?.full_name}
            </h3>
            {post.location && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {post.location}
              </p>
            )}
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-500 dark:text-gray-400 p-1"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMenu && user?.id === post.user_id && (
            <div className="absolute right-0 mt-1 py-1 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Excluir post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image */}
      <div className="w-full">
        <div className="relative pb-[100%] bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
          <img
            src={post.image_url}
            alt="Post"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLike}
              className={`text-gray-900 dark:text-white ${isLiked ? 'text-red-500 dark:text-red-500' : 'hover:text-red-500 dark:hover:text-red-500'}`}
            >
              <Heart className="w-6 h-6" fill={isLiked ? 'currentColor' : 'none'} />
            </button>
            <button className="text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-400">
              <MessageCircle className="w-6 h-6" />
            </button>
            <button className="text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-400">
              <Share2 className="w-6 h-6" />
            </button>
          </div>
          <button className="text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-400">
            <Bookmark className="w-6 h-6" />
          </button>
        </div>
        {likesCount > 0 && (
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            {likesCount} {likesCount === 1 ? 'curtida' : 'curtidas'}
          </p>
        )}
        {/* Caption */}
        {post.caption && (
          <div className="pb-4">
            <p className="text-sm text-gray-900 dark:text-white">
              <span className="font-semibold">{post.user?.full_name}</span>{' '}
              {post.caption}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatDistanceToNow(new Date(post.created_at), {
                addSuffix: true,
                locale: ptBR
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PostCard;
