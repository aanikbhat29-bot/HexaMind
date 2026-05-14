import { Link } from 'react-router-dom';

interface Props { role: 'teacher' | 'student' | null; }

export default function Sidebar({ role }: Props) {
  const common = [
    { name: 'Community', path: '/community' },
    { name: 'AI Tutor', path: '/ai' },
    { name: 'Notifications', path: '/notifications' }
  ];
  const teacherLinks = [{ name: 'Dashboard', path: '/teacher' }];
  const studentLinks = [{ name: 'Dashboard', path: '/student' }];

  return (
    <aside className="sidebar" style={{ width: 280, padding: 20, borderRadius: 24, background: 'rgba(10, 14, 28, 0.96)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ width: 56, height: 56, borderRadius: 18, background: '#1f2937', marginBottom: 14 }} />
        <p style={{ color: '#94a3b8', margin: 0 }}>Next-gen education</p>
        <h2 style={{ margin: '8px 0 0', fontSize: 22 }}>AI Classroom</h2>
      </div>
      <nav style={{ display: 'grid', gap: 12 }}>
        {(role === 'teacher' ? teacherLinks : studentLinks).concat(common).map((item) => (
          <Link key={item.path} to={item.path} style={{ color: '#f8fafc', padding: 14, borderRadius: 16, display: 'block', background: 'rgba(255,255,255,0.03)', textDecoration: 'none' }}>
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
