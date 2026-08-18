import type { Rep } from '@/lib/types';
import { Card, SectionHeading } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

function makeRep(): Rep {
  return {
    id: `rep-${Math.random().toString(36).slice(2, 9)}`,
    name: '',
    newCash: 0,
    installmentCash: 0,
    calls: 0,
    shows: 0,
    closes: 0,
  };
}

const NUMERIC_FIELDS: { key: keyof Rep; label: string }[] = [
  { key: 'newCash', label: 'New Cash' },
  { key: 'installmentCash', label: 'Installments' },
  { key: 'calls', label: 'Calls' },
  { key: 'shows', label: 'Shows' },
  { key: 'closes', label: 'Closes' },
];

export function RepsEditor({ reps, onChange }: { reps: Rep[]; onChange: (reps: Rep[]) => void }) {
  const update = (id: string, patch: Partial<Rep>) => {
    onChange(reps.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const remove = (id: string) => onChange(reps.filter((r) => r.id !== id));

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= reps.length) return;
    const next = [...reps];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <Card className="print-avoid-break" padded={false}>
      <div className="flex items-center justify-between p-5 pb-0 sm:p-6 sm:pb-0">
        <SectionHeading title="Representatives" subtitle="Add, reorder, and edit rep performance" />
        <Button size="sm" variant="secondary" onClick={() => onChange([...reps, makeRep()])} className="mb-5">
          + Add Rep
        </Button>
      </div>

      {reps.length === 0 ? (
        <div className="mx-5 mb-5 rounded-lg border border-dashed border-line py-8 text-center text-[13px] text-ink-muted sm:mx-6">
          No reps added yet.
        </div>
      ) : (
        <div className="overflow-x-auto pb-2">
          <table className="w-full min-w-[720px] border-collapse text-[13px]">
            <thead>
              <tr className="border-y border-line-soft text-left text-[12px] font-medium text-ink-muted">
                <th className="w-16 py-2.5 pl-5 sm:pl-6" />
                <th className="py-2.5">Name</th>
                {NUMERIC_FIELDS.map((f) => (
                  <th key={f.key} className="py-2.5 text-right">{f.label}</th>
                ))}
                <th className="w-10 py-2.5 pr-5 sm:pr-6" />
              </tr>
            </thead>
            <tbody>
              {reps.map((rep, i) => (
                <tr key={rep.id} className="border-b border-line-soft last:border-0">
                  <td className="py-2 pl-5 sm:pl-6">
                    <div className="flex gap-0.5">
                      <button onClick={() => move(i, -1)} disabled={i === 0} className="text-ink-muted hover:text-ink disabled:opacity-30">
                        ↑
                      </button>
                      <button onClick={() => move(i, 1)} disabled={i === reps.length - 1} className="text-ink-muted hover:text-ink disabled:opacity-30">
                        ↓
                      </button>
                    </div>
                  </td>
                  <td className="py-2">
                    <input
                      value={rep.name}
                      onChange={(e) => update(rep.id, { name: e.target.value })}
                      placeholder="Rep name"
                      className="w-full min-w-[120px] rounded-md border border-line bg-surface-raised px-2 py-1.5 text-[13px] outline-none focus:border-navy/40"
                    />
                  </td>
                  {NUMERIC_FIELDS.map((f) => (
                    <td key={f.key} className="py-2 text-right">
                      <input
                        type="number"
                        value={rep[f.key] as number}
                        onChange={(e) => update(rep.id, { [f.key]: Number(e.target.value) || 0 })}
                        className="w-20 rounded-md border border-line bg-surface-raised px-2 py-1.5 text-right text-[13px] tabular-nums outline-none focus:border-navy/40"
                      />
                    </td>
                  ))}
                  <td className="py-2 pr-5 text-right sm:pr-6">
                    <button onClick={() => remove(rep.id)} className="text-ink-muted hover:text-negative">
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
