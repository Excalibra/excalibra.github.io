import { useState } from 'react';

export const InterviewQA = ({ questions, initialLimit = 50 }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAnswers, setShowAnswers] = useState({});
  const [visibleCount, setVisibleCount] = useState(initialLimit);

  const toggleAnswer = (id) => {
    setShowAnswers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const categories = ['all', ...new Set(questions.map(q => q.category))];

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          q.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || q.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const displayedQuestions = filteredQuestions.slice(0, visibleCount);

  return (
    <div className="cyber-qa-container">
      <div className="qa-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search questions or answers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-box">
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="category-select"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? '📚 All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="qa-stats">
        <span>📊 Showing {displayedQuestions.length} of {filteredQuestions.length} questions</span>
        {searchTerm && <span>🔎 Search results for: "{searchTerm}"</span>}
      </div>

      <div className="questions-list">
        {displayedQuestions.map((q, idx) => (
          <div key={q.id} className="qa-card">
            <div 
              className="qa-question" 
              onClick={() => toggleAnswer(q.id)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && toggleAnswer(q.id)}
            >
              <div className="question-header">
                <span className="question-number">{idx + 1}</span>
                <span className="category-tag">{q.category}</span>
                <span className={`difficulty-tag ${q.difficulty?.toLowerCase()}`}>
                  {q.difficulty || 'Intermediate'}
                </span>
              </div>
              <h3 className="question-text">{q.question}</h3>
              <div className="toggle-indicator">
                {showAnswers[q.id] ? '▲ Hide Answer' : '▼ Show Answer'}
              </div>
            </div>
            
            {showAnswers[q.id] && (
              <div className="qa-answer">
                <div className="answer-content">
                  <h4>📝 Answer:</h4>
                  <p>{q.answer}</p>
                  
                  {q.codeExample && (
                    <>
                      <h4>💻 Code Example:</h4>
                      <pre className="code-block">
                        <code>{q.codeExample}</code>
                      </pre>
                    </>
                  )}
                  
                  {q.tips && q.tips.length > 0 && (
                    <div className="tips-box">
                      <h4>💡 Pro Tips:</h4>
                      <ul>
                        {q.tips.map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {visibleCount < filteredQuestions.length && (
        <div className="load-more">
          <button onClick={() => setVisibleCount(prev => prev + 50)} className="load-more-btn">
            Load More Questions ({filteredQuestions.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
};
