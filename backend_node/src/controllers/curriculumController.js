import crypto from 'crypto'
import {
  generateContent,
  getCurriculumOverview,
  getClassCurriculum,
  getTermCurriculum,
  getMilestoneDetails
} from '../services/contentGeneratorService.js'
import GeneratedContent from '../models/GeneratedContent.js'

const normalizeText = (value) => String(value || '').trim().toLowerCase()

const buildCurriculumRequestKey = (contentType, payload = {}) => {
  const keyPayload = {
    contentType,
    classLevel: normalizeText(payload.classLevel),
    term: normalizeText(payload.term),
    milestoneId: normalizeText(payload.milestoneId),
    topic: normalizeText(payload.topic),
    questionCount: Number(payload.questionCount || 15),
    scenarioCount: Number(payload.scenarioCount || 4),
    resourceType: normalizeText(payload.resourceType || 'vocabulary_list')
  }

  return crypto.createHash('sha256').update(JSON.stringify(keyPayload)).digest('hex')
}

const loadFromCache = async (contentType, requestKey) => {
  const cached = await GeneratedContent.findOne({ contentType, requestKey })
  if (!cached) return null
  cached.hitCount += 1
  cached.lastAccessedAt = new Date()
  await cached.save()
  return cached
}

const saveToCache = async ({ contentType, requestKey, requestMeta, content, provider }) => {
  await GeneratedContent.findOneAndUpdate(
    { contentType, requestKey },
    {
      contentType,
      requestKey,
      requestMeta,
      content,
      provider: provider || 'unknown',
      lastAccessedAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )
}

// Get full curriculum overview
export const getCurriculum = (req, res) => {
  try {
    const overview = getCurriculumOverview()
    if (overview.error) {
      return res.status(500).json({ success: false, error: overview.error })
    }
    res.json({ success: true, curriculum: overview })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// Get specific class curriculum
export const getClassCurriculumHandler = (req, res) => {
  try {
    const { classLevel } = req.params
    const classData = getClassCurriculum(classLevel)
    if (!classData) {
      return res.status(404).json({ success: false, error: `Class ${classLevel} not found` })
    }
    res.json({ success: true, classLevel, data: classData })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// Get specific term curriculum
export const getTermCurriculumHandler = (req, res) => {
  try {
    const { classLevel, term } = req.params
    const termData = getTermCurriculum(classLevel, term)
    if (!termData) {
      return res.status(404).json({ success: false, error: `Term ${term} for ${classLevel} not found` })
    }
    res.json({ success: true, classLevel, term, data: termData })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// Get specific milestone details
export const getMilestoneDetailsHandler = (req, res) => {
  try {
    const { classLevel, term, milestoneId } = req.params
    const milestone = getMilestoneDetails(classLevel, term, milestoneId)
    if (!milestone) {
      return res.status(404).json({ success: false, error: `Milestone ${milestoneId} not found` })
    }
    res.json({ success: true, milestone })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// Generate lesson
export const generateLessonContent = async (req, res) => {
  try {
    const { classLevel, term, milestoneId, topic } = req.body

    if (!classLevel || !term || !milestoneId || !topic) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: classLevel, term, milestoneId, topic'
      })
    }

    const requestMeta = { classLevel, term, milestoneId, topic }
    const requestKey = buildCurriculumRequestKey('curriculum_lesson', requestMeta)
    const cached = await loadFromCache('curriculum_lesson', requestKey)

    if (cached) {
      return res.json({
        success: true,
        contentType: 'lesson',
        classLevel,
        term,
        milestoneId,
        topic,
        content: cached.content,
        cached: true,
        provider: cached.provider,
        source: 'mongo-cache'
      })
    }

    const result = await generateContent('lesson', classLevel, term, milestoneId, topic, req.body.options || {})

    if (!result.success) {
      return res.status(500).json(result)
    }

    await saveToCache({
      contentType: 'curriculum_lesson',
      requestKey,
      requestMeta,
      content: result.content,
      provider: result.provider
    })

    res.json({ ...result, cached: false })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// Generate quiz
export const generateQuizContent = async (req, res) => {
  try {
    const { classLevel, term, milestoneId, topic } = req.body
    const options = {
      questionCount: req.body.questionCount || 15,
      ...req.body.options
    }

    if (!classLevel || !term || !milestoneId || !topic) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: classLevel, term, milestoneId, topic'
      })
    }

    const requestMeta = { classLevel, term, milestoneId, topic, questionCount: options.questionCount }
    const requestKey = buildCurriculumRequestKey('curriculum_quiz', requestMeta)
    const cached = await loadFromCache('curriculum_quiz', requestKey)

    if (cached) {
      return res.json({
        success: true,
        contentType: 'quiz',
        classLevel,
        term,
        milestoneId,
        topic,
        content: cached.content,
        cached: true,
        provider: cached.provider,
        source: 'mongo-cache'
      })
    }

    const result = await generateContent('quiz', classLevel, term, milestoneId, topic, options)

    if (!result.success) {
      return res.status(500).json(result)
    }

    await saveToCache({
      contentType: 'curriculum_quiz',
      requestKey,
      requestMeta,
      content: result.content,
      provider: result.provider
    })

    res.json({ ...result, cached: false })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// Generate practice
export const generatePracticeContent = async (req, res) => {
  try {
    const { classLevel, term, milestoneId, topic } = req.body
    const options = {
      scenarioCount: req.body.scenarioCount || 4,
      ...req.body.options
    }

    if (!classLevel || !term || !milestoneId || !topic) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: classLevel, term, milestoneId, topic'
      })
    }

    const requestMeta = { classLevel, term, milestoneId, topic, scenarioCount: options.scenarioCount }
    const requestKey = buildCurriculumRequestKey('curriculum_practice', requestMeta)
    const cached = await loadFromCache('curriculum_practice', requestKey)

    if (cached) {
      return res.json({
        success: true,
        contentType: 'practice',
        classLevel,
        term,
        milestoneId,
        topic,
        content: cached.content,
        cached: true,
        provider: cached.provider,
        source: 'mongo-cache'
      })
    }

    const result = await generateContent('practice', classLevel, term, milestoneId, topic, options)

    if (!result.success) {
      return res.status(500).json(result)
    }

    await saveToCache({
      contentType: 'curriculum_practice',
      requestKey,
      requestMeta,
      content: result.content,
      provider: result.provider
    })

    res.json({ ...result, cached: false })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// Generate resource
export const generateResourceContent = async (req, res) => {
  try {
    const { classLevel, topic } = req.body
    const options = {
      resourceType: req.body.resourceType || 'vocabulary_list',
      ...req.body.options
    }

    if (!classLevel || !topic) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: classLevel, topic'
      })
    }

    const requestMeta = { classLevel, topic, resourceType: options.resourceType }
    const requestKey = buildCurriculumRequestKey('curriculum_resource', requestMeta)
    const cached = await loadFromCache('curriculum_resource', requestKey)

    if (cached) {
      return res.json({
        success: true,
        contentType: 'resource',
        classLevel,
        topic,
        content: cached.content,
        cached: true,
        provider: cached.provider,
        source: 'mongo-cache'
      })
    }

    const result = await generateContent('resource', classLevel, null, null, topic, options)

    if (!result.success) {
      return res.status(500).json(result)
    }

    await saveToCache({
      contentType: 'curriculum_resource',
      requestKey,
      requestMeta,
      content: result.content,
      provider: result.provider
    })

    res.json({ ...result, cached: false })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}
