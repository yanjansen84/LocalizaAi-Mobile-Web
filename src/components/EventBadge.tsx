interface EventBadgeProps {
  isFree: boolean;
  price?: number;
  className?: string;
}

export function EventBadge({ isFree, price = 150, className = '' }: EventBadgeProps) {
  const badgeText = isFree ? 'Grátis' : `R$ ${price.toFixed(2)}`;
  const badgeColor = isFree ? 'bg-green-500' : 'bg-purple-600';
  const ariaLabel = isFree ? 'Evento gratuito' : `Preço do evento: R$ ${price.toFixed(2)}`;

  return (
    <span 
      className={`px-2 py-1 ${badgeColor} text-white text-xs rounded-full ${className}`}
      role="status"
      aria-label={ariaLabel}
    >
      {badgeText}
    </span>
  );
}
