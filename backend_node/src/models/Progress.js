import mongoose from 'mongoose'
const { Schema } = mongoose

const ProgressSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  weekId: { type: Number },
  language: { type: String, default: 'luganda' },
  proficiencyLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  lessonCompleted: { type: Boolean, default: false },
  lessonId: { type: String },
  quizScores: { type: Map, of: Number },
  quizAttempts: [{
    quizId: String,
    score: Number,
    maxScore: { type: Number, default: 100 },
    percentage: Number,
    attemptDate: { type: Date, default: Date.now },
    timeSpent: Number // in seconds
  }],
  practiceAttempts: [{
    practiceId: String,
    score: Number,
    totalQuestions: Number,
    percentage: Number,
    attemptDate: { type: Date, default: Date.now }
  }],
  practiceData: { type: Schema.Types.Mixed },
  totalScore: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  completionPercentage: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
})

export default mongoose.model('Progress', ProgressSchema)
