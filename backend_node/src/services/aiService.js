import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config()

const GEMINI_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-pro'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`
const OPENAI_KEY = process.env.OPENAI_API_KEY
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o'
const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions'
const OPENAI_TIMEOUT_MS = Number(process.env.OPENAI_TIMEOUT_MS || 30000)
const OPENAI_MAX_RETRIES = Number(process.env.OPENAI_MAX_RETRIES || 2)

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function clampMaxTokens(maxTokens, fallback = 512) {
  const parsed = Number(maxTokens)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return Math.min(parsed, 1200)
}

function compactText(text, maxChars = 2200) {
  const raw = String(text || '')
  if (raw.length <= maxChars) return raw
  return `${raw.slice(0, maxChars)}...`
}

function compactMessages(messages = [], maxMessages = 8) {
  return messages
    .filter((m) => m && typeof m.content === 'string')
    .slice(-maxMessages)
    .map((m) => ({
      role: ['system', 'assistant', 'user'].includes(m.role) ? m.role : 'user',
      content: compactText(m.content)
    }))
}

function buildSystemPromptFromProgress(progress) {
  if (!progress) return 'You are a helpful language tutor.'
  const summary = []
  if (progress.lessonCompleted) summary.push('Last lesson completed')
  if (progress.quizScores) summary.push(`Quiz scores: ${JSON.stringify(Object.fromEntries(progress.quizScores || []))}`)
  if (progress.practiceData) summary.push(`Practice attempts: ${JSON.stringify(progress.practiceData)}`)
  return `You are a helpful language tutor. Student progress summary: ${summary.join('; ')}`
}

async function callGemini(prompt) {
  if (!GEMINI_KEY) throw new Error('No GEMINI_KEY')
  const payload = {
    contents: [{
      parts: [{ text: compactText(prompt, 7000) }]
    }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1200
    }
  }
  const url = `${GEMINI_URL}?key=${GEMINI_KEY}`
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    timeout: 30000
  })
  if (!resp.ok) {
    const errorText = await resp.text().catch(() => '')
    throw new Error(`Gemini error ${resp.status}: ${errorText}`)
  }
  const data = await resp.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  return { text, raw: data }
}

async function callOpenAIChat(messages, max_tokens = 512, options = {}) {
  if (!OPENAI_KEY) throw new Error('No OPENAI_KEY')

  const safeMessages = compactMessages(messages)
  const safeMaxTokens = clampMaxTokens(max_tokens)
  const safeTemperature = typeof options.temperature === 'number' ? options.temperature : 0.3

  const payload = {
    model: OPENAI_MODEL,
    messages: safeMessages,
    max_tokens: safeMaxTokens,
    temperature: safeTemperature
  }

  for (let attempt = 0; attempt <= OPENAI_MAX_RETRIES; attempt += 1) {
    const resp = await fetch(OPENAI_CHAT_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      timeout: OPENAI_TIMEOUT_MS
    })

    if (resp.ok) {
      const data = await resp.json()
      return data.choices?.[0]?.message?.content || ''
    }

    const shouldRetry = [429, 500, 503].includes(resp.status) && attempt < OPENAI_MAX_RETRIES
    if (shouldRetry) {
      await wait((attempt + 1) * 1200)
      continue
    }

    const errorText = await resp.text().catch(() => '')
    throw new Error(`OpenAI error ${resp.status}: ${errorText}`)
  }

  throw new Error('OpenAI request failed after retries')
}

// Export for use in content generator
export { callGemini, callOpenAIChat }

export async function generateLesson(payload) {
  const prompt = `Create a lesson for:\nTitle: ${payload.topic || 'Topic'}\nObjectives: ${payload.objectives?.join(', ') || ''}\nLevel: ${payload.classLevel || ''}\nProvide structured JSON with fields title, objectives, content, exercises, answers.`

  try {
    if (OPENAI_KEY) {
      const content = await callOpenAIChat([
        { role: 'system', content: 'Return a structured lesson as JSON' },
        { role: 'user', content: prompt }
      ], 850)
      let lesson = content
      try {
        if (content.includes('{')) lesson = JSON.parse(content)
      } catch (e) {
        lesson = { raw: content }
      }
      return { success: true, lesson }
    }
  } catch (err) {
    console.error('generateLesson OpenAI error:', err)
  }

  try {
    if (GEMINI_KEY) {
      const r = await callGemini(prompt)
      let lesson = r.text
      try {
        if (r.text.includes('{') && r.text.includes('}')) {
          const jsonMatch = r.text.match(/\{[\s\S]*\}/)
          if (jsonMatch) lesson = JSON.parse(jsonMatch[0])
        }
      } catch (e) {
        lesson = { raw: r.text, introduction: r.text }
      }
      return { success: true, lesson }
    }
  } catch (err) {
    console.error('generateLesson Gemini error:', err)
  }

  return { success: false, error: 'No AI provider configured' }
}

export async function translate(text, source = 'en', target = 'lg') {
  try {
    if (OPENAI_KEY) {
      const prompt = `Translate the following from ${source} to ${target} and return only the translation:\n\n${text}`
      const content = await callOpenAIChat([
        { role: 'system', content: 'You are a professional translator.' },
        { role: 'user', content: prompt }
      ], 256)
      return { success: true, translation: content, model: 'openai' }
    }
  } catch (err) {
    console.error('OpenAI translate error:', err)
  }

  return { success: false, error: 'No translation provider configured' }
}

export async function chat(message, options = {}) {
  try {
    const progress = options.progress || null
    const system = buildSystemPromptFromProgress(progress)

    const messages = [{ role: 'system', content: system }]
    if (Array.isArray(options.conversationHistory)) {
      options.conversationHistory.slice(-4).forEach((m) => {
        messages.push({ role: m.role || 'user', content: compactText(m.content, 1200) })
      })
    }
    messages.push({ role: 'user', content: compactText(message, 1400) })

    if (OPENAI_KEY) {
      const text = await callOpenAIChat(messages, 380, { temperature: 0.25 })
      return { success: true, response: text, provider: 'openai' }
    }

    if (GEMINI_KEY) {
      let conversationText = `${system}\n\n`
      if (Array.isArray(options.conversationHistory)) {
        options.conversationHistory.slice(-4).forEach((m) => {
          conversationText += `${m.role === 'user' ? 'User' : 'Assistant'}: ${compactText(m.content, 900)}\n`
        })
      }
      conversationText += `User: ${compactText(message, 1400)}\nAssistant:`

      const resp = await callGemini(conversationText)
      return { success: true, response: resp.text || 'No response from AI', provider: 'gemini' }
    }

    return { success: true, response: '(mock) Tutor offline — enable AI keys for real responses.' }
  } catch (err) {
    console.error('Chat error:', err)
    return { success: false, response: `(error) ${err.message}` }
  }
}
