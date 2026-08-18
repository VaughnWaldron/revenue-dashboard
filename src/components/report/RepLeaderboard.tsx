import type { Rep } from '@/lib/types';
import { Card, SectionHeading } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatPercent } from '@/lib/format';
import { safeDiv } from '@/lib/calculations';
import { cn } from '@/lib/cn';

export function RepLeaderboard({ reps }: { reps: Rep[] }) {
  const ranked = [...reps]
    .map((r) => ({ ...r, totalCash: r.newCash + r.installmentCash }))
    .sort((a, b) => b.totalCash - a.totalCash);

  if (ranked.length === 0) {
    return (
      <Card className="print-avoid-break">
        <SectionHeading title="Rep Leaderboard" subtitle="Individual contribution to total cash" />
        <div className="rounded-lg border border-dashed border-line py-8 text-center text-[13px] text-ink-muted">
          No reps added for this report.
        </div>
      </Card>
    );
  }

  return (
    <Card className="print-avoid-break" padded={false}>
      <div className="p-5 pb-0 sm:p-6 sm:pb-0">
        <SectionHeading title="Rep Leaderboard" subtitle="Individual contribution to total cash" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-[13px]">
          <thead>
            <tr className="border-y border-line-soft text-left text-[12px] font-medium text-ink-muted">
              <th className="py-2.5 pl-5 sm:pl-6">Rep</th>
              <th className="py-2.5 text-right">New Cash</th>
              <th className="py-2.5 text-right">Installments</th>
              <th className="py-2.5 text-right">Total Cash</th>
              <th className="py-2.5 text-right">Calls</th>
              <th className="py-2.5 text-right">Shows</th>
              <th className="py-2.5 text-right">Closes</th>
              <th className="py-2.5 text-right">Show %</th>
              <th className="py-2.5 pr-5 text-right sm:pr-6">Close %</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((rep, i) => (
              <tr key={rep.id} className={cn('border-b border-line-soft last:border-0', i === 0 && 'bg-navy-tint/40')}>
                <td className="py-3 pl-5 sm:pl-6">
                  <div className="flex items-center gap-2">
                    <span className="w-4 text-[11px] font-semibold tabular-nums text-ink-muted">#{i + 1}</span>
                    <span className="font-medium text-ink">{rep.name}</span>
                    {i === 0 && <Badge tone="positive">Top</Badge>}
                  </div>
                </td>
                <td className="py-3 text-right tabular-nums text-ink-soft">{formatCurrency(rep.newCash)}</td>
                <td className="py-3 text-right tabular-nums text-ink-soft">{formatCurrency(rep.installmentCash)}</td>
                <td className="py-3 text-right tabular-nums font-semibold text-ink">{formatCurrency(rep.totalCash)}</td>
                <td className="py-3 text-right tabular-nums text-ink-soft">{rep.calls}</td>
                <td className="py-3 text-right tabular-nums text-ink-soft">{rep.shows}</td>
                <td className="py-3 text-right tabular-nums text-ink-soft">{rep.closes}</td>
                <td className="py-3 text-right tabular-nums text-ink-soft">{formatPercent(safeDiv(rep.shows, rep.calls))}</td>
                <td className="py-3 pr-5 text-right tabular-nums text-ink-soft sm:pr-6">{formatPercent(safeDiv(rep.closes, rep.shows))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
