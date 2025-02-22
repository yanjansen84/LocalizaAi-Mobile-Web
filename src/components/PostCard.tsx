import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Heart, MessageCircle, Share2, Bookmark, MapPin, Trash2, Pencil } from 'lucide-react';
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

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
}

interface PostCardProps {
  post: Post;
  onDelete?: () => void;
}

function PostCard({ post, onDelete }: PostCardProps) {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = React.useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedCommentText, setEditedCommentText] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const modalRef = useRef(null);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [modalPosition, setModalPosition] = useState(0);
  const modalHeight = useRef(0);
  const screenHeight = useRef(0);

  useEffect(() => {
    if (modalRef.current) {
      modalHeight.current = modalRef.current.clientHeight;
      screenHeight.current = window.innerHeight;
    }
  }, [showComments, comments]);

  useEffect(() => {
    const checkIfLiked = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('post_likes')
        .select('id')  
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .maybeSingle(); 

      setIsLiked(!!data);
    };

    checkIfLiked();
  }, [post.id, user]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentTouch = e.touches[0].clientY;
    const diff = currentTouch - startY;
    setCurrentY(currentTouch);

    if (!isFullScreen) {
      if (diff > 0) {
        // Movimento para baixo
        setModalPosition(diff);
      } else if (diff < 0) {
        // Movimento para cima - calcula a altura proporcional
        const progress = Math.abs(diff) / (window.innerHeight / 2);
        const heightProgress = Math.min(progress, 1);
        const targetHeight = window.innerHeight * heightProgress;
        
        setModalPosition(diff);
        if (modalRef.current) {
          modalRef.current.style.height = `${90 + (10 * heightProgress)}vh`;
        }
      }
    } else {
      // Se estiver em tela cheia, só permite movimento para baixo
      if (diff > 0) {
        const progress = diff / (window.innerHeight / 2);
        const heightProgress = Math.max(1 - progress, 0);
        
        setModalPosition(diff);
        if (modalRef.current) {
          modalRef.current.style.height = `${90 + (10 * heightProgress)}vh`;
        }
      }
    }
  };

  const handleTouchEnd = () => {
    const diff = currentY - startY;
    const threshold = 100;

    if (!isFullScreen) {
      if (diff > threshold) {
        // Deslizou para baixo - fecha o modal
        setShowComments(false);
      } else if (diff < -threshold) {
        // Deslizou para cima - ativa tela cheia
        setIsFullScreen(true);
        setModalPosition(0);
        if (modalRef.current) {
          modalRef.current.style.height = '100vh';
        }
      } else {
        // Volta para posição original
        setModalPosition(0);
        if (modalRef.current) {
          modalRef.current.style.height = '90vh';
        }
      }
    } else {
      if (diff > threshold) {
        // Deslizou para baixo - sai da tela cheia
        setIsFullScreen(false);
        setModalPosition(0);
        if (modalRef.current) {
          modalRef.current.style.height = '90vh';
        }
      } else {
        // Mantém em tela cheia
        setModalPosition(0);
        if (modalRef.current) {
          modalRef.current.style.height = '100vh';
        }
      }
    }

    setStartY(0);
    setCurrentY(0);
  };

  const loadComments = async () => {
    setIsLoadingComments(true);
    try {
      const { data, error } = await supabase
        .rpc('get_post_comments', { p_post_id: post.id });

      if (error) throw error;
      setComments(data || []);
      setShowComments(true);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
      toast.error('Erro ao carregar comentários');
    }
    setIsLoadingComments(false);
  };

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;

    try {
      const { error } = await supabase
        .from('post_comments')
        .insert([{
          post_id: post.id,
          user_id: user.id,
          content: newComment.trim()
        }]);

      if (error) {
        console.error('Erro ao adicionar comentário:', error);
        return;
      }

      // Recarrega os comentários
      const { data: newComments } = await supabase
        .rpc('get_post_comments', { p_post_id: post.id });

      setComments(newComments || []);
      setNewComment('');
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
    }
  };

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
    if (!user) return;

    try {
      if (isLiked) {
        // Remove curtida
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);

        if (error) throw error;
        setLikesCount(prev => prev - 1);
      } else {
        // Adiciona curtida
        const { error } = await supabase
          .from('post_likes')
          .insert({ post_id: post.id, user_id: user.id });

        if (error) throw error;
        setLikesCount(prev => prev + 1);
      }
      
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Erro ao curtir/descurtir post:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(comments.filter(c => c.id !== commentId));
      setShowDeleteModal(false);
      setCommentToDelete(null);
      toast.success('Comentário excluído!');
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      toast.error('Erro ao excluir comentário');
    }
  };

  const handleConfirmDelete = (commentId: string) => {
    setCommentToDelete(commentId);
    setShowDeleteModal(true);
  };

  return (
    <>
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
              <button 
                onClick={loadComments}
                className="text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-400"
              >
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

      {showComments && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={(e) => e.target === e.currentTarget && setShowComments(false)}>
          <div
            ref={modalRef}
            style={{
              transform: `translateY(${modalPosition}px)`,
              transition: 'all 0.3s ease-out',
              height: '90vh',
            }}
            className="fixed inset-x-0 bottom-0 bg-white dark:bg-gray-900 rounded-t-xl shadow-xl overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className={`w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto ${isFullScreen ? 'mt-3' : 'my-2'}`} />
            <div className="flex-1 overflow-y-auto" style={{ height: isFullScreen ? 'calc(100vh - 24px)' : 'auto', maxHeight: isFullScreen ? undefined : 'calc(90vh - 24px)' }}>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Comentários
                </h3>
                {isLoadingComments ? (
                  <div className="flex justify-center items-center p-4">
                    <div className="w-6 h-6 border-2 border-gray-900 dark:border-white rounded-full animate-spin border-t-transparent"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map(comment => (
                      <div key={comment.id} className="flex space-x-3">
                        <img
                          src={comment.user_avatar_url || '/default-avatar.png'}
                          alt={comment.user_full_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm text-gray-900 dark:text-white">
                                <span className="font-semibold">{comment.user_full_name}</span>{' '}
                                {comment.content}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {formatDistanceToNow(new Date(comment.created_at), {
                                  addSuffix: true,
                                  locale: ptBR
                                })}
                              </p>
                            </div>
                            {user?.id === comment.user_id && (
                              <div className="flex items-center gap-2 ml-4">
                                <button
                                  onClick={() => {
                                    setEditingCommentId(comment.id);
                                    setEditedCommentText(comment.content);
                                  }}
                                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                  title="Editar comentário"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleConfirmDelete(comment.id)}
                                  className="p-1 text-red-500 hover:text-red-600"
                                  title="Excluir comentário"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Campo de comentário */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
                <div className="flex items-center space-x-3">
                  <button className="text-gray-900 dark:text-white">
                    <svg 
                      aria-label="Emoji"
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Adicione um comentário..."
                    className="flex-1 text-sm bg-transparent border-none focus:outline-none text-gray-900 dark:text-white placeholder-gray-500"
                  />
                  {newComment.trim() && (
                    <button
                      onClick={handleAddComment}
                      className="text-sm font-semibold text-blue-500 hover:text-blue-600"
                    >
                      Publicar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1F2937] p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
            <h2 className="text-xl text-white mb-4">Confirmar Exclusão</h2>
            <p className="text-gray-300 mb-6">
              Tem certeza que deseja excluir este comentário? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setCommentToDelete(null);
                }}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => commentToDelete && handleDeleteComment(commentToDelete)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PostCard;
