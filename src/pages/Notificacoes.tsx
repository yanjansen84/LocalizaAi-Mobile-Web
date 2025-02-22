import React from 'react';
import { ArrowLeft, Bell, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: number;
  type: 'follow' | 'payment' | 'cancel' | 'feature';
  title?: string;
  message: string;
  date: string;
  timeGroup: 'Últimos 7 dias' | 'Últimos 30 dias' | 'Anterior';
  icon?: string;
  color?: string;
  userId?: string;
  userName?: string;
  userImage?: string;
}

function NotificationItem({ notification }: { notification: Notification }) {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = React.useState(true);

  const handleClick = () => {
    if (notification.type === 'follow' && notification.userId) {
      navigate(`/perfil/${notification.userId}`);
    }
  };

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFollowing(!isFollowing);
    // Aqui você pode adicionar a lógica para seguir/deixar de seguir
  };

  return (
    <div
      onClick={handleClick}
      className="w-full py-3 px-4 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800/50 cursor-pointer"
    >
      <div className="w-12 h-12">
        <img 
          src={notification.userImage} 
          alt={notification.userName} 
          className="w-full h-full rounded-full object-cover"
        />
      </div>
      
      <div className="flex-1 text-left">
        <span className="text-sm text-gray-900 dark:text-white">
          <span className="font-semibold">{notification.userName}</span>
          {' '}{notification.message}
        </span>
        <span className="text-xs text-gray-500 block mt-0.5">
          {notification.date}
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

function Notificacoes() {
  const navigate = useNavigate();
  const [hasNotifications, setHasNotifications] = React.useState(true);

  const notifications: Notification[] = [
    {
      id: 1,
      type: 'follow',
      message: 'começou a seguir você.',
      date: '1 d',
      timeGroup: 'Últimos 7 dias',
      userId: '123',
      userName: 'docerrefugio',
      userImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=doce'
    },
    {
      id: 2,
      type: 'follow',
      message: 'curtiu seu story.',
      date: '2 d',
      timeGroup: 'Últimos 7 dias',
      userId: '124',
      userName: 'aliciinhahoficial',
      userImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alicia'
    },
    {
      id: 3,
      type: 'follow',
      message: 'e outras 3 pessoas convidaram você para participar de canais de transmissão.',
      date: '4 d',
      timeGroup: 'Últimos 7 dias',
      userId: '125',
      userName: 'duploacerto, chocolateriasophia',
      userImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=duplo'
    },
    {
      id: 4,
      type: 'follow',
      message: 'postou uma thread que talvez você curta: Let\'s go',
      date: '5 d',
      timeGroup: 'Últimos 7 dias',
      userId: '126',
      userName: '_allanessantos',
      userImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=allan'
    },
    {
      id: 5,
      type: 'follow',
      message: 'curtiram seu story.',
      date: '1 sem',
      timeGroup: 'Últimos 30 dias',
      userId: '127',
      userName: 'aliciinhahoficial e deboradiasdld',
      userImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alicia2'
    }
  ];

  // Agrupa as notificações por período
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const group = groups.find(g => g.timeGroup === notification.timeGroup);
    if (group) {
      group.notifications.push(notification);
    } else {
      groups.push({
        timeGroup: notification.timeGroup,
        notifications: [notification]
      });
    }
    return groups;
  }, [] as { timeGroup: string; notifications: Notification[] }[]);

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
        {!hasNotifications ? (
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