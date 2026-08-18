import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/Button';

export function AdminLogin({ onLogin }: { onLogin: (password: string) => Promise<void> }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onLogin(password);
    } catch {
      setError('Incorrect password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm rounded-xl border border-line bg-surface-raised p-8 shadow-raised">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-navy font-display text-[15px] font-bold text-white">
            R
          </div>
          <h1 className="font-display text-[17px] font-semibold text-ink">Admin Sign-in</h1>
          <p className="mt-1 text-[13px] text-ink-muted">Enter the admin password to manage reports.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="rounded-lg border border-line bg-surface px-3 py-2.5 text-[13.5px] text-ink outline-none focus:border-navy/40 focus:ring-2 focus:ring-navy/10"
          />
          {error && <p className="text-[12.5px] text-negative">{error}</p>}
          <Button type="submit" variant="primary" disabled={submitting || !password} className="mt-1 w-full justify-center">
            {submitting ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}
