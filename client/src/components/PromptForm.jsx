import { useState } from 'react';

const PromptForm = ({ onGenerate, loading }) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (topic.trim()) {
      onGenerate(topic);
      setTopic('');
    }
  };

  return (
    <div className="card mb-4" style={{ textAlign: 'center' }}>
      <h2>What do you want to learn?</h2>
      <p className="mb-3" style={{ color: 'var(--text-main)' }}>Enter a topic and we'll generate a full course for you.</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <input 
          type="text" 
          value={topic} 
          onChange={(e) => setTopic(e.target.value)} 
          placeholder="e.g. React Hooks, Python Basics..." 
          style={{ width: '60%', padding: '0.75rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)' }}
          disabled={loading}
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Course'}
        </button>
      </form>
    </div>
  );
};

export default PromptForm;