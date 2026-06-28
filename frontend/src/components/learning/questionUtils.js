const normalizeText = (value) => String(value ?? '').trim().toLowerCase();

export const normalizeQuestionType = (type, questionText = '', options = []) => {
  const raw = String(type || '').toLowerCase().replace(/[\s_]+/g, '-');
  const prompt = String(questionText || '').toLowerCase();

  // Reading-comprehension renders a passage, then answers like an MCQ (or text).
  if (raw.includes('reading') || raw.includes('comprehension') || raw.includes('passage')) {
    return Array.isArray(options) && options.length > 0 ? 'multiple-choice' : 'translate';
  }
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

export const normalizeQuestion = (question, index) => {
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

  const passage = question?.passage || question?.reading || question?.readingPassage || question?.reading_passage || '';

  return {
    id: question?.id || index + 1,
    type: normalizedType,
    passage: passage ? String(passage) : '',
    question: String(question?.question || question?.prompt || `Question ${index + 1}`),
    options: normalizedType === 'true-false' && normalizedOptions.length === 0
      ? ['True', 'False']
      : normalizedOptions,
    correctAnswer: String(correctAnswer),
    acceptableAnswers: Array.isArray(question?.acceptableAnswers)
      ? question.acceptableAnswers.map((answer) => String(answer))
      : Array.isArray(question?.acceptable_answers)
        ? question.acceptable_answers.map((answer) => String(answer))
        : undefined,
    points: Number(question?.points || 1),
    hint: question?.hint || question?.clue || 'Think about common usage.',
    explanation: question?.explanation || '',
    pairs: normalizedPairs,
    tokens: normalizedTokens,
    correctOrder: normalizedOrder
  };
};

export const normalizeQuestions = (questions = []) => {
  if (!Array.isArray(questions)) return [];
  return questions.map((question, index) => normalizeQuestion(question, index));
};

export const isQuestionAnswered = (question, answer) => {
  if (!question) return false;

  if (question.type === 'matching') {
    const expected = question.pairs || [];
    const selections = answer || {};
    return expected.length > 0 && expected.every((pair) => selections[pair.left]);
  }

  if (question.type === 'reorder') {
    if (Array.isArray(answer)) return answer.length > 0;
    return String(answer || '').trim().length > 0;
  }

  return answer !== undefined && answer !== null && String(answer).trim() !== '';
};

export const formatAnswerForReview = (question, answer) => {
  if (question.type === 'matching') {
    const selections = answer || {};
    const pairs = question.pairs || [];
    return pairs
      .map((pair) => `${pair.left} -> ${selections[pair.left] || '-'}`)
      .join(', ');
  }

  if (question.type === 'reorder') {
    if (Array.isArray(answer)) {
      return answer.length > 0 ? answer.join(' ') : '';
    }
    return String(answer || '').trim();
  }

  return typeof answer === 'string' ? answer : String(answer || '');
};

export const formatCorrectAnswer = (question) => {
  if (question.type === 'matching') {
    return (question.pairs || [])
      .map((pair) => `${pair.left} -> ${pair.right}`)
      .join(', ');
  }

  if (question.type === 'reorder') {
    if (Array.isArray(question.correctOrder) && question.correctOrder.length > 0) {
      return question.correctOrder.join(' ');
    }
  }

  return question.correctAnswer || '';
};

export const isAnswerCorrect = (question, answer) => {
  if (!isQuestionAnswered(question, answer)) {
    return false;
  }

  if (question.type === 'translate' || question.type === 'fill-blank') {
    const acceptable = Array.isArray(question.acceptableAnswers) && question.acceptableAnswers.length > 0
      ? question.acceptableAnswers
      : [question.correctAnswer];
    return acceptable.some((candidate) => normalizeText(candidate) === normalizeText(answer));
  }

  if (question.type === 'matching') {
    const selections = answer || {};
    const expectedPairs = question.pairs || [];
    return expectedPairs.length > 0 && expectedPairs.every((pair) => selections[pair.left] === pair.right);
  }

  if (question.type === 'reorder') {
    if (Array.isArray(answer)) {
      const expected = question.correctOrder || [];
      return expected.length > 0 && expected.every((token, idx) => token === answer[idx]);
    }

    if (typeof answer === 'string') {
      const expectedText = question.correctAnswer || (question.correctOrder || []).join(' ');
      return normalizeText(answer) === normalizeText(expectedText);
    }

    return false;
  }

  return normalizeText(answer) === normalizeText(question.correctAnswer);
};
