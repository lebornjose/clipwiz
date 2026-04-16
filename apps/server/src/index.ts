import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import mongoose from 'mongoose'
import { uploadRouter } from './routes/upload.js'
import { videoRouter } from './routes/video.js'
import { jobRouter } from './routes/job.js'
import { errorHandler } from './middleware/errorHandler.js'
import { graphRouter } from './routes/graph.js'
import { projectRouter } from './routes/project.js'
import { materialRouter } from './routes/material.js'
import { audioRouter } from './routes/audio.js'
import { filterRouter } from './routes/filter.js'
import { transitionRouter } from './routes/transition.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/clip_wiz'

mongoose.connect(MONGO_URI).then(() => {
  console.log('✅ MongoDB connected:', MONGO_URI)
}).catch((err) => {
  console.error('❌ MongoDB connection failed:', err)
})

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
app.use('/api/project', projectRouter)  // 项目管理
app.use('/api/material', materialRouter) // 素材管理
app.use('/api/audio', audioRouter)      // 音频管理
app.use('/api/filter', filterRouter)    // 滤镜管理
app.use('/api/transition', transitionRouter) // 转场管理



// Error handling
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`)
})

export default app
