export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className="no-print fixed left-0 top-0 z-40 flex h-screen w-64 flex-col"
        style={{ background: 'linear-gradient(180deg, #0A1628 0%, #0F2B5B 100%)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
            style={{
              background: 'linear-gradient(135deg, #1E88E5, #0F2B5B)',
              border: '1.5px solid rgba(255,255,255,0.2)',
            }}
          >
            🚛
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white">FreightFlow</h1>
            <span className="text-[10px] font-semibold tracking-widest text-white/40">PRO</span>
          </div>
        </div>

        {/* Navigation — placeholder, will build out in Phase 1 */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-white/30">
            Main Menu
          </p>
          <div className="mt-3 space-y-1">
            {[
              { label: 'Dashboard', href: '/dashboard', icon: '📊' },
              { label: 'Orders (LR)', href: '/dashboard/orders', icon: '📦' },
              { label: 'Pallets', href: '/dashboard/pallets', icon: '📋' },
              { label: 'Trips', href: '/dashboard/trips', icon: '🚛' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </a>
            ))}
          </div>

          <p className="mt-6 px-3 text-[10px] font-bold uppercase tracking-widest text-white/30">
            Masters
          </p>
          <div className="mt-3 space-y-1">
            {[
              { label: 'Dealers', href: '/dashboard/masters/dealers', icon: '🏢' },
              { label: 'Consignees', href: '/dashboard/masters/consignees', icon: '📍' },
              { label: 'Vehicles', href: '/dashboard/masters/vehicles', icon: '🚚' },
              { label: 'Labour', href: '/dashboard/masters/labour', icon: '👷' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        {/* User section */}
        <div className="border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-600 text-sm font-bold text-white">
              A
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Admin User</p>
              <p className="text-xs text-white/40">Company Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1">
        {/* Top bar */}
        <header className="no-print sticky top-0 z-30 flex h-16 items-center justify-between border-b border-neutral-200 bg-white/80 px-8 backdrop-blur-sm">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Dashboard</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-500 transition-colors hover:bg-neutral-50">
              🔔 Notifications
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
