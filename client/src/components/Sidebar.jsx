import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/api';

const Sidebar = () => {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?.token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/courses`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        } else if (res.status === 401) {
          logout();
          navigate('/login');
        }
      } catch (err) {
        console.error("Failed to fetch recent courses", err);
      }
    };
    
    if (user?.token) {
      fetchCourses();
    }
  }, [user, logout, navigate]);

  const filteredCourses = courses
    .filter(course => 
      course.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aStart = a.title.toLowerCase().startsWith(searchQuery.toLowerCase());
      const bStart = b.title.toLowerCase().startsWith(searchQuery.toLowerCase());
      if (aStart && !bStart) return -1;
      if (!aStart && bStart) return 1;
      return 0;
    });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      {/* Collapsed View (Icons only) */}
      <div className="sidebar-collapsed-icons">
        <div className="logo-circle" style={{ marginBottom: '1.5rem' }}>T</div>
        <div className="sidebar-icon-item" title="New Chat">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </div>
        <div className="sidebar-icon-item" title="Search">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      {/* Expanded View */}
      <div className="sidebar-content">
        <div className="sidebar-header">
          <div className="logo-circle">T</div>
          <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>TextToLearn</span>
        </div>

        <div className="sidebar-actions">
          <button className="sidebar-btn" onClick={() => navigate('/')}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Chat
          </button>
          
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Search chats..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.5rem 0.5rem 0.5rem 2rem', 
                background: 'var(--bg-hover)', 
                border: 'none', 
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-main)',
                fontSize: '0.9rem'
              }} 
            />
          </div>
        </div>

        <div className="sidebar-section-title">Recents</div>
        
        <div className="recent-list">
          {courses.length === 0 ? (
            <div style={{ padding: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No courses yet</div>
          ) : (
            filteredCourses.map(course => (
              <Link to={`/course/${course._id}`} key={course._id} className="recent-item">
                {course.title}
              </Link>
            ))
          )}
        </div>

        <div className="sidebar-footer" onClick={handleLogout}>
          <div className="logo-circle" style={{ width: '28px', height: '28px', fontSize: '0.8rem' }}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{user?.name}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Logout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
