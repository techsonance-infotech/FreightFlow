export default function DashboardPage() {
  const kpiCards = [
    { label: "Today's LRs", value: '0', sub: 'No LRs yet', color: '#1565C0', bg: '#E3F2FD', icon: '📦' },
    { label: 'Outstanding', value: '₹0', sub: '0 invoices', color: '#C62828', bg: '#FFEBEE', icon: '🧾' },
    { label: 'Vehicles On Trip', value: '0/0', sub: '0 idle', color: '#2E7D32', bg: '#E8F5E9', icon: '🚛' },
    { label: 'Docs Expiring', value: '0', sub: 'within 30 days', color: '#E65100', bg: '#FFF3E0', icon: '⚠️' },
  ];

  return (
    <div>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            style={{ borderLeft: `4px solid ${card.color}`, border: `1px solid ${card.bg}`, borderLeftWidth: '4px', borderLeftColor: card.color }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  {card.label}
                </p>
                <p className="mt-1 text-3xl font-black" style={{ color: card.color }}>
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-neutral-400">{card.sub}</p>
              </div>
              <span
                className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                style={{ background: card.bg }}
              >
                {card.icon}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Today's LRs placeholder */}
      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-neutral-900">Today&apos;s Lorry Receipts</h3>
          <a
            href="/dashboard/orders"
            className="text-xs font-semibold text-accent-600 hover:underline"
          >
            View All Orders →
          </a>
        </div>
        <div className="mt-4 flex items-center justify-center rounded-lg border border-dashed border-neutral-200 py-16">
          <div className="text-center">
            <p className="text-4xl">📦</p>
            <p className="mt-3 text-sm font-medium text-neutral-400">No LRs created today</p>
            <a
              href="/dashboard/orders"
              className="mt-3 inline-block rounded-lg px-4 py-2 text-sm font-bold text-white"
              style={{ background: '#1565C0' }}
            >
              Create First LR
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
