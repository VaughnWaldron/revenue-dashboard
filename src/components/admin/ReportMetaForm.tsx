import type { DataStatus, ReportRecord } from '@/lib/types';
import { DATA_STATUS_LABEL, MONTH_NAMES } from '@/lib/types';
import { Card, SectionHeading } from '@/components/ui/Card';
import { TextField, SelectField, NumberField } from '@/components/ui/Field';
import { LogoUploader } from './LogoUploader';

const DATA_STATUS_OPTIONS: { label: string; value: DataStatus }[] = [
  { value: 'verified', label: DATA_STATUS_LABEL.verified },
  { value: 'case_study', label: DATA_STATUS_LABEL.case_study },
  { value: 'modeled', label: DATA_STATUS_LABEL.modeled },
];

const MONTH_OPTIONS = MONTH_NAMES.map((m) => ({ label: m, value: m }));

export function ReportMetaForm({
  report,
  onChange,
}: {
  report: ReportRecord;
  onChange: (patch: Partial<ReportRecord>) => void;
}) {
  return (
    <Card className="print-avoid-break">
      <SectionHeading title="Report Details" subtitle="Header identity and data classification" />

      <div className="mb-5">
        <LogoUploader logoUrl={report.logoUrl} onChange={(logoUrl) => onChange({ logoUrl })} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Agency Name" value={report.agencyName} onChange={(agencyName) => onChange({ agencyName })} placeholder="Northbeam Media Group" />
        <TextField label="Client / Case Study Name" value={report.clientName} onChange={(clientName) => onChange({ clientName })} placeholder="Elevate Coaching Collective" />
        <SelectField label="Month" options={MONTH_OPTIONS} value={report.month} onChange={(month) => onChange({ month })} />
        <NumberField label="Year" value={report.year} onChange={(year) => onChange({ year })} min={2020} step={1} />
        <SelectField
          label="Data Status"
          hint="Shown as a restrained label on the report — never dominant."
          options={DATA_STATUS_OPTIONS}
          value={report.dataStatus}
          onChange={(dataStatus) => onChange({ dataStatus: dataStatus as DataStatus })}
          className="sm:col-span-2"
        />
        <TextField
          label="Report URL Slug"
          value={report.slug}
          onChange={(slug) => onChange({ slug })}
          placeholder="client-name-march-2026"
          hint="Used at /report/:slug — lowercase, hyphenated."
          className="sm:col-span-2"
        />
      </div>
    </Card>
  );
}
