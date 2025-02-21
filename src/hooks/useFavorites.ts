import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  const loadFavorites = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('event_id')
        .eq('user_id', user.id);

      if (error) throw error;

      setFavorites(data.map(fav => fav.event_id));
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
  }, [user]);

  const toggleFavorite = useCallback(async (eventId: string) => {
    if (!user) return;

    setLoading(prev => ({ ...prev, [eventId]: true }));

    try {
      const isFavorite = favorites.includes(eventId);

      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('event_id', eventId);

        setFavorites(prev => prev.filter(id => id !== eventId));
      } else {
        await supabase
          .from('favorites')
          .insert([{ user_id: user.id, event_id: eventId }]);

        setFavorites(prev => [...prev, eventId]);
      }
    } catch (error) {
      console.error('Erro ao atualizar favorito:', error);
    } finally {
      setLoading(prev => ({ ...prev, [eventId]: false }));
    }
  }, [user, favorites]);

  const isFavorite = useCallback((eventId: string) => {
    return favorites.includes(eventId);
  }, [favorites]);

  const isLoading = useCallback((eventId: string) => {
    return loading[eventId] || false;
  }, [loading]);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    isLoading,
    loadFavorites
  };
};
