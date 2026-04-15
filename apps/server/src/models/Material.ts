import mongoose, { Schema, Document } from 'mongoose'

export interface IMaterial extends Document {
  name: string
  url: string
  ossKey: string

  type: 'video' | 'image'
  duration?: number       // ms (video only)
  width?: number
  height?: number
  size: number
  createdAt: Date
  updatedAt: Date
}

const MaterialSchema = new Schema<IMaterial>(
  {
    name:         { type: String, required: true },
    url:          { type: String, required: true },
    ossKey:       { type: String, required: true },

    type:         { type: String, enum: ['video', 'image'], required: true },
    duration:     { type: Number },
    width:        { type: Number },
    height:       { type: Number },
    size:         { type: Number, required: true },
  },
  { timestamps: true }
)

export const Material = mongoose.model<IMaterial>('Material', MaterialSchema)
