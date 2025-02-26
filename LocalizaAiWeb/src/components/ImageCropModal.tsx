import React, { useState, useRef, useEffect } from 'react';

interface ImageCropModalProps {
  imageUrl: string;
  onClose: () => void;
  onSave: (croppedImage: Blob) => void;
}

export default function ImageCropModal({ imageUrl, onClose, onSave }: ImageCropModalProps) {
  const [circlePosition, setCirclePosition] = useState({ x: 0, y: 0 });
  const [circleSize, setCircleSize] = useState(288); // 72 * 4 = 288px inicial
  const [startTouch, setStartTouch] = useState({ x: 0, y: 0 });
  const [pinchStart, setPinchStart] = useState(0);
  const [initialSize, setInitialSize] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);

  // Centralizar o círculo quando a imagem carregar
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      setCirclePosition({
        x: (container.offsetWidth - circleSize) / 2,
        y: (container.offsetHeight - circleSize) / 2
      });
    }
  }, [circleSize]);

  const adjustCircleSize = (delta: number) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
    // Calcular novo tamanho
    const minSize = 150;
    const maxSize = Math.min(container.offsetWidth, container.offsetHeight) - 40;
    const newSize = Math.max(minSize, Math.min(circleSize + delta, maxSize));
    
    // Ajustar posição para manter centralizado
    const deltaSize = newSize - circleSize;
    const newPosition = {
      x: circlePosition.x - deltaSize / 2,
      y: circlePosition.y - deltaSize / 2
    };

    // Garantir que o círculo não saia do container
    newPosition.x = Math.max(0, Math.min(newPosition.x, container.offsetWidth - newSize));
    newPosition.y = Math.max(0, Math.min(newPosition.y, container.offsetHeight - newSize));

    setCircleSize(newSize);
    setCirclePosition(newPosition);
  };

  const handleWheel = (e: React.WheelEvent) => {
    try {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 10 : -10;
      adjustCircleSize(delta);
    } catch (error) {
      // Ignora o erro de preventDefault
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartTouch({
      x: e.clientX - circlePosition.x,
      y: e.clientY - circlePosition.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const container = containerRef.current;
    let newX = e.clientX - startTouch.x;
    let newY = e.clientY - startTouch.y;

    // Limitar movimento dentro do container
    newX = Math.max(0, Math.min(newX, container.offsetWidth - circleSize));
    newY = Math.max(0, Math.min(newY, container.offsetHeight - circleSize));

    setCirclePosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );
      setPinchStart(distance);
      setInitialSize(circleSize);
    } else {
      const touch = e.touches[0];
      setStartTouch({
        x: touch.clientX - circlePosition.x,
        y: touch.clientY - circlePosition.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );

      const scale = distance / pinchStart;
      const sizeDelta = Math.round((scale - 1) * initialSize);
      adjustCircleSize(sizeDelta);
    } else {
      const touch = e.touches[0];
      let newX = touch.clientX - startTouch.x;
      let newY = touch.clientY - startTouch.y;

      const container = containerRef.current;
      newX = Math.max(0, Math.min(newX, container.offsetWidth - circleSize));
      newY = Math.max(0, Math.min(newY, container.offsetHeight - circleSize));

      setCirclePosition({ x: newX, y: newY });
    }
  };

  const handleSave = async () => {
    if (!imageRef.current || !containerRef.current) return;

    try {
      const container = containerRef.current;
      const image = imageRef.current;

      const canvas = document.createElement('canvas');
      canvas.width = circleSize;
      canvas.height = circleSize;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Não foi possível criar contexto 2d');

      ctx.beginPath();
      ctx.arc(circleSize / 2, circleSize / 2, circleSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      const scale = container.offsetHeight / image.naturalHeight;
      const scaledWidth = image.naturalWidth * scale;
      const imageX = (container.offsetWidth - scaledWidth) / 2;

      const sourceX = (circlePosition.x - imageX) / scale;
      const sourceY = circlePosition.y / scale;
      const sourceSize = circleSize / scale;

      ctx.drawImage(
        image,
        sourceX,
        sourceY,
        sourceSize,
        sourceSize,
        0,
        0,
        circleSize,
        circleSize
      );

      canvas.toBlob(
        (blob) => {
          if (blob) onSave(blob);
        },
        'image/jpeg',
        1
      );
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 flex justify-between items-center">
          <button
            onClick={onClose}
            className="text-white text-base font-normal"
          >
            Cancelar
          </button>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => adjustCircleSize(-10)}
              className="text-white text-2xl font-normal px-3"
            >
              -
            </button>
            <h1 className="text-white text-base font-normal">
              Mover e ajustar
            </h1>
            <button
              onClick={() => adjustCircleSize(10)}
              className="text-white text-2xl font-normal px-3"
            >
              +
            </button>
          </div>
          <button
            onClick={handleSave}
            className="text-base font-normal text-[#7C3AED]"
          >
            Escolher
          </button>
        </div>

        {/* Image Container */}
        <div 
          ref={containerRef}
          className="flex-1 relative overflow-hidden touch-none select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ WebkitUserSelect: 'none' }}
        >
          {/* Imagem fixa centralizada */}
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Prévia da foto de perfil"
            className="h-full w-auto absolute left-1/2 transform -translate-x-1/2"
            draggable={false}
          />

          {/* Overlay escuro */}
          <div className="absolute inset-0 bg-black bg-opacity-50">
            {/* Círculo móvel e redimensionável */}
            <div
              ref={circleRef}
              className="absolute"
              style={{
                width: circleSize,
                height: circleSize,
                transform: `translate3d(${circlePosition.x}px, ${circlePosition.y}px, 0)`,
                willChange: 'transform',
                transition: 'width 0.1s, height 0.1s'
              }}
            >
              <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
                <div className="w-full h-full bg-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
