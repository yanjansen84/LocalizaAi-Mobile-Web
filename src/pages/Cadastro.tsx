import React, { useState } from 'react';
import { UserPlus, ArrowLeft, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Cadastro() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    foto: null as File | null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.senha !== formData.confirmarSenha) {
      return setError('As senhas não coincidem');
    }

    if (formData.senha.length < 6) {
      return setError('A senha deve ter pelo menos 6 caracteres');
    }

    setLoading(true);

    try {
      const { error } = await signUp(formData.email, formData.senha, formData.nome);
      if (error) {
        if (error.message === 'User already registered') {
          setError('Este email já está cadastrado');
        } else {
          setError('Erro ao criar conta. Por favor, tente novamente.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, foto: e.target.files![0] }));
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="p-4">
        <Link to="/">
          <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </Link>
      </div>
      
      <div className="px-6 pt-8">
        <div className="flex justify-center mb-8">
          <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Criar nova conta
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <label 
                htmlFor="foto" 
                className="cursor-pointer block"
              >
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
                  {formData.foto ? (
                    <img 
                      src={URL.createObjectURL(formData.foto)} 
                      alt="Foto de perfil" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Upload className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <span className="text-sm text-purple-600 text-center block mt-2">
                  Adicionar foto
                </span>
              </label>
              <input
                id="foto"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl border-0 focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
              placeholder="Nome completo"
              required
            />
          </div>

          <div>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl border-0 focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <input
              type="password"
              value={formData.senha}
              onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl border-0 focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
              placeholder="Senha"
              required
            />
          </div>

          <div>
            <input
              type="password"
              value={formData.confirmarSenha}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmarSenha: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl border-0 focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
              placeholder="Confirmar senha"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Já tem uma conta?{' '}
            <Link 
              to="/" 
              className="text-purple-600 hover:text-purple-500 font-medium"
            >
              Fazer login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Cadastro;