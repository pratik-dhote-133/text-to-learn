import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3>{course.title}</h3>
      <p className="mt-1 mb-2" style={{ flexGrow: 1, color: '#555' }}>{course.description}</p>
      <Link to={`/course/${course._id}`} className="btn-outline text-center" style={{ display: 'block' }}>
        View Course
      </Link>
    </div>
  );
};

export default CourseCard;
