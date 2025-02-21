import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';

function Ingresso() {
  const ticketData = {
    event: {
      title: 'Festival Nacional de Música',
      date: 'Segunda, 24 Dez • 18:00 - 23:00',
      location: 'Parque Central, São Paulo',
      organizer: 'Mundo da Música'
    },
    buyer: {
      fullName: 'Andrew Ainsley',
      nickname: 'Andrew',
      gender: 'Masculino',
      birthDate: '27/12/1995',
      country: 'Brasil',
      phone: '+11 467 378 399',
      email: 'andrew_ainsley@exemplo.com'
    },
    ticket: {
      type: 'Economy',
      quantity: 1,
      price: 50.00,
      tax: 5.00,
      total: 55.00,
      orderId: '5472829779',
      status: 'Confirmado',
      paymentMethod: 'Mastercard',
      cardNumber: '****4679'
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Link to="/eventos" className="text-gray-700 dark:text-gray-300">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Ingresso Digital
        </h1>
        <div className="w-6 h-6" /> {/* Espaçador */}
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 pb-24">
        {/* QR Code */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl flex justify-center">
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TICKET-ID-12345"
            alt="QR Code do Ingresso"
            className="w-64 h-64"
          />
        </div>

        {/* Event Details */}
        <div className="space-y-4">
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl space-y-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Evento</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {ticketData.event.title}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Data e Hora</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {ticketData.event.date}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Local do Evento</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {ticketData.event.location}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Organizador</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {ticketData.event.organizer}
              </p>
            </div>
          </div>

          {/* Buyer Details */}
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl space-y-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Nome Completo</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {ticketData.buyer.fullName}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Apelido</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {ticketData.buyer.nickname}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Gênero</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {ticketData.buyer.gender}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Data de Nascimento</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {ticketData.buyer.birthDate}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">País</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {ticketData.buyer.country}
                </p>
              </div>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ingressos</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {ticketData.ticket.quantity} ({ticketData.ticket.type})
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Valor</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  R$ {ticketData.ticket.price.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Taxa</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  R$ {ticketData.ticket.tax.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  R$ {ticketData.ticket.total.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Forma de Pagamento</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {ticketData.ticket.paymentMethod} ({ticketData.ticket.cardNumber})
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <p className="text-purple-600 font-medium">
                  {ticketData.ticket.status}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Número do Pedido</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {ticketData.ticket.orderId}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <button className="w-full py-3 bg-purple-600 text-white rounded-full font-medium flex items-center justify-center gap-2">
          <Download className="w-5 h-5" />
          Baixar Ingresso
        </button>
      </div>
    </div>
  );
}

export default Ingresso;