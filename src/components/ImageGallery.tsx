import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  onClose: () => void;
}

export function ImageGallery({ images, onClose }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setScale(1);
  };

  const previousImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setScale(1);
  };

  const toggleZoom = () => {
    setScale(prev => prev === 1 ? 2 : 1);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white p-2"
        aria-label="Fechar galeria"
      >
        <X className="w-6 h-6" />
      </button>

      <button
        onClick={previousImage}
        className="absolute left-4 text-white p-2"
        aria-label="Imagem anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextImage}
        className="absolute right-4 text-white p-2"
        aria-label="Próxima imagem"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div 
        className="w-full h-full flex items-center justify-center overflow-hidden"
        style={{ cursor: scale === 1 ? 'zoom-in' : 'zoom-out' }}
        onClick={toggleZoom}
      >
        <img
          src={images[currentIndex]}
          alt={`Imagem ${currentIndex + 1}`}
          className="max-w-full max-h-full transition-transform duration-200"
          style={{ transform: `scale(${scale})` }}
        />
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index);
              setScale(1);
            }}
            className={`w-2 h-2 rounded-full ${
              currentIndex === index ? 'bg-white' : 'bg-white/50'
            }`}
            aria-label={`Ir para imagem ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
