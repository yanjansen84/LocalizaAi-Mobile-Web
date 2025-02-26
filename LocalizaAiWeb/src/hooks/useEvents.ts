import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  image_url: string;
  is_free: boolean;
  category_id: string;
  latitude: number;
  longitude: number;
}

interface UseEventsOptions {
  pageSize?: number;
}

export const useEvents = (options: UseEventsOptions = {}) => {
  const { pageSize = 10 } = options;
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadEvents = useCallback(async (currentPage = 1): Promise<void> => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

      if (fetchError) throw fetchError;

      if (data) {
        if (currentPage === 1) {
          setEvents(data);
          setFilteredEvents(data);
        } else {
          setEvents(prev => [...prev, ...data]);
          setFilteredEvents(prev => [...prev, ...data]);
        }
        setHasMore(data.length === pageSize);
      }
      setError(null);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      setError('Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  const loadMoreEvents = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadEvents(nextPage);
    }
  }, [loading, hasMore, page, loadEvents]);

  const filterEvents = useCallback((categoryId: string, searchTerm: string) => {
    if (!events.length) return;

    let filtered = [...events];

    if (categoryId !== 'all') {
      filtered = filtered.filter(event => event.category_id === categoryId);
    }

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query)
      );
    }

    setFilteredEvents(filtered);
  }, [events]);

  return {
    events,
    filteredEvents,
    loading,
    error,
    hasMore,
    loadEvents,
    loadMoreEvents,
    filterEvents,
    setError
  };
};
