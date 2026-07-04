'use client';

import { cn } from '@/lib/utils';

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'success' | 'info' | 'ghost';
  fullWidth?: boolean;
  type?: 'button' | 'submit';
  className?: string;
}

const VARIANT_STYLES: Record<string, React.CSSProperties> = {
  primary: { backgroundColor: 'var(--pink-300)', boxShadow: 'var(--shadow-btn-primary)', color: 'var(--text-on-pink)' },
  success: { backgroundColor: 'var(--correct)', boxShadow: 'var(--shadow-btn-success)', color: 'var(--text-on-pink)' },
  info: { backgroundColor: 'var(--world-6)', boxShadow: 'var(--shadow-btn-info)', color: 'var(--text-on-pink)' },
  ghost: { backgroundColor: 'var(--bg-surface)', boxShadow: 'var(--shadow-sm)', color: 'var(--text-primary)' },
};

export function PrimaryButton({
  children,
  onClick,
  disabled,
  variant = 'primary',
  fullWidth,
  type = 'button',
  className,
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center justify-center gap-2 px-8 min-h-[56px] rounded-xl font-bold text-lg transition-all duration-100 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed',
        fullWidth && 'w-full',
        className
      )}
      style={{ fontFamily: 'var(--font-display)', ...VARIANT_STYLES[variant] }}
    >
      {children}
    </button>
  );
}
