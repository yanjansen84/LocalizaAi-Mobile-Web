interface EventBadgeProps {
  isFree: boolean;
  price?: number;
  className?: string;
}

export function EventBadge({ isFree, price = 150, className = '' }: EventBadgeProps) {
  if (isFree) {
    return (
      <span className={`px-2 py-1 bg-green-500 text-white text-xs rounded-full ${className}`}>
        Grátis
      </span>
    );
  }

  return (
    <span className={`px-2 py-1 bg-purple-600 text-white text-xs rounded-full ${className}`}>
      R$ {price.toFixed(2)}
    </span>
  );
}
