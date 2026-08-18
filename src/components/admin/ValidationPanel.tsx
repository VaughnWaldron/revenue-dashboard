import type { ValidationWarning } from '@/lib/calculations';

export function ValidationPanel({ warnings }: { warnings: ValidationWarning[] }) {
  if (warnings.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-positive/20 bg-positive-tint px-4 py-3 text-[13px] font-medium text-positive">
        <span>✓</span> All figures reconcile — no inconsistencies detected.
      </div>
    );
  }

  const errors = warnings.filter((w) => w.severity === 'error');
  const soft = warnings.filter((w) => w.severity === 'warning');

  return (
    <div className="rounded-lg border border-warning/25 bg-warning-tint px-4 py-3">
      <div className="mb-2 text-[13px] font-semibold text-warning">
        {errors.length > 0 ? `${errors.length} issue${errors.length === 1 ? '' : 's'} need attention` : 'Data consistency warnings'}
      </div>
      <ul className="space-y-1">
        {[...errors, ...soft].map((w, i) => (
          <li key={i} className="flex items-start gap-1.5 text-[12.5px] text-ink-soft">
            <span className={w.severity === 'error' ? 'text-negative' : 'text-warning'}>&bull;</span>
            {w.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
