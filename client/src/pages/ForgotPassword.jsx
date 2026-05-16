import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await fetch('http://localhost:3000/api/debug/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage('Password reset successfully! You can now log in.');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(data.message || 'Password reset failed. Please try again.');
      }
    } catch (error) {
      setError('A network error occurred. Please try again later.');
    }
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h2 className="text-center mb-3">Reset Password</h2>
      {error && <div style={{ color: 'red', backgroundColor: '#ffebee', padding: '10px', borderRadius: '4px', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}
      {message && <div style={{ color: 'green', backgroundColor: '#e8f5e9', padding: '10px', borderRadius: '4px', marginBottom: '15px', textAlign: 'center' }}>{message}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email Address</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Enter your registered email"
            required 
          />
        </div>
        <div className="form-group">
          <label>New Password</label>
          <input 
            type="password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            placeholder="Enter your new password"
            required 
          />
        </div>
        <button type="submit" className="btn-primary" style={{ width: '100%', marginBottom: '10px' }}>
          Reset Password
        </button>
      </form>
      
      <div className="text-center mt-3">
        <Link to="/login" style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>Back to Login</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
