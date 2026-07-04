'use client';

interface StarProgressBarProps {
  score: number;
  star1: number;
  star2: number;
  star3: number;
}

export function StarProgressBar({ score, star1, star2, star3 }: StarProgressBarProps) {
  const max = star3;
  const pct = Math.min((score / max) * 100, 100);
  const markers = [star1, star2, star3];

  return (
    <div className="px-4 py-2">
      <div className="relative">
        {/* Stars above markers */}
        <div className="relative h-6">
          {markers.map((threshold, i) => (
            <span
              key={i}
              className={score >= threshold ? 'animate-star-earn' : ''}
              style={{
                position: 'absolute',
                left: `${(threshold / max) * 100}%`,
                transform: 'translateX(-50%)',
                filter: score >= threshold ? 'none' : 'grayscale(1) opacity(0.4)',
              }}
            >
              ⭐
            </span>
          ))}
        </div>
        {/* Track */}
        <div className="h-[10px] rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${pct}%`, backgroundColor: 'var(--pink-300)' }}
          />
        </div>
        {/* Numbers below */}
        <div className="relative h-4 mt-1">
          {markers.map((threshold, i) => (
            <span
              key={i}
              className="text-[0.7rem]"
              style={{
                position: 'absolute',
                left: `${(threshold / max) * 100}%`,
                transform: 'translateX(-50%)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-tertiary)',
              }}
            >
              {threshold}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
