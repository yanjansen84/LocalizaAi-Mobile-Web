import { PostgrestError } from '@supabase/supabase-js';
import { ErrorType } from '../components/ErrorFeedback';

interface ErrorDetails {
  type: ErrorType;
  message: string;
}

export function handleError(error: unknown): ErrorDetails {
  // Erros de rede
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return {
      type: 'network',
      message: 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.',
    };
  }

  // Erros do Supabase
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const pgError = error as PostgrestError;
    
    switch (pgError.code) {
      case '42501':
        return {
          type: 'permission',
          message: 'Você não tem permissão para realizar esta ação.',
        };
      case '23505':
        return {
          type: 'general',
          message: 'Este registro já existe no sistema.',
        };
      default:
        return {
          type: 'general',
          message: 'Ocorreu um erro ao processar sua solicitação.',
        };
    }
  }

  // Erros de Geolocalização
  if (error instanceof GeolocationPositionError) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return {
          type: 'permission',
          message: 'Permissão de localização negada. Por favor, permita o acesso à sua localização nas configurações do navegador.',
        };
      case error.POSITION_UNAVAILABLE:
        return {
          type: 'geolocation',
          message: 'Não foi possível determinar sua localização. Verifique se o GPS está ativado.',
        };
      case error.TIMEOUT:
        return {
          type: 'geolocation',
          message: 'Tempo excedido ao tentar obter sua localização. Tente novamente.',
        };
      default:
        return {
          type: 'geolocation',
          message: 'Ocorreu um erro ao tentar obter sua localização.',
        };
    }
  }

  // Erro genérico
  return {
    type: 'general',
    message: 'Ocorreu um erro inesperado. Por favor, tente novamente.',
  };
}

export function handleGeolocationError(error: GeolocationPositionError): ErrorDetails {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return {
        type: 'permission',
        message: 'Permissão de localização negada. Por favor, permita o acesso à sua localização nas configurações do navegador.',
      };
    case error.POSITION_UNAVAILABLE:
      return {
        type: 'geolocation',
        message: 'Não foi possível determinar sua localização. Verifique se o GPS está ativado.',
      };
    case error.TIMEOUT:
      return {
        type: 'geolocation',
        message: 'Tempo excedido ao tentar obter sua localização. Tente novamente.',
      };
    default:
      return {
        type: 'geolocation',
        message: 'Ocorreu um erro ao tentar obter sua localização.',
      };
  }
}
