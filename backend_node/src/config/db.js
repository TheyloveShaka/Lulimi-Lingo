import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

const MONGO_URI = process.env.DATABASE_URL || process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/lulimi_lingo'

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log('✅ MongoDB connected')
  } catch (err) {
    console.warn('⚠️  MongoDB connection error:', err.message)
    console.log('📝 Server will run with mock data support (Database operations may be limited)')
    // Don't exit - allow server to run with mock data
  }
}

export default connectDB
