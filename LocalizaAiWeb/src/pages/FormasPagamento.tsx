import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, CreditCard, Trash2 } from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'credit' | 'debit';
  brand: string;
  lastFour: string;
  expiryDate: string;
  isDefault: boolean;
}

function FormasPagamento() {
  const [showAddCard, setShowAddCard] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'credit',
      brand: 'Mastercard',
      lastFour: '4679',
      expiryDate: '12/25',
      isDefault: true
    },
    {
      id: '2',
      type: 'credit',
      brand: 'Visa',
      lastFour: '2766',
      expiryDate: '09/24',
      isDefault: false
    },
    {
      id: '3',
      type: 'debit',
      brand: 'Mastercard',
      lastFour: '3892',
      expiryDate: '03/26',
      isDefault: false
    }
  ]);

  const [newCard, setNewCard] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    type: 'credit' as 'credit' | 'debit'
  });

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar lógica de adicionar cartão
    setShowAddCard(false);
  };

  const handleDeleteCard = (id: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev =>
      prev.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
  };

  if (showAddCard) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAddCard(false)}
              className="text-gray-700 dark:text-gray-300"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Adicionar Cartão
            </h1>
          </div>
        </div>

        <form onSubmit={handleAddCard} className="p-4 space-y-4">
          <div className="bg-purple-600 p-6 rounded-xl relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <CreditCard className="w-8 h-8 text-white/50" />
            </div>
            <div className="space-y-4">
              <div className="w-12 h-8 bg-white/20 rounded" />
              <div className="pt-4">
                <div className="text-lg tracking-widest text-white">
                  {newCard.number || '•••• •••• •••• ••••'}
                </div>
              </div>
              <div className="flex justify-between text-white">
                <div>
                  <p className="text-xs text-white/60 mb-1">Nome do Titular</p>
                  <p className="font-medium">
                    {newCard.name || '••••• •••••'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/60 mb-1">Validade</p>
                  <p className="font-medium">
                    {newCard.expiry || 'MM/AA'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                Número do Cartão
              </label>
              <input
                type="text"
                value={newCard.number}
                onChange={(e) => setNewCard({ ...newCard, number: e.target.value })}
                placeholder="1234 5678 9012 3456"
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white"
                maxLength={19}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                Nome no Cartão
              </label>
              <input
                type="text"
                value={newCard.name}
                onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                placeholder="Nome como está no cartão"
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                  Validade
                </label>
                <input
                  type="text"
                  value={newCard.expiry}
                  onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                  placeholder="MM/AA"
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white"
                  maxLength={5}
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                  CVV
                </label>
                <input
                  type="text"
                  value={newCard.cvv}
                  onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                  placeholder="123"
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white"
                  maxLength={3}
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                Tipo de Cartão
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setNewCard({ ...newCard, type: 'credit' })}
                  className={`p-3 rounded-xl flex items-center justify-center ${
                    newCard.type === 'credit'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  }`}
                >
                  Crédito
                </button>
                <button
                  type="button"
                  onClick={() => setNewCard({ ...newCard, type: 'debit' })}
                  className={`p-3 rounded-xl flex items-center justify-center ${
                    newCard.type === 'debit'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  }`}
                >
                  Débito
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-purple-600 text-white rounded-full font-medium mt-6"
          >
            Adicionar Cartão
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 flex items-center gap-4">
        <Link to="/perfil" className="text-gray-700 dark:text-gray-300">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Formas de Pagamento
        </h1>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Add Card Button */}
        <button
          onClick={() => setShowAddCard(true)}
          className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400"
        >
          <Plus className="w-5 h-5" />
          <span>Adicionar Novo Cartão</span>
        </button>

        {/* Payment Methods List */}
        <div className="space-y-4">
          {paymentMethods.map(method => (
            <div
              key={method.id}
              className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {method.brand} •••• {method.lastFour}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Expira em {method.expiryDate}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteCard(method.id)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {method.type === 'credit' ? 'Cartão de Crédito' : 'Cartão de Débito'}
                </p>
                {!method.isDefault && (
                  <button
                    onClick={() => handleSetDefault(method.id)}
                    className="text-sm text-purple-600"
                  >
                    Definir como Padrão
                  </button>
                )}
                {method.isDefault && (
                  <span className="text-sm text-purple-600">
                    Cartão Padrão
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FormasPagamento;