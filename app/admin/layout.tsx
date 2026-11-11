import AdminNav from './AdminNav'
import { requireAdmin } from './require-admin'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin()

  return (
    <div className="create-shell flex min-h-dvh flex-col bg-[var(--tikkitte-cream)] md:flex-row">
      <AdminNav displayName={user.email ?? 'Administrator'} />
      <main className="min-w-0 flex-1 px-4 py-7 md:px-8 md:py-8 lg:px-10">
        <div className="mx-auto w-full max-w-[1220px]">{children}</div>
      </main>
    </div>
  )
}
