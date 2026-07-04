'use client';

interface TextFieldProps {
  label: string;
  type?: 'text' | 'email' | 'password';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
}

export function TextField({ label, type = 'text', value, onChange, placeholder, autoComplete }: TextFieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-label" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="min-h-[56px] rounded-xl px-4 outline-none focus:ring-2"
        style={{
          backgroundColor: 'var(--bg-card)',
          boxShadow: 'var(--shadow-sm)',
          border: '2px solid var(--pink-200)',
          color: 'var(--text-primary)',
        }}
      />
    </label>
  );
}
