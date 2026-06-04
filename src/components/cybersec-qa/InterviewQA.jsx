// components/InterviewQA.jsx
import { useState } from 'react';

export const InterviewQA = ({ questions }) => {
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [showAnswers, setShowAnswers] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const toggleAnswer = (id) => {
    setShowAnswers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || q.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(questions.map(q => q.category))];

  return (
    <div className="interview-qa-container">
      <div className="controls">
        <input
          type="text"
          placeholder="🔍 Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select 
          value={categoryFilter} 
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="category-filter"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
      </div>

      <div className="stats">
        Showing {filteredQuestions.length} of {questions.length} questions
      </div>

      <div className="questions-list">
        {filteredQuestions.map((q, idx) => (
          <div key={idx} className="question-card">
            <div 
              className="question-header"
              onClick={() => toggleAnswer(q.id || idx)}
            >
              <span className="question-number">{idx + 1}</span>
              <span className="category-badge">{q.category}</span>
              <h3 className="question-text">{q.question}</h3>
              <span className="toggle-icon">
                {showAnswers[q.id || idx] ? '▲' : '▼'}
              </span>
            </div>
            
            {showAnswers[q.id || idx] && (
              <div className="answer-content">
                <div className="answer-text">{q.answer}</div>
                {q.codeExample && (
                  <pre className="code-block">
                    <code>{q.codeExample}</code>
                  </pre>
                )}
                {q.tips && (
                  <div className="pro-tips">
                    <strong>💡 Pro Tips:</strong>
                    <ul>
                      {q.tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const FlashcardMode = ({ questions }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showProgress, setShowProgress] = useState(true);

  const nextCard = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % questions.length);
  };

  const prevCard = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + questions.length) % questions.length);
  };

  const shuffleCards = () => {
    setFlipped(false);
    // Shuffle implementation
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // You'd need to manage shuffled state
  };

  return (
    <div className="flashcard-container">
      <div className="flashcard-controls">
        <button onClick={prevCard}>← Previous</button>
        <span className="card-counter">
          Card {currentIndex + 1} of {questions.length}
        </span>
        <button onClick={nextCard}>Next →</button>
        <button onClick={shuffleCards}>🔀 Shuffle</button>
      </div>

      <div 
        className={`flashcard ${flipped ? 'flipped' : ''}`}
        onClick={() => setFlipped(!flipped)}
      >
        <div className="flashcard-front">
          <div className="category-label">{questions[currentIndex].category}</div>
          <h3>{questions[currentIndex].question}</h3>
          <div className="click-hint">Click to reveal answer</div>
        </div>
        <div className="flashcard-back">
          <div className="answer-label">Answer</div>
          <p>{questions[currentIndex].answer}</p>
        </div>
      </div>
    </div>
  );
};

export const QuizMode = ({ questions }) => {
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (qId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [qId]: answer
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (userAnswers[q.id]?.toLowerCase() === q.correctAnswer?.toLowerCase()) {
        correct++;
      }
    });
    return { correct, total: questions.length, percentage: (correct / questions.length) * 100 };
  };

  const submitQuiz = () => {
    setShowResults(true);
  };

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="quiz-results">
        <h2>Quiz Results</h2>
        <div className="score">{score.correct}/{score.total}</div>
        <div className="percentage">{score.percentage.toFixed(1)}%</div>
        <button onClick={() => setShowResults(false)}>Review Answers</button>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      {questions.map((q, idx) => (
        <div key={idx} className="quiz-question">
          <h4>{idx + 1}. {q.question}</h4>
          <textarea
            placeholder="Type your answer..."
            onChange={(e) => handleAnswer(q.id || idx, e.target.value)}
            className="quiz-answer-input"
          />
          {userAnswers[q.id || idx] && (
            <div className="sample-answer">
              <strong>📝 Sample answer:</strong> {q.answer.substring(0, 150)}...
            </div>
          )}
        </div>
      ))}
      <button onClick={submitQuiz} className="submit-quiz">Submit Answers</button>
    </div>
  );
};
