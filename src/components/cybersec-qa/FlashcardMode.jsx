import { useState, useEffect } from 'react';

export const FlashcardMode = ({ questions }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [studied, setStudied] = useState(new Set());
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    let filtered = questions;
    if (categoryFilter !== 'all') {
      filtered = questions.filter(q => q.category === categoryFilter);
    }
    const shuffled = [...filtered];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShuffledQuestions(shuffled);
    setCurrentIndex(0);
    setFlipped(false);
  }, [categoryFilter, questions]);

  const currentQuestion = shuffledQuestions[currentIndex];
  const progress = ((currentIndex + 1) / shuffledQuestions.length) * 100;

  const nextCard = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % shuffledQuestions.length);
  };

  const prevCard = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + shuffledQuestions.length) % shuffledQuestions.length);
  };

  const markAsStudied = () => {
    setStudied(prev => new Set([...prev, currentQuestion.id]));
    nextCard();
  };

  const shuffleCards = () => {
    const shuffled = [...shuffledQuestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShuffledQuestions(shuffled);
    setCurrentIndex(0);
    setFlipped(false);
  };

  const categories = ['all', ...new Set(questions.map(q => q.category))];

  if (!currentQuestion) {
    return <div className="flashcard-container">Loading...</div>;
  }

  return (
    <div className="flashcard-container">
      <div className="flashcard-controls-top">
        <select 
          value={categoryFilter} 
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="flashcard-category-select"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
        
        <div className="flashcard-stats">
          <span>📊 Progress: {currentIndex + 1} / {shuffledQuestions.length}</span>
          <span>✅ Studied: {studied.size}</span>
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div 
        className={`flashcard ${flipped ? 'flipped' : ''}`}
        onClick={() => setFlipped(!flipped)}
      >
        <div className="flashcard-front">
          <div className="flashcard-category">{currentQuestion.category}</div>
          <div className="flashcard-difficulty">{currentQuestion.difficulty || 'Intermediate'}</div>
          <h3 className="flashcard-question">{currentQuestion.question}</h3>
          <div className="flashcard-hint">👆 Click to reveal answer</div>
        </div>
        <div className="flashcard-back">
          <div className="flashcard-answer-label">📝 Answer</div>
          <div className="flashcard-answer">{currentQuestion.answer}</div>
          {currentQuestion.tips && (
            <div className="flashcard-tips">
              <strong>💡 Tip:</strong> {currentQuestion.tips[0]}
            </div>
          )}
        </div>
      </div>

      <div className="flashcard-controls-bottom">
        <button onClick={prevCard} className="flashcard-nav-btn">← Previous</button>
        <button onClick={shuffleCards} className="flashcard-shuffle-btn">🔀 Shuffle</button>
        <button onClick={markAsStudied} className="flashcard-studied-btn">
          ✓ Mark as Studied
        </button>
        <button onClick={nextCard} className="flashcard-nav-btn">Next →</button>
      </div>
    </div>
  );
};
