export default function StudentDashboard() {
  return (
    <div className="card" style={{ maxWidth: 1100, margin: 'auto', display: 'grid', gap: 24 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Student Dashboard</h1>
          <p style={{ color: '#a6b4cb' }}>Access study resources, AI tutoring, analytics, and a personal roadmap for your next exam.</p>
        </div>
      </header>

      <section style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {[
          { title: 'AI Tutor', subtitle: 'Chat, upload images, text and voice for instant doubt resolution.' },
          { title: 'Study Planner', subtitle: 'Daily reminders, revision mode, and exam preparation sessions.' },
          { title: 'Performance', subtitle: 'Track weak topics, scores, streaks, and leaderboard rank.' },
          { title: 'Bookmarks', subtitle: 'Save important notes, videos, and community resources.' }
        ].map((item) => (
          <div key={item.title} className="card" style={{ background: 'rgba(13, 24, 52, 0.92)' }}>
            <h3>{item.title}</h3>
            <p style={{ color: '#a6b4cb' }}>{item.subtitle}</p>
          </div>
        ))}
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24 }}>
        <div className="card" style={{ background: 'rgba(13, 24, 52, 0.92)' }}>
          <h2>Smart Revision Mode</h2>
          <p>Focus on weak topics, review flashcards, and follow AI-generated exam roadmaps before the test.</p>
        </div>
        <div className="card" style={{ background: 'rgba(13, 24, 52, 0.92)' }}>
          <h2>Achievement system</h2>
          <p>Earn badges, daily XP, streak rewards, and climbing leaderboard status for consistent study.</p>
        </div>
      </section>
    </div>
  );
}
