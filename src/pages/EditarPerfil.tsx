import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Mail, Phone, Calendar, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface UserProfile {
  full_name: string;
  email: string;
  phone: string;
  birth_date: string;
  country: string;
  bio: string;
  avatar_url: string | null;
}

function EditarPerfil() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({
    full_name: '',
    email: '',
    phone: '',
    birth_date: '',
    country: 'Brasil',
    bio: '',
    avatar_url: null
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setFormData({
        full_name: data.full_name || '',
        email: data.email || '',
        phone: data.phone || '',
        birth_date: data.birth_date || '',
        country: data.country || 'Brasil',
        bio: data.bio || '',
        avatar_url: data.avatar_url
      });
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          birth_date: formData.birth_date,
          country: formData.country,
          bio: formData.bio
        })
        .eq('id', user.id);

      if (error) throw error;

      // Return to profile page instead of settings
      navigate('/perfil');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar perfil. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/perfil" className="text-gray-700 dark:text-gray-300">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Editar Perfil
          </h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="text-purple-600 font-medium disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                Nome Completo
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white"
                required
              />
            </div>

            <div className="relative">
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white opacity-50"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="relative">
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                Telefone
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white"
                />
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="relative">
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                Data de Nascimento
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="relative">
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                País
              </label>
              <div className="relative">
                <select
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white appearance-none"
                >
                  <option value="Brasil">Brasil</option>
                  <option value="Portugal">Portugal</option>
                  <option value="Estados Unidos">Estados Unidos</option>
                </select>
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                Biografia
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white h-32 resize-none"
                placeholder="Conte um pouco sobre você..."
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditarPerfil;