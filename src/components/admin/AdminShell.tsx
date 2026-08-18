import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function AdminShell({ children, onLogout }: { children: ReactNode; onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-surface">
      <div className="sticky top-0 z-10 border-b border-line bg-surface-raised/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-4 py-3 sm:px-8">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy font-display text-[13px] font-bold text-white">
              R
            </div>
            <div>
              <div className="font-display text-[13.5px] font-semibold leading-none text-ink">Revenue Reports</div>
              <div className="text-[11px] leading-none text-ink-muted">Admin</div>
            </div>
          </Link>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            Sign Out
          </Button>
        </div>
      </div>
      <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-8">{children}</div>
    </div>
  );
}
