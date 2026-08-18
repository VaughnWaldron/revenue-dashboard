export function LiveIndicator() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-soft">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full rounded-full bg-positive animate-live-pulse" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-positive" />
      </span>
      Live
    </span>
  );
}
