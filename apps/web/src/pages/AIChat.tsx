import { useState } from 'react';
import { sendDoubt } from '../lib/api';

export default function AIChat() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const handleAsk = async () => {
    const result = await sendDoubt({ question, attachments: [] });
    setAnswer(result.data.answer || 'AI response pending');
  };

  return (
    <div className="card" style={{ maxWidth: 980, margin: 'auto', display: 'grid', gap: 20 }}>
      <h1>AI Tutor Assistant</h1>
      <p style={{ color: '#a6b4cb' }}>Ask your doubts using text, voice, PDF, or image inputs and get instant guidance.</p>
      <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a question or paste a topic" style={{ minHeight: 140, borderRadius: 20, padding: 18, background: '#081127', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.08)' }} />
      <button className="button" onClick={handleAsk}>Send to AI Tutor</button>
      {answer ? <div className="card" style={{ background: 'rgba(8, 17, 39, 0.96)' }}><h2>AI Response</h2><p style={{ color: '#cbd5e1' }}>{answer}</p></div> : null}
    </div>
  );
}
