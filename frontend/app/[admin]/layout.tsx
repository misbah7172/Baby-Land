import { redirect } from 'next/navigation';
import { AdminGate } from '../../components/admin-gate';

type AdminLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ admin: string }>;
};

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { admin } = await params;
  const expectedPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '458901';

  if (admin !== expectedPath) {
    redirect('/');
  }

  return (
    <AdminGate
      expectedEmail={process.env.NEXT_PUBLIC_ADMIN_EMAIL || ''}
      expectedPassword={process.env.NEXT_PUBLIC_ADMIN_PASSWORD_HASH || ''}
    >
      {children}
    </AdminGate>
  );
}
