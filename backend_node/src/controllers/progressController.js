import Progress from '../models/Progress.js'
import User from '../models/User.js'

export const getProgress = async (req, res) => {
  const { userId } = req.params
  try {
    const progress = await Progress.find({ user: userId }).lean()
    return res.json({ success: true, progress })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, error: err.message })
  }
}

export const upsertProgress = async (req, res) => {
  const { userId } = req.params
  const payload = req.body || {}
  try {
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ success: false, error: 'User not found' })

    const filter = { user: userId, weekId: payload.weekId }
    const update = { ...payload, updatedAt: new Date() }
    const doc = await Progress.findOneAndUpdate(filter, update, { upsert: true, new: true })
    return res.json({ success: true, progress: doc })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, error: err.message })
  }
}
