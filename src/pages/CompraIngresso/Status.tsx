import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';

function Status() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    // Simular processamento do pagamento
    const timer = setTimeout(() => {
      setStatus('success');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const StatusContent = {
    loading: {
      icon: (
        <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center animate-pulse">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      ),
      title: 'Processando...',
      message: 'Por favor, aguarde enquanto processamos seu pagamento.',
      primaryButton: null,
      secondaryButton: null
    },
    success: {
      icon: (
        <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center relative">
          <Check className="w-10 h-10 text-white" />
          <div className="absolute inset-0 bg-purple-600 rounded-full animate-ping opacity-20" />
          <div className="absolute -inset-4">
            <div className="w-full h-full relative">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-purple-600 rounded-full"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `float ${2 + Math.random()}s infinite ease-in-out ${Math.random()}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      ),
      title: 'Parabéns!',
      message: 'Você realizou com sucesso a compra do ingresso para o Festival Nacional de Música. Aproveite o evento!',
      primaryButton: {
        text: 'Ver Ingresso',
        onClick: () => navigate('/compra-ingresso/ingresso')
      },
      secondaryButton: {
        text: 'Voltar para Eventos',
        onClick: () => navigate('/eventos')
      }
    },
    error: {
      icon: (
        <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center relative">
          <X className="w-10 h-10 text-white" />
          <div className="absolute -inset-4">
            <div className="w-full h-full relative">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-red-500 rounded-full"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `float ${2 + Math.random()}s infinite ease-in-out ${Math.random()}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      ),
      title: 'Ops, falhou!',
      message: 'Seu pagamento não foi processado. Por favor, verifique sua conexão com a internet e tente novamente.',
      primaryButton: {
        text: 'Tentar Novamente',
        onClick: () => navigate('/compra-ingresso/pagamento')
      },
      secondaryButton: {
        text: 'Cancelar',
        onClick: () => navigate('/eventos')
      }
    }
  };

  const currentStatus = StatusContent[status];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
            50% {
              transform: translateY(-20px) scale(0.8);
              opacity: 0.5;
            }
          }
        `}
      </style>
      <div className="w-full max-w-sm bg-gray-100 dark:bg-gray-800 rounded-3xl p-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6">
            {currentStatus.icon}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {currentStatus.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {currentStatus.message}
          </p>
          {currentStatus.primaryButton && (
            <button
              onClick={currentStatus.primaryButton.onClick}
              className="w-full py-3 bg-purple-600 text-white rounded-full font-medium mb-3 hover:bg-purple-700 transition-colors"
            >
              {currentStatus.primaryButton.text}
            </button>
          )}
          {currentStatus.secondaryButton && (
            <button
              onClick={currentStatus.secondaryButton.onClick}
              className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {currentStatus.secondaryButton.text}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Status;