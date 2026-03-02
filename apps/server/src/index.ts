import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { uploadRouter } from './routes/upload.js'
import { videoRouter } from './routes/video.js'
import { jobRouter } from './routes/job.js'
import { errorHandler } from './middleware/errorHandler.js'
import { graphRouter } from './routes/graph.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.resolve(process.env.UPLOAD_DIR || './uploads')))

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'ClipWiz Server is running' })
})

app.use('/api/upload', uploadRouter)
app.use('/api/video', videoRouter)
app.use('/api/job', jobRouter)
app.use('/api/graph', graphRouter)  // 合成视频



// Error handling
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`)
})

export default app
