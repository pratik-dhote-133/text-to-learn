import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LessonRenderer from '../components/LessonRenderer';

const LessonPage = () => {
  const { courseId, moduleIndex, lessonIndex } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const inFlightRef = useRef(false);
  const pollTimeoutRef = useRef(null);

  useEffect(() => {
    fetchCourse();
    return () => { if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current); };
  }, [courseId, moduleIndex, lessonIndex, user]);

  const fetchCourse = async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/api/courses/${courseId}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCourse(data);
        const lesson = data.modules[moduleIndex].lessons[lessonIndex];
        if (!lesson.isGenerated) {
          try {
            await generateLesson();
          } catch (err) {
            setError("Failed to load lesson. Please try again.");
          }
        }
      } else {
        setError("Failed to load lesson. Please try again.");
      }
    } catch (err) {
      setError("Check backend server");
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  };

  const generateLesson = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`http://localhost:3000/api/courses/generate-lesson/${courseId}/${moduleIndex}/${lessonIndex}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      
      if (res.status === 202) {
        // Queueing / Still generating
        pollTimeoutRef.current = setTimeout(generateLesson, 3000);
        return;
      }

      const data = await res.json();
      if (res.ok) {
        setCourse(data);
        setGenerating(false);
      } else {
        setError("Failed to load lesson. Please try again.");
        setGenerating(false);
      }
    } catch (err) {
      setError("Check backend server");
      setGenerating(false);
    }
  };

  if (loading || generating) return (
    <div className="container mt-4">
      <div className="loader-container">
        <div className="spinner"></div>
        <p className="text-muted mt-3">AI is {generating ? 'generating your custom lesson content...' : 'loading...'}</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="container mt-4 text-center">
      <div className="card border-danger p-5">
        <h3 className="text-danger mb-3">Oops! Something went wrong</h3>
        <p className="mb-4">{error}</p>
        <button className="btn-primary" onClick={fetchCourse}>Try Again</button>
      </div>
    </div>
  );

  if (!course) return null;

  const lesson = course.modules[moduleIndex].lessons[lessonIndex];

  const handleComplete = async () => {
    try {
      await fetch(`http://localhost:3000/api/courses/${courseId}/progress`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}` 
        },
        body: JSON.stringify({ moduleIndex, lessonIndex })
      });
    } catch (err) {
      console.error("Failed to mark lesson as complete", err);
    }
    navigate(`/module/${courseId}/${moduleIndex}`);
  };

  return (
    <div className="container mt-4 animate-fade-in" style={{ maxWidth: '800px' }}>
      <div className="flex justify-between items-center mb-5">
        <button className="btn-outline" onClick={() => navigate(`/module/${courseId}/${moduleIndex}`)}>← Back to Module</button>
        <span className="text-muted text-sm">Step {parseInt(lessonIndex) + 1} of {course.modules[moduleIndex].lessons.length}</span>
      </div>

      <LessonRenderer 
        lesson={lesson} 
        courseId={courseId} 
        moduleIndex={moduleIndex}
        lessonIndex={lessonIndex}
        onComplete={handleComplete} 
      />
    </div>
  );
};

export default LessonPage;
