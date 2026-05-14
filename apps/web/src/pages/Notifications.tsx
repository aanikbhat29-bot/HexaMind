import { useEffect, useState } from 'react';
import { fetchNotifications } from '../lib/api';

export default function Notifications() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetchNotifications().then((res) => setItems(res.data.notifications || []));
  }, []);

  return (
    <div className="card" style={{ maxWidth: 980, margin: 'auto' }}>
      <h1>Notifications</h1>
      <p style={{ color: '#a6b4cb' }}>Real-time alerts for assignments, live classes, community updates, and study reminders.</p>
      <div style={{ display: 'grid', gap: 14, marginTop: 20 }}>
        {items.length ? items.map((item) => (
          <div key={item.id} style={{ padding: 16, borderRadius: 20, background: 'rgba(15, 23, 42, 0.95)' }}>
            <h3>{item.title}</h3>
            <p style={{ color: '#cbd5e1' }}>{item.message}</p>
          </div>
        )) : <p style={{ color: '#94a3b8' }}>No notifications yet.</p>}
      </div>
    </div>
  );
}
