import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventResult {
  id: string;
  title: string;
  date: string;
  tickets_sold: number;
  total_tickets: number;
  total_revenue: number;
  attendees: number;
}

function ResultadosEvento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEventResults();
  }, [id]);

  const loadEventResults = async () => {
    try {
      if (!id) return;

      const { data, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          date,
          tickets_sold,
          total_tickets,
          total_revenue,
          attendees
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error('Erro ao carregar resultados:', error);
      navigate('/gerenciar-eventos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <Loader className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Evento não encontrado.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => navigate('/gerenciar-eventos')}
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
            >
              ← Voltar para Gerenciar Eventos
            </button>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Resultados do Evento
          </h1>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {event.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {format(new Date(event.date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Ingressos Vendidos
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {event.tickets_sold}/{event.total_tickets}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {((event.tickets_sold / event.total_tickets) * 100).toFixed(1)}% da capacidade
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Receita Total
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(event.total_revenue)}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Presença
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {event.attendees}/{event.tickets_sold}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {((event.attendees / event.tickets_sold) * 100).toFixed(1)}% de comparecimento
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultadosEvento;
