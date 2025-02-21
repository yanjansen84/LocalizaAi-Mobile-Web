import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

type TabType = 'proximos' | 'concluidos' | 'cancelados';

function Ingressos() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('proximos');
  const [hasTickets, setHasTickets] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const completedTickets = [
    {
      id: 1,
      title: 'Arte & Pintura Training',
      date: 'Qua, 26 Dez • 18:00 - 21:00',
      location: 'Centro de Arte, São Paulo',
      image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&h=300&fit=crop',
      status: 'completed'
    },
    {
      id: 2,
      title: 'DJ & Music Concert',
      date: 'Ter, 30 Dez • 18:00 - 22:00',
      location: 'Nova Avenida, São Paulo',
      image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=500&h=300&fit=crop',
      status: 'completed'
    },
    {
      id: 3,
      title: 'Fitness & Gym Training',
      date: 'Dom, 24 Dez • 19:00 - 23:00',
      location: 'Grand Build, São Paulo',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=300&fit=crop',
      status: 'completed'
    }
  ];

  const upcomingTickets = [
    {
      id: 4,
      title: 'Festival Nacional de Música',
      date: 'Seg, 24 Dez • 18:00 - 23:00',
      location: 'Parque Central, São Paulo',
      image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=500&h=300&fit=crop',
      status: 'paid'
    },
    {
      id: 5,
      title: 'Workshop de Arte & Murais',
      date: 'Qua, 27 Dez • 14:00 - 16:00',
      location: 'Centro de Arte, São Paulo',
      image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&h=300&fit=crop',
      status: 'paid'
    }
  ];

  const cancelledTickets = [
    {
      id: 6,
      title: 'Traditional Dance Festival',
      date: 'Ter, 16 Dez • 18:00 - 22:00',
      location: 'Nova Avenida, São Paulo',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&h=300&fit=crop',
      status: 'cancelled',
      refundAmount: 120.00
    },
    {
      id: 7,
      title: 'Painting Workshops',
      date: 'Dom, 23 Dez • 19:00 - 23:00',
      location: 'Grand Park, São Paulo',
      image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&h=300&fit=crop',
      status: 'cancelled',
      refundAmount: 80.00
    },
    {
      id: 8,
      title: 'Gebyar Music Festival',
      date: 'Qui, 20 Dez • 17:00 - 22:00',
      location: 'Central Hall, São Paulo',
      image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=500&h=300&fit=crop',
      status: 'cancelled',
      refundAmount: 150.00
    },
    {
      id: 9,
      title: 'National Concert of Music',
      date: 'Qua, 18 Dez • 18:00 - 22:00',
      location: 'Central Park, São Paulo',
      image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500&h=300&fit=crop',
      status: 'cancelled',
      refundAmount: 200.00
    }
  ];

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] px-6 text-center">
      <div className="w-48 h-48 mb-6">
        <img
          src="https://illustrations.popsy.co/purple/digital-nomad.svg"
          alt="Sem ingressos"
          className="w-full h-full"
        />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Nenhum Ingresso
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Parece que você ainda não tem ingressos. Comece a explorar eventos clicando no botão abaixo.
      </p>
      <Link
        to="/eventos"
        className="px-6 py-3 bg-purple-600 text-white rounded-full font-medium"
      >
        Encontrar Eventos
      </Link>
    </div>
  );

  const NoResultsState = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] px-6 text-center">
      <div className="w-48 h-48 mb-6">
        <img
          src="https://illustrations.popsy.co/purple/searching.svg"
          alt="Nenhum resultado encontrado"
          className="w-full h-full"
        />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Nenhum Resultado
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Não encontramos nenhum ingresso correspondente à sua busca.
      </p>
    </div>
  );

  const renderTickets = () => {
    let tickets;
    switch (activeTab) {
      case 'proximos':
        tickets = upcomingTickets;
        break;
      case 'concluidos':
        tickets = completedTickets;
        break;
      case 'cancelados':
        tickets = cancelledTickets;
        break;
      default:
        tickets = upcomingTickets;
    }

    // Filtrar ingressos com base na busca
    const filteredTickets = tickets.filter(ticket => {
      const searchTerms = searchQuery.toLowerCase();
      return (
        ticket.title.toLowerCase().includes(searchTerms) ||
        ticket.location.toLowerCase().includes(searchTerms) ||
        ticket.date.toLowerCase().includes(searchTerms)
      );
    });

    if (filteredTickets.length === 0 && searchQuery) {
      return <NoResultsState />;
    }

    return (
      <div className="p-4 space-y-4">
        {filteredTickets.map(ticket => (
          <div
            key={ticket.id}
            className="bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden"
          >
            <div className="relative h-32">
              <img
                src={ticket.image}
                alt={ticket.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  ticket.status === 'completed' 
                    ? 'bg-green-600 text-white'
                    : ticket.status === 'cancelled'
                    ? 'bg-red-600 text-white'
                    : 'bg-purple-600 text-white'
                }`}>
                  {ticket.status === 'completed' 
                    ? 'Concluído' 
                    : ticket.status === 'cancelled'
                    ? 'Cancelado'
                    : 'Pago'}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {ticket.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {ticket.date}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {ticket.location}
              </p>
              {ticket.status === 'cancelled' && 'refundAmount' in ticket && (
                <div className="mb-4 p-3 bg-gray-200 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Valor estornado: <span className="font-semibold">R$ {ticket.refundAmount.toFixed(2)}</span>
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                {ticket.status === 'completed' ? (
                  <>
                    <button
                      onClick={() => navigate('/compra-ingresso/avaliacao')}
                      className="flex-1 py-2 border border-purple-600 text-purple-600 rounded-full text-sm font-medium"
                    >
                      Deixar Avaliação
                    </button>
                    <Link
                      to={`/compra-ingresso/ingresso`}
                      className="flex-1 py-2 bg-purple-600 text-white rounded-full text-sm font-medium text-center"
                    >
                      Ver Ingresso
                    </Link>
                  </>
                ) : ticket.status === 'paid' ? (
                  <>
                    <button
                      onClick={() => navigate('/compra-ingresso/cancelar')}
                      className="flex-1 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium"
                    >
                      Cancelar Reserva
                    </button>
                    <Link
                      to={`/compra-ingresso/ingresso`}
                      className="flex-1 py-2 bg-purple-600 text-white rounded-full text-sm font-medium text-center"
                    >
                      Ver Ingresso
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/eventos"
                    className="w-full py-2 bg-purple-600 text-white rounded-full text-sm font-medium text-center"
                  >
                    Explorar Eventos
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            {!showSearch ? (
              <>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Ingressos
                </h1>
                <button 
                  onClick={() => setShowSearch(true)}
                  className="p-2 text-gray-600 dark:text-gray-400"
                >
                  <Search className="w-6 h-6" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 w-full">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Pesquisar ingressos..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white"
                    autoFocus
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <button 
                  onClick={() => {
                    setShowSearch(false);
                    setSearchQuery('');
                  }}
                  className="p-2 text-gray-600 dark:text-gray-400"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setActiveTab('proximos')}
              className={`pb-3 px-1 text-sm font-medium ${
                activeTab === 'proximos'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Próximos
            </button>
            <button
              onClick={() => setActiveTab('concluidos')}
              className={`pb-3 px-1 text-sm font-medium ${
                activeTab === 'concluidos'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Concluídos
            </button>
            <button
              onClick={() => setActiveTab('cancelados')}
              className={`pb-3 px-1 text-sm font-medium ${
                activeTab === 'cancelados'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Cancelados
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {!hasTickets ? <EmptyState /> : renderTickets()}
        </div>

        {/* Navbar */}
        <Navbar />
      </div>
    </div>
  );
}

export default Ingressos;