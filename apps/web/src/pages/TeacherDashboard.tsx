export default function TeacherDashboard() {
  return (
    <div className="card" style={{ maxWidth: 1100, margin: 'auto', display: 'grid', gap: 24 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Teacher Dashboard</h1>
          <p style={{ color: '#a6b4cb' }}>Manage classrooms, upload lessons, monitor student growth, and generate AI-powered study content.</p>
        </div>
      </header>

      <section style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {[
          { title: 'Live Class Scheduler', feature: 'Plan doubt sessions and live lectures with reminders.' },
          { title: 'AI Content Builder', feature: 'Create quizzes, notes, flashcards and summaries with one prompt.' },
          { title: 'Performance Analytics', feature: 'Track attendance, completion, weak topics, and batch progress.' },
          { title: 'Classroom Leaderboard', feature: 'Boost engagement with XP, badges, and competitive ranking.' }
        ].map((item) => (
          <div key={item.title} className="card" style={{ background: 'rgba(13, 24, 52, 0.92)' }}>
            <h3>{item.title}</h3>
            <p style={{ color: '#a6b4cb' }}>{item.feature}</p>
          </div>
        ))}
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24 }}>
        <div className="card" style={{ background: 'rgba(13, 24, 52, 0.92)' }}>
          <h2>AI-powered content studio</h2>
          <p>Generate summaries, quizzes, assignments, revision notes, flashcards and classroom descriptions instantly.</p>
        </div>
        <div className="card" style={{ background: 'rgba(13, 24, 52, 0.92)' }}>
          <h2>Teaching command center</h2>
          <p>Manage subject batches, verify teacher access, and review student engagement across your coaching communities.</p>
        </div>
      </section>
    </div>
  );
}
