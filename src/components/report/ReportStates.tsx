export function ReportLoading() {
  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-4 py-10 sm:px-8">
      <div className="flex items-center gap-4">
        <div className="h-11 w-11 animate-pulse rounded-lg bg-surface-sunken" />
        <div className="flex-1">
          <div className="h-3 w-28 animate-pulse rounded bg-surface-sunken" />
          <div className="mt-2 h-6 w-56 animate-pulse rounded bg-surface-sunken" />
        </div>
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-40 animate-pulse rounded-xl border border-line bg-surface-sunken/60" />
      ))}
    </div>
  );
}

export function ReportError({ message }: { message?: string }) {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-negative-tint text-negative">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5" strokeLinecap="round" />
          <path d="M12 16h.01" strokeLinecap="round" />
        </svg>
      </div>
      <h1 className="font-display text-[17px] font-semibold text-ink">Report unavailable</h1>
      <p className="text-[13.5px] text-ink-muted">
        {message || 'This report link is invalid or is no longer published. Please confirm the link with the report owner.'}
      </p>
    </div>
  );
}
