import React from 'react';
import { ArrowLeft, Bell, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: number;
  type: 'payment' | 'cancel' | 'feature';
  title: string;
  message: string;
  date: string;
  icon: string;
  color: string;
}

function Notificacoes() {
  const navigate = useNavigate();
  const [hasNotifications, setHasNotifications] = React.useState(true);

  const notifications: Notification[] = [
    {
      id: 1,
      type: 'payment',
      title: 'Pagamento Realizado!',
      message: 'Você realizou um pagamento para o Show Bastai',
      date: 'Hoje, 25 de Dezembro 2022',
      icon: '✓',
      color: 'bg-blue-500'
    },
    {
      id: 2,
      type: 'cancel',
      title: 'Pedido Cancelado!',
      message: 'Você cancelou o pagamento do Festival de Música',
      date: 'Hoje, 25 de Dezembro 2022',
      icon: '×',
      color: 'bg-red-500'
    },
    {
      id: 3,
      type: 'feature',
      title: 'Novos Recursos Disponíveis',
      message: 'Agora você pode convidar amigos para eventos',
      date: 'Ontem, 24 de Dezembro 2022',
      icon: '★',
      color: 'bg-yellow-500'
    },
    {
      id: 4,
      type: 'payment',
      title: 'Pagamento Realizado!',
      message: 'Você realizou um pagamento para o Show em Surabaya',
      date: 'Segunda, 23 de Dezembro 2022',
      icon: '✓',
      color: 'bg-blue-500'
    },
    {
      id: 5,
      type: 'cancel',
      title: 'Pedido Cancelado!',
      message: 'Você realizou um pagamento',
      date: 'Segunda, 23 de Dezembro 2022',
      icon: '×',
      color: 'bg-red-500'
    }
  ];

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
          <button className="p-2 text-gray-600 dark:text-gray-400">
            <MoreVertical className="w-6 h-6" />
          </button>
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
          <div className="p-4">
            {notifications.reduce((acc: JSX.Element[], notification, index, array) => {
              // Check if we need to add a date header
              if (index === 0 || notification.date !== array[index - 1].date) {
                acc.push(
                  <div key={`date-${notification.date}`} className="text-sm text-gray-600 dark:text-gray-400 mb-4 mt-6">
                    {notification.date}
                  </div>
                );
              }

              // Add the notification
              acc.push(
                <div
                  key={notification.id}
                  className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl"
                >
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 ${notification.color} rounded-full flex items-center justify-center text-white`}>
                      {notification.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </div>
              );

              return acc;
            }, [])}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notificacoes;