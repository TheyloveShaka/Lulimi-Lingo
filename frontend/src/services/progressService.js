/**
 * Progress Service - Save quiz/practice progress
 */

const NODE_BACKEND_URL = import.meta.env.VITE_NODE_BACKEND_URL || 'https://lulimi-lingo-production.up.railway.app'

export const upsertProgress = async (userId, payload) => {
  try {
    if (!userId) {
      return { success: false, error: 'Missing userId' }
    }

    const response = await fetch(`${NODE_BACKEND_URL}/api/progress/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update progress')
    }

    return data
  } catch (error) {
    console.error('Progress update error:', error)
    return { success: false, error: error.message }
  }
}
