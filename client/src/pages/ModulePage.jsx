import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ModulePage = () => {
  const { courseId, moduleIndex } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const inFlightRef = useRef(false);

  const initLoad = async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setError(null);

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/api/courses/${courseId}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setCourse(data);
      } else {
        setError(data.error || data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  };

  useEffect(() => {
    initLoad();
  }, [courseId, moduleIndex, user]);

  if (loading) return (
    <div className="container mt-4">
      <div className="loader-container"><div className="spinner"></div></div>
    </div>
  );

  if (error) return (
    <div className="container mt-4 text-center">
      <div className="card" style={{ borderColor: 'var(--danger)' }}>
        <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>
        <button className="btn-primary" onClick={() => initLoad()}>Retry</button>
      </div>
    </div>
  );

  if (!course || !course.modules || !course.modules[moduleIndex]) {
    return (
      <div className="container mt-4 text-center animate-fade-in">
        <div className="card">
          <p className="mb-4">Module not found.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Go to Home</button>
        </div>
      </div>
    );
  }

  const mod = course.modules[moduleIndex];
  const lessons = mod.lessons || [];
  
  const completedLessonsList = course.completedLessons || [];
  
  // Count how many lessons in THIS module are complete
  let moduleCompletedCount = 0;
  lessons.forEach((l, idx) => {
    if (completedLessonsList.includes(`${moduleIndex}_${idx}`)) {
      moduleCompletedCount++;
    }
  });
  
  const progressPercentage = lessons.length === 0 ? 0 : Math.round((moduleCompletedCount / lessons.length) * 100);

  return (
    <div className="container mt-4 animate-fade-in">
      <div className="mb-4">
        <button className="btn-outline" onClick={() => navigate(`/course/${course._id}`)}>
          ← Back to Course
        </button>
      </div>

      <div className="card mb-4" style={{ position: 'relative' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Module {parseInt(moduleIndex) + 1}: {mod.title}</h1>
        <div className="mt-3">
          <div className="flex justify-between items-center text-muted" style={{ fontSize: '0.9rem' }}>
            <span>Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="progress-bg">
            <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>
      </div>

      <h3 className="mb-3">Lessons</h3>
      
      <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '1rem' }}>
        {lessons.map((lesson, idx) => {
          const isCompleted = completedLessonsList.includes(`${moduleIndex}_${idx}`);
          return (
            <Link to={`/lesson/${courseId}/${moduleIndex}/${idx}`} key={idx} style={{ textDecoration: 'none' }}>
              <div className="card card-hoverable flex justify-between items-center" style={{ padding: '1rem 1.5rem', borderLeft: isCompleted ? '4px solid var(--success)' : '1px solid var(--border-color)' }}>
                <div>
                  <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}>Lesson {idx + 1}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>{lesson.title}</div>
                </div>
                {isCompleted && (
                  <div style={{ color: 'var(--success)' }}><svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ModulePage;