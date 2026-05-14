import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props { setRole: (role: 'teacher' | 'student' | null) => void; }

export default function LoginPage({ setRole }: Props) {
  const [userType, setUserType] = useState<'teacher' | 'student'>('student');
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setRole(userType);
    navigate(userType === 'teacher' ? '/teacher' : '/student');
  };

  return (
    <div className="card" style={{ maxWidth: 520, margin: 'auto' }}>
      <h1 style={{ marginBottom: 8 }}>AI Learning Hub</h1>
      <p style={{ color: '#a6b4cb', marginBottom: 24 }}>Secure login for Teachers and Students with personalized dashboards.</p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          Select role
          <select value={userType} onChange={(e) => setUserType(e.target.value as 'teacher' | 'student')} style={{ padding: 12, borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: '#0f172a', color: '#f8fafc' }}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          Email
          <input type="email" placeholder="you@school.com" required style={{ padding: 12, borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: '#0f172a', color: '#f8fafc' }} />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          Password
          <input type="password" placeholder="••••••••" required style={{ padding: 12, borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: '#0f172a', color: '#f8fafc' }} />
        </label>

        <button className="button" type="submit">Continue as {userType === 'teacher' ? 'Teacher' : 'Student'}</button>
      </form>
    </div>
  );
}
