import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { callGemini, callOpenAIChat } from './aiService.js'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR_CANDIDATES = [
  process.env.CURRICULUM_DATA_DIR,
  path.resolve(__dirname, '..', '..', 'data'),
  path.resolve(__dirname, '..', '..', '..', 'backend', 'data'),
  '/app/data',
  '/backend/data'
].filter(Boolean)

function resolveDataFile(fileName) {
  for (const dir of DATA_DIR_CANDIDATES) {
    const candidate = path.join(dir, fileName)
    if (fs.existsSync(candidate)) {
      return candidate
    }
  }

  return path.join(DATA_DIR_CANDIDATES[0], fileName)
}

const normalizeClassLevel = (classLevel = '') => String(classLevel).trim().toUpperCase()

const resolveLanguageName = (language = 'luganda') => (
  String(language).trim().toLowerCase() === 'runyankole' ? 'Runyankole' : 'Luganda'
)

const normalizeTermCandidates = (term = '') => {
  const raw = String(term || '').trim()
  if (!raw) return []

  const compact = raw.replace(/\s+/g, '').replace(/_/g, '')
  const digits = compact.match(/\d+/)?.[0]

  const candidates = [
    raw,
    compact,
    compact.toLowerCase(),
    compact.toUpperCase()
  ]

  if (digits) {
    candidates.push(`Term${digits}`, `term${digits}`, `Term ${digits}`, `term ${digits}`, digits)
  }

  return [...new Set(candidates)]
}

function resolveClassData(curriculum, classLevel) {
  const classes = curriculum?.curriculum?.classes || {}
  const normalized = normalizeClassLevel(classLevel)
  return classes[normalized] || classes[classLevel]
}

function resolveTermData(classData, term) {
  if (!classData?.terms) return { key: null, data: null }

  const candidates = normalizeTermCandidates(term)
  for (const key of Object.keys(classData.terms)) {
    if (candidates.includes(key) || candidates.includes(key.replace(/\s+/g, '').replace(/_/g, ''))) {
      return { key, data: classData.terms[key] }
    }
  }

  return { key: null, data: null }
}

// Load curriculum and templates
function loadCurriculumData() {
  try {
    const curriculumPath = resolveDataFile('luganda_curriculum_structure.json')
    const data = fs.readFileSync(curriculumPath, 'utf8')
    return JSON.parse(data)
  } catch (err) {
    console.error('Error loading curriculum:', err.message)
    console.error('Attempted paths:', DATA_DIR_CANDIDATES.map((dir) => path.join(dir, 'luganda_curriculum_structure.json')).join(' | '))
    return null
  }
}

function loadPromptTemplates() {
  try {
    const templatesPath = resolveDataFile('ai_prompt_templates_guidelines.json')
    const data = fs.readFileSync(templatesPath, 'utf8')
    return JSON.parse(data)
  } catch (err) {
    console.error('Error loading prompt templates:', err.message)
    console.error('Attempted paths:', DATA_DIR_CANDIDATES.map((dir) => path.join(dir, 'ai_prompt_templates_guidelines.json')).join(' | '))
    return null
  }
}

// Get milestone from curriculum
function getMilestone(classLevel, term, milestoneId) {
  const curriculum = loadCurriculumData()
  if (!curriculum) return null

  const classData = resolveClassData(curriculum, classLevel)
  if (!classData) return null

  const { data: termData } = resolveTermData(classData, term)
  if (!termData) return null
  
  return termData.milestones.find(m => m.id === milestoneId)
}

// Build AI prompt for lesson generation
function buildLessonPrompt(classLevel, term, milestone, topic, languageName = 'Luganda') {
  const templates = loadPromptTemplates()
  if (!templates) return null
  
  const template = templates.ai_prompt_templates_and_guidelines.content_generation_prompts.lesson_generation.template
  
  const coreSkills = milestone.core_skills_focus.join(', ')
  const scenarios = milestone.scenario_examples.join('\n - ')
  
  const prompt = `
Create an engaging and culturally appropriate ${languageName} lesson.

CLASS LEVEL: ${classLevel}
TERM: ${term}
MILESTONE: ${milestone.milestone_name}
TOPIC: ${topic}
CORE SKILLS TO FOCUS ON: ${coreSkills}

Learning Outcomes:
${milestone.learning_outcomes.map(lo => `- ${lo}`).join('\n')}

Real-World Scenarios Students Should Engage With:
${scenarios}

LESSON STRUCTURE (provide in JSON format):
1. "opening_scenario" - Present a real-life Ugandan context (2-3 sentences)
2. "vocabulary" - Array of 10-15 key words with ${languageName} word, pronunciation, English translation, and example usage
3. "grammar_rules" - Explanation of grammar rules with examples
4. "guided_practice" - Array of 3 worked examples showing correct usage
5. "scenario_practice" - Array of 4 scenario-based practice exercises requiring student application
6. "cultural_notes" - Array of 2-3 important cultural insights
7. "common_mistakes" - Array of 2-3 frequent student errors with corrections

Return ONLY valid JSON with these fields. Use both ${languageName} and English.
Make all scenarios authentic to Ugandan context (markets, homes, schools, community gatherings).
`
  
  return prompt
}

// Build AI prompt for quiz generation
function buildQuizPrompt(classLevel, term, milestone, topic, questionCount = 15, languageName = 'Luganda') {
  const templates = loadPromptTemplates()
  if (!templates) return null
  
  const prompt = `
Create a comprehensive quiz for ${languageName} language learners.

CLASS LEVEL: ${classLevel}
TERM: ${term}
TOPIC: ${topic} (Milestone: ${milestone.milestone_name})
TOTAL QUESTIONS: ${questionCount}

QUESTION TYPE DISTRIBUTION:
- Recall Questions (30%: ~${Math.ceil(questionCount * 0.3)}): Multiple choice, fill-in-blank, vocabulary matching
- Comprehension Questions (30%: ~${Math.ceil(questionCount * 0.3)}): True/false, short answer, matching
- Scenario-Based Application (25%: ~${Math.ceil(questionCount * 0.25)}): Real-world situations requiring skill application
- Analysis Questions (15%: ~${Math.ceil(questionCount * 0.15)}): Critical thinking, comparison, interpretation

Return a JSON object with this structure:
{
  "quiz_title": "Quiz Title",
  "topic": "${topic}",
  "class_level": "${classLevel}",
  "total_questions": ${questionCount},
  "recall_questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "question": "Question text in English and/or Luganda",
      "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
      "correct_answer": "A",
      "explanation": "Why this is correct"
    }
  ],
  "comprehension_questions": [
    {
      "id": "q_comp",
      "type": "fill_in_blank",
      "question": "Complete sentence: The word for 'hello' in ${languageName} is ___",
      "answer": "Wasuze",
      "explanation": "This is a common greeting"
    }
  ],
  "scenario_questions": [
    {
      "id": "q_scenario",
      "type": "scenario_based",
      "context": "You are at a market in Kampala buying vegetables. The vendor asks for the price.",
      "question": "What would you say? Provide response in ${languageName} with English translation.",
      "expected_response": "${languageName} response and English translation",
      "explanation": "This demonstrates negotiation skills in authentic context"
    }
  ],
  "analysis_questions": [
    {
      "id": "q_analysis",
      "type": "analysis",
      "question": "Question requiring interpretation/comparison",
      "expected_response": "Sample response",
      "explanation": "This tests critical thinking"
    }
  ]
}

Return ONLY valid JSON. Make all scenarios authentic and culturally appropriate.
`
  
  return prompt
}

// Build AI prompt for practice generation
function buildPracticePrompt(classLevel, milestone, topic, scenarioCount = 4, languageName = 'Luganda') {
  const prompt = `
Create ${scenarioCount} progressive, scenario-based practice exercises for ${languageName} learners.

CLASS LEVEL: ${classLevel}
MILESTONE: ${milestone.milestone_name}
TOPIC: ${topic}
CORE SKILLS: ${milestone.core_skills_focus.join(', ')}

For EACH scenario, provide 3 versions:
1. GUIDED: Sentence starters and model language provided
2. SEMI-GUIDED: Situation + 3 key vocabulary words, student constructs response
3. INDEPENDENT: Only situation given, student creates full response

Return JSON with this structure:
{
  "topic": "${topic}",
  "class_level": "${classLevel}",
  "scenarios": [
    {
      "scenario_id": "S1",
      "context": "Real Ugandan situation (2-3 sentences)",
      "guided": {
        "instructions": "Here's what to do...",
        "sentence_starters": ["Nze jjinja...", "Omusolo..."],
        "vocabulary_provided": ["word1 - English", "word2 - English"],
        "model_or_example": "Nze jjinja John. Wasuze otya?"
      },
      "semi_guided": {
        "instructions": "Use the following words to respond",
        "vocabulary": ["greet", "introduce", "family"],
        "situation": "You meet your teacher after school"
      },
      "independent": {
        "instructions": "Create a full response to this situation",
        "situation": "You see your grandmother and want to tell her about your school day"
      },
      "model_answer": "Expected response in ${languageName} with English translation",
      "feedback": "Explanation of correct usage, pronunciation guide, cultural notes"
    }
  ]
}

Progressively increase difficulty: Scenario 1 most scaffolded, final scenario least scaffolded.
Include pronunciation guides (phonetic ${languageName}), cultural appropriateness tips, common errors.
Return ONLY valid JSON.
`
  
  return prompt
}

// Build AI prompt for resource generation
function buildResourcePrompt(classLevel, topic, resourceType = 'vocabulary_list', languageName = 'Luganda') {
  const prompt = `
Create a comprehensive ${resourceType} resource for ${languageName} learners.

CLASS LEVEL: ${classLevel}
TOPIC: ${topic}
RESOURCE TYPE: ${resourceType}

Return JSON with this structure:
{
  "resource_type": "${resourceType}",
  "topic": "${topic}",
  "class_level": "${classLevel}",
  "vocabulary": [
    {
      "luganda_word": "Word",
      "pronunciation": "Phonetic pronunciation",
      "english_translation": "English meaning",
      "example_sentence_luganda": "Sentence in ${languageName}",
      "example_sentence_english": "English translation of sentence",
      "usage_context": "When/how this word is used"
    }
  ],
  "grammar_rules": [
    {
      "rule_name": "Rule name",
      "explanation": "Clear explanation",
      "example": "Example demonstrating rule"
    }
  ],
  "cultural_context": "Explanation of cultural relevance",
  "pronunciation_guide": "Guide for challenging sounds",
  "extension_activities": [
    "Activity 1",
    "Activity 2",
    "Activity 3"
  ],
  "common_variations": "Regional or contextual variations in usage",
  "authentic_examples": [
    {
      "source": "Source (story, song, etc.)",
      "text": "Authentic Luganda text",
      "translation": "English translation"
    }
  ]
}

Include 20-30 vocabulary items with complete details.
Return ONLY valid JSON.
`
  
  return prompt
}

// Main content generation function
export async function generateContent(contentType, classLevel, term, milestoneId, topic, options = {}) {
  try {
    const requiresMilestone = ['lesson', 'quiz', 'practice'].includes(contentType)
    const milestone = requiresMilestone ? getMilestone(classLevel, term, milestoneId) : null
    const languageName = resolveLanguageName(options.language)

    if (requiresMilestone && !milestone) {
      throw new Error(`Milestone not found: ${milestoneId}`)
    }

    let prompt = null
    let generatorFn = null

    switch (contentType) {
      case 'lesson':
        prompt = buildLessonPrompt(classLevel, term, milestone, topic, languageName)
        generatorFn = 'lesson'
        break
      case 'quiz':
        prompt = buildQuizPrompt(classLevel, term, milestone, topic, options.questionCount || 15, languageName)
        generatorFn = 'quiz'
        break
      case 'practice':
        prompt = buildPracticePrompt(classLevel, milestone, topic, options.scenarioCount || 4, languageName)
        generatorFn = 'practice'
        break
      case 'resource':
        prompt = buildResourcePrompt(classLevel, topic, options.resourceType || 'vocabulary_list', languageName)
        generatorFn = 'resource'
        break
      default:
        throw new Error(`Unknown content type: ${contentType}`)
    }

    if (!prompt) {
      throw new Error('Failed to build prompt')
    }

    // Call AI
    let aiResponse = null
    const preferOpenAi = contentType !== 'resource'
    let provider = 'unknown'

    if (preferOpenAi && process.env.OPENAI_API_KEY) {
      try {
        aiResponse = await callOpenAIChat([
          { role: 'system', content: `You are an expert ${languageName} language teacher and curriculum designer. Return ONLY valid JSON with no markdown or extra text.` },
          { role: 'user', content: prompt }
        ], 1000)
        if (aiResponse) provider = 'openai'
      } catch (err) {
        console.error('OpenAI error:', err.message)
      }
    }

    if (!aiResponse && process.env.GEMINI_API_KEY) {
      try {
        const resp = await callGemini(prompt)
        if (resp && resp.text) {
          aiResponse = resp.text
          provider = 'gemini'
        }
      } catch (err) {
        console.error('Gemini error:', err.message)
      }
    }

    // Final fallback for heavy-resource mode when Gemini is unavailable
    if (!aiResponse && !preferOpenAi && process.env.OPENAI_API_KEY) {
      try {
        aiResponse = await callOpenAIChat([
          { role: 'system', content: `You are an expert ${languageName} language teacher and curriculum designer. Return ONLY valid JSON with no markdown or extra text.` },
          { role: 'user', content: prompt }
        ], 1100)
        if (aiResponse) provider = 'openai'
      } catch (err) {
        console.error('OpenAI fallback error:', err.message)
      }
    }

    if (!aiResponse) {
      throw new Error('No AI provider available')
    }

    // Parse JSON response with a repair retry
    const tryParse = (text) => {
      try {
        const jsonMatch = String(text || '').match(/\{[\s\S]*\}/)
        if (!jsonMatch) return null
        return JSON.parse(jsonMatch[0])
      } catch (err) {
        return null
      }
    }

    let content = tryParse(aiResponse)
    if (!content) {
      // Ask the model to repair/return valid JSON once
      try {
        const repairPrompt = `The previous AI response could not be parsed as JSON. Return ONLY valid JSON appropriate for ${contentType} generation. Here is the raw response:\n\n${String(aiResponse)}\n\nReturn only the corrected JSON.`
        const repairResp = await callOpenAIChat([
          { role: 'system', content: `You are an expert ${languageName} language teacher and curriculum designer. Return ONLY valid JSON with no markdown or extra text.` },
          { role: 'user', content: repairPrompt }
        ], 1200)

        content = tryParse(repairResp)
      } catch (repairErr) {
        console.error('Content repair attempt failed:', repairErr.message)
      }
    }

    if (!content) {
      throw new Error('AI did not return valid curriculum content JSON')
    }

    return {
      success: true,
      contentType,
      classLevel: normalizeClassLevel(classLevel),
      term,
      milestoneId,
      topic,
      milestone: milestone?.milestone_name || null,
      content,
      provider,
      timestamp: new Date().toISOString()
    }

  } catch (err) {
    console.error(`Error generating ${contentType}:`, err.message)
    return {
      success: false,
      error: err.message,
      contentType
    }
  }
}

// Get curriculum overview
export function getCurriculumOverview() {
  const curriculum = loadCurriculumData()
  if (!curriculum) {
    return { error: 'Failed to load curriculum' }
  }

  const overview = {
    language: curriculum.curriculum.language,
    program_name: curriculum.curriculum.program_name,
    grade_levels: curriculum.curriculum.grade_levels,
    core_skills: curriculum.curriculum.core_skills,
    classes: {}
  }

  Object.keys(curriculum.curriculum.classes).forEach(classLevel => {
    const classData = curriculum.curriculum.classes[classLevel]
    overview.classes[classLevel] = {
      level_name: classData.level_name,
      level_description: classData.level_description,
      terms: Object.keys(classData.terms).map(termKey => {
        const termData = classData.terms[termKey]
        return {
          term_name: termData.term_name,
          duration: termData.duration,
          milestone_count: termData.milestones.length,
          milestones: termData.milestones.map(m => ({
            id: m.id,
            name: m.milestone_name,
            topics: m.topics
          }))
        }
      })
    }
  })

  return overview
}

// Get specific class curriculum
export function getClassCurriculum(classLevel) {
  const curriculum = loadCurriculumData()
  if (!curriculum) return null

  const classData = resolveClassData(curriculum, classLevel)
  if (!classData) return null

  return {
    level_name: classData.level_name,
    level_description: classData.level_description,
    terms: classData.terms
  }
}

// Get specific term curriculum
export function getTermCurriculum(classLevel, term) {
  const curriculum = loadCurriculumData()
  if (!curriculum) return null

  const classData = resolveClassData(curriculum, classLevel)
  if (!classData) return null

  const { key: resolvedTerm, data: termData } = resolveTermData(classData, term)
  if (!termData) return null

  return {
    ...termData,
    resolvedTerm
  }
}

// Get specific milestone details
export function getMilestoneDetails(classLevel, term, milestoneId) {
  const milestone = getMilestone(classLevel, term, milestoneId)
  if (!milestone) return null

  return {
    ...milestone,
    class_level: normalizeClassLevel(classLevel),
    term: term
  }
}
