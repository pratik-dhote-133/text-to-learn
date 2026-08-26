import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/api';

const LOADING_STAGES = [
  "Analyzing topic & domain context...",
  "Planning course architecture & modules...",
  "Structuring progressive lesson objectives...",
  "Finalizing your interactive learning path..."
];

const Home = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [error, setError] = useState(null);
  const [cooldown, setCooldown] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    setTopic('');
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingStage(0);
      interval = setInterval(() => {
        setLoadingStage((prev) => (prev < LOADING_STAGES.length - 1 ? prev + 1 : prev));
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!topic.trim() || loading || cooldown) return;
    
    if (!user || !user.token) {
      setError('Your session has expired. Please log in again.');
      logout();
      return;
    }

    setLoading(true);
    setError(null);
    setCooldown(true);

    setTimeout(() => setCooldown(false), 3000);

    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/generate`, {
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
        if (res.status === 401) {
          setError('Authentication failed. Please log in again.');
          logout();
        } else {
          setError(data.error || data.message || 'Something went wrong. Please try again.');
        }
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
          <h3 style={{ color: 'var(--text-main)', marginTop: '1.5rem', fontWeight: '600' }}>
            {LOADING_STAGES[loadingStage]}
          </h3>
          <p className="text-muted" style={{ fontSize: '0.95rem' }}>Designing a personalized course for "{topic}"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '0.5rem', background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Build your next skill
      </h1>
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
          <button className="btn-primary" onClick={!user || !user.token ? () => navigate('/login') : handleSubmit}>
            {!user || !user.token ? 'Go to Login' : 'Retry Generation'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;