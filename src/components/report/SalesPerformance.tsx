import type { ReportInputs } from '@/lib/types';
import type { DerivedMetrics } from '@/lib/calculations';
import { Card, SectionHeading } from '@/components/ui/Card';
import { MetricTile } from '@/components/ui/MetricTile';

export function SalesPerformance({ inputs, metrics, animate }: { inputs: ReportInputs; metrics: DerivedMetrics; animate: boolean }) {
  return (
    <Card className="print-avoid-break">
      <SectionHeading title="Sales Performance" subtitle="Call volume, show behavior, and conversion" />
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
        <MetricTile label="Booked Calls" value={inputs.totalBookedCalls} format="number" animate={animate} />
        <MetricTile label="Conducted Calls" value={inputs.conductedCalls} format="number" animate={animate} />
        <MetricTile label="Show-ups" value={inputs.showUps} format="number" animate={animate} />
        <MetricTile label="No-shows" value={metrics.noShows} format="number" animate={animate} />
        <MetricTile label="Show Rate" value={metrics.showRate} format="percent" animate={animate} />
        <MetricTile label="Total Closes" value={inputs.totalCloses} format="number" animate={animate} />
        <MetricTile label="Close Rate" value={metrics.closeRate} format="percent" animate={animate} />
        <MetricTile label="Cash per Show" value={metrics.cashPerShow} format="currency" animate={animate} />
        <MetricTile label="Calls per Close" value={metrics.callsPerClose} format="number" formatDigits={1} animate={animate} />
      </div>
    </Card>
  );
}
