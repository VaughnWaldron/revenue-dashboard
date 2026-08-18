import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface FieldShellProps {
  label: string;
  hint?: string;
  overridden?: boolean;
  children: ReactNode;
  className?: string;
}

export function FieldShell({ label, hint, overridden, children, className }: FieldShellProps) {
  return (
    <label className={cn('flex flex-col gap-1', className)}>
      <span className="flex items-center gap-1.5 text-[11.5px] font-medium text-ink-soft">
        {label}
        {overridden && (
          <span className="rounded-full bg-warning-tint px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-warning">
            Override
          </span>
        )}
      </span>
      {children}
      {hint && <span className="text-[11.5px] text-ink-muted">{hint}</span>}
    </label>
  );
}

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  hint?: string;
  overridden?: boolean;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
}

export function TextField({ label, hint, overridden, onChange, prefix, suffix, className, ...rest }: TextFieldProps) {
  return (
    <FieldShell label={label} hint={hint} overridden={overridden}>
      <div className="flex items-center rounded-lg border border-line bg-surface-raised px-2.5 focus-within:border-navy/40 focus-within:ring-2 focus-within:ring-navy/10">
        {prefix && <span className="text-[13px] text-ink-muted">{prefix}</span>}
        <input
          className={cn(
            'w-full min-w-0 bg-transparent px-1.5 py-2 text-[13.5px] text-ink outline-none placeholder:text-ink-muted/70',
            className,
          )}
          onChange={(e) => onChange(e.target.value)}
          {...rest}
        />
        {suffix && <span className="text-[13px] text-ink-muted">{suffix}</span>}
      </div>
    </FieldShell>
  );
}

interface NumberFieldProps {
  label: string;
  hint?: string;
  overridden?: boolean;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  step?: number;
  className?: string;
}

export function NumberField({ label, hint, overridden, value, onChange, prefix, suffix, min = 0, step = 1, className }: NumberFieldProps) {
  return (
    <FieldShell label={label} hint={hint} overridden={overridden} className={className}>
      <div className="flex items-center rounded-lg border border-line bg-surface-raised px-2.5 focus-within:border-navy/40 focus-within:ring-2 focus-within:ring-navy/10">
        {prefix && <span className="text-[13px] text-ink-muted">{prefix}</span>}
        <input
          type="number"
          className="w-full min-w-0 bg-transparent px-1.5 py-2 text-[13.5px] tabular-nums text-ink outline-none"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          step={step}
          onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
        />
        {suffix && <span className="text-[13px] text-ink-muted">{suffix}</span>}
      </div>
    </FieldShell>
  );
}

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label: string;
  hint?: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}

export function SelectField({ label, hint, options, onChange, className, ...rest }: SelectFieldProps) {
  return (
    <FieldShell label={label} hint={hint}>
      <select
        className={cn(
          'rounded-lg border border-line bg-surface-raised px-2.5 py-2 text-[13.5px] text-ink outline-none focus:border-navy/40 focus:ring-2 focus:ring-navy/10',
          className,
        )}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
