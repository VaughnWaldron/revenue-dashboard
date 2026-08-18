import { Navigate, Route, Routes } from 'react-router-dom';
import { ReportView } from '@/routes/ReportView';
import { AdminApp } from '@/routes/AdminApp';
import { ReportShell } from '@/components/report/ReportShell';
import { DEMO_REPORT } from '@/lib/demoData';

// Static, backend-free render of the demo report — useful for design review
// with plain `vite dev` when the Netlify Functions runtime isn't running.
function DemoPreview() {
  return <ReportShell report={DEMO_REPORT} animate />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/report/:slug" element={<ReportView />} />
      <Route path="/preview-demo" element={<DemoPreview />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
