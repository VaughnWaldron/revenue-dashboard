import type { DailyDataPoint, ReportInputs } from '@/lib/types';
import { Card, SectionHeading } from '@/components/ui/Card';
import { CallsTrendChart, CumulativeCashChart, DailyClosesChart, DailyNewCashChart } from './charts';

export function PerformanceCharts({
  dailyData,
  inputs,
  totalCash,
}: {
  dailyData: DailyDataPoint[];
  inputs: ReportInputs;
  totalCash: number;
}) {
  if (dailyData.length === 0) return null;
  const hasCallData = dailyData.some((d) => d.bookedCalls > 0 || d.conductedCalls > 0);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="print-avoid-break">
        <SectionHeading title="Daily Closes" subtitle={`${inputs.currentDay}-day trend`} />
        <DailyClosesChart data={dailyData} />
      </Card>
      <Card className="print-avoid-break">
        <SectionHeading title="Daily New Cash" subtitle={`${inputs.currentDay}-day trend`} />
        <DailyNewCashChart data={dailyData} />
      </Card>
      <Card className="print-avoid-break lg:col-span-2">
        <SectionHeading title="Cumulative Cash vs. Goal Pace" subtitle="Solid line: cash collected · Dashed line: straight-line goal pace" />
        <CumulativeCashChart data={dailyData} inputs={inputs} totalCash={totalCash} />
      </Card>
      {hasCallData && (
        <Card className="print-avoid-break lg:col-span-2">
          <SectionHeading title="Booked vs. Conducted Calls" subtitle="Daily call volume trend" />
          <CallsTrendChart data={dailyData} />
        </Card>
      )}
    </div>
  );
}
