import { useState } from 'react';

export const QuizMode = ({ questions, quizSize = 10 }) => {
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  const startQuiz = () => {
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setSelectedQuestions(shuffled.slice(0, quizSize));
    setUserAnswers({});
    setQuizStarted(true);
    setQuizSubmitted(false);
    setScore(null);
  };

  const handleAnswerChange = (questionId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    const results = selectedQuestions.map(q => {
      const userAnswer = userAnswers[q.id] || '';
      const isCorrect = userAnswer.toLowerCase().includes(q.correctAnswer?.toLowerCase() || 
                        q.answer.split('.')[0].toLowerCase());
      if (isCorrect) correct++;
      return {
        ...q,
        userAnswer,
        isCorrect
      };
    });
    return { correct, total: selectedQuestions.length, percentage: (correct / selectedQuestions.length) * 100, results };
  };

  const submitQuiz = () => {
    const results = calculateScore();
    setScore(results);
    setQuizSubmitted(true);
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuizSubmitted(false);
    setUserAnswers({});
    setScore(null);
  };

  if (!quizStarted) {
    return (
      <div className="quiz-container">
        <div className="quiz-intro">
          <h3>📝 Cybersecurity Quiz Mode</h3>
          <p>Test your knowledge with {quizSize} random questions from the bank</p>
          <div className="quiz-features">
            <span>✅ Instant scoring</span>
            <span>✅ Detailed feedback</span>
            <span>✅ Review correct answers</span>
          </div>
          <button onClick={startQuiz} className="quiz-start-btn">
            Start Quiz 🚀
          </button>
        </div>
      </div>
    );
  }

  if (quizSubmitted && score) {
    return (
      <div className="quiz-results-container">
        <div className="quiz-score-card">
          <h2>Quiz Results</h2>
          <div className="quiz-score-circle">
            <div className="score-number">{score.correct}/{score.total}</div>
            <div className="score-percentage">{score.percentage.toFixed(1)}%</div>
          </div>
          
          <div className="score-feedback">
            {score.percentage >= 80 && <p>🎉 Excellent! You're well prepared!</p>}
            {score.percentage >= 60 && score.percentage < 80 && <p>👍 Good job! Review the questions you missed.</p>}
            {score.percentage < 60 && <p>📚 Keep studying! Review the answers below.</p>}
          </div>

          <div className="quiz-review">
            <h3>Review Answers</h3>
            {score.results.map((q, idx) => (
              <div key={q.id} className={`review-item ${q.isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="review-question">
                  <span className="review-number">{idx + 1}</span>
                  <span className="review-status">{q.isCorrect ? '✅' : '❌'}</span>
                  <strong>{q.question}</strong>
                </div>
                <div className="review-answer">
                  <div>Your answer: <span className="user-answer">{q.userAnswer || 'Not answered'}</span></div>
                  <div>Correct answer: <span className="correct-answer">{q.answer.split('.')[0]}...</span></div>
                </div>
              </div>
            ))}
          </div>

          <div className="quiz-actions">
            <button onClick={resetQuiz} className="quiz-retry-btn">Try Again</button>
            <button onClick={startQuiz} className="quiz-new-btn">New Quiz</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container active">
      <div className="quiz-header">
        <h3>Quiz in Progress</h3>
        <div className="quiz-progress">
          Answered: {Object.keys(userAnswers).length} / {selectedQuestions.length}
        </div>
      </div>

      <div className="quiz-questions">
        {selectedQuestions.map((q, idx) => (
          <div key={q.id} className="quiz-question-card">
            <div className="quiz-question-header">
              <span className="quiz-question-number">Question {idx + 1}</span>
              <span className="quiz-category">{q.category}</span>
            </div>
            <div className="quiz-question-text">{q.question}</div>
            <textarea
              className="quiz-answer-input"
              rows="4"
              placeholder="Type your answer here..."
              value={userAnswers[q.id] || ''}
              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
            />
            <div className="quiz-hint">
              💡 Hint: Think about {q.category} concepts
            </div>
          </div>
        ))}
      </div>

      <div className="quiz-submit">
        <button onClick={submitQuiz} className="quiz-submit-btn">
          Submit Quiz 📝
        </button>
      </div>
    </div>
  );
};
