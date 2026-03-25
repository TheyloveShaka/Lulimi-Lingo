import {
  generateContent,
  getCurriculumOverview,
  getClassCurriculum,
  getTermCurriculum,
  getMilestoneDetails
} from '../services/contentGeneratorService.js'

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

    const result = await generateContent('lesson', classLevel, term, milestoneId, topic, req.body.options || {})

    if (!result.success) {
      return res.status(500).json(result)
    }

    res.json(result)
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

    const result = await generateContent('quiz', classLevel, term, milestoneId, topic, options)

    if (!result.success) {
      return res.status(500).json(result)
    }

    res.json(result)
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

    const result = await generateContent('practice', classLevel, term, milestoneId, topic, options)

    if (!result.success) {
      return res.status(500).json(result)
    }

    res.json(result)
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

    const result = await generateContent('resource', classLevel, null, null, topic, options)

    if (!result.success) {
      return res.status(500).json(result)
    }

    res.json(result)
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}
