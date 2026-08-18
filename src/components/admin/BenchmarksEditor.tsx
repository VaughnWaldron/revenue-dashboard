import type { Benchmarks } from '@/lib/types';
import { Card, SectionHeading } from '@/components/ui/Card';
import { NumberField } from '@/components/ui/Field';

export function BenchmarksEditor({ benchmarks, onChange }: { benchmarks: Benchmarks; onChange: (patch: Partial<Benchmarks>) => void }) {
  return (
    <Card className="print-avoid-break">
      <SectionHeading title="Benchmarks" subtitle="Targets compared against actual performance — fully configurable, never hard-coded" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <NumberField label="Monthly Closes Target" value={benchmarks.monthlyCloses} onChange={(monthlyCloses) => onChange({ monthlyCloses })} />
        <NumberField
          label="Show Rate Target"
          suffix="%"
          value={Math.round(benchmarks.showRate * 1000) / 10}
          onChange={(v) => onChange({ showRate: v / 100 })}
          step={0.5}
        />
        <NumberField
          label="Close Rate Target"
          suffix="%"
          value={Math.round(benchmarks.closeRate * 1000) / 10}
          onChange={(v) => onChange({ closeRate: v / 100 })}
          step={0.5}
        />
        <NumberField label="Cash per Show Target" prefix="$" value={benchmarks.cashPerShow} onChange={(cashPerShow) => onChange({ cashPerShow })} />
      </div>
    </Card>
  );
}
