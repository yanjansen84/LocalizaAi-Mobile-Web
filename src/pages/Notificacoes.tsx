import React from 'react';
import { ArrowLeft, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotification, formatNotificationDate } from '../contexts/NotificationContext';
import type { Notification } from '../contexts/NotificationContext';

function NotificationItem({ notification }: { notification: Notification }) {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = React.useState(true);
  const { markAsRead } = useNotification();

  const handleClick = async () => {
    if (notification.type === 'follow') {
      await markAsRead(notification.id);
      navigate(`/perfil/${notification.from_user_id}`);
    }
  };

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFollowing(!isFollowing);
    // TODO: Implementar lógica de follow/unfollow quando o contexto de usuário estiver pronto
  };

  return (
    <div
      onClick={handleClick}
      className="w-full py-3 px-4 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800/50 cursor-pointer"
    >
      <div className="w-12 h-12">
        <img 
          src={notification.from_user_image} 
          alt={notification.from_user_name} 
          className="w-full h-full rounded-full object-cover"
        />
      </div>
      
      <div className="flex-1 text-left">
        <span className="text-sm text-gray-900 dark:text-white">
          <span className="font-semibold">{notification.from_user_name}</span>
          {' '}{notification.message}
        </span>
        <span className="text-xs text-gray-500 block mt-0.5">
          {formatNotificationDate(notification.created_at)}
        </span>
      </div>

      {notification.type === 'follow' && (
        <button 
          onClick={handleFollowClick}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors
            ${isFollowing 
              ? 'bg-gray-100 dark:bg-gray-800 text-white dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700' 
              : 'bg-purple-600 text-white hover:bg-purple-700'}`}
        >
          {isFollowing ? 'Seguindo' : 'Seguir'}
        </button>
      )}
    </div>
  );
}

function groupNotificationsByDate(notifications: Notification[]) {
  const groups = notifications.reduce((acc, notification) => {
    const date = new Date(notification.created_at);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    let timeGroup = 'Anterior';
    if (diffDays < 7) {
      timeGroup = 'Últimos 7 dias';
    } else if (diffDays < 30) {
      timeGroup = 'Últimos 30 dias';
    }

    if (!acc[timeGroup]) {
      acc[timeGroup] = [];
    }
    acc[timeGroup].push(notification);
    return acc;
  }, {} as Record<string, Notification[]>);

  return Object.entries(groups).map(([timeGroup, notifications]) => ({
    timeGroup,
    notifications
  }));
}

function Notificacoes() {
  const navigate = useNavigate();
  const { notifications } = useNotification();
  const groupedNotifications = groupNotificationsByDate(notifications);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="text-gray-700 dark:text-gray-300"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Notificações
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {notifications.length === 0 ? (
          <div className="h-[calc(100vh-70px)] flex flex-col items-center justify-center p-4">
            <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Você não tem notificações
            </h2>
          </div>
        ) : (
          <div>
            {groupedNotifications.map((group) => (
              <div key={group.timeGroup}>
                <h2 className="px-4 py-3 text-base font-semibold text-gray-900 dark:text-white">
                  {group.timeGroup}
                </h2>
                {group.notifications.map((notification) => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notificacoes;