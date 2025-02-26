import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, senha);
      if (error) {
        if (error.message === 'Invalid login credentials') {
          setError('Email ou senha incorretos');
        } else {
          setError('Ocorreu um erro ao fazer login. Por favor, tente novamente.');
        }
      }
    } catch (err: any) {
      setError('Ocorreu um erro ao fazer login. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="px-6 pt-12">
        <div className="flex justify-center mb-8">
          <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center">
            <LogIn className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Entrar na sua conta
        </h1>

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl border-0 focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
              placeholder="seu@email.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl border-0 focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <div className="flex items-center">
            <input
              id="lembrar"
              type="checkbox"
              className="h-4 w-4 text-purple-600 rounded border-gray-300"
            />
            <label htmlFor="lembrar" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Lembrar de mim
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <div className="mt-8 text-center">
            <Link 
              to="/esqueceu-senha" 
              className="text-sm text-purple-600 hover:text-purple-500"
            >
              Esqueceu a senha?
            </Link>
          </div>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Não tem uma conta?{' '}
            <Link 
              to="/cadastro" 
              className="text-purple-600 hover:text-purple-500 font-medium"
            >
              Cadastre-se
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;