import { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LearningRoadmap from '../components/LearningRoadmap';
import { API_BASE_URL } from '../utils/api';

const CoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!user?.token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setCourse(data);
        } else if (res.status === 401) {
          logout();
          navigate('/login');
        }
      } catch (err) {
        console.error('Failed to fetch course');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, user, logout, navigate]);

  /* ─── Toggle lesson completion (optimistic + backend sync) ─── */
  const handleToggleLesson = useCallback(async (moduleIndex, lessonIndex) => {
    if (!course) return;

    const lessonKey = `${moduleIndex}_${lessonIndex}`;
    const currentCompleted = course.completedLessons || [];

    // Optimistic update
    const isCompleted = currentCompleted.includes(lessonKey);
    const newCompleted = isCompleted
      ? currentCompleted.filter(k => k !== lessonKey)
      : [...currentCompleted, lessonKey];

    setCourse(prev => ({ ...prev, completedLessons: newCompleted }));

    // Backend sync
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${id}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ moduleIndex, lessonIndex })
      });

      if (res.ok) {
        const data = await res.json();
        // Sync with server truth
        setCourse(prev => ({ ...prev, completedLessons: data.completedLessons }));
      }
    } catch (err) {
      // Revert on failure
      console.error('Failed to toggle lesson completion', err);
      setCourse(prev => ({ ...prev, completedLessons: currentCompleted }));
    }
  }, [course, id, user]);

  if (loading) return <div className="loader-container animate-fade-in"><div className="spinner"></div></div>;
  if (!course) {
    return (
      <div className="container mt-4 text-center animate-fade-in">
        <div className="card">
          <p className="mb-4">Course not found.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Go to Home</button>
        </div>
      </div>
    );
  }

  // Calculate overall course progress
  let totalLessons = 0;
  let completedLessonsCount = 0;
  const completedLessonsList = course.completedLessons || [];

  if (course.modules) {
    course.modules.forEach((mod, mIdx) => {
      if (mod.lessons) {
        totalLessons += mod.lessons.length;
        mod.lessons.forEach((les, lIdx) => {
          if (completedLessonsList.includes(`${mIdx}_${lIdx}`)) {
            completedLessonsCount++;
          }
        });
      }
    });
  }

  const progressPercentage = totalLessons === 0 ? 0 : Math.round((completedLessonsCount / totalLessons) * 100);

  return (
    <div className="container mt-4 animate-fade-in">
      <div className="text-center mb-4">
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>{course.title}</h1>
        <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
          {course.description}
        </p>
      </div>

      {/* Learning Roadmap — SOLE interactive navigation */}
      <LearningRoadmap
        course={course}
        completedLessons={completedLessonsList}
        courseId={id}
        onToggleLesson={handleToggleLesson}
      />
    </div>
  );
};

export default CoursePage;
