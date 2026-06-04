// src/components/cybersec-qa/InterviewLayout.jsx
import { useEffect } from 'react';
import { InterviewQA, FlashcardMode, QuizMode, ProgressTracker } from './index';
import './styles.css';

export const InterviewLayout = ({ questions }) => {
  useEffect(() => {
    const setupModeTabs = () => {
      const tabs = document.querySelectorAll('.mode-tab');
      const handleClick = (e) => {
        const tab = e.currentTarget;
        const mode = tab.dataset.mode;
        
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        document.querySelectorAll('.mode-content').forEach(content => {
          content.style.display = 'none';
        });
        
        const activeContent = document.getElementById(mode + '-mode');
        if (activeContent) activeContent.style.display = 'block';
      };
      
      tabs.forEach(tab => {
        tab.removeEventListener('click', handleClick);
        tab.addEventListener('click', handleClick);
      });
    };
    
    setupModeTabs();
  }, []);

  // ... rest of your component
};
