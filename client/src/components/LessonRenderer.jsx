import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { API_BASE_URL } from '../utils/api';

const HeadingBlock = ({ text }) => (
  <h2 className="lesson-heading mt-5 mb-3" style={{ color: 'var(--primary)' }}>{text}</h2>
);

const ParagraphBlock = ({ text }) => (
  <p className="lesson-paragraph mb-3 leading-relaxed text-lg" style={{ lineHeight: '1.7' }}>{text}</p>
);

const CodeBlock = ({ text, language }) => (
  <div className="code-block-wrapper my-5 pdf-no-break shadow-sm">
    <div className="code-header flex justify-between items-center px-4 py-2 bg-dark rounded-t-lg border-b border-color">
      <span className="text-xs uppercase font-bold text-muted">{language || 'code'}</span>
      <button className="btn-xs text-xs" onClick={() => navigator.clipboard.writeText(text)}>Copy</button>
    </div>
    <SyntaxHighlighter 
      language={language || 'javascript'} 
      style={atomDark}
      customStyle={{ margin: 0, padding: '1.5rem', borderRadius: '0 0 8px 8px', fontSize: '0.95rem', lineHeight: '1.6' }}
    >
      {text}
    </SyntaxHighlighter>
  </div>
);

const CalloutBlock = ({ style, text }) => {
  const styles = {
    important: { bg: 'bg-primary-soft', border: 'var(--primary)', icon: '💡', title: 'Important' },
    interview_tip: { bg: 'bg-warning-soft', border: 'var(--warning)', icon: '🎯', title: 'Interview Tip' },
    common_mistake: { bg: 'bg-danger-soft', border: 'var(--danger)', icon: '⚠️', title: 'Common Mistake' },
    best_practice: { bg: 'bg-success-soft', border: 'var(--success)', icon: '⭐', title: 'Best Practice' },
    pro_tip: { bg: 'bg-info-soft', border: 'var(--info)', icon: '🚀', title: 'Pro Tip' },
    complexity_note: { bg: 'bg-primary-soft', border: 'var(--primary)', icon: '⏱️', title: 'Complexity Note' },
    edge_case_warning: { bg: 'bg-warning-soft', border: 'var(--warning)', icon: '🚧', title: 'Edge Case Warning' },
    optimization_note: { bg: 'bg-success-soft', border: 'var(--success)', icon: '⚡', title: 'Optimization Note' },
    common_bug: { bg: 'bg-danger-soft', border: 'var(--danger)', icon: '🐛', title: 'Common Bug' },
  };

  const config = styles[style] || styles.important;

  return (
    <div className={`callout-card my-4 p-5 rounded-lg flex gap-4 shadow-sm pdf-no-break ${config.bg}`} style={{ borderLeft: `4px solid ${config.border}` }}>
      <div className="callout-icon text-2xl flex-shrink-0 mt-1">{config.icon}</div>
      <div className="callout-content">
        <h4 className="font-bold mb-1 uppercase text-xs tracking-widest" style={{ color: config.border }}>{config.title}</h4>
        <p className="m-0 text-md leading-relaxed" style={{ color: 'var(--text-main)' }}>{text}</p>
      </div>
    </div>
  );
};

const VideoBlock = ({ query, courseId }) => {
  const [videoId, setVideoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchVideo = async () => {
      if (!user?.token) return;
      try {
        const url = `${API_BASE_URL}/api/youtube?query=${encodeURIComponent(query)}&courseId=${courseId}`;
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const data = await res.json();
        setVideoId(data.videoId);
      } catch (err) {
        console.error("Video fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    if (query && user?.token) fetchVideo();
    else setLoading(false);
  }, [query, user?.token, courseId]);

  if (loading) return <div className="video-skeleton animate-pulse my-5 h-64 bg-gray-200 rounded">Loading video tutorial...</div>;

  return (
    <div className="video-wrapper my-5 pdf-no-break">
      {videoId ? (
        <div className="video-container" style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px' }}>
          <iframe
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '8px' }}
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      ) : (
        <div className="no-video-alert p-4 text-center border border-dashed rounded-lg my-4">
          <p className="text-muted">No specific video could be loaded. Please check YouTube directly.</p>
          <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`} target="_blank" rel="noreferrer" className="text-primary text-sm underline">Search on YouTube</a>
        </div>
      )}
    </div>
  );
};

const MCQBlock = React.memo(({ mcq, index, submitted, onSelect, selectedOption }) => {
  const isCorrect = selectedOption === mcq.options[mcq.answer];
  
  return (
    <div className="mcq-card card mb-4 p-5 border border-color pdf-no-break animate-fade-in shadow-sm">
      <h4 className="mb-4 text-lg font-bold">Q{index + 1}: {mcq.question}</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {mcq.options.map((opt, i) => {
          const isSelected = selectedOption === opt;
          let className = "option-btn text-left p-4 rounded-lg border transition-all cursor-pointer ";
          
          if (submitted) {
            if (i === mcq.answer) className += "border-success bg-success-soft text-success font-bold";
            else if (isSelected) className += "border-danger bg-danger-soft text-danger";
            else className += "border-color opacity-50";
          } else {
            className += isSelected ? "border-primary bg-primary-soft shadow-sm" : "border-color hover-border-primary";
          }

          const letter = String.fromCharCode(65 + i);
          
          return (
            <label 
              key={i} 
              className={className} 
              style={{ 
                background: submitted ? undefined : isSelected ? 'var(--bg-hover)' : 'transparent', 
                minHeight: '3.5rem', 
                width: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                cursor: submitted ? 'default' : 'pointer',
                padding: '0.75rem 1.25rem',
                gap: '1rem',
                borderRadius: '8px'
              }}
            >
              <input 
                type="radio" 
                name={`mcq-${index}`} 
                value={opt} 
                checked={isSelected} 
                onChange={() => { if (!submitted) onSelect(opt); }} 
                disabled={submitted} 
                style={{ position: 'absolute', opacity: 0, cursor: 'pointer', height: 0, width: 0 }} 
              />
              <span style={{ 
                fontWeight: 'bold', 
                minWidth: '28px', 
                color: submitted ? (i === mcq.answer ? 'var(--success)' : isSelected ? 'var(--danger)' : 'var(--text-muted)') : (isSelected ? 'var(--primary)' : 'var(--text-muted)') 
              }}>
                [{letter}]
              </span>
              <span style={{ fontSize: '1rem', lineHeight: '1.4', flexGrow: 1, textAlign: 'left' }}>{opt}</span>
            </label>
          );
        })}
      </div>
      {submitted && (
        <div className={`mt-4 p-4 rounded-lg animate-fade-in ${isCorrect ? 'bg-success-soft border border-success' : 'bg-danger-soft border border-danger'}`}>
          <p className="text-sm m-0"><strong>{isCorrect ? 'Correct!' : 'Incorrect.'}</strong> {mcq.explanation}</p>
        </div>
      )}
    </div>
  );
});

const LessonRenderer = ({ lesson, courseId, moduleIndex, lessonIndex, onComplete }) => {
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [mcqSubmitted, setMcqSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const { user } = useContext(AuthContext);

  // Reset state if lesson changes
  useEffect(() => {
    setMcqAnswers({});
    setMcqSubmitted(false);
    setFinalScore(null);
  }, [lesson.title]);

  if (!lesson || !lesson.content) return null;

  let contentArray = lesson.content;
  if (!Array.isArray(lesson.content)) {
      contentArray = [];
      const c = lesson.content;
      if (c.introduction) { contentArray.push({ type: 'heading', text: 'Introduction' }); contentArray.push({ type: 'paragraph', text: c.introduction }); }
      if (c.explanation) { contentArray.push({ type: 'heading', text: 'Explanation' }); contentArray.push({ type: 'paragraph', text: c.explanation }); }
      if (c.analogy) { contentArray.push({ type: 'heading', text: 'Real-World Analogy' }); contentArray.push({ type: 'paragraph', text: c.analogy }); }
      if (c.stepByStep) { contentArray.push({ type: 'heading', text: 'Step-by-Step' }); contentArray.push({ type: 'paragraph', text: c.stepByStep }); }
      if (c.examples) { contentArray.push({ type: 'heading', text: 'Examples' }); contentArray.push({ type: 'paragraph', text: c.examples }); }
      if (c.practicalUsage) { contentArray.push({ type: 'heading', text: 'Practical Usage' }); contentArray.push({ type: 'paragraph', text: c.practicalUsage }); }
      if (c.commonMistakes) { contentArray.push({ type: 'heading', text: 'Common Mistakes' }); contentArray.push({ type: 'paragraph', text: c.commonMistakes }); }
      if (c.summary) { contentArray.push({ type: 'heading', text: 'Summary' }); contentArray.push({ type: 'paragraph', text: c.summary }); }
      
      if (lesson.mcqs) {
          lesson.mcqs.forEach(mcq => {
              contentArray.push({ type: 'mcq', ...mcq });
          });
      }
      contentArray.push({ type: 'video', query: lesson.title });
  }

  const mcqBlocks = contentArray.filter(b => b.type === 'mcq');
  const isAssessment = lesson.title.includes("Assessment");

  const downloadPDF = () => {
    window.print();
  };

  const handleQuizSubmit = async () => {
    setMcqSubmitted(true);
    let score = 0;
    mcqBlocks.forEach((mcq, idx) => {
      if (mcqAnswers[idx] === mcq.options[mcq.answer]) score++;
    });
    setFinalScore(score);

    try {
      await fetch(`${API_BASE_URL}/api/courses/${courseId}/quiz`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}` 
        },
        body: JSON.stringify({ moduleIndex, lessonIndex, score, totalQuestions: mcqBlocks.length })
      });
    } catch (err) {
      console.error("Failed to submit quiz score", err);
    }
  };

  const handleRetry = () => {
    setMcqAnswers({});
    setMcqSubmitted(false);
    setFinalScore(null);
  };

  return (
    <div className="lesson-renderer">
      <div id="lesson-pdf-content" style={{ padding: '20px', background: 'var(--bg-color)', color: 'var(--text-color)' }}>
        <header className="lesson-header mb-5">
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--text-color)' }}>{lesson.title}</h1>
          
          {lesson.objectives && lesson.objectives.length > 0 && (
            <div className="objectives-box p-5 rounded-lg bg-hover border border-color mb-5">
              <h4 className="mb-3 uppercase text-sm tracking-widest text-primary font-bold">Learning Objectives</h4>
              <ul className="list-disc pl-5">
                {lesson.objectives.map((obj, i) => <li key={i} className="text-base text-muted mb-2">{obj}</li>)}
              </ul>
            </div>
          )}
        </header>

        <main className="lesson-body mb-5">
          {contentArray.map((block, idx) => {
            if (block.type === 'heading') return <HeadingBlock key={idx} text={block.text} />;
            if (block.type === 'paragraph') return <ParagraphBlock key={idx} text={block.text} />;
            if (block.type === 'callout') return <CalloutBlock key={idx} style={block.style} text={block.text} />;
            if (block.type === 'code') return <CodeBlock key={idx} text={block.text} language={block.language} />;
            if (block.type === 'video') return <VideoBlock key={idx} query={block.query || lesson.title} courseId={courseId} />;
            return null; // mcqs are rendered separately below
          })}
        </main>

        {mcqBlocks.length > 0 && (
          <section className="lesson-mcqs mt-5 pt-4 border-top border-color html2pdf__page-break">
            <h2 className="mb-4 text-2xl font-bold">{isAssessment ? 'Assessment Questions' : 'Knowledge Check'}</h2>
            {mcqBlocks.map((mcq, idx) => (
              <MCQBlock 
                key={idx} 
                mcq={mcq} 
                index={idx}
                submitted={mcqSubmitted}
                selectedOption={mcqAnswers[idx]}
                onSelect={(opt) => setMcqAnswers(prev => ({ ...prev, [idx]: opt }))}
              />
            ))}
          </section>
        )}
      </div>

      <div className="px-4 pb-5">
        {!mcqSubmitted && mcqBlocks.length > 0 && (
          <button 
            className="btn-primary w-100 py-4 mb-4 text-lg font-bold transition-all hover-scale shadow-sm rounded-lg" 
            disabled={Object.keys(mcqAnswers).length < mcqBlocks.length}
            onClick={handleQuizSubmit}
          >
            Submit Answers
          </button>
        )}

        {mcqSubmitted && (
          <div className="quiz-results p-5 mb-5 rounded-lg border border-color bg-hover text-center animate-fade-in shadow-sm">
            <h3 className="text-2xl font-bold mb-2">Quiz Completed!</h3>
            <p className="text-xl mb-4">You scored <strong className={finalScore >= mcqBlocks.length * 0.8 ? 'text-success' : 'text-primary'}>{finalScore}</strong> out of {mcqBlocks.length}</p>
            {isAssessment && finalScore !== null && (
              <p className="text-muted mb-4">
                {finalScore / mcqBlocks.length >= 0.8 ? "Excellent work! You've mastered these concepts." : "Good effort! Review the explanations and try again to improve your score."}
              </p>
            )}
            <button className="btn-outline py-2 px-5 font-semibold" onClick={handleRetry}>Retry Quiz</button>
          </div>
        )}

        <div className="lesson-footer pt-5 border-top border-color flex justify-between gap-4">
          <button 
            className="btn-outline py-3 px-5 flex-1 font-semibold rounded-lg" 
            onClick={downloadPDF}
          >
            Download as PDF
          </button>
          <button 
            className="btn-success py-3 px-5 flex-1 font-semibold rounded-lg shadow-sm" 
            onClick={onComplete}
          >
            {isAssessment ? 'Complete Assessment' : 'Complete Lesson & Return'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonRenderer;
