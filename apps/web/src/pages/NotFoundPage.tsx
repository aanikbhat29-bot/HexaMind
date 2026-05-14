import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="card" style={{ maxWidth: 640, margin: 'auto', textAlign: 'center' }}>
      <h1>Page Not Found</h1>
      <p style={{ color: '#a6b4cb' }}>It looks like you ventured into an unknown classroom.</p>
      <Link to="/" className="button">Go back to login</Link>
    </div>
  );
}
