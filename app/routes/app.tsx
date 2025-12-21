import { Outlet, redirect } from 'react-router';
import { DashboardLayout } from '~/components/layout/DashboardLayout';

export function clientLoader() {
  const token = sessionStorage.getItem('token');
  if (!token) {
    return redirect('/login');
  }
}

export default function AppLayout() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
