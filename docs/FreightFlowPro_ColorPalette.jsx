export default function ColorPalette() {
  const palette = {
    primary: [
      { name: "Navy 950", hex: "#0A1628", usage: "Sidebar background, deepest backgrounds" },
      { name: "Navy 900", hex: "#0F2B5B", usage: "Primary brand color, headers, logo" },
      { name: "Navy 800", hex: "#1A3A6B", usage: "Sidebar hover, dark UI elements" },
      { name: "Navy 700", hex: "#1E4D8C", usage: "Active nav items, dark buttons" },
    ],
    accent: [
      { name: "Blue 600", hex: "#1565C0", usage: "Primary action buttons, links" },
      { name: "Blue 500", hex: "#1E88E5", usage: "Hover states, icons, highlights" },
      { name: "Blue 400", hex: "#42A5F5", usage: "Focus rings, secondary highlights" },
      { name: "Blue 100", hex: "#BBDEFB", usage: "Button hover bg, tag backgrounds" },
      { name: "Blue 50",  hex: "#E3F2FD", usage: "Info callout bg, selected row bg" },
    ],
    amber: [
      { name: "Amber 900", hex: "#E65100", usage: "Critical alerts, overdue badges" },
      { name: "Amber 700", hex: "#F57F17", usage: "Logo accent, warning badges, CTAs" },
      { name: "Amber 500", hex: "#FFB300", usage: "Star ratings, highlight accents" },
      { name: "Amber 100", hex: "#FFF8E1", usage: "Warning callout backgrounds" },
    ],
    semantic: [
      { name: "Success 700", hex: "#2E7D32", usage: "Paid status, delivered, active" },
      { name: "Success 500", hex: "#43A047", usage: "Success toasts, positive trends" },
      { name: "Success 50",  hex: "#E8F5E9", usage: "Success badge bg, positive row" },
      { name: "Warning 700", hex: "#F57F17", usage: "Expiring documents, pending" },
      { name: "Warning 50",  hex: "#FFF3E0", usage: "Warning badge bg, pending row" },
      { name: "Error 700",   hex: "#C62828", usage: "Overdue, failed, expired, errors" },
      { name: "Error 500",   hex: "#E53935", usage: "Destructive buttons, error toasts" },
      { name: "Error 50",    hex: "#FFEBEE", usage: "Error badge bg, overdue row" },
      { name: "Info 700",    hex: "#0277BD", usage: "Info toasts, in-transit status" },
      { name: "Info 50",     hex: "#E1F5FE", usage: "Info callout background" },
    ],
    neutral: [
      { name: "Gray 900", hex: "#1A1A2E", usage: "Primary text, headings" },
      { name: "Gray 700", hex: "#37474F", usage: "Body text, descriptions" },
      { name: "Gray 500", hex: "#607D8B", usage: "Placeholder text, secondary labels" },
      { name: "Gray 400", hex: "#90A4AE", usage: "Disabled text, icons" },
      { name: "Gray 200", hex: "#CFD8DC", usage: "Borders, dividers, table lines" },
      { name: "Gray 100", hex: "#ECEFF1", usage: "Alternating table rows, input bg" },
      { name: "Gray 50",  hex: "#F5F7FA", usage: "Page background, card bg" },
      { name: "White",    hex: "#FFFFFF", usage: "Card surfaces, modal backgrounds" },
    ],
    status: [
      { name: "In Transit",  hex: "#1E88E5", usage: "LR status — in transit" },
      { name: "Delivered",   hex: "#2E7D32", usage: "LR status — delivered" },
      { name: "Pending",     hex: "#F57F17", usage: "LR status — pending dispatch" },
      { name: "Cancelled",   hex: "#607D8B", usage: "LR status — cancelled" },
      { name: "Overdue",     hex: "#C62828", usage: "Invoice status — overdue" },
      { name: "Paid",        hex: "#2E7D32", usage: "Invoice status — paid" },
      { name: "Partial",     hex: "#0277BD", usage: "Invoice status — partial payment" },
      { name: "Draft",       hex: "#90A4AE", usage: "Invoice/voucher — draft" },
    ],
  };

  const SectionTitle = ({ children }) => (
    <div className="mb-4">
      <h2 style={{ fontFamily: "system-ui, sans-serif", fontSize: 13, fontWeight: 700,
        letterSpacing: "0.12em", textTransform: "uppercase", color: "#607D8B",
        borderBottom: "1px solid #CFD8DC", paddingBottom: 8, marginBottom: 16 }}>
        {children}
      </h2>
    </div>
  );

  const Swatch = ({ name, hex, usage }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10,
      padding: "10px 14px", borderRadius: 10, background: "#fff",
      boxShadow: "0 1px 3px rgba(0,0,0,0.07)", border: "1px solid #ECEFF1" }}>
      <div style={{ width: 52, height: 52, borderRadius: 10, background: hex, flexShrink: 0,
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)" }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 3 }}>
          <span style={{ fontFamily: "system-ui", fontWeight: 700, fontSize: 14, color: "#1A1A2E" }}>
            {name}
          </span>
          <code style={{ fontFamily: "monospace", fontSize: 12, color: "#1E88E5",
            background: "#E3F2FD", padding: "2px 8px", borderRadius: 5 }}>
            {hex}
          </code>
        </div>
        <p style={{ fontFamily: "system-ui", fontSize: 12, color: "#607D8B", margin: 0,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {usage}
        </p>
      </div>
      <button
        onClick={() => navigator.clipboard.writeText(hex)}
        style={{ flexShrink: 0, padding: "4px 10px", borderRadius: 6, border: "1px solid #CFD8DC",
          background: "#F5F7FA", color: "#37474F", fontSize: 11, cursor: "pointer",
          fontFamily: "system-ui", fontWeight: 600 }}>
        Copy
      </button>
    </div>
  );

  const sections = [
    { label: "Primary — Navy (Trust & Authority)", key: "primary" },
    { label: "Accent — Blue (Technology & Speed)", key: "accent" },
    { label: "Energy — Amber (Action & India)", key: "amber" },
    { label: "Semantic — Status Colors", key: "semantic" },
    { label: "Neutral — Grays & Surfaces", key: "neutral" },
    { label: "Transport Status Pills", key: "status" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F5F7FA", fontFamily: "system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0F2B5B 0%, #1565C0 100%)",
        padding: "40px 40px 32px", color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12,
            background: "linear-gradient(135deg, #1E88E5, #0F2B5B)",
            border: "2px solid rgba(255,255,255,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24 }}>🚛</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: "-0.5px" }}>
              FreightFlow Pro
            </h1>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.7, letterSpacing: "0.05em" }}>
              Official Color Palette & Design Tokens
            </p>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: 14, opacity: 0.85, maxWidth: 560, lineHeight: 1.6 }}>
          Every color has a purpose — Navy for trust, Blue for technology, Amber for the energy of Indian roads.
          Use these tokens consistently across the entire product.
        </p>
        {/* Color preview strip */}
        <div style={{ display: "flex", gap: 6, marginTop: 24, flexWrap: "wrap" }}>
          {["#0F2B5B","#1565C0","#1E88E5","#42A5F5","#F57F17","#FFB300",
            "#2E7D32","#43A047","#C62828","#E53935","#0277BD","#607D8B","#ECEFF1","#FFFFFF"]
            .map(c => (
              <div key={c} title={c} style={{ width: 32, height: 32, borderRadius: 8,
                background: c, border: "2px solid rgba(255,255,255,0.2)",
                cursor: "pointer", flexShrink: 0 }}
                onClick={() => navigator.clipboard.writeText(c)} />
            ))}
        </div>
        <p style={{ margin: "8px 0 0", fontSize: 11, opacity: 0.5 }}>
          Click any swatch to copy hex
        </p>
      </div>

      {/* Tailwind Config Box */}
      <div style={{ margin: "24px 40px 0", padding: "16px 20px", borderRadius: 12,
        background: "#1A1A2E", border: "1px solid #37474F" }}>
        <p style={{ margin: "0 0 8px", fontSize: 11, color: "#42A5F5",
          fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          tailwind.config.js — Design Tokens
        </p>
        <pre style={{ margin: 0, fontSize: 11, color: "#90A4AE", lineHeight: 1.7,
          fontFamily: "monospace", overflow: "auto" }}>{`colors: {
  brand: {
    950: '#0A1628',  900: '#0F2B5B',
    800: '#1A3A6B',  700: '#1E4D8C',
  },
  blue: {
    600: '#1565C0',  500: '#1E88E5',
    400: '#42A5F5',  100: '#BBDEFB',  50: '#E3F2FD',
  },
  amber: {
    900: '#E65100',  700: '#F57F17',
    500: '#FFB300',  100: '#FFF8E1',
  },
  success: { 700: '#2E7D32', 500: '#43A047', 50: '#E8F5E9' },
  warning: { 700: '#F57F17', 50: '#FFF3E0' },
  error:   { 700: '#C62828', 500: '#E53935', 50: '#FFEBEE' },
  info:    { 700: '#0277BD', 50: '#E1F5FE' },
  gray: {
    900: '#1A1A2E',  700: '#37474F',  500: '#607D8B',
    400: '#90A4AE',  200: '#CFD8DC',  100: '#ECEFF1',
    50:  '#F5F7FA',
  },
}`}</pre>
      </div>

      {/* Swatches */}
      <div style={{ padding: "32px 40px", display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 32 }}>
        {sections.map(({ label, key }) => (
          <div key={key}>
            <SectionTitle>{label}</SectionTitle>
            {palette[key].map(s => <Swatch key={s.hex} {...s} />)}
          </div>
        ))}
      </div>

      {/* UI Usage Examples */}
      <div style={{ padding: "0 40px 40px" }}>
        <SectionTitle>UI Component Previews</SectionTitle>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          {/* Buttons */}
          {[
            { label: "Create LR", bg: "#1565C0", color: "#fff" },
            { label: "Generate Invoice", bg: "#2E7D32", color: "#fff" },
            { label: "Export PDF", bg: "#F57F17", color: "#fff" },
            { label: "Cancel", bg: "#ECEFF1", color: "#37474F" },
            { label: "Delete", bg: "#FFEBEE", color: "#C62828" },
          ].map(b => (
            <button key={b.label} style={{ padding: "10px 20px", borderRadius: 8,
              background: b.bg, color: b.color, border: "none", fontWeight: 700,
              fontSize: 13, cursor: "pointer", fontFamily: "system-ui",
              boxShadow: "0 2px 6px rgba(0,0,0,0.12)" }}>
              {b.label}
            </button>
          ))}
        </div>

        {/* Status Badges */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
          {[
            { label: "In Transit", bg: "#E3F2FD", color: "#1565C0" },
            { label: "Delivered", bg: "#E8F5E9", color: "#2E7D32" },
            { label: "Pending", bg: "#FFF3E0", color: "#E65100" },
            { label: "Overdue", bg: "#FFEBEE", color: "#C62828" },
            { label: "Paid", bg: "#E8F5E9", color: "#2E7D32" },
            { label: "Partial", bg: "#E1F5FE", color: "#0277BD" },
            { label: "Draft", bg: "#ECEFF1", color: "#607D8B" },
            { label: "Cancelled", bg: "#ECEFF1", color: "#607D8B" },
            { label: "POD Pending", bg: "#FFF8E1", color: "#F57F17" },
          ].map(b => (
            <span key={b.label} style={{ padding: "4px 12px", borderRadius: 20,
              background: b.bg, color: b.color, fontWeight: 700, fontSize: 12,
              fontFamily: "system-ui", letterSpacing: "0.02em" }}>
              {b.label}
            </span>
          ))}
        </div>

        {/* Sample Dashboard Card */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Today's LRs", value: "24", sub: "+3 from yesterday", color: "#1565C0", bg: "#E3F2FD", icon: "📦" },
            { label: "Outstanding", value: "₹4.2L", sub: "12 invoices overdue", color: "#C62828", bg: "#FFEBEE", icon: "🧾" },
            { label: "Vehicles On Trip", value: "18/24", sub: "6 idle right now", color: "#2E7D32", bg: "#E8F5E9", icon: "🚛" },
            { label: "Docs Expiring", value: "5", sub: "within 30 days", color: "#E65100", bg: "#FFF3E0", icon: "⚠️" },
          ].map(c => (
            <div key={c.label} style={{ background: "#fff", borderRadius: 14, padding: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)", border: `1px solid ${c.bg}`,
              borderLeft: `4px solid ${c.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ margin: "0 0 6px", fontSize: 12, color: "#607D8B",
                    fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em",
                    fontFamily: "system-ui" }}>{c.label}</p>
                  <p style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 900,
                    color: c.color, fontFamily: "system-ui" }}>{c.value}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#90A4AE",
                    fontFamily: "system-ui" }}>{c.sub}</p>
                </div>
                <span style={{ fontSize: 28, padding: "8px", borderRadius: 10,
                  background: c.bg }}>{c.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Sample Table Row */}
        <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.07)", border: "1px solid #ECEFF1" }}>
          <div style={{ background: "#0F2B5B", padding: "12px 20px", display: "grid",
            gridTemplateColumns: "80px 1fr 1fr 100px 100px 120px",
            gap: 16, fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.85)",
            letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "system-ui" }}>
            <span>LR No</span><span>Dealer</span><span>Consignee</span>
            <span>Weight</span><span>Amount</span><span>Status</span>
          </div>
          {[
            { lr: "390", dealer: "K V RAYON", consignee: "AMRUT TEXTILE", wt: "469.4 kg", amt: "₹469", status: "Delivered", sc: "#E8F5E9", tc: "#2E7D32", shade: false },
            { lr: "389", dealer: "K V RAYON", consignee: "Devangi Industries", wt: "2038.4 kg", amt: "₹1,590", status: "In Transit", sc: "#E3F2FD", tc: "#1565C0", shade: true },
            { lr: "396", dealer: "K V RAYON", consignee: "JAY SIYARAM FABRICS", wt: "2421 kg", amt: "₹2,421", status: "POD Pending", sc: "#FFF8E1", tc: "#F57F17", shade: false },
            { lr: "395", dealer: "K V RAYON", consignee: "VASTRA TEXTILE", wt: "1205.5 kg", amt: "₹1,205", status: "Overdue", sc: "#FFEBEE", tc: "#C62828", shade: true },
          ].map(r => (
            <div key={r.lr} style={{ padding: "13px 20px", display: "grid",
              gridTemplateColumns: "80px 1fr 1fr 100px 100px 120px", gap: 16, alignItems: "center",
              background: r.shade ? "#F5F7FA" : "#FFFFFF",
              borderBottom: "1px solid #ECEFF1", fontFamily: "system-ui" }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: "#1565C0" }}>{r.lr}</span>
              <span style={{ fontSize: 13, color: "#37474F" }}>{r.dealer}</span>
              <span style={{ fontSize: 13, color: "#37474F" }}>{r.consignee}</span>
              <span style={{ fontSize: 13, color: "#607D8B" }}>{r.wt}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1A1A2E" }}>{r.amt}</span>
              <span style={{ padding: "3px 10px", borderRadius: 20, background: r.sc,
                color: r.tc, fontWeight: 700, fontSize: 11, display: "inline-block",
                textAlign: "center" }}>{r.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: "#0F2B5B", padding: "20px 40px", textAlign: "center" }}>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "system-ui" }}>
          FreightFlow Pro Design System · Color Palette v1.0 · April 2026
        </p>
      </div>
    </div>
  );
}
