import React, { useState } from 'react';
import { KeyRound, ArrowLeft, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function EsqueceuSenha() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar email de recuperação');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-gray-100 dark:bg-gray-800 rounded-3xl p-8 text-center">
          <div className="mb-6 relative">
            <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Email Enviado!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Verifique sua caixa de entrada para redefinir sua senha. Se não encontrar o email, verifique sua pasta de spam.
          </p>
          <Link
            to="/"
            className="block w-full py-3 bg-purple-600 text-white rounded-full font-medium"
          >
            Voltar para Login
          </Link>
        </div>
      </div>
    );
  }

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
            <KeyRound className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Esqueceu sua senha?
        </h1>
        
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          Digite seu e-mail para receber um link de recuperação
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar link'}
          </button>

          <div className="text-center mt-6">
            <Link 
              to="/" 
              className="text-sm text-purple-600 hover:text-purple-500"
            >
              Voltar para o login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EsqueceuSenha;