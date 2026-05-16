import { useState } from "react";

function CourseDisplay({ course }) {
  const [selectedModule, setSelectedModule] = useState(null);

  if (!course) return null;

  return (
    <div style={styles.container}>
      
      {/* 🔹 COURSE TITLE */}
      <h2 style={styles.title}>{course.title}</h2>

      {/* 🔹 MODULE GRID */}
      <div style={styles.grid}>
        {course.modules.map((module, index) => (
          <div
            key={index}
            style={{
              ...styles.card,
              ...(selectedModule === module ? styles.activeCard : {}),
            }}
            onClick={() => setSelectedModule(module)}
          >
            <p style={styles.moduleNumber}>MODULE {index + 1}</p>
            <h3 style={styles.moduleTitle}>{module.title}</h3>
          </div>
        ))}
      </div>

      {/* 🔥 LESSON DISPLAY */}
      {selectedModule && (
        <div style={styles.lessonContainer}>
          <h3 style={styles.lessonTitle}>{selectedModule.title}</h3>

          <ul style={styles.lessonList}>
            {selectedModule.lessons.map((lesson, i) => (
              <li key={i} style={styles.lessonItem}>
                ▶ {lesson}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    marginTop: "30px",
    width: "100%",
    maxWidth: "700px",
  },

  title: {
    textAlign: "center",
    marginBottom: "25px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
  },

  card: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "20px",
    borderRadius: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  activeCard: {
    background: "#6366f1",
  },

  moduleNumber: {
    fontSize: "12px",
    color: "#94a3b8",
    marginBottom: "5px",
  },

  moduleTitle: {
    color: "white",
  },

  lessonContainer: {
    marginTop: "25px",
    background: "rgba(255,255,255,0.05)",
    padding: "20px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.1)",
    animation: "fadeIn 0.3s ease",
  },

  lessonTitle: {
    marginBottom: "10px",
  },

  lessonList: {
    listStyle: "none",
    padding: 0,
  },

  lessonItem: {
    padding: "8px 0",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
};

export default CourseDisplay;