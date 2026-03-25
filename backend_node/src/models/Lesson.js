import mongoose from 'mongoose'
const { Schema } = mongoose

const LessonSchema = new Schema({
  title: String,
  objectives: [String],
  content: Schema.Types.Mixed,
  exercises: [Schema.Types.Mixed],
  language: { type: String, default: 'en' },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('Lesson', LessonSchema)
