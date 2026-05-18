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
import { upsertProgress } from '../../services/progressService';
import { useLearning } from '../../context/LearningContext';
import './QuizView.css';

const QuizView = ({ topic, onComplete, numberOfQuestions = 5 }) => {
  const { getSyllabusContext, recordQuizScore } = useLearning();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCached, setIsCached] = useState(false);
  const [provider, setProvider] = useState('openai');
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [quizState, setQuizState] = useState('taking'); // 'taking', 'submitting', 'reviewing'
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [quizDuration, setQuizDuration] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [submittedResults, setSubmittedResults] = useState(null);

  const loadingMessages = [
    'Challenge improves mastery.',
    'Strong foundations come from steady revision.',
    'You are training your memory and confidence.'
  ];

  const normalizeQuestionType = (type, questionText = '', options = []) => {
    const raw = String(type || '').toLowerCase().replace(/[\s_]+/g, '-');
    const prompt = String(questionText || '').toLowerCase();

    if (raw.includes('multiple') || raw.includes('choice') || raw === 'mcq') return 'multiple-choice';
    if (raw.includes('fill') || raw.includes('blank')) return 'fill-blank';
    if (raw.includes('translate') || raw.includes('translation')) return 'translate';
    if (raw.includes('reorder') || raw.includes('arrange')) return 'reorder';
    if (raw.includes('true-false') || raw.includes('truefalse') || raw === 'tf') return 'true-false';
    if (raw.includes('match')) return 'matching';

    if (prompt.includes('translate')) return 'translate';
    if (prompt.includes('fill') || prompt.includes('blank')) return 'fill-blank';
    if (Array.isArray(options) && options.length === 2 && options.every((opt) => ['true', 'false'].includes(String(opt).toLowerCase()))) {
      return 'true-false';
    }
    if (Array.isArray(options) && options.length > 0) return 'multiple-choice';
    return 'translate';
  };

  const normalizeQuestion = (question, index) => {
    const options =
      question?.options ||
      question?.choices ||
      question?.answerOptions ||
      question?.answer_options ||
      [];

    const normalizedOptions = Array.isArray(options)
      ? options.map((opt) => String(opt))
      : [];

    const pairsSource =
      question?.pairs ||
      question?.matchingPairs ||
      question?.matching_pairs ||
      question?.matches ||
      [];

    const normalizedPairs = Array.isArray(pairsSource)
      ? pairsSource
          .map((pair) => {
            if (Array.isArray(pair)) {
              return { left: String(pair[0]), right: String(pair[1]) };
            }
            return {
              left: String(pair?.left ?? pair?.prompt ?? pair?.term ?? ''),
              right: String(pair?.right ?? pair?.answer ?? pair?.match ?? '')
            };
          })
          .filter((pair) => pair.left && pair.right)
      : [];

    const tokensSource =
      question?.tokens ||
      question?.items ||
      question?.wordBank ||
      question?.word_bank ||
      question?.shuffle ||
      [];

    const normalizedTokens = Array.isArray(tokensSource)
      ? tokensSource.map((token) => String(token))
      : [];

    const orderSource =
      question?.correctOrder ||
      question?.correct_order ||
      question?.order ||
      question?.sequence ||
      [];

    const normalizedOrder = Array.isArray(orderSource)
      ? orderSource.map((token) => String(token))
      : [];

    const correctAnswer =
      question?.correctAnswer ??
      question?.correct_answer ??
      question?.answer ??
      question?.correct ??
      '';

    let normalizedType = normalizeQuestionType(
      question?.type || question?.questionType || question?.question_type,
      question?.question,
      normalizedOptions
    );

    if (normalizedPairs.length > 0) {
      normalizedType = 'matching';
    }

    if (normalizedOrder.length > 0 && normalizedTokens.length > 0) {
      normalizedType = 'reorder';
    }

    return {
      id: question?.id || index + 1,
      type: normalizedType,
      question: String(question?.question || question?.prompt || `Question ${index + 1}`),
      options: normalizedType === 'true-false' && normalizedOptions.length === 0
        ? ['True', 'False']
        : normalizedOptions,
      correctAnswer: String(correctAnswer),
      acceptableAnswers: Array.isArray(question?.acceptableAnswers)
        ? question.acceptableAnswers
        : Array.isArray(question?.acceptable_answers)
          ? question.acceptable_answers
          : undefined,
      points: Number(question?.points || 1),
      explanation: question?.explanation || '',
      pairs: normalizedPairs,
      tokens: normalizedTokens,
      correctOrder: normalizedOrder
    };
  };

  const normalizeQuiz = (quizData) => {
    const sourceQuestions = Array.isArray(quizData?.questions) ? quizData.questions : [];
    return {
      ...quizData,
      questions: sourceQuestions.map((q, idx) => normalizeQuestion(q, idx))
    };
  };

  const formatFeedbackParagraphs = (text) => {
    const source = String(text || '').trim();
    if (!source) return [];
    return source
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  };

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

  useEffect(() => {
    if (!loading) return;
    const timer = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1300);
    return () => clearInterval(timer);
  }, [loading]);

  const loadQuiz = async () => {
    setLoading(true);
    setError(null);
    setUserAnswers({});
    setFlaggedQuestions([]);
    setCurrentQuestion(0);
    setQuizState('taking');
    setSubmittedResults(null);
    setFeedback(null);

    const context = getSyllabusContext();

    try {
      const result = await generateQuiz({
        topic: topic?.title || topic?.topics?.[0] || context.weekData?.topic || 'Quiz',
        numberOfQuestions,
        assessmentCriteria: context.weekData?.assessmentTypes || [],
        language: context.language,
        proficiencyLevel: context.proficiencyLevel
      });

      if (result.success) {
        const quizData = result.quiz?.questions?.length > 0
          ? normalizeQuiz(result.quiz)
          : { questions: generateMockQuizQuestions(topic, numberOfQuestions) };
        
        setQuiz(quizData);
        setIsCached(Boolean(result.cached));
        setProvider(result.provider || 'openai');
        // Set timer: 2 minutes per question
        const duration = quizData.questions.length * 120;
        setTimeRemaining(duration);
        setQuizDuration(duration);
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
        type: 'true-false',
        question: 'True or False: "Webale" means "thank you" in Luganda.',
        options: ['True', 'False'],
        correctAnswer: 'True',
        points: 1,
        explanation: '"Webale" is the standard way to say thank you.'
      },
      {
        id: 3,
        type: 'matching',
        question: 'Match the Luganda phrase to its meaning.',
        pairs: [
          { left: 'Gyendi', right: "I'm fine" },
          { left: 'Webale', right: 'Thank you' },
          { left: 'Weraba', right: 'Goodbye' }
        ],
        correctAnswer: 'All pairs matched',
        points: 3,
        explanation: 'These are common Luganda greetings and responses.'
      },
      {
        id: 4,
        type: 'reorder',
        question: 'Arrange the words to form a polite greeting.',
        tokens: ['otya?', 'Wasuze'],
        correctOrder: ['Wasuze', 'otya?'],
        correctAnswer: 'Wasuze otya?',
        points: 2,
        explanation: '"Wasuze otya?" means "How did you sleep?" and is used as a morning greeting.'
      },
      {
        id: 5,
        type: 'fill-blank',
        question: 'Complete the phrase: "Gyebale ___" (Thank you for your effort)',
        options: ['nnyo', 'ko', 'otya', 'nze'],
        correctAnswer: 'ko',
        points: 2,
        explanation: '"Gyebale ko" is a polite expression thanking someone for their work or effort.'
      },
      {
        id: 6,
        type: 'translate',
        question: 'Translate to English: "Webale nnyo"',
        correctAnswer: 'Thank you very much',
        acceptableAnswers: ['Thank you very much', 'Thank you so much', 'Thanks a lot'],
        points: 3,
        explanation: '"Webale" means "thank you" and "nnyo" intensifies it to mean "very much".'
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

  const handleMatchingChange = (leftItem, rightItem) => {
    const existing = userAnswers[currentQuestion] || {};
    setUserAnswers({
      ...userAnswers,
      [currentQuestion]: {
        ...existing,
        [leftItem]: rightItem
      }
    });
  };

  const handleReorderMove = (index, direction) => {
    if (!question) return;
    const current = Array.isArray(userAnswers[currentQuestion])
      ? [...userAnswers[currentQuestion]]
      : [...question.tokens];

    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= current.length) return;

    const updated = [...current];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;

    setUserAnswers({
      ...userAnswers,
      [currentQuestion]: updated
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
    if (quizState !== 'taking') return;

    const results = calculateResults();
    const context = getSyllabusContext();
    setSubmittedResults(results);
    setQuizState('reviewing');
    recordQuizScore(
      topic?.id || topic,
      results.score,
      results.maxScore
    );

    // Notify parent immediately so the modal can switch to a Results tab.
    try {
      if (typeof onComplete === 'function') {
        onComplete(results, null);
      }
    } catch (err) {
      console.error('onComplete callback failed:', err);
    }

    (async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem('lulimiLingoCurrentUser') || 'null');
        const timeSpent = quizDuration && timeRemaining !== null
          ? Math.max(0, quizDuration - timeRemaining)
          : null;

        if (currentUser?._id) {
          await upsertProgress(currentUser._id, {
            weekId: context.week,
            language: context.language,
            proficiencyLevel: context.proficiencyLevel,
            quizAttempt: {
              quizId: topic?.id || topic?.title || topic || 'quiz',
              score: results.score,
              maxScore: results.maxScore,
              percentage: results.percentage,
              timeSpent
            }
          });
        }

        const feedbackResult = await generateFeedback({
          learnerAnswers: userAnswers,
          correctAnswers: quiz.questions.map(q => ({ question: q.question, answer: q.correctAnswer })),
          topicObjectives: topic?.objectives || [],
          language: context.language
        });

        if (feedbackResult.success) {
          setFeedback(feedbackResult);
          // Inform parent that feedback is now available
          try {
            if (typeof onComplete === 'function') {
              onComplete(results, feedbackResult);
            }
          } catch (err) {
            console.error('onComplete callback failed (feedback):', err);
          }
        }
      } catch (err) {
        console.error('Failed to persist quiz attempt or get feedback:', err);
      }
    })();
  };

  const formatAnswerForReview = (question, answer) => {
    if (question.type === 'matching') {
      const selections = answer || {};
      const pairs = question.pairs || [];
      return pairs
        .map((pair) => `${pair.left} → ${selections[pair.left] || '—'}`)
        .join(', ');
    }

    if (question.type === 'reorder') {
      const ordered = Array.isArray(answer) ? answer : [];
      return ordered.length > 0 ? ordered.join(' ') : '';
    }

    return typeof answer === 'string' ? answer : '';
  };

  const formatCorrectAnswer = (question) => {
    if (question.type === 'matching') {
      return (question.pairs || [])
        .map((pair) => `${pair.left} → ${pair.right}`)
        .join(', ');
    }

    if (question.type === 'reorder') {
      return (question.correctOrder || []).join(' ');
    }

    return question.correctAnswer || '';
  };

  const isAnswerCorrect = (question, answer) => {
    if (answer === null || answer === undefined || answer === '') {
      return false;
    }

    if (question.type === 'translate' || question.type === 'fill-blank') {
      const acceptable = question.acceptableAnswers || [question.correctAnswer];
      return acceptable.some(a => 
        String(a).toLowerCase().trim() === String(answer).toLowerCase().trim()
      );
    }

    if (question.type === 'matching') {
      const selections = answer || {};
      const expectedPairs = question.pairs || [];
      return expectedPairs.length > 0 && expectedPairs.every((pair) => selections[pair.left] === pair.right);
    }

    if (question.type === 'reorder') {
      const expected = question.correctOrder || [];
      const provided = Array.isArray(answer) ? answer : [];
      return expected.length > 0 && expected.every((token, idx) => token === provided[idx]);
    }

    return String(answer).trim() === String(question.correctAnswer).trim();
  };

  const calculateResults = () => {
    let score = 0;
    let maxScore = 0;
    const details = [];

    quiz.questions.forEach((q, index) => {
      const userAnswer = userAnswers[index];
      const points = q.points || 1;
      maxScore += points;

      const isCorrect = isAnswerCorrect(q, userAnswer);

      if (isCorrect) score += points;

      const formattedUserAnswer = formatAnswerForReview(q, userAnswer);
      const formattedCorrect = formatCorrectAnswer(q);
      const explanation = q.explanation || (formattedCorrect ? `Correct answer: ${formattedCorrect}.` : 'Review this concept and try again.');

      details.push({
        question: q.question,
        userAnswer: formattedUserAnswer,
        correctAnswer: formattedCorrect,
        isCorrect,
        points: isCorrect ? points : 0,
        maxPoints: points,
        explanation
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
        <span className="quiz-loading-message">{loadingMessages[loadingMessageIndex]}</span>
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
  const answeredCount = quiz?.questions.reduce((count, q, index) => {
    const answer = userAnswers[index];
    if (q.type === 'matching') {
      const expected = q.pairs || [];
      const selections = answer || {};
      return expected.length > 0 && expected.every((pair) => selections[pair.left]) ? count + 1 : count;
    }
    if (q.type === 'reorder') {
      return Array.isArray(answer) && answer.length > 0 ? count + 1 : count;
    }
    return answer !== undefined && answer !== '' ? count + 1 : count;
  }, 0);

  if (quizState === 'submitting') {
    return (
      <div className="quiz-view submitting-view">
        <motion.div
          className="grading-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="grading-orb"
            animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <h2>Grading your quiz...</h2>
          <p>Checking answers and preparing feedback.</p>
        </motion.div>
      </div>
    );
  }

  // Results View
  if (quizState === 'reviewing') {
    const results = submittedResults || calculateResults();
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
              {!detail.isCorrect && detail.explanation && (
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
            <div className="feedback-content feedback-content-polished">
              {formatFeedbackParagraphs(feedback.feedback?.summary || feedback.raw).map((paragraph, index) => (
                <div key={index} className="feedback-paragraph">
                  {paragraph}
                </div>
              ))}
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
            <div className="quiz-meta-tags">
              <span className="quiz-meta-tag">{provider === 'openai' ? 'GPT-4o' : 'Gemini fallback'}</span>
              {isCached && <span className="quiz-meta-tag cached">Library-backed</span>}
            </div>
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
            {(question.type === 'multiple-choice' || question.type === 'true-false' || (question.type === 'fill-blank' && question.options?.length > 0)) && (
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

            {question.type === 'fill-blank' && (!question.options || question.options.length === 0) && (
              <div className="translate-answer">
                <input
                  type="text"
                  placeholder="Type the missing word..."
                  value={userAnswers[currentQuestion] || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  disabled={quizState !== 'taking'}
                />
              </div>
            )}

            {(question.type === 'translate') && (
              <div className="translate-answer">
                <input
                  type="text"
                  placeholder="Type your answer..."
                  value={userAnswers[currentQuestion] || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                />
              </div>
            )}

            {question.type === 'matching' && (
              <div className="matching-grid">
                <div className="matching-header">
                  <span>Match each item</span>
                  <span>Choose the pair</span>
                </div>
                {(question.pairs || []).map((pair, index) => (
                  <div key={`${pair.left}-${index}`} className="matching-row">
                    <span className="matching-left">{pair.left}</span>
                    <select
                      className="matching-select"
                      value={(userAnswers[currentQuestion] || {})[pair.left] || ''}
                      onChange={(e) => handleMatchingChange(pair.left, e.target.value)}
                    >
                      <option value="" disabled>Choose...</option>
                      {(question.pairs || []).map((optionPair) => (
                        <option key={`${pair.left}-${optionPair.right}`} value={optionPair.right}>
                          {optionPair.right}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}

            {question.type === 'reorder' && (
              <div className="reorder-list">
                {(Array.isArray(userAnswers[currentQuestion]) && userAnswers[currentQuestion].length > 0
                  ? userAnswers[currentQuestion]
                  : question.tokens
                ).map((token, index) => (
                  <div key={`${token}-${index}`} className="reorder-item">
                    <span>{token}</span>
                    <div className="reorder-controls">
                      <button onClick={() => handleReorderMove(index, -1)} aria-label="Move up">▲</button>
                      <button onClick={() => handleReorderMove(index, 1)} aria-label="Move down">▼</button>
                    </div>
                  </div>
                ))}
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
