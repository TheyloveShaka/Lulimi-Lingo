import mongoose from 'mongoose'
const { Schema } = mongoose

const MessageSchema = new Schema({
  role: { type: String, enum: ['user','assistant','system'], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
})

const ConversationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [MessageSchema],
  updatedAt: { type: Date, default: Date.now }
})

export default mongoose.model('Conversation', ConversationSchema)
