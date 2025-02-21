import React from 'react';
import { Loader } from 'lucide-react';

interface LoadingScreenProps {
  fullScreen?: boolean;
  className?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  fullScreen = true,
  className = ''
}) => {
  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <Loader className="w-6 h-6 text-purple-600 animate-spin" />
    </div>
  );
};

export default LoadingScreen;
