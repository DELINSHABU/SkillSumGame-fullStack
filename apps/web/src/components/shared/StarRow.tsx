import type { StarCount } from '@skillsum/shared';
import { cn } from '@/lib/utils';

interface StarRowProps {
  stars: StarCount;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const SIZES = { sm: 'text-sm', md: 'text-2xl', lg: 'text-5xl' };

export function StarRow({ stars, size = 'md', animated = false }: StarRowProps) {
  return (
    <div className="flex gap-1 justify-center" aria-label={`${stars} of 3 stars`}>
      {[1, 2, 3].map((slot) => (
        <span
          key={slot}
          className={cn(SIZES[size], animated && slot <= stars && 'animate-star-earn')}
          style={{
            animationDelay: animated ? `${slot * 0.3}s` : undefined,
            filter: slot <= stars ? 'none' : 'grayscale(1) opacity(0.4)',
          }}
        >
          ⭐
        </span>
      ))}
    </div>
  );
}
