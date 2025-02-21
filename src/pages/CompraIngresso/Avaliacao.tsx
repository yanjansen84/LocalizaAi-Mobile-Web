import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';

function Avaliacao() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const eventData = {
    title: 'Arte & Pintura Training',
    date: 'Qua, 26 Dez • 18:00 - 21:00',
    location: 'Centro de Arte',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&h=300&fit=crop'
  };

  const handleSubmit = () => {
    // Aqui você implementaria a lógica para enviar a avaliação
    navigate('/ingressos');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 flex items-center gap-4">
        <Link to="/ingressos" className="text-gray-700 dark:text-gray-300">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Deixar Avaliação
        </h1>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Event Card */}
        <div className="flex gap-4 items-center bg-gray-100 dark:bg-gray-800 p-4 rounded-xl">
          <img
            src={eventData.image}
            alt={eventData.title}
            className="w-16 h-16 rounded-xl object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {eventData.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {eventData.date}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {eventData.location}
            </p>
          </div>
        </div>

        {/* Rating Section */}
        <div className="text-center space-y-4">
          <h2 className="text-lg text-gray-900 dark:text-white">
            Como foi sua experiência com
            <br />
            {eventData.title}?
          </h2>
          
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
                className="p-1"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-purple-600 text-purple-600'
                      : 'text-gray-400 dark:text-gray-600'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Review Section */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Escreva sua Avaliação
          </h3>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Conte-nos mais sobre sua experiência..."
            className="w-full h-32 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white resize-none"
          />
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/ingressos')}
            className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-medium"
          >
            Avaliar Depois
          </button>
          <button
            onClick={handleSubmit}
            disabled={!rating}
            className="flex-1 py-3 bg-purple-600 text-white rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}

export default Avaliacao;