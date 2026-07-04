'use client';

interface NumpadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  submitDisabled: boolean;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'];

export function Numpad({ onDigit, onBackspace, onSubmit, submitDisabled }: NumpadProps) {
  const press = (key: string) => {
    if (key === '⌫') onBackspace();
    else if (key === '✓') onSubmit();
    else onDigit(key);
  };

  return (
    <div className="grid grid-cols-3 gap-2 p-4 pb-[max(env(safe-area-inset-bottom),16px)]">
      {KEYS.map((key) => {
        const isSubmit = key === '✓';
        const isBackspace = key === '⌫';
        return (
          <button
            key={key}
            type="button"
            aria-label={isSubmit ? 'Submit answer' : isBackspace ? 'Backspace' : `Digit ${key}`}
            disabled={isSubmit && submitDisabled}
            onClick={() => press(key)}
            className="min-h-[56px] rounded-xl text-2xl font-bold active:scale-95 transition-transform disabled:opacity-40"
            style={{
              fontFamily: 'var(--font-display)',
              backgroundColor: isSubmit ? 'var(--pink-300)' : isBackspace ? 'var(--bg-surface)' : 'var(--bg-card)',
              color: isSubmit ? 'var(--text-on-pink)' : 'var(--text-primary)',
              boxShadow: isSubmit ? 'var(--shadow-btn-primary)' : 'var(--shadow-sm)',
            }}
          >
            {key}
          </button>
        );
      })}
    </div>
  );
}
