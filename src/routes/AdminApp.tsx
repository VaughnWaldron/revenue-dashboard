import { Route, Routes } from 'react-router-dom';
import { useAuth } from '@/lib/useAuth';
import { AdminLogin } from './admin/AdminLogin';
import { AdminShell } from '@/components/admin/AdminShell';
import { ReportList } from './admin/ReportList';
import { ReportEditor } from './admin/ReportEditor';

export function AdminApp() {
  const auth = useAuth();

  if (auth.status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-navy" />
      </div>
    );
  }

  if (auth.status === 'unauthenticated') {
    return <AdminLogin onLogin={auth.login} />;
  }

  return (
    <AdminShell onLogout={auth.logout}>
      <Routes>
        <Route index element={<ReportList />} />
        <Route path="reports/new" element={<ReportEditor mode="create" />} />
        <Route path="reports/:id" element={<ReportEditor mode="edit" />} />
      </Routes>
    </AdminShell>
  );
}
