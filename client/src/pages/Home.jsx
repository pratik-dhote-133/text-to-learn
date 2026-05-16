import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cooldown, setCooldown] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    setTopic('');
    setError(null);
    setLoading(false);
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!topic.trim() || loading || cooldown) return;
    
    setLoading(true);
    setError(null);
    setCooldown(true);

    // Cooldown timer
    setTimeout(() => setCooldown(false), 3000);

    try {
      const res = await fetch('http://localhost:3000/api/courses/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ topic })
      });
      
      const data = await res.json();
      if (res.ok) {
        navigate(`/course/${data._id}`);
      } else {
        // 7. FRONTEND ERROR HANDLING
        setError(data.error || data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Connection failed. Please check your internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loader-container">
          <div className="spinner"></div>
          <h3 style={{ color: 'var(--text-main)', marginTop: '1.5rem' }}>Generating Course Structure...</h3>
          <p className="text-muted">This usually takes 3-5 seconds</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '0.5rem' }}>Build your next skill</h1>
      <h2 style={{ fontSize: '1.2rem', fontWeight: '400', color: 'var(--text-muted)', marginBottom: '3rem' }}>
        Hi {user?.name}, what topic should we break down today?
      </h2>

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div className="chat-input-wrapper">
          <input
            type="text"
            className="chat-input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="E.g. Rust concurrency, Advanced CSS animations, Macroeconomics..."
            disabled={loading}
          />
          <button 
            type="submit" 
            className="chat-submit"
            disabled={!topic.trim() || loading || cooldown}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </form>

      {error && (
        <div className="card mt-4 text-center" style={{ borderColor: 'var(--danger)', maxWidth: '500px', width: '100%' }}>
          <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontWeight: '600' }}>{error}</div>
          <button className="btn-primary" onClick={handleSubmit}>Retry Generation</button>
        </div>
      )}
    </div>
  );
};

export default Home;