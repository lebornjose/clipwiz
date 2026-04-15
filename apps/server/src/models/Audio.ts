import mongoose, { Schema, Document } from 'mongoose'

export interface IAudio extends Document {
  name: string
  url: string
  ossKey?: string
  duration?: number   // ms
  size: number
  source: 'preset' | 'user'
  createdAt: Date
  updatedAt: Date
}

const AudioSchema = new Schema<IAudio>(
  {
    name:     { type: String, required: true },
    url:      { type: String, required: true },
    ossKey:   { type: String },
    duration: { type: Number },
    size:     { type: Number, required: true, default: 0 },
    source:   { type: String, enum: ['preset', 'user'], default: 'user' },
  },
  { timestamps: true }
)

export const Audio = mongoose.model<IAudio>('Audio', AudioSchema)
