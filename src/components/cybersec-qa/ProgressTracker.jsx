import { useState, useEffect } from 'react';

export const ProgressTracker = ({ questions, userId = 'default' }) => {
  const [progress, setProgress] = useState({});
  const [notes, setNotes] = useState({});

  useEffect(() => {
    const savedProgress = localStorage.getItem(`cyber-qa-progress-${userId}`);
    const savedNotes = localStorage.getItem(`cyber-qa-notes-${userId}`);
    if (savedProgress) setProgress(JSON.parse(savedProgress));
    if (savedNotes) setNotes(JSON.parse(savedNotes));
  }, [userId]);

  const saveProgress = (newProgress) => {
    setProgress(newProgress);
    localStorage.setItem(`cyber-qa-progress-${userId}`, JSON.stringify(newProgress));
  };

  const markQuestion = (questionId, status) => {
    const newProgress = {
      ...progress,
      [questionId]: {
        ...progress[questionId],
        status,
        lastUpdated: new Date().toISOString()
      }
    };
    saveProgress(newProgress);
  };

  const saveNote = (questionId, note) => {
    const newNotes = { ...notes, [questionId]: note };
    setNotes(newNotes);
    localStorage.setItem(`cyber-qa-notes-${userId}`, JSON.stringify(newNotes));
  };

  const getStats = () => {
    const total = questions.length;
    const reviewed = Object.values(progress).filter(p => p.status === 'reviewed').length;
    const mastered = Object.values(progress).filter(p => p.status === 'mastered').length;
    const needsWork = Object.values(progress).filter(p => p.status === 'needs-work').length;
    return { total, reviewed, mastered, needsWork, percentage: (reviewed / total) * 100 };
  };

  const stats = getStats();

  const getQuestionsByCategory = () => {
    const categoryStats = {};
    questions.forEach(q => {
      if (!categoryStats[q.category]) {
        categoryStats[q.category] = { total: 0, reviewed: 0 };
      }
      categoryStats[q.category].total++;
      if (progress[q.id]?.status === 'reviewed') {
        categoryStats[q.category].reviewed++;
      }
    });
    return categoryStats;
  };

  return (
    <div className="progress-tracker-container">
      <div className="progress-overview">
        <h3>📊 Your Progress</h3>
        <div className="progress-circle">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="10"/>
            <circle 
              cx="50" cy="50" r="45" fill="none" 
              stroke="#4299e1" strokeWidth="10"
              strokeDasharray={`${stats.percentage * 2.83} 283`}
              strokeDashoffset="0"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="progress-text">
            <div className="progress-percentage">{stats.percentage.toFixed(0)}%</div>
            <div className="progress-complete">{stats.reviewed}/{stats.total}</div>
          </div>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card mastered">
            <div className="stat-value">{stats.mastered}</div>
            <div className="stat-label">Mastered</div>
          </div>
          <div className="stat-card reviewed">
            <div className="stat-value">{stats.reviewed}</div>
            <div className="stat-label">Reviewed</div>
          </div>
          <div className="stat-card needs-work">
            <div className="stat-value">{stats.needsWork}</div>
            <div className="stat-label">Needs Work</div>
          </div>
        </div>
      </div>

      <div className="category-progress">
        <h4>Progress by Category</h4>
        {Object.entries(getQuestionsByCategory()).map(([category, data]) => (
          <div key={category} className="category-progress-item">
            <div className="category-name">{category}</div>
            <div className="category-bar-container">
              <div 
                className="category-bar-fill" 
                style={{ width: `${(data.reviewed / data.total) * 100}%` }}
              />
            </div>
            <div className="category-stats">{data.reviewed}/{data.total}</div>
          </div>
        ))}
      </div>

      <div className="study-plan">
        <h4>📅 Recommended Study Plan</h4>
        <ul>
          {Object.entries(getQuestionsByCategory())
            .filter(([_, data]) => (data.reviewed / data.total) < 0.7)
            .slice(0, 3)
            .map(([category, data]) => (
              <li key={category}>
                Focus on <strong>{category}</strong> - Only {data.reviewed}/{data.total} reviewed
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};
