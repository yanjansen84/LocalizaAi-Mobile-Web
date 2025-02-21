import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';

const cancellationReasons = [
  'Tenho outro evento que coincide',
  'Estou doente, não posso comparecer',
  'Tenho um compromisso urgente',
  'Não tenho transporte para ir',
  'Não tenho amigos para ir',
  'Quero reservar outro evento',
  'Apenas quero cancelar'
];

function CancelarReserva() {
  const navigate = useNavigate();
  const [selectedReason, setSelectedReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCancel = () => {
    setShowSuccess(true);
  };

  const handleConfirm = () => {
    navigate('/ingressos');
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-gray-100 dark:bg-gray-800 rounded-3xl p-8 text-center">
          <div className="mb-6 relative">
            <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto relative">
              <Check className="w-10 h-10 text-white" />
              <div className="absolute -inset-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-purple-600 rounded-full animate-ping"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.2}s`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Sucesso!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Você cancelou o evento com sucesso. 80% do valor será estornado para sua conta.
          </p>
          <button
            onClick={handleConfirm}
            className="w-full py-3 bg-purple-600 text-white rounded-full font-medium"
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 flex items-center gap-4">
        <Link to="/ingressos" className="text-gray-700 dark:text-gray-300">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Cancelar Reserva
        </h1>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        <p className="text-gray-600 dark:text-gray-400">
          Por favor, selecione o motivo do cancelamento:
        </p>

        <div className="space-y-3">
          {cancellationReasons.map((reason) => (
            <button
              key={reason}
              onClick={() => setSelectedReason(reason)}
              className={`w-full p-4 rounded-xl flex items-center justify-between ${
                selectedReason === reason
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
              }`}
            >
              <span>{reason}</span>
              {selectedReason === reason && (
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-purple-600" />
                </div>
              )}
            </button>
          ))}
        </div>

        <div>
          <p className="text-gray-900 dark:text-white font-medium mb-2">
            Outros
          </p>
          <textarea
            value={otherReason}
            onChange={(e) => setOtherReason(e.target.value)}
            placeholder="Descreva outro motivo..."
            className="w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white resize-none h-32"
          />
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={handleCancel}
          disabled={!selectedReason && !otherReason}
          className="w-full py-3 bg-purple-600 text-white rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar Reserva
        </button>
      </div>
    </div>
  );
}

export default CancelarReserva;