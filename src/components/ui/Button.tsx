import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-navy text-white hover:bg-navy-soft border border-navy',
  secondary: 'bg-surface-raised text-ink border border-line hover:bg-surface-sunken',
  ghost: 'bg-transparent text-ink-soft hover:bg-surface-sunken border border-transparent',
  danger: 'bg-surface-raised text-negative border border-negative/25 hover:bg-negative-tint',
};

export function Button({ variant = 'secondary', size = 'md', className, ...rest }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' ? 'px-2.5 py-1.5 text-[12.5px]' : 'px-3.5 py-2 text-[13.5px]',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...rest}
    />
  );
}
