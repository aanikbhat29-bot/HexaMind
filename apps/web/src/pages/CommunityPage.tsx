export default function CommunityPage() {
  return (
    <div className="card" style={{ maxWidth: 980, margin: 'auto' }}>
      <h1>Community Learning</h1>
      <p style={{ color: '#a6b4cb' }}>Public and private discussion groups, trending educational posts, polls, and collaborative learning activities.</p>
      <div style={{ display: 'grid', gap: 16, marginTop: 24 }}>
        {['Weekly challenges', 'Topic-based study circles', 'AI moderated Q&A', 'Discussion leaderboards'].map((item) => (
          <div key={item} className="card" style={{ background: 'rgba(13, 24, 52, 0.92)' }}>
            <h3>{item}</h3>
            <p style={{ color: '#a6b4cb' }}>Encourage social learning with likes, shares, saved resources, and research-backed support.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
