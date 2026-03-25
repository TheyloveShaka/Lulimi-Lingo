import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import connectDB from './config/db.js'
import apiRoutes from './routes/api.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Connect to MongoDB
connectDB()

// Middleware
app.use(cors())
app.use(morgan('dev'))
app.use(bodyParser.json({ limit: '1mb' }))
app.use(bodyParser.urlencoded({ extended: true }))

// Routes
app.use('/api', apiRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'Lulimi Express Backend', version: '0.1.0' })
})

app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`)
})
