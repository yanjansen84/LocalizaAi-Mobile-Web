import React from 'react';
import { AlertCircle, WifiOff, Lock, MapPin, RefreshCw } from 'lucide-react';

export type ErrorType = 'network' | 'permission' | 'geolocation' | 'general';

interface ErrorFeedbackProps {
  type?: ErrorType;
  message: string;
  onRetry?: () => void;
  className?: string;
}

const errorIcons = {
  network: WifiOff,
  permission: Lock,
  geolocation: MapPin,
  general: AlertCircle,
};

const errorTitles = {
  network: 'Erro de Conexão',
  permission: 'Erro de Permissão',
  geolocation: 'Erro de Localização',
  general: 'Erro',
};

export const ErrorFeedback: React.FC<ErrorFeedbackProps> = ({
  type = 'general',
  message,
  onRetry,
  className = '',
}) => {
  const IconComponent = errorIcons[type];
  const title = errorTitles[type];

  return (
    <div className={`flex flex-col items-center justify-center p-4 text-center ${className}`}>
      <IconComponent className="w-12 h-12 text-red-500 mb-3" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar Novamente
        </button>
      )}
    </div>
  );
};
