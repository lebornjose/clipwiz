import mongoose, { Schema, Document } from 'mongoose'

export interface IProject extends Document {
  title: string
  protocol: Record<string, unknown>
  coverUrl?: string
  coverOssKey?: string
  createdAt: Date
  updatedAt: Date
}

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    protocol: { type: Schema.Types.Mixed, required: true },
    coverUrl: { type: String, default: '' },
    coverOssKey: { type: String, default: '' },
  },
  { timestamps: true }
)

export const Project = mongoose.model<IProject>('Project', ProjectSchema)
