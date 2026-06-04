// src/components/cybersec-qa/InterviewLayout.jsx
import React, { useEffect } from 'react';
import { InterviewQA, FlashcardMode, QuizMode, ProgressTracker } from './index';
import './styles.css';

export const InterviewLayout = ({ questions }) => {
  useEffect(() => {
    // Initialize mode switching after component mounts
    const setupModeTabs = () => {
      const tabs = document.querySelectorAll('.mode-tab');
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const mode = tab.dataset.mode;
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          
          document.querySelectorAll('.mode-content').forEach(content => {
            content.style.display = 'none';
          });
          
          const activeContent = document.getElementById(mode + '-mode');
          if (activeContent) activeContent.style.display = 'block';
        });
      });
    };
    
    setupModeTabs();
  }, []);

  const categories = [...new Set(questions.map(q => q.category))];

  return (
    <div className="cyber-interview-container">
      <div className="stats-banner">
        <div className="stat-item">
          <div className="stat-number">{questions.length}+</div>
          <div className="stat-label">Questions</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{new Set(questions.map(q => q.category)).size}</div>
          <div className="stat-label">Categories</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">3</div>
          <div className="stat-label">Difficulty Levels</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">100%</div>
          <div className="stat-label">Free</div>
        </div>
      </div>

      <div className="mode-selector">
        <button className="mode-tab active" data-mode="qa">📖 Q&A Explorer</button>
        <button className="mode-tab" data-mode="flashcard">🎴 Flashcard Trainer</button>
        <button className="mode-tab" data-mode="quiz">📝 Quiz Yourself</button>
        <button className="mode-tab" data-mode="progress">📊 Track Progress</button>
      </div>

      <div className="mode-content active" id="qa-mode">
        <InterviewQA questions={questions} initialLimit={20} />
      </div>

      <div className="mode-content" id="flashcard-mode" style={{display: 'none'}}>
        <FlashcardMode questions={questions} />
      </div>

      <div className="mode-content" id="quiz-mode" style={{display: 'none'}}>
        <QuizMode questions={questions} quizSize={10} />
      </div>

      <div className="mode-content" id="progress-mode" style={{display: 'none'}}>
        <ProgressTracker questions={questions} />
      </div>

      <div className="categories-grid">
        {categories.slice(0, 10).map(cat => (
          <div key={cat} className="category-card">
            <h3>{cat}</h3>
            <p>Security concepts and best practices</p>
            <span className="question-count">{questions.filter(q => q.category === cat).length} questions</span>
          </div>
        ))}
      </div>

      <div className="success-box">
        <h3>🎉 Good Luck with Your Interview!</h3>
        <p>Remember: Interviewers value problem-solving ability over perfect answers. Think aloud, ask clarifying questions, and show your passion for security.</p>
      </div>
    </div>
  );
};
