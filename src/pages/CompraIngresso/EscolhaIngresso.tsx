import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus } from 'lucide-react';

function EscolhaIngresso() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('economy');
  const [quantity, setQuantity] = useState(1);

  const tickets = {
    economy: {
      name: 'Economy',
      price: 50.00
    },
    vip: {
      name: 'VIP',
      price: 150.00
    }
  };

  const handleQuantityChange = (action: 'increase' | 'decrease') => {
    if (action === 'increase' && quantity < 10) {
      setQuantity(quantity + 1);
    } else if (action === 'decrease' && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="p-4 flex items-center gap-4">
        <Link to="/evento/1" className="text-gray-900 dark:text-white">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-semibold">Reservar Evento</h1>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Ticket Type Selection */}
        <div className="mb-8">
          <div className="flex gap-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6">
            <button
              onClick={() => setSelectedType('economy')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedType === 'economy'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Economy
            </button>
            <button
              onClick={() => setSelectedType('vip')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedType === 'vip'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              VIP
            </button>
          </div>

          {/* Quantity Selection */}
          <div className="mb-8">
            <h2 className="text-lg mb-4">Escolha a quantidade</h2>
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => handleQuantityChange('decrease')}
                className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                disabled={quantity <= 1}
              >
                <Minus className="w-6 h-6 text-gray-400 dark:text-gray-600" />
              </button>
              <span className="text-2xl font-semibold w-8 text-center">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange('increase')}
                className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                disabled={quantity >= 10}
              >
                <Plus className="w-6 h-6 text-gray-400 dark:text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => navigate('/compra-ingresso/dados-comprador')}
          className="w-full py-3 bg-purple-600 text-white rounded-full font-medium"
        >
          Continuar - R$ {(tickets[selectedType].price * quantity).toFixed(2)}
        </button>
      </div>
    </div>
  );
}

export default EscolhaIngresso;