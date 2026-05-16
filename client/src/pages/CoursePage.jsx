import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LearningRoadmap from '../components/LearningRoadmap';

const CoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/courses/${id}`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setCourse(data);
        }
      } catch (err) {
        console.error('Failed to fetch course');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, user]);

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

      <div className="card mb-4">
        <h3 className="mb-3">Course Progress</h3>
        <div className="flex justify-between items-center text-muted" style={{ fontSize: '0.9rem' }}>
          <span>{completedLessonsCount} / {totalLessons} Lessons Completed</span>
          <span>{progressPercentage}%</span>
        </div>
        <div className="progress-bg mt-2">
          <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
        </div>
      </div>

      {/* Learning Roadmap Diagram */}
      <LearningRoadmap course={course} completedLessons={completedLessonsList} />

      <h3 className="mb-3">Course Modules</h3>
      <div className="grid grid-cols-2">
        {course.modules?.map((mod, index) => {
          // Module progress calculation
          const modTotal = mod.lessons?.length || 0;
          let modCompleted = 0;
          if (mod.lessons) {
            mod.lessons.forEach((les, lIdx) => {
              if (completedLessonsList.includes(`${index}_${lIdx}`)) {
                modCompleted++;
              }
            });
          }
          const modProgress = modTotal === 0 ? 0 : Math.round((modCompleted / modTotal) * 100);

          return (
            <Link to={`/module/${course._id}/${index}`} key={index}>
              <div className="card card-hoverable h-100 flex flex-col justify-between">
                <div>
                  <h4 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>Module {index + 1}: {mod.title}</h4>
                  <p className="text-muted" style={{ fontSize: '0.9rem' }}>{modTotal} Lessons</p>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted mb-1">
                    <span>Progress</span>
                    <span>{modProgress}%</span>
                  </div>
                  <div className="progress-bg" style={{ height: '4px', marginTop: 0 }}>
                    <div className="progress-fill" style={{ width: `${modProgress}%` }}></div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CoursePage;

