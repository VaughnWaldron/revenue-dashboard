import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DailyDataPoint, ReportInputs } from '@/lib/types';
import { formatCurrency, formatNumber } from '@/lib/format';
import { safeDiv } from '@/lib/calculations';

const AXIS_STYLE = { fontSize: 11, fill: 'var(--color-ink-muted)' };
const GRID_COLOR = 'var(--color-line-soft)';
const NAVY = '#2454d1';
const EMERALD = '#17845f';
const EMERALD_SOFT_FILL = 'rgba(23,132,95,0.10)';

function ChartTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-surface-raised px-3 py-2 shadow-raised">
      <div className="text-[11px] font-medium text-ink-muted">Day {label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="text-[12.5px] font-semibold text-ink">
          {formatter ? formatter(p.value) : p.value}
        </div>
      ))}
    </div>
  );
}

export function DailyClosesChart({ data }: { data: DailyDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={GRID_COLOR} />
        <XAxis dataKey="day" tick={AXIS_STYLE} axisLine={{ stroke: GRID_COLOR }} tickLine={false} />
        <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<ChartTooltip formatter={(v: number) => `${v} close${v === 1 ? '' : 'es'}`} />} cursor={{ fill: 'var(--color-surface-sunken)' }} />
        <Bar dataKey="closes" fill={NAVY} radius={[3, 3, 0, 0]} maxBarSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DailyNewCashChart({ data }: { data: DailyDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={GRID_COLOR} />
        <XAxis dataKey="day" tick={AXIS_STYLE} axisLine={{ stroke: GRID_COLOR }} tickLine={false} />
        <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v, { compact: true })} />
        <Tooltip content={<ChartTooltip formatter={(v: number) => formatCurrency(v)} />} cursor={{ fill: 'var(--color-surface-sunken)' }} />
        <Bar dataKey="newCash" fill={EMERALD} radius={[3, 3, 0, 0]} maxBarSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CumulativeCashChart({
  data,
  inputs,
  totalCash,
}: {
  data: DailyDataPoint[];
  inputs: ReportInputs;
  totalCash: number;
}) {
  const scale = safeDiv(totalCash, inputs.newCash) || 1;
  let running = 0;
  const series = data.map((d) => {
    running += d.newCash;
    const cumulativeCash = running * scale;
    const goalPace = safeDiv(inputs.monthlyGoal, inputs.daysInMonth) * d.day;
    return { day: d.day, cumulativeCash, goalPace };
  });

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={series} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="cashFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={EMERALD_SOFT_FILL} />
            <stop offset="100%" stopColor="rgba(23,132,95,0)" />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={GRID_COLOR} />
        <XAxis dataKey="day" tick={AXIS_STYLE} axisLine={{ stroke: GRID_COLOR }} tickLine={false} />
        <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v, { compact: true })} />
        <Tooltip
          content={({ active, payload, label }: any) => {
            if (!active || !payload?.length) return null;
            const cash = payload.find((p: any) => p.dataKey === 'cumulativeCash')?.value ?? 0;
            const goal = payload.find((p: any) => p.dataKey === 'goalPace')?.value ?? 0;
            return (
              <div className="rounded-lg border border-line bg-surface-raised px-3 py-2 shadow-raised">
                <div className="text-[11px] font-medium text-ink-muted">Day {label}</div>
                <div className="text-[12.5px] font-semibold text-positive">{formatCurrency(cash)} cash</div>
                <div className="text-[12px] text-ink-muted">{formatCurrency(goal)} goal pace</div>
              </div>
            );
          }}
        />
        <Area type="monotone" dataKey="cumulativeCash" stroke={EMERALD} strokeWidth={2} fill="url(#cashFill)" />
        <Line type="linear" dataKey="goalPace" stroke="var(--color-ink-muted)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CallsTrendChart({ data }: { data: DailyDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={GRID_COLOR} />
        <XAxis dataKey="day" tick={AXIS_STYLE} axisLine={{ stroke: GRID_COLOR }} tickLine={false} />
        <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          content={({ active, payload, label }: any) => {
            if (!active || !payload?.length) return null;
            const booked = payload.find((p: any) => p.dataKey === 'bookedCalls')?.value ?? 0;
            const conducted = payload.find((p: any) => p.dataKey === 'conductedCalls')?.value ?? 0;
            return (
              <div className="rounded-lg border border-line bg-surface-raised px-3 py-2 shadow-raised">
                <div className="text-[11px] font-medium text-ink-muted">Day {label}</div>
                <div className="text-[12.5px] font-semibold text-navy">{formatNumber(booked)} booked</div>
                <div className="text-[12px] text-ink-soft">{formatNumber(conducted)} conducted</div>
              </div>
            );
          }}
        />
        <Line type="monotone" dataKey="bookedCalls" stroke="var(--color-ink-muted)" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="conductedCalls" stroke={NAVY} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
