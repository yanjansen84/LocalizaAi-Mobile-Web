import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Fecha automaticamente após 3 segundos

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 flex items-center p-4 mb-4 text-sm rounded-lg ${
        type === 'success'
          ? 'text-green-800 bg-green-50 dark:bg-gray-800 dark:text-green-400'
          : 'text-red-800 bg-red-50 dark:bg-gray-800 dark:text-red-400'
      } animate-slide-up`}
      role="alert"
    >
      <div className="flex items-center">
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5 mr-2" />
        ) : (
          <XCircle className="w-5 h-5 mr-2" />
        )}
        <span className="sr-only">{type === 'success' ? 'Sucesso' : 'Erro'}</span>
        <div className="text-sm font-medium mr-4">{message}</div>
        <button
          type="button"
          className="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
          aria-label="Close"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
