import { Link } from 'react-router-dom';

const ModuleList = ({ modules }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {modules.map((mod, index) => (
        <div key={mod._id} className="card">
          <h3>Module {index + 1}: {mod.title}</h3>
          <ul style={{ marginTop: '1rem', paddingLeft: '1rem' }}>
            {mod.lessons.map((lesson, lIndex) => (
              <li key={lesson._id} style={{ marginBottom: '0.5rem' }}>
                <Link to={`/lesson/${lesson._id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ 
                    display: 'inline-block', width: '24px', height: '24px', 
                    borderRadius: '50%', backgroundColor: 'var(--primary-color)', 
                    color: '#fff', textAlign: 'center', lineHeight: '24px', fontSize: '0.8rem' 
                  }}>
                    {lIndex + 1}
                  </span>
                  {lesson.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default ModuleList;
