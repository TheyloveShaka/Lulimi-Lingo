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
import { generateCurriculumPractice, getTermCurriculum } from '../../services/curriculumService';
import { upsertProgress } from '../../services/progressService';
import { useLearning } from '../../context/LearningContext';
import './PracticeView.css';

const normalizeText = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/[’']/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const findMatchingMilestone = (termData, topicText) => {
  const target = normalizeText(topicText);
  if (!target || !Array.isArray(termData?.milestones)) return null;

  return termData.milestones.find((milestone) => {
    const milestoneValues = [
      milestone?.milestone_name,
      milestone?.topic,
      milestone?.title,
      ...(Array.isArray(milestone?.topics) ? milestone.topics : [])
    ]
      .filter(Boolean)
      .map(normalizeText);

    return milestoneValues.some((candidate) => candidate === target || candidate.includes(target) || target.includes(candidate));
  }) || null;
};

const mapCurriculumScenarioToQuestion = (scenario, index) => {
  const promptText = scenario?.independent?.situation || scenario?.context || scenario?.guided?.instructions || `Scenario ${index + 1}`;
  const modelAnswer = scenario?.model_answer || scenario?.independent?.model_answer || scenario?.guided?.model_or_example || scenario?.feedback || '';

  return {
    id: scenario?.scenario_id || index + 1,
    type: 'translate',
    question: String(promptText),
    options: [],
    correctAnswer: String(modelAnswer),
    acceptableAnswers: modelAnswer ? [String(modelAnswer)] : undefined,
    hint: scenario?.guided?.instructions || scenario?.feedback || 'Use the lesson vocabulary and structure.',
    explanation: scenario?.feedback || String(modelAnswer)
  };
};

const extractCurriculumQuestions = (content) => {
  if (!content) return [];
  if (Array.isArray(content.questions)) return content.questions;
  if (Array.isArray(content.scenarios)) return content.scenarios.map(mapCurriculumScenarioToQuestion);
  return [];
};

const PracticeView = ({ topic, onComplete, onStartQuiz }) => {
  const { getSyllabusContext, recordMistake } = useLearning();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCached, setIsCached] = useState(false);
  const [provider, setProvider] = useState('openai');
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [hasSavedSummary, setHasSavedSummary] = useState(false);

  const loadingMessages = [
    'Practice builds confidence.',
    'Every attempt sharpens your language skills.',
    'Consistency today, fluency tomorrow.'
  ];

  const normalizeQuestionType = (type, questionText = '', options = []) => {
    const raw = String(type || '').toLowerCase().replace(/[\s_]+/g, '-');
    const prompt = String(questionText || '').toLowerCase();

    if (raw.includes('multiple') || raw.includes('choice') || raw === 'mcq') return 'multiple-choice';
    if (raw.includes('fill') || raw.includes('blank')) return 'fill-blank';
    if (raw.includes('translate') || raw.includes('translation')) return 'translate';
    if (raw.includes('reorder') || raw.includes('arrange')) return 'reorder';

    if (prompt.includes('translate')) return 'translate';
    if (prompt.includes('fill') || prompt.includes('blank')) return 'fill-blank';
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

    const correctAnswer =
      question?.correctAnswer ??
      question?.correct_answer ??
      question?.answer ??
      question?.correct ??
      '';

    return {
      id: question?.id || index + 1,
      type: normalizeQuestionType(question?.type || question?.questionType || question?.question_type, question?.question, normalizedOptions),
      question: String(question?.question || question?.prompt || `Practice question ${index + 1}`),
      options: normalizedOptions,
      correctAnswer: String(correctAnswer),
      acceptableAnswers: Array.isArray(question?.acceptableAnswers)
        ? question.acceptableAnswers
        : Array.isArray(question?.acceptable_answers)
          ? question.acceptable_answers
          : undefined,
      hint: question?.hint || question?.clue || 'Think about common usage.',
      explanation: question?.explanation || ''
    };
  };

  useEffect(() => {
    loadPractice();
  }, [topic]);

  useEffect(() => {
    if (!loading) return;
    const timer = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1300);
    return () => clearInterval(timer);
  }, [loading]);

  const loadPractice = async () => {
    setLoading(true);
    setError(null);
    setUserAnswers({});
    setCurrentQuestion(0);
    setShowResult(false);
    setShowSummary(false);

    const context = getSyllabusContext();
    const classLevel = context.classLevel || context.class || topic?.classLevel || topic?.class || 'S1';
    const term = context.term || context.weekData?.term || topic?.term || 1;
    const topicTitle = topic?.title || topic?.topics?.[0] || context.weekData?.topic || 'Practice';

    try {
      const termCurriculum = await getTermCurriculum(classLevel, term);
      const matchingMilestone = findMatchingMilestone(termCurriculum?.data, topicTitle)
        || findMatchingMilestone(termCurriculum?.data, context.weekData?.topic)
        || termCurriculum?.data?.milestones?.[0];

      if (termCurriculum.success && matchingMilestone?.id) {
        const curriculumResult = await generateCurriculumPractice(classLevel, term, matchingMilestone.id, topicTitle, 4);
        const curriculumQuestions = extractCurriculumQuestions(curriculumResult?.content)
          .map((q, idx) => normalizeQuestion(q, idx));

        if (curriculumResult.success && curriculumQuestions.length > 0) {
          setQuestions(curriculumQuestions);
          setIsCached(Boolean(curriculumResult.cached));
          setProvider(curriculumResult.provider || 'curriculum');
          return;
        }
      }

      const result = await generatePractice({
        topic: topicTitle,
        proficiencyLevel: context.proficiencyLevel,
        commonMistakes: context.commonMistakes,
        language: context.language,
        topicObjectives: context.weekData?.objectives || []
      });

      if (result.success) {
        const parsedQuestions = result.questions?.length > 0
          ? result.questions.map((q, idx) => normalizeQuestion(q, idx))
          : generateMockQuestions(topic);
        setQuestions(parsedQuestions);
        setIsCached(Boolean(result.cached));
        setProvider(result.provider || 'openai');
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
        hint: 'This is the informal "you" in Luganda',
        explanation: 'Use the singular informal "you" in this greeting.'
      },
      {
        id: 2,
        type: 'translate',
        question: 'Translate to Luganda: "Good morning"',
        correctAnswer: 'Wasuze otya',
        acceptableAnswers: ['Wasuze otya', 'Wasuze otya?', 'wasuze otya'],
        hint: 'It literally means "How did you sleep?"',
        explanation: 'This is the standard Luganda morning greeting.'
      },
      {
        id: 3,
        type: 'multiple-choice',
        question: 'What is the correct response to "Oli otya?"',
        options: ['Webale', 'Gyendi', 'Wasuze otya', 'Nze'],
        correctAnswer: 'Gyendi',
        hint: 'It means "I\'m fine"',
        explanation: '"Gyendi" is the polite response to "How are you?"'
      },
      {
        id: 4,
        type: 'fill-blank',
        question: 'Complete: "Gyebale _____" (Thank you for your work)',
        options: ['ko', 'nyo', 'nnyo', 'otya'],
        correctAnswer: 'ko',
        hint: 'This is a common polite expression',
        explanation: '"Gyebale ko" thanks someone for their effort.'
      },
      {
        id: 5,
        type: 'multiple-choice',
        question: 'When would you use "Osiibye otya?"',
        options: ['In the morning', 'In the afternoon/evening', 'At midnight', 'Never'],
        correctAnswer: 'In the afternoon/evening',
        hint: 'Think about what time of day this greeting refers to',
        explanation: 'This greeting is used later in the day.'
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

    if (question.type === 'translate' || question.type === 'fill-blank') {
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
      if (q.type === 'translate' || q.type === 'fill-blank') {
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
  const isComplete = showSummary && allAnswered;

  useEffect(() => {
    if (!isComplete || hasSavedSummary) return;

    const persistSummary = async () => {
      try {
        const context = getSyllabusContext();
        const currentUser = JSON.parse(localStorage.getItem('lulimiLingoCurrentUser') || 'null');
        const score = calculateScore();

        if (currentUser?._id) {
          await upsertProgress(currentUser._id, {
            weekId: context.week,
            language: context.language,
            proficiencyLevel: context.proficiencyLevel,
            practiceAttempt: {
              practiceId: topic?.id || topic?.title || topic || 'practice',
              score: score.correct,
              totalQuestions: score.total,
              percentage: score.percentage
            }
          });
        }
      } catch (err) {
        console.error('Failed to persist practice attempt:', err);
      } finally {
        setHasSavedSummary(true);
      }
    };

    persistSummary();
  }, [isComplete, hasSavedSummary, getSyllabusContext, topic, userAnswers]);

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
        <span className="practice-loading-message">{loadingMessages[loadingMessageIndex]}</span>
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
  const currentAnswer = userAnswers[currentQuestion];
  const formattedCurrentAnswer = typeof currentAnswer === 'string'
    ? currentAnswer.trim()
    : Array.isArray(currentAnswer)
      ? currentAnswer.join(' ')
      : currentAnswer || '';

  return (
    <div className="practice-view">
      {/* Header */}
      <div className="practice-header">
        <div className="practice-title">
          <PenTool className="practice-icon" />
          <div>
            <h2>Practice Time</h2>
            <span className="practice-subtitle">✍🏾 Practice Mode</span>
            <div className="practice-meta-tags">
              <span className="practice-meta-tag">{provider === 'openai' ? 'GPT-4o' : 'Gemini fallback'}</span>
              {isCached && <span className="practice-meta-tag cached">Reused from library</span>}
            </div>
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
      {!showSummary && question && (
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
            {(question.type === 'multiple-choice' || (question.type === 'fill-blank' && question.options?.length > 0)) && (
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

            {question.type === 'fill-blank' && (!question.options || question.options.length === 0) && (
              <div className="translate-input">
                <input
                  type="text"
                  placeholder="Type the missing word..."
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

            {(question.type === 'translate' || question.type === 'reorder') && (
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
              {!isCorrect && question.explanation && (
                <span className="brief-explanation">{question.explanation}</span>
              )}
            </motion.div>
          )}

          {showResult && (
            <motion.div
              className={`answer-review-card ${isCorrect ? 'correct' : 'incorrect'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="answer-review-row">
                <span className="answer-review-label">Your answer</span>
                <span className={`answer-review-value ${isCorrect ? 'correct' : 'incorrect'}`}>
                  {formattedCurrentAnswer || 'No answer'}
                </span>
              </div>
              {!isCorrect && (
                <div className="answer-review-row">
                  <span className="answer-review-label">Correct answer</span>
                  <span className="answer-review-value correct">{question.correctAnswer}</span>
                </div>
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
                Next Practice Question <ChevronRight size={16} />
              </button>
            ) : (
              <button className="finish-btn" onClick={() => setShowSummary(true)}>
                Finish Practice <Award size={16} />
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
      )}

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
