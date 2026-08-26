import { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toPng } from 'html-to-image';
import './LearningRoadmap.css';

/* ─── Icon helpers (inline SVGs to avoid deps) ─── */
const BookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
);
const ModuleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
);
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);
const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
);
const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
);
const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
);
const MapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
);
const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
);

/* ─── Main Component ─── */
const LearningRoadmap = ({ course, completedLessons = [], courseId, onToggleLesson }) => {
  const navigate = useNavigate();
  const roadmapRef = useRef(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [downloading, setDownloading] = useState(false);
  const [tooltip, setTooltip] = useState(null);
  const [animatingLessons, setAnimatingLessons] = useState({});

  /* ─── Progress calculations (memoized) ─── */
  const progressData = useMemo(() => {
    if (!course?.modules) return { modules: [], totalLessons: 0, totalCompleted: 0 };

    let totalLessons = 0;
    let totalCompleted = 0;

    const modules = course.modules.map((mod, mIdx) => {
      const lessons = (mod.lessons || []).map((lesson, lIdx) => {
        const key = `${mIdx}_${lIdx}`;
        const completed = completedLessons.includes(key);
        totalLessons++;
        if (completed) totalCompleted++;
        return { title: typeof lesson === 'string' ? lesson : lesson.title || `Lesson ${lIdx + 1}`, completed, key };
      });

      const modCompleted = lessons.filter(l => l.completed).length;
      const modProgress = lessons.length === 0 ? 0 : Math.round((modCompleted / lessons.length) * 100);

      return {
        title: mod.title,
        lessons,
        completedCount: modCompleted,
        totalCount: lessons.length,
        progress: modProgress,
      };
    });

    return { modules, totalLessons, totalCompleted };
  }, [course, completedLessons]);

  const overallProgress = progressData.totalLessons === 0
    ? 0
    : Math.round((progressData.totalCompleted / progressData.totalLessons) * 100);

  /* ─── Find next incomplete lesson for active highlight ─── */
  const nextLesson = useMemo(() => {
    for (let mIdx = 0; mIdx < progressData.modules.length; mIdx++) {
      const mod = progressData.modules[mIdx];
      for (let lIdx = 0; lIdx < mod.lessons.length; lIdx++) {
        if (!mod.lessons[lIdx].completed) {
          return `${mIdx}_${lIdx}`;
        }
      }
    }
    return null;
  }, [progressData]);

  /* ─── Toggle expand/collapse (accordion — only one at a time) ─── */
  const toggleModule = useCallback((idx) => {
    setExpandedModules(prev => {
      // If clicking the already-expanded module, collapse it
      if (prev[idx]) return {};
      // Otherwise expand only this one
      return { [idx]: true };
    });
  }, []);

  const expandAll = useCallback(() => {
    const all = {};
    progressData.modules.forEach((_, i) => { all[i] = true; });
    setExpandedModules(all);
  }, [progressData.modules]);

  const collapseAll = useCallback(() => {
    setExpandedModules({});
  }, []);

  /* ─── Navigation handlers ─── */
  const navigateToModule = useCallback((mIdx) => {
    if (courseId) navigate(`/module/${courseId}/${mIdx}`);
  }, [courseId, navigate]);

  const navigateToLesson = useCallback((mIdx, lIdx) => {
    if (courseId) navigate(`/lesson/${courseId}/${mIdx}/${lIdx}`);
  }, [courseId, navigate]);

  /* ─── Toggle lesson completion ─── */
  const handleToggleLesson = useCallback((e, mIdx, lIdx) => {
    e.stopPropagation();
    if (onToggleLesson) {
      // Animate the checkbox
      const key = `${mIdx}_${lIdx}`;
      setAnimatingLessons(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setAnimatingLessons(prev => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }, 400);
      onToggleLesson(mIdx, lIdx);
    }
  }, [onToggleLesson]);

  /* ─── Download as PNG ─── */
  const handleDownload = useCallback(async () => {
    if (!roadmapRef.current) return;
    setDownloading(true);

    // Expand all for complete screenshot
    const prevExpanded = { ...expandedModules };
    const all = {};
    progressData.modules.forEach((_, i) => { all[i] = true; });
    setExpandedModules(all);

    // Wait for DOM update
    await new Promise(r => setTimeout(r, 300));

    try {
      const dataUrl = await toPng(roadmapRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#0b1020',
        style: {
          padding: '32px',
        },
      });

      const link = document.createElement('a');
      link.download = `${course.title?.replace(/[^a-z0-9]/gi, '_') || 'roadmap'}_learning_roadmap.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export roadmap:', err);
    } finally {
      setExpandedModules(prevExpanded);
      setDownloading(false);
    }
  }, [expandedModules, progressData.modules, course]);

  /* ─── Get status color ─── */
  const getModuleColor = (mod, idx) => {
    const colors = [
      { main: '#6366f1', soft: 'rgba(99,102,241,0.12)', glow: 'rgba(99,102,241,0.3)' },
      { main: '#8b5cf6', soft: 'rgba(139,92,246,0.12)', glow: 'rgba(139,92,246,0.3)' },
      { main: '#ec4899', soft: 'rgba(236,72,153,0.12)', glow: 'rgba(236,72,153,0.3)' },
      { main: '#14b8a6', soft: 'rgba(20,184,166,0.12)', glow: 'rgba(20,184,166,0.3)' },
      { main: '#f59e0b', soft: 'rgba(245,158,11,0.12)', glow: 'rgba(245,158,11,0.3)' },
      { main: '#06b6d4', soft: 'rgba(6,182,212,0.12)', glow: 'rgba(6,182,212,0.3)' },
    ];
    if (mod.progress === 100) return { main: '#10b981', soft: 'rgba(16,185,129,0.12)', glow: 'rgba(16,185,129,0.3)' };
    return colors[idx % colors.length];
  };

  if (!course?.modules?.length) return null;

  return (
    <div className="roadmap-wrapper animate-fade-in">
      {/* Header */}
      <div className="roadmap-header">
        <div className="roadmap-header-left">
          <div className="roadmap-header-icon"><MapIcon /></div>
          <div>
            <h3 className="roadmap-title">Learning Roadmap</h3>
            <p className="roadmap-subtitle">
              {progressData.modules.length} Modules · {progressData.totalLessons} Lessons · {overallProgress}% Complete
            </p>
          </div>
        </div>
        <div className="roadmap-header-actions">
          <button className="roadmap-btn roadmap-btn-ghost" onClick={expandAll} title="Expand All">
            Expand All
          </button>
          <button className="roadmap-btn roadmap-btn-ghost" onClick={collapseAll} title="Collapse All">
            Collapse
          </button>
          <button
            className="roadmap-btn roadmap-btn-download"
            onClick={handleDownload}
            disabled={downloading}
            title="Download as PNG"
          >
            <DownloadIcon />
            {downloading ? 'Exporting…' : 'Download'}
          </button>
        </div>
      </div>

      {/* Roadmap Flow */}
      <div className="roadmap-flow" ref={roadmapRef}>
        {/* Course Root Node */}
        <div className="roadmap-course-node">
          <div className="roadmap-course-icon">🎓</div>
          <div className="roadmap-course-title">{course.title}</div>
          <div className="roadmap-course-progress">
            <div className="roadmap-progress-ring">
              <svg viewBox="0 0 36 36" className="roadmap-circular-progress">
                <path
                  className="roadmap-circle-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="roadmap-circle-fill"
                  strokeDasharray={`${overallProgress}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="roadmap-progress-text">{overallProgress}%</span>
            </div>
          </div>
        </div>

        {/* Vertical connector from course to modules */}
        <div className="roadmap-connector-vertical" />

        {/* Modules */}
        <div className="roadmap-modules">
          {progressData.modules.map((mod, mIdx) => {
            const color = getModuleColor(mod, mIdx);
            const isExpanded = !!expandedModules[mIdx];
            const isLast = mIdx === progressData.modules.length - 1;

            return (
              <div className="roadmap-module-group" key={mIdx}>
                {/* Module node */}
                <div
                  className={`roadmap-module-node ${isExpanded ? 'expanded' : ''} ${mod.progress === 100 ? 'completed' : ''}`}
                  style={{
                    '--module-color': color.main,
                    '--module-soft': color.soft,
                    '--module-glow': color.glow,
                  }}
                  onClick={() => navigateToModule(mIdx)}
                  onMouseEnter={() => setTooltip({ id: `mod-${mIdx}`, text: `${mod.completedCount}/${mod.totalCount} lessons · Click to open module` })}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <div className="roadmap-module-indicator">
                    {mod.progress === 100 ? <CheckIcon /> : <span className="roadmap-module-number">{mIdx + 1}</span>}
                  </div>
                  <div className="roadmap-module-info">
                    <div className="roadmap-module-label">Module {mIdx + 1}</div>
                    <div className="roadmap-module-title">{mod.title}</div>
                    <div className="roadmap-module-meta">
                      <span>{mod.totalCount} lessons</span>
                      {mod.progress > 0 && <span className="roadmap-module-progress-badge">{mod.progress}%</span>}
                    </div>
                  </div>

                  {/* Navigate arrow + Chevron toggle */}
                  <div className="roadmap-module-actions">
                    <button
                      className="roadmap-chevron-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleModule(mIdx);
                      }}
                      title={isExpanded ? 'Collapse' : 'Expand'}
                      aria-label={isExpanded ? 'Collapse module' : 'Expand module'}
                    >
                      {isExpanded ? <ChevronDown /> : <ChevronRight />}
                    </button>
                    <div className="roadmap-navigate-arrow">
                      <ArrowRightIcon />
                    </div>
                  </div>

                  {/* Mini progress bar on module */}
                  <div className="roadmap-module-progress-bar">
                    <div className="roadmap-module-progress-fill" style={{ width: `${mod.progress}%` }} />
                  </div>

                  {/* Tooltip */}
                  {tooltip?.id === `mod-${mIdx}` && (
                    <div className="roadmap-tooltip">{tooltip.text}</div>
                  )}
                </div>

                {/* Lessons (expandable) */}
                <div className={`roadmap-lessons-container ${isExpanded ? 'expanded' : ''}`}>
                  <div className="roadmap-lessons-inner">
                    {mod.lessons.map((lesson, lIdx) => {
                      const isNext = nextLesson === `${mIdx}_${lIdx}`;
                      const isAnimating = !!animatingLessons[`${mIdx}_${lIdx}`];

                      return (
                        <div
                          className={`roadmap-lesson-node ${lesson.completed ? 'completed' : ''} ${isNext ? 'next-lesson' : ''}`}
                          key={lIdx}
                          style={{ '--module-color': color.main, '--module-soft': color.soft, animationDelay: `${lIdx * 0.05}s` }}
                          onClick={() => navigateToLesson(mIdx, lIdx)}
                          onMouseEnter={() => setTooltip({ id: `les-${mIdx}-${lIdx}`, text: lesson.completed ? '✓ Completed · Click to open' : isNext ? '→ Up next · Click to start' : 'Click to open lesson' })}
                          onMouseLeave={() => setTooltip(null)}
                        >
                          <div className="roadmap-lesson-connector" />
                          <div
                            className={`roadmap-lesson-dot ${isAnimating ? 'animating' : ''}`}
                            onClick={(e) => handleToggleLesson(e, mIdx, lIdx)}
                            title={lesson.completed ? 'Mark as incomplete' : 'Mark as complete'}
                            role="checkbox"
                            aria-checked={lesson.completed}
                          >
                            {lesson.completed && <CheckIcon />}
                          </div>
                          <span className="roadmap-lesson-title">{lesson.title}</span>
                          <div className="roadmap-lesson-arrow">
                            <ArrowRightIcon />
                          </div>

                          {tooltip?.id === `les-${mIdx}-${lIdx}` && (
                            <div className="roadmap-tooltip roadmap-tooltip-sm">{tooltip.text}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Connector to next module */}
                {!isLast && <div className="roadmap-connector-module" style={{ '--module-color': color.main }} />}
              </div>
            );
          })}
        </div>

        {/* Finish node */}
        <div className="roadmap-connector-vertical" />
        <div className={`roadmap-finish-node ${overallProgress === 100 ? 'completed' : ''}`}>
          <span className="roadmap-finish-icon">🏆</span>
          <span>{overallProgress === 100 ? 'Course Complete!' : 'Course Complete'}</span>
        </div>
      </div>
    </div>
  );
};

export default LearningRoadmap;
