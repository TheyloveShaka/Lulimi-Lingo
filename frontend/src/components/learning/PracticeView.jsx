/**
 * PracticeView Component
 * 
 * Interactive practice mode with AI-generated questions.
 * Supports fill-in-the-blank, multiple choice, translation, and reordering.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PenTool, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  RefreshCw,
  HelpCircle,
  Lightbulb,
  Award
} from 'lucide-react';
import { generatePractice } from '../../services/aiService';
import { useLearning } from '../../context/LearningContext';
import './PracticeView.css';

const PracticeView = ({ topic, onComplete, onStartQuiz }) => {
  const { getSyllabusContext, recordMistake } = useLearning();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    loadPractice();
  }, [topic]);

  const loadPractice = async () => {
    setLoading(true);
    setError(null);
    setUserAnswers({});
    setCurrentQuestion(0);
    setShowResult(false);

    const context = getSyllabusContext();

    try {
      const result = await generatePractice({
        topic: topic?.title || topic?.topics?.[0] || context.weekData?.topic || 'Practice',
        proficiencyLevel: context.proficiencyLevel,
        commonMistakes: context.commonMistakes
      });

      if (result.success) {
        // Parse questions or use mock data
        const parsedQuestions = result.questions?.length > 0 
          ? result.questions 
          : generateMockQuestions(topic);
        setQuestions(parsedQuestions);
      } else {
        setError(result.error || 'Failed to generate practice');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateMockQuestions = (topic) => {
    return [
      {
        id: 1,
        type: 'fill-blank',
        question: 'Complete: "_____ otya?" (How are you?)',
        options: ['Oli', 'Gwe', 'Nze', 'Ye'],
        correctAnswer: 'Oli',
        hint: 'This is the informal "you" in Luganda'
      },
      {
        id: 2,
        type: 'translate',
        question: 'Translate to Luganda: "Good morning"',
        correctAnswer: 'Wasuze otya',
        acceptableAnswers: ['Wasuze otya', 'Wasuze otya?', 'wasuze otya'],
        hint: 'It literally means "How did you sleep?"'
      },
      {
        id: 3,
        type: 'multiple-choice',
        question: 'What is the correct response to "Oli otya?"',
        options: ['Webale', 'Gyendi', 'Wasuze otya', 'Nze'],
        correctAnswer: 'Gyendi',
        hint: 'It means "I\'m fine"'
      },
      {
        id: 4,
        type: 'fill-blank',
        question: 'Complete: "Gyebale _____" (Thank you for your work)',
        options: ['ko', 'nyo', 'nnyo', 'otya'],
        correctAnswer: 'ko',
        hint: 'This is a common polite expression'
      },
      {
        id: 5,
        type: 'multiple-choice',
        question: 'When would you use "Osiibye otya?"',
        options: ['In the morning', 'In the afternoon/evening', 'At midnight', 'Never'],
        correctAnswer: 'In the afternoon/evening',
        hint: 'Think about what time of day this greeting refers to'
      }
    ];
  };

  const handleAnswer = (answer) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestion]: answer
    });
  };

  const checkAnswer = () => {
    const question = questions[currentQuestion];
    const userAnswer = userAnswers[currentQuestion];
    
    if (!userAnswer) return null;

    if (question.type === 'translate') {
      const acceptable = question.acceptableAnswers || [question.correctAnswer];
      return acceptable.some(a => 
        a.toLowerCase().trim() === userAnswer.toLowerCase().trim()
      );
    }
    
    return userAnswer === question.correctAnswer;
  };

  const handleSubmitAnswer = () => {
    setShowResult(true);
    
    // Record mistake if incorrect
    if (!checkAnswer()) {
      recordMistake({
        type: questions[currentQuestion].type,
        topic: topic?.title || topic,
        question: questions[currentQuestion].question
      });
    }
  };

  const handleNextQuestion = () => {
    setShowResult(false);
    setShowHint(false);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, index) => {
      const answer = userAnswers[index];
      if (q.type === 'translate') {
        const acceptable = q.acceptableAnswers || [q.correctAnswer];
        if (acceptable.some(a => a.toLowerCase().trim() === answer?.toLowerCase().trim())) {
          correct++;
        }
      } else if (answer === q.correctAnswer) {
        correct++;
      }
    });
    return { correct, total: questions.length, percentage: Math.round((correct / questions.length) * 100) };
  };

  const allAnswered = Object.keys(userAnswers).length === questions.length;
  const isComplete = allAnswered && currentQuestion === questions.length - 1 && showResult;

  if (loading) {
    return (
      <div className="practice-loading">
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw size={32} />
        </motion.div>
        <p>Preparing practice questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="practice-error">
        <p>😔 {error}</p>
        <button onClick={loadPractice} className="retry-btn">
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const isCorrect = showResult ? checkAnswer() : null;

  return (
    <div className="practice-view">
      {/* Header */}
      <div className="practice-header">
        <div className="practice-title">
          <PenTool className="practice-icon" />
          <div>
            <h2>Practice Time</h2>
            <span className="practice-subtitle">✍🏾 Practice Mode</span>
          </div>
        </div>
        <div className="practice-progress">
          <div className="question-counter">
            Question {currentQuestion + 1} of {questions.length}
          </div>
          <div className="progress-bar-practice">
            <motion.div 
              className="progress-fill-practice"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          className="question-card"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
        >
          {/* Question Type Badge */}
          <div className="question-type-badge">
            {question.type === 'fill-blank' && '📝 Fill in the Blank'}
            {question.type === 'translate' && '🔄 Translation'}
            {question.type === 'multiple-choice' && '✅ Multiple Choice'}
            {question.type === 'reorder' && '🔀 Reorder'}
          </div>

          {/* Question Text */}
          <h3 className="question-text">{question.question}</h3>

          {/* Answer Input */}
          <div className="answer-section">
            {(question.type === 'multiple-choice' || question.type === 'fill-blank') && (
              <div className="options-grid">
                {question.options?.map((option, index) => (
                  <motion.button
                    key={index}
                    className={`option-btn ${userAnswers[currentQuestion] === option ? 'selected' : ''} ${showResult && option === question.correctAnswer ? 'correct' : ''} ${showResult && userAnswers[currentQuestion] === option && option !== question.correctAnswer ? 'incorrect' : ''}`}
                    onClick={() => !showResult && handleAnswer(option)}
                    whileHover={!showResult ? { scale: 1.02 } : {}}
                    whileTap={!showResult ? { scale: 0.98 } : {}}
                    disabled={showResult}
                  >
                    <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                    <span className="option-text">{option}</span>
                    {showResult && option === question.correctAnswer && (
                      <CheckCircle className="result-icon correct" size={20} />
                    )}
                    {showResult && userAnswers[currentQuestion] === option && option !== question.correctAnswer && (
                      <XCircle className="result-icon incorrect" size={20} />
                    )}
                  </motion.button>
                ))}
              </div>
            )}

            {question.type === 'translate' && (
              <div className="translate-input">
                <input
                  type="text"
                  placeholder="Type your translation here..."
                  value={userAnswers[currentQuestion] || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  disabled={showResult}
                  className={showResult ? (isCorrect ? 'correct' : 'incorrect') : ''}
                />
                {showResult && (
                  <div className="translate-result">
                    {isCorrect ? (
                      <span className="correct-msg">
                        <CheckCircle size={16} /> Correct!
                      </span>
                    ) : (
                      <span className="incorrect-msg">
                        <XCircle size={16} /> Correct answer: {question.correctAnswer}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hint Section */}
          {!showResult && (
            <button 
              className="hint-btn"
              onClick={() => setShowHint(!showHint)}
            >
              <HelpCircle size={16} />
              {showHint ? 'Hide Hint' : 'Need a Hint?'}
            </button>
          )}
          
          <AnimatePresence>
            {showHint && !showResult && (
              <motion.div
                className="hint-box"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Lightbulb size={16} />
                <span>{question.hint}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result Feedback */}
          {showResult && (
            <motion.div
              className={`result-feedback ${isCorrect ? 'correct' : 'incorrect'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {isCorrect ? (
                <>
                  <CheckCircle size={24} />
                  <span>Excellent! That's correct! 🎉</span>
                </>
              ) : (
                <>
                  <XCircle size={24} />
                  <span>Not quite. The correct answer is: <strong>{question.correctAnswer}</strong></span>
                </>
              )}
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="question-actions">
            {!showResult ? (
              <button 
                className="submit-btn"
                onClick={handleSubmitAnswer}
                disabled={!userAnswers[currentQuestion]}
              >
                Check Answer
              </button>
            ) : currentQuestion < questions.length - 1 ? (
              <button className="next-btn" onClick={handleNextQuestion}>
                Next Question <ChevronRight size={16} />
              </button>
            ) : (
              <button className="finish-btn" onClick={() => setCurrentQuestion(questions.length)}>
                See Results <Award size={16} />
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Results Summary */}
      {isComplete && (
        <motion.div
          className="practice-results"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {(() => {
            const score = calculateScore();
            return (
              <>
                <div className="results-header">
                  <Award size={48} className="results-icon" />
                  <h3>Practice Complete!</h3>
                </div>
                <div className="score-display">
                  <div className="score-circle">
                    <span className="score-number">{score.percentage}%</span>
                    <span className="score-label">{score.correct}/{score.total}</span>
                  </div>
                </div>
                <p className="score-message">
                  {score.percentage >= 80 
                    ? "Excellent work! You've mastered this topic! 🌟" 
                    : score.percentage >= 60 
                      ? "Good job! A little more practice will help! 💪"
                      : "Keep practicing! You're making progress! 📚"}
                </p>
                <div className="results-actions">
                  <button className="action-btn secondary" onClick={loadPractice}>
                    <RefreshCw size={16} /> Practice Again
                  </button>
                  <button className="action-btn primary" onClick={onStartQuiz}>
                    <Award size={16} /> Take Quiz
                  </button>
                </div>
              </>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
};

export default PracticeView;
