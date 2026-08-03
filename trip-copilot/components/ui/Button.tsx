'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-sea text-white hover:bg-sea/90 active:bg-sea/80 shadow-card',
  secondary: 'bg-raised text-ink border border-line hover:bg-raised/70',
  ghost: 'bg-transparent text-ink hover:bg-raised/60',
  danger: 'bg-danger text-white hover:bg-danger/90',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm rounded-pill',
  md: 'h-12 px-4 text-[15px] rounded-2xl',
  lg: 'h-16 px-5 text-lg rounded-2xl font-semibold',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  full?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  full,
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none ${VARIANTS[variant]} ${SIZES[size]} ${full ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
