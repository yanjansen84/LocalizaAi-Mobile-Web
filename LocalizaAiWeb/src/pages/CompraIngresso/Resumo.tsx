import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard } from 'lucide-react';

function Resumo() {
  const navigate = useNavigate();

  const orderSummary = {
    event: {
      title: 'Festival Nacional de Música',
      date: 'Seg, 24 Dez • 18:00 - 21:00',
      location: 'Parque Central, São Paulo',
      image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=500&h=300&fit=crop'
    },
    buyer: {
      name: 'Andrew Ainsley',
      phone: '+11 467 378 399',
      email: 'andrew_ainsley@exemplo.com'
    },
    order: {
      tickets: '1 Ingresso (Economy)',
      subtotal: 50.00,
      tax: 5.00,
      total: 55.00
    },
    payment: {
      method: 'Mastercard',
      last4: '4679'
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="p-4 flex items-center gap-4">
        <Link to="/compra-ingresso/pagamento" className="text-gray-900 dark:text-white">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-semibold">Resumo do Pedido</h1>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Event Info */}
        <div className="flex gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <img
            src={orderSummary.event.image}
            alt={orderSummary.event.title}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div>
            <h3 className="font-medium mb-1 line-clamp-1">
              {orderSummary.event.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {orderSummary.event.date}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {orderSummary.event.location}
            </p>
          </div>
        </div>

        {/* Buyer Info */}
        <div className="space-y-3">
          <h3 className="font-medium">Dados do Comprador</h3>
          <div className="space-y-2 text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              Nome Completo:{' '}
              <span className="text-gray-900 dark:text-white">{orderSummary.buyer.name}</span>
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Telefone:{' '}
              <span className="text-gray-900 dark:text-white">{orderSummary.buyer.phone}</span>
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Email:{' '}
              <span className="text-gray-900 dark:text-white">{orderSummary.buyer.email}</span>
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-3">
          <h3 className="font-medium">Detalhes do Pedido</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{orderSummary.order.tickets}</span>
              <span className="text-gray-900 dark:text-white">
                R$ {orderSummary.order.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Taxa de Serviço</span>
              <span className="text-gray-900 dark:text-white">
                R$ {orderSummary.order.tax.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-base font-medium pt-2 border-t border-gray-200 dark:border-gray-700">
              <span>Total</span>
              <span>R$ {orderSummary.order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-3">
          <h3 className="font-medium">Método de Pagamento</h3>
          <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-medium">{orderSummary.payment.method}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                **** {orderSummary.payment.last4}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => navigate('/compra-ingresso/status')}
          className="w-full py-3 bg-purple-600 text-white rounded-full font-medium"
        >
          Confirmar Compra
        </button>
      </div>
    </div>
  );
}

export default Resumo;