/**
 * QuizView Component
 * 
 * Formal assessment mode with timed quizzes and comprehensive scoring.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ChevronRight,
  ChevronLeft,
  Flag,
  AlertCircle,
  Trophy,
  RefreshCw
} from 'lucide-react';
import { generateQuiz, generateFeedback } from '../../services/aiService';
import { useLearning } from '../../context/LearningContext';
import './QuizView.css';

const QuizView = ({ topic, onComplete, numberOfQuestions = 5 }) => {
  const { getSyllabusContext, recordQuizScore } = useLearning();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [quizState, setQuizState] = useState('taking'); // 'taking', 'reviewing', 'results'
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Timer
  useEffect(() => {
    if (quizState !== 'taking' || !timeRemaining) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizState, timeRemaining]);

  useEffect(() => {
    loadQuiz();
  }, [topic]);

  const loadQuiz = async () => {
    setLoading(true);
    setError(null);
    setUserAnswers({});
    setFlaggedQuestions([]);
    setCurrentQuestion(0);
    setQuizState('taking');

    const context = getSyllabusContext();

    try {
      const result = await generateQuiz({
        topic: topic?.title || topic?.topics?.[0] || context.weekData?.topic || 'Quiz',
        numberOfQuestions,
        assessmentCriteria: context.weekData?.assessmentTypes || []
      });

      if (result.success) {
        const quizData = result.quiz?.questions?.length > 0 
          ? result.quiz 
          : { questions: generateMockQuizQuestions(topic, numberOfQuestions) };
        
        setQuiz(quizData);
        // Set timer: 2 minutes per question
        setTimeRemaining(quizData.questions.length * 120);
      } else {
        setError(result.error || 'Failed to generate quiz');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateMockQuizQuestions = (topic, count) => {
    const questions = [
      {
        id: 1,
        type: 'multiple-choice',
        question: 'What is the appropriate morning greeting in Luganda?',
        options: ['Osiibye otya?', 'Wasuze otya?', 'Oli otya?', 'Gyebale ko'],
        correctAnswer: 'Wasuze otya?',
        points: 2,
        explanation: '"Wasuze otya?" literally means "How did you sleep?" and is used as a morning greeting.'
      },
      {
        id: 2,
        type: 'multiple-choice',
        question: 'How do you respond to "Oli otya?"',
        options: ['Wasuze otya', 'Gyendi', 'Webale', 'Nze'],
        correctAnswer: 'Gyendi',
        points: 2,
        explanation: '"Gyendi" means "I\'m fine" and is the common response to "How are you?"'
      },
      {
        id: 3,
        type: 'translate',
        question: 'Translate to English: "Webale nnyo"',
        correctAnswer: 'Thank you very much',
        acceptableAnswers: ['Thank you very much', 'Thank you so much', 'Thanks a lot'],
        points: 3,
        explanation: '"Webale" means "thank you" and "nnyo" intensifies it to mean "very much".'
      },
      {
        id: 4,
        type: 'multiple-choice',
        question: 'When would you use "Osiibye otya?"',
        options: ['Morning only', 'Afternoon and evening', 'Anytime', 'Only with elders'],
        correctAnswer: 'Afternoon and evening',
        points: 2,
        explanation: '"Osiibye otya?" is used later in the day, asking "How has your day been?"'
      },
      {
        id: 5,
        type: 'fill-blank',
        question: 'Complete the phrase: "Gyebale ___" (Thank you for your effort)',
        options: ['nnyo', 'ko', 'otya', 'nze'],
        correctAnswer: 'ko',
        points: 2,
        explanation: '"Gyebale ko" is a polite expression thanking someone for their work or effort.'
      }
    ];
    return questions.slice(0, count);
  };

  const handleAnswer = (answer) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestion]: answer
    });
  };

  const toggleFlag = () => {
    if (flaggedQuestions.includes(currentQuestion)) {
      setFlaggedQuestions(flaggedQuestions.filter(q => q !== currentQuestion));
    } else {
      setFlaggedQuestions([...flaggedQuestions, currentQuestion]);
    }
  };

  const handleSubmitQuiz = async () => {
    setQuizState('reviewing');
    
    // Calculate score
    const results = calculateResults();
    
    // Record score
    recordQuizScore(
      topic?.id || topic,
      results.score,
      results.maxScore
    );

    // Get AI feedback
    try {
      const feedbackResult = await generateFeedback({
        learnerAnswers: userAnswers,
        correctAnswers: quiz.questions.map(q => ({ question: q.question, answer: q.correctAnswer })),
        topicObjectives: topic?.objectives || []
      });

      if (feedbackResult.success) {
        setFeedback(feedbackResult);
      }
    } catch (err) {
      console.error('Failed to get feedback:', err);
    }
  };

  const calculateResults = () => {
    let score = 0;
    let maxScore = 0;
    const details = [];

    quiz.questions.forEach((q, index) => {
      const userAnswer = userAnswers[index];
      const points = q.points || 1;
      maxScore += points;

      let isCorrect = false;
      if (q.type === 'translate') {
        const acceptable = q.acceptableAnswers || [q.correctAnswer];
        isCorrect = acceptable.some(a => 
          a.toLowerCase().trim() === userAnswer?.toLowerCase().trim()
        );
      } else {
        isCorrect = userAnswer === q.correctAnswer;
      }

      if (isCorrect) score += points;

      details.push({
        question: q.question,
        userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        points: isCorrect ? points : 0,
        maxPoints: points,
        explanation: q.explanation
      });
    });

    return { score, maxScore, percentage: Math.round((score / maxScore) * 100), details };
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: 'A', color: '#10b981', message: 'Excellent!' };
    if (percentage >= 80) return { grade: 'B', color: '#6b9fff', message: 'Great job!' };
    if (percentage >= 70) return { grade: 'C', color: '#f59e0b', message: 'Good effort!' };
    if (percentage >= 60) return { grade: 'D', color: '#f97316', message: 'Keep practicing!' };
    return { grade: 'F', color: '#ef4444', message: 'More study needed' };
  };

  if (loading) {
    return (
      <div className="quiz-loading">
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw size={32} />
        </motion.div>
        <p>Preparing your quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-error">
        <p>😔 {error}</p>
        <button onClick={loadQuiz} className="retry-btn">
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    );
  }

  const question = quiz?.questions[currentQuestion];
  const answeredCount = Object.keys(userAnswers).length;

  // Results View
  if (quizState === 'reviewing') {
    const results = calculateResults();
    const gradeInfo = getGrade(results.percentage);

    return (
      <div className="quiz-view results-view">
        <div className="results-header">
          <Trophy size={64} className="trophy-icon" style={{ color: gradeInfo.color }} />
          <h2>Quiz Complete!</h2>
          <p className="topic-name">{topic?.title || topic}</p>
        </div>

        <div className="results-summary">
          <div className="grade-display" style={{ borderColor: gradeInfo.color }}>
            <span className="grade-letter" style={{ color: gradeInfo.color }}>{gradeInfo.grade}</span>
            <span className="grade-message">{gradeInfo.message}</span>
          </div>
          <div className="score-stats">
            <div className="stat">
              <span className="stat-value">{results.percentage}%</span>
              <span className="stat-label">Score</span>
            </div>
            <div className="stat">
              <span className="stat-value">{results.score}/{results.maxScore}</span>
              <span className="stat-label">Points</span>
            </div>
            <div className="stat">
              <span className="stat-value">{results.details.filter(d => d.isCorrect).length}/{quiz.questions.length}</span>
              <span className="stat-label">Correct</span>
            </div>
          </div>
        </div>

        {/* Question Review */}
        <div className="questions-review">
          <h3>Review Your Answers</h3>
          {results.details.map((detail, index) => (
            <motion.div
              key={index}
              className={`review-card ${detail.isCorrect ? 'correct' : 'incorrect'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="review-header">
                <span className="question-num">Q{index + 1}</span>
                {detail.isCorrect ? (
                  <CheckCircle className="status-icon correct" size={20} />
                ) : (
                  <XCircle className="status-icon incorrect" size={20} />
                )}
              </div>
              <p className="review-question">{detail.question}</p>
              <div className="review-answers">
                <div className="your-answer">
                  <span className="label">Your answer:</span>
                  <span className={detail.isCorrect ? 'correct' : 'incorrect'}>
                    {detail.userAnswer || '(No answer)'}
                  </span>
                </div>
                {!detail.isCorrect && (
                  <div className="correct-answer">
                    <span className="label">Correct answer:</span>
                    <span>{detail.correctAnswer}</span>
                  </div>
                )}
              </div>
              {detail.explanation && (
                <div className="explanation">
                  <AlertCircle size={14} />
                  <span>{detail.explanation}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Feedback from AI */}
        {feedback && (
          <div className="ai-feedback">
            <h3>📊 Teacher's Feedback</h3>
            <div className="feedback-content">
              {feedback.feedback?.summary || feedback.raw}
            </div>
            {feedback.encouragement && (
              <p className="encouragement">{feedback.encouragement}</p>
            )}
          </div>
        )}

        <div className="results-actions">
          <button className="action-btn secondary" onClick={loadQuiz}>
            <RefreshCw size={16} /> Retake Quiz
          </button>
          <button className="action-btn primary" onClick={onComplete}>
            <CheckCircle size={16} /> Continue Learning
          </button>
        </div>
      </div>
    );
  }

  // Quiz Taking View
  return (
    <div className="quiz-view">
      {/* Quiz Header */}
      <div className="quiz-header">
        <div className="quiz-title">
          <Award className="quiz-icon" />
          <div>
            <h2>Quiz: {topic?.title || topic}</h2>
            <span className="quiz-subtitle">🧪 Quiz Mode</span>
          </div>
        </div>
        <div className="quiz-timer">
          <Clock size={20} />
          <span className={timeRemaining < 60 ? 'warning' : ''}>
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>

      {/* Progress & Navigation */}
      <div className="quiz-progress-bar">
        <div className="question-dots">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              className={`question-dot ${currentQuestion === index ? 'active' : ''} ${userAnswers[index] !== undefined ? 'answered' : ''} ${flaggedQuestions.includes(index) ? 'flagged' : ''}`}
              onClick={() => setCurrentQuestion(index)}
            >
              {index + 1}
              {flaggedQuestions.includes(index) && <Flag size={8} className="flag-indicator" />}
            </button>
          ))}
        </div>
        <div className="progress-info">
          {answeredCount}/{quiz.questions.length} answered
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          className="quiz-question-card"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
        >
          <div className="question-header">
            <span className="question-number">Question {currentQuestion + 1}</span>
            <span className="question-points">{question.points || 1} pts</span>
            <button 
              className={`flag-btn ${flaggedQuestions.includes(currentQuestion) ? 'flagged' : ''}`}
              onClick={toggleFlag}
              title="Flag for review"
            >
              <Flag size={16} />
            </button>
          </div>

          <h3 className="question-text">{question.question}</h3>

          {/* Answer Options */}
          <div className="quiz-options">
            {(question.type === 'multiple-choice' || question.type === 'fill-blank') && (
              <div className="options-list">
                {question.options?.map((option, index) => (
                  <motion.button
                    key={index}
                    className={`quiz-option ${userAnswers[currentQuestion] === option ? 'selected' : ''}`}
                    onClick={() => handleAnswer(option)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <span className="option-marker">{String.fromCharCode(65 + index)}</span>
                    <span className="option-content">{option}</span>
                  </motion.button>
                ))}
              </div>
            )}

            {question.type === 'translate' && (
              <div className="translate-answer">
                <input
                  type="text"
                  placeholder="Type your answer..."
                  value={userAnswers[currentQuestion] || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="quiz-nav">
            <button 
              className="nav-btn"
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
            >
              <ChevronLeft size={16} /> Previous
            </button>

            {currentQuestion < quiz.questions.length - 1 ? (
              <button 
                className="nav-btn primary"
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button 
                className="submit-quiz-btn"
                onClick={handleSubmitQuiz}
              >
                Submit Quiz <Award size={16} />
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Submit Bar */}
      {answeredCount === quiz.questions.length && (
        <motion.div 
          className="submit-bar"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p>All questions answered! Ready to submit?</p>
          <button className="submit-quiz-btn large" onClick={handleSubmitQuiz}>
            Submit Quiz <Award size={20} />
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default QuizView;
