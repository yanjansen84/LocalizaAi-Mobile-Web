import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, BarChart2, Loader, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image_url: string;
}

function GerenciarEventos() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{show: boolean; eventId?: string; title?: string}>({show: false});
  const [toast, setToast] = useState<{show: boolean; message: string; type: 'success' | 'error'}>({
    show: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    if (user) {
      console.log('Usuario autenticado, carregando eventos...');
      loadEvents();
    } else {
      console.log('Usuário não autenticado');
    }
  }, [user]);

  const loadEvents = async () => {
    try {
      console.log('Carregando eventos para o usuário:', user?.id);
      setLoading(true);

      if (!user) {
        console.log('Usuário não autenticado, não é possível carregar eventos');
        return;
      }

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', user.id)
        .order('date', { ascending: false });

      console.log('Resposta do Supabase:', { data, error });

      if (error) {
        console.error('Erro ao buscar eventos:', error);
        throw error;
      }

      console.log('Eventos carregados:', data);
      setEvents(data || []);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirmation = (eventId: string, eventTitle: string) => {
    setDeleteModal({
      show: true,
      eventId,
      title: eventTitle
    });
  };

  const handleDelete = async () => {
    if (!deleteModal.eventId) return;

    try {
      setLoading(true);
      const eventId = deleteModal.eventId;
      console.log('Tentando excluir evento com ID:', eventId);

      const { data, error } = await supabase.rpc('delete_event', {
        event_id: eventId,
        user_id: user?.id
      });

      if (error) {
        console.error('Erro ao excluir evento:', error);
        setToast({
          show: true,
          message: 'Erro ao excluir o evento. Por favor, tente novamente.',
          type: 'error'
        });
        return;
      }

      console.log('Evento excluído com sucesso');
      
      // Atualiza a lista local
      setEvents(currentEvents => currentEvents.filter(event => event.id !== eventId));
      setDeleteModal({show: false});
      
      // Mostra mensagem de sucesso
      setToast({
        show: true,
        message: 'Evento excluído com sucesso!',
        type: 'success'
      });
      
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      setToast({
        show: true,
        message: 'Erro ao excluir o evento. Por favor, tente novamente.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (eventId: string) => {
    navigate(`/editar-evento/${eventId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <Loader className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Eventos
            </h1>
            <button
              onClick={() => navigate('/criar-evento')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
            >
              Criar Novo Evento
            </button>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                Nenhum evento encontrado.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {event.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {new Date(event.date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {event.location}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(event.id)}
                        className="p-2 text-gray-600 hover:text-purple-600 dark:text-gray-400"
                        title="Editar"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => showDeleteConfirmation(event.id, event.title)}
                        className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400"
                        title="Excluir"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => navigate(`/evento/${event.id}/resultados`)}
                        className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400"
                        title="Ver resultados"
                      >
                        <BarChart2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toast notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />
      )}

      {/* Modal de Confirmação de Exclusão */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirmar Exclusão
              </h3>
              <button
                onClick={() => setDeleteModal({show: false})}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                Tem certeza que deseja excluir o evento "{deleteModal.title}"? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModal({show: false})}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GerenciarEventos;
