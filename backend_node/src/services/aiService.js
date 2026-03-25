import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config()

const GEMINI_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-pro'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`
const OPENAI_KEY = process.env.OPENAI_API_KEY
const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions'

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
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2048
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

async function callOpenAIChat(messages, max_tokens = 512) {
  if (!OPENAI_KEY) throw new Error('No OPENAI_KEY')
  const payload = {
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages,
    max_tokens,
    temperature: 0.3
  }
  const resp = await fetch(OPENAI_CHAT_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    timeout: 30000
  })
  if (!resp.ok) throw new Error(`OpenAI error ${resp.status}`)
  const data = await resp.json()
  const content = data.choices?.[0]?.message?.content || ''
  return content
}

// Export for use in content generator
export { callGemini, callOpenAIChat }

export async function generateLesson(payload) {
  const prompt = `Create a lesson for:\nTitle: ${payload.topic || 'Topic'}\nObjectives: ${payload.objectives?.join(', ') || ''}\nLevel: ${payload.classLevel || ''}\nProvide structured JSON with fields title, objectives, content, exercises, answers.`
  
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

  try {
    if (OPENAI_KEY) {
      const content = await callOpenAIChat([
        { role: 'system', content: 'Return a structured lesson as JSON' },
        { role: 'user', content: prompt }
      ], 1024)
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
    
    if (GEMINI_KEY) {
      let conversationText = `${system}\n\n`
      if (Array.isArray(options.conversationHistory)) {
        options.conversationHistory.forEach(m => {
          conversationText += `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}\n`
        })
      }
      conversationText += `User: ${message}\nAssistant:`
      
      const resp = await callGemini(conversationText)
      return { success: true, response: resp.text || 'No response from AI' }
    }

    const messages = [{ role: 'system', content: system }]
    if (Array.isArray(options.conversationHistory)) {
      options.conversationHistory.forEach(m => messages.push({ role: m.role || 'user', content: m.content }))
    }
    messages.push({ role: 'user', content: message })

    if (OPENAI_KEY) {
      const text = await callOpenAIChat(messages, 512)
      return { success: true, response: text }
    }

    return { success: true, response: '(mock) Tutor offline — enable AI keys for real responses.' }
  } catch (err) {
    console.error('Chat error:', err)
    return { success: false, response: `(error) ${err.message}` }
  }
}
