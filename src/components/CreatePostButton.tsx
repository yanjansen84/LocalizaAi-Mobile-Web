import React, { useState } from 'react';
import { Plus, Image as ImageIcon, MapPin, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface CreatePostButtonProps {
  onPostCreated?: () => void;
}

function CreatePostButton({ onPostCreated }: CreatePostButtonProps) {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user?.id}/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('posts')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('posts')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !user) return;

    setLoading(true);
    try {
      const imageUrl = await uploadImage(image);

      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          image_url: imageUrl,
          caption,
          location
        });

      if (error) throw error;

      toast.success('Post criado com sucesso!');
      setIsModalOpen(false);
      setImage(null);
      setPreviewUrl(null);
      setCaption('');
      setLocation('');
      onPostCreated?.();
    } catch (error) {
      console.error('Erro ao criar post:', error);
      toast.error('Erro ao criar post. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
      >
        <Plus className="w-6 h-6" />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Criar novo post</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 text-center">
                {previewUrl ? (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-96 mx-auto rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setPreviewUrl(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-gray-900 bg-opacity-50 rounded-full text-white hover:bg-opacity-70"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                      <span className="text-gray-500">Clique para adicionar uma foto</span>
                    </div>
                  </label>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Legenda
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
                  rows={3}
                  placeholder="Escreva uma legenda..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Localização
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
                    placeholder="Adicionar localização"
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!image || loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'Publicando...' : 'Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default CreatePostButton;
