import mongoose from 'mongoose'

const { Schema } = mongoose

const GeneratedContentSchema = new Schema({
  contentType: {
    type: String,
    enum: [
      'lesson',
      'quiz',
      'practice',
      'curriculum_lesson',
      'curriculum_quiz',
      'curriculum_practice',
      'curriculum_resource'
    ],
    required: true,
    index: true
  },
  requestKey: { type: String, required: true, index: true },
  requestMeta: { type: Schema.Types.Mixed },
  content: { type: Schema.Types.Mixed, required: true },
  provider: { type: String, default: 'unknown' },
  hitCount: { type: Number, default: 0 },
  lastAccessedAt: { type: Date, default: Date.now },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
  }
}, {
  timestamps: true
})

GeneratedContentSchema.index({ contentType: 1, requestKey: 1 }, { unique: true })
GeneratedContentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model('GeneratedContent', GeneratedContentSchema)
