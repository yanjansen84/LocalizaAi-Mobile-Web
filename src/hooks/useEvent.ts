import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image_url: string | null;
  price: number | null;
  is_free: boolean;
  organizer_id: string;
  category_id: string | null;
}

interface FormattedEvent {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string;
  time: string;
  location: {
    name: string;
    address: string;
  };
  price: {
    min: number;
    max: number;
  };
  gallery: string[];
  organizer: {
    id: string;
    name: string;
    avatar: string | null;
    isFollowing: boolean;
  };
}

export function useEvent(eventId: string) {
  const [event, setEvent] = useState<FormattedEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      
      const { data, error: eventError } = await supabase
        .from('events')
        .select(`
          id,
          title,
          description,
          date,
          location,
          image_url,
          price,
          is_free,
          organizer_id,
          category_id
        `)
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      // Buscar dados do organizador
      const { data: organizerData, error: organizerError } = await supabase
        .from('users')
        .select('full_name, avatar_url')
        .eq('id', data.organizer_id)
        .single();

      if (organizerError) throw organizerError;

      // Buscar categoria
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('name')
        .eq('id', data.category_id)
        .single();

      if (categoryError) {
        console.warn('Category not found:', categoryError);
      }

      // Formatar os dados para o formato esperado
      const formattedEvent: FormattedEvent = {
        id: data.id,
        title: data.title,
        category: categoryData?.name || 'Sem categoria',
        description: data.description,
        date: new Date(data.date).toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        time: new Date(data.date).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        location: {
          name: data.location,
          address: data.location,
        },
        price: {
          min: data.is_free ? 0 : data.price || 0,
          max: data.is_free ? 0 : data.price || 0
        },
        gallery: [data.image_url].filter(Boolean),
        organizer: {
          id: data.organizer_id,
          name: organizerData.full_name,
          avatar: organizerData.avatar_url,
          isFollowing: false
        }
      };

      setEvent(formattedEvent);
      setError(null);
    } catch (err) {
      console.error('Error fetching event:', err);
      setError('Não foi possível carregar os dados do evento.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFollowOrganizer = async () => {
    if (!event) return;

    try {
      const userId = supabase.auth.getUser()?.data.user?.id;
      if (!userId) throw new Error('Usuário não autenticado');

      if (event.organizer.isFollowing) {
        await supabase
          .from('organizer_followers')
          .delete()
          .eq('organizer_id', event.organizer.id)
          .eq('user_id', userId);
      } else {
        await supabase
          .from('organizer_followers')
          .insert({
            organizer_id: event.organizer.id,
            user_id: userId
          });
      }

      setEvent(prev => prev ? {
        ...prev,
        organizer: {
          ...prev.organizer,
          isFollowing: !prev.organizer.isFollowing
        }
      } : null);
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  const addToCalendar = async () => {
    if (!event) return;
    
    try {
      // Criar evento no Google Calendar (exemplo)
      const eventStart = new Date(event.date + ' ' + event.time);
      const eventEnd = new Date(eventStart.getTime() + 3600000); // +1 hora

      const calendarEvent = {
        'summary': event.title,
        'location': event.location.address,
        'description': event.description,
        'start': {
          'dateTime': eventStart.toISOString(),
          'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        'end': {
          'dateTime': eventEnd.toISOString(),
          'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };

      // Aqui você pode integrar com a API do Google Calendar
      // Por enquanto, vamos apenas baixar um arquivo .ics
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${event.title}
LOCATION:${event.location.address}
DESCRIPTION:${event.description}
DTSTART:${eventStart.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${eventEnd.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
END:VEVENT
END:VCALENDAR`;

      const blob = new Blob([icsContent], { type: 'text/calendar' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${event.title.replace(/\s+/g, '_')}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error adding to calendar:', err);
    }
  };

  return {
    event,
    loading,
    error,
    toggleFollowOrganizer,
    addToCalendar
  };
}
