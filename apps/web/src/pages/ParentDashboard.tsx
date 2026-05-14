export default function ParentDashboard() {
  return (
    <div className="card" style={{ maxWidth: 980, margin: 'auto', display: 'grid', gap: 20 }}>
      <h1>Parent Monitoring</h1>
      <p style={{ color: '#a6b4cb' }}>View child progress, attendance alerts, assignments, and learning achievements in one dashboard.</p>
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        <div className="card" style={{ background: 'rgba(8, 17, 39, 0.96)' }}><h3>Attendance</h3><p style={{ color: '#cbd5e1' }}>Real-time child attendance and session logs.</p></div>
        <div className="card" style={{ background: 'rgba(8, 17, 39, 0.96)' }}><h3>Performance</h3><p style={{ color: '#cbd5e1' }}>Score analytics, weak topic alerts and AI study recommendations.</p></div>
      </div>
    </div>
  );
}
