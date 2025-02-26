import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface Notification {
  id: string;
  type: 'follow' | 'payment' | 'cancel' | 'feature';
  message: string;
  created_at: string;
  from_user_id: string;
  from_user_name: string;
  from_user_image: string;
  user_id: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  createNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    // Inscreve-se para receber atualizações em tempo real
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Recarrega as notificações quando houver mudanças
          fetchNotifications();
        }
      )
      .subscribe();

    // Carrega as notificações iniciais
    fetchNotifications();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const fetchNotifications = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar notificações:', error);
      return;
    }

    setNotifications(data);
    setUnreadCount(data.filter(n => !n.read).length);
  };

  const markAsRead = async (notificationId: string) => {
    if (!user?.id) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const createNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => {
    if (!user?.id) return;

    const { error } = await supabase
      .from('notifications')
      .insert([
        {
          ...notification,
          read: false
        }
      ]);

    if (error) {
      console.error('Erro ao criar notificação:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!user?.id) return;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Erro ao deletar notificação:', error);
    }
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        markAsRead, 
        createNotification,
        deleteNotification 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

export function formatNotificationDate(date: string) {
  return formatDistanceToNow(new Date(date), {
    addSuffix: false,
    locale: ptBR
  })
  .replace('cerca de ', '')
  .replace('menos de ', '')
  .replace(' segundos', ' s')
  .replace(' minutos', ' m')
  .replace(' minuto', ' m')
  .replace(' horas', ' h')
  .replace(' hora', ' h')
  .replace(' dias', ' d')
  .replace(' dia', ' d')
  .replace(' semanas', ' sem')
  .replace(' semana', ' sem')
  .replace(' meses', ' m')
  .replace(' mês', ' m')
  .replace(' anos', ' a')
  .replace(' ano', ' a');
}
