import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
const { Schema } = mongoose

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, index: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  classLevel: { type: String, enum: ['S1', 'S2', 'S3', 'S4'], default: 'S1' },
  language: { type: String, default: 'luganda' },
  completedLessons: [{ type: String }],
  completedTopics: [{ type: String }],
  progressPercentage: { type: Number, default: 0 },
  // Teacher-specific fields
  assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  try {
    this.password = await bcrypt.hash(this.password, 10)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to verify password
UserSchema.methods.verifyPassword = async function(password) {
  return await bcrypt.compare(password, this.password)
}

export default mongoose.model('User', UserSchema)
