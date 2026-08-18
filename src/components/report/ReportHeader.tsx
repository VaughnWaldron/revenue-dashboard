import type { ReportRecord } from '@/lib/types';
import { DATA_STATUS_LABEL } from '@/lib/types';
import { LiveIndicator } from '@/components/ui/LiveIndicator';

function formatUpdated(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export function ReportHeader({ report, showLive = true }: { report: ReportRecord; showLive?: boolean }) {
  return (
    <header className="print-avoid-break flex flex-col gap-5 border-b border-line pb-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-4">
        {report.logoUrl ? (
          <img
            src={report.logoUrl}
            alt={`${report.agencyName} logo`}
            className="h-11 w-11 shrink-0 rounded-lg border border-line object-cover"
          />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-navy-tint font-display text-[15px] font-bold text-navy">
            {report.agencyName.slice(0, 1) || '·'}
          </div>
        )}
        <div>
          <div className="text-[13px] text-ink-muted">{report.agencyName || 'Agency'}</div>
          <h1 className="font-display text-[26px] font-bold tracking-[-0.01em] text-ink sm:text-[30px]">
            {report.clientName || 'Client Report'}
          </h1>
          <div className="mt-1 text-[13px] text-ink-soft">
            {report.month} {report.year}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start gap-1.5 sm:items-end">
        {showLive && report.status === 'published' && <LiveIndicator />}
        <div className="text-[12.5px] text-ink-soft">
          Confidential Performance Report <span className="text-ink-muted">&middot; {DATA_STATUS_LABEL[report.dataStatus]}</span>
        </div>
        {report.updatedAt && (
          <div className="text-[12.5px] text-ink-muted">Last updated {formatUpdated(report.updatedAt)}</div>
        )}
      </div>
    </header>
  );
}
