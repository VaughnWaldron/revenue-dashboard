import type { DailyDataPoint } from '@/lib/types';
import { Card, SectionHeading } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const FIELDS: { key: keyof DailyDataPoint; label: string }[] = [
  { key: 'bookedCalls', label: 'Booked' },
  { key: 'conductedCalls', label: 'Conducted' },
  { key: 'closes', label: 'Closes' },
  { key: 'newCash', label: 'New Cash' },
];

function nextDay(data: DailyDataPoint[]): number {
  return data.length === 0 ? 1 : Math.max(...data.map((d) => d.day)) + 1;
}

export function DailyDataEditor({ dailyData, onChange }: { dailyData: DailyDataPoint[]; onChange: (data: DailyDataPoint[]) => void }) {
  const update = (day: number, patch: Partial<DailyDataPoint>) => {
    onChange(dailyData.map((d) => (d.day === day ? { ...d, ...patch } : d)));
  };

  const remove = (day: number) => onChange(dailyData.filter((d) => d.day !== day));

  const add = () => {
    onChange([...dailyData, { day: nextDay(dailyData), bookedCalls: 0, conductedCalls: 0, closes: 0, newCash: 0 }]);
  };

  const sorted = [...dailyData].sort((a, b) => a.day - b.day);
  const totals = sorted.reduce(
    (acc, d) => ({
      bookedCalls: acc.bookedCalls + d.bookedCalls,
      conductedCalls: acc.conductedCalls + d.conductedCalls,
      closes: acc.closes + d.closes,
      newCash: acc.newCash + d.newCash,
    }),
    { bookedCalls: 0, conductedCalls: 0, closes: 0, newCash: 0 },
  );

  return (
    <Card className="print-avoid-break" padded={false}>
      <div className="flex items-center justify-between p-5 pb-0 sm:p-6 sm:pb-0">
        <SectionHeading title="Daily Chart Data" subtitle="Feeds the daily-closes, new-cash, and cumulative charts" />
        <Button size="sm" variant="secondary" onClick={add} className="mb-5">
          + Add Day
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="mx-5 mb-5 rounded-lg border border-dashed border-line py-8 text-center text-[13px] text-ink-muted sm:mx-6">
          No daily data added yet.
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto overflow-x-auto pb-2">
          <table className="w-full min-w-[500px] border-collapse text-[13px]">
            <thead className="sticky top-0 bg-surface-raised">
              <tr className="border-y border-line-soft text-left text-[12px] font-medium text-ink-muted">
                <th className="py-2.5 pl-5 sm:pl-6">Day</th>
                {FIELDS.map((f) => (
                  <th key={f.key} className="py-2.5 text-right">{f.label}</th>
                ))}
                <th className="w-10 py-2.5 pr-5 sm:pr-6" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((d) => (
                <tr key={d.day} className="border-b border-line-soft last:border-0">
                  <td className="py-2 pl-5 font-medium text-ink-soft sm:pl-6">{d.day}</td>
                  {FIELDS.map((f) => (
                    <td key={f.key} className="py-2 text-right">
                      <input
                        type="number"
                        value={d[f.key] as number}
                        onChange={(e) => update(d.day, { [f.key]: Number(e.target.value) || 0 })}
                        className="w-20 rounded-md border border-line bg-surface-raised px-2 py-1.5 text-right text-[13px] tabular-nums outline-none focus:border-navy/40"
                      />
                    </td>
                  ))}
                  <td className="py-2 pr-5 text-right sm:pr-6">
                    <button onClick={() => remove(d.day)} className="text-ink-muted hover:text-negative">
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-line-soft text-[12px] font-semibold text-ink">
                <td className="py-2 pl-5 sm:pl-6">Total</td>
                <td className="py-2 text-right tabular-nums">{totals.bookedCalls}</td>
                <td className="py-2 text-right tabular-nums">{totals.conductedCalls}</td>
                <td className="py-2 text-right tabular-nums">{totals.closes}</td>
                <td className="py-2 text-right tabular-nums">${totals.newCash.toLocaleString()}</td>
                <td className="pr-5 sm:pr-6" />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </Card>
  );
}
