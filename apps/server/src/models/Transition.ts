import mongoose, { Schema, Document } from 'mongoose'

export interface ITransition extends Document {
  elementId: string
  elementCode: string
  elementName: string
  coverImgPath: string
  originalUrl: string
  duration: string
  coincideDuration: string
  renderResource: Record<string, string>
  createdAt: Date
  updatedAt: Date
}

const TransitionSchema = new Schema<ITransition>(
  {
    elementId:       { type: String, required: true, unique: true },
    elementCode:     { type: String, required: true },
    elementName:     { type: String, required: true },
    coverImgPath:    { type: String, required: true },
    originalUrl:     { type: String, required: true },
    duration:        { type: String, default: '500' },
    coincideDuration:{ type: String, default: '0' },
    renderResource:  { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
)

export const Transition = mongoose.model<ITransition>('Transition', TransitionSchema)
