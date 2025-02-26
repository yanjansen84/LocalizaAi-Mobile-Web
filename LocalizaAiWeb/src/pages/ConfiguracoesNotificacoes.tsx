import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bell, Calendar, Heart, CreditCard, MessageCircle, Gift, Info } from 'lucide-react';

function ConfiguracoesNotificacoes() {
  const [notifications, setNotifications] = useState({
    sound: true,
    purchasedTickets: true,
    likedEvents: false,
    followedOrganizer: true,
    specialOffers: false,
    payments: true,
    reminders: true,
    recommendations: true,
    appUpdates: true,
    newService: false,
    newTips: false
  });

  const notificationItems = [
    {
      id: 'sound',
      icon: Bell,
      title: 'Som e Vibração',
      description: 'Ativar sons e vibração para notificações'
    },
    {
      id: 'purchasedTickets',
      icon: Calendar,
      title: 'Ingressos Comprados',
      description: 'Atualizações sobre seus ingressos'
    },
    {
      id: 'likedEvents',
      icon: Heart,
      title: 'Eventos Curtidos',
      description: 'Novidades sobre eventos que você curtiu'
    },
    {
      id: 'followedOrganizer',
      icon: MessageCircle,
      title: 'Organizador Seguido',
      description: 'Atualizações de organizadores que você segue'
    },
    {
      id: 'specialOffers',
      icon: Gift,
      title: 'Ofertas Especiais',
      description: 'Promoções e descontos exclusivos'
    },
    {
      id: 'payments',
      icon: CreditCard,
      title: 'Pagamentos',
      description: 'Atualizações sobre suas transações'
    },
    {
      id: 'reminders',
      icon: Bell,
      title: 'Lembretes',
      description: 'Lembretes sobre eventos próximos'
    },
    {
      id: 'recommendations',
      icon: Gift,
      title: 'Recomendações',
      description: 'Eventos que podem te interessar'
    },
    {
      id: 'appUpdates',
      icon: Info,
      title: 'Atualizações do App',
      description: 'Novidades e melhorias no aplicativo'
    },
    {
      id: 'newService',
      icon: Gift,
      title: 'Novos Serviços',
      description: 'Quando novos serviços estiverem disponíveis'
    },
    {
      id: 'newTips',
      icon: Info,
      title: 'Novas Dicas',
      description: 'Dicas e truques para melhor experiência'
    }
  ];

  const handleToggle = (id: string) => {
    setNotifications(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 flex items-center gap-4">
        <Link to="/configuracoes" className="text-gray-700 dark:text-gray-300">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Notificações
        </h1>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="space-y-4">
          {notificationItems.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-gray-900 dark:text-white font-medium">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle(item.id)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  notifications[item.id] ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                    notifications[item.id] ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ConfiguracoesNotificacoes;