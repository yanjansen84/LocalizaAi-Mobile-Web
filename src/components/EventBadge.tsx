import React from 'react';

interface EventBadgeProps {
  isFree: boolean;
  price?: number;
  className?: string;
}

export function EventBadge({ isFree, price, className = '' }: EventBadgeProps) {
  return (
    <div className={`rounded-full px-3 py-1 text-sm font-medium ${isFree ? 'bg-green-500' : 'bg-purple-500'} text-white ${className}`}>
      {isFree ? 'Grátis' : `R$ ${price?.toFixed(2)}`}
    </div>
  );
}
