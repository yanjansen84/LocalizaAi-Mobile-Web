import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard } from 'lucide-react';

function Pagamento() {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState('');

  const paymentMethods = [
    {
      id: 'pix',
      name: 'Pix',
      icon: '🔐',
      description: 'Pagamento instantâneo'
    },
    {
      id: 'card',
      name: 'Cartão de Crédito',
      icon: '💳',
      description: 'Visa, Mastercard, Elo'
    }
  ];

  const handleContinue = () => {
    if (selectedMethod === 'card') {
      navigate('/compra-ingresso/cadastro-cartao');
    } else {
      navigate('/compra-ingresso/resumo');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="p-4 flex items-center gap-4">
        <Link to="/compra-ingresso/dados-comprador" className="text-gray-900 dark:text-white">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-semibold">Forma de Pagamento</h1>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Selecione o método de pagamento que deseja utilizar
        </p>

        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`w-full p-4 rounded-xl flex items-center gap-4 transition-colors ${
                selectedMethod === method.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
              }`}
            >
              <span className="text-2xl">{method.icon}</span>
              <div className="flex-1 text-left">
                <p className="font-medium">{method.name}</p>
                <p className={`text-sm ${
                  selectedMethod === method.id
                    ? 'text-gray-200'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {method.description}
                </p>
              </div>
              <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center">
                {selectedMethod === method.id && (
                  <div className="w-3 h-3 rounded-full bg-white" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={handleContinue}
          disabled={!selectedMethod}
          className="w-full py-3 bg-purple-600 text-white rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

export default Pagamento;