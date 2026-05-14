import { Route, Routes, Navigate } from 'react-router-dom';
import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import CommunityPage from './pages/CommunityPage';
import AIChat from './pages/AIChat';
import Notifications from './pages/Notifications';
import ParentDashboard from './pages/ParentDashboard';
import Sidebar from './components/Sidebar';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const [role, setRole] = useState<'teacher' | 'student' | 'parent' | null>(null);

  return (
    <div className="app-shell" style={{ display: 'grid', gap: 24, gridTemplateColumns: role ? '280px 1fr' : '1fr' }}>
      {role && <Sidebar role={role} />}
      <div>
        <Routes>
          <Route path="/" element={<LoginPage setRole={setRole} />} />
          <Route path="/teacher" element={role === 'teacher' ? <TeacherDashboard /> : <Navigate to="/" />} />
          <Route path="/student" element={role === 'student' ? <StudentDashboard /> : <Navigate to="/" />} />
          <Route path="/parent" element={role === 'parent' ? <ParentDashboard /> : <Navigate to="/" />} />
          <Route path="/community" element={role ? <CommunityPage /> : <Navigate to="/" />} />
          <Route path="/ai" element={role ? <AIChat /> : <Navigate to="/" />} />
          <Route path="/notifications" element={role ? <Notifications /> : <Navigate to="/" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
