import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, CreditCard } from 'lucide-react';

function CadastroCartao() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/compra-ingresso/resumo');
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <div className="p-4 flex items-center gap-4">
        <Link to="/compra-ingresso/pagamento" className="text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-semibold">Adicionar Cartão</h1>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Card Preview */}
        <div className="mb-8 p-6 bg-purple-600 rounded-xl relative overflow-hidden text-white">
          <div className="absolute top-4 right-4">
            <CreditCard className="w-8 h-8 text-white/50" />
          </div>
          <div className="space-y-4">
            <div className="w-12 h-8 bg-white/20 rounded" />
            <div className="pt-4">
              <div className="text-lg tracking-widest">
                {formData.cardNumber || '•••• •••• •••• ••••'}
              </div>
            </div>
            <div className="flex justify-between">
              <div>
                <p className="text-xs text-white/60 mb-1">Nome do Titular</p>
                <p className="font-medium">
                  {formData.cardName || '••••• •••••'}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/60 mb-1">Validade</p>
                <p className="font-medium">
                  {formData.expiryDate || 'MM/AA'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Nome no Cartão
            </label>
            <input
              type="text"
              value={formData.cardName}
              onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
              placeholder="Nome como está no cartão"
              className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-900 placeholder-gray-500"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Número do Cartão
            </label>
            <input
              type="text"
              value={formData.cardNumber}
              onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
              placeholder="1234 5678 9012 3456"
              className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-900 placeholder-gray-500"
              required
              maxLength={19}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Data de Validade
              </label>
              <input
                type="text"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                placeholder="MM/AA"
                className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-900 placeholder-gray-500"
                required
                maxLength={5}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                CVV
              </label>
              <input
                type="text"
                value={formData.cvv}
                onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                placeholder="123"
                className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-900 placeholder-gray-500"
                required
                maxLength={3}
              />
            </div>
          </div>
        </form>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-purple-600 text-white rounded-full font-medium"
        >
          Adicionar Cartão
        </button>
      </div>
    </div>
  );
}

export default CadastroCartao;