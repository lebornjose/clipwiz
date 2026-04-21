import mongoose, { Schema, Document } from 'mongoose'

export interface IFontMaterial extends Document {
  elementId: string
  elementCode: string
  elementName: string
  coverImgPath: string
  originalUrl: string
  pagUrl: string
  scope?: string
  supportMultiFont?: boolean
  payload?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

const FontSchema = new Schema<IFontMaterial>(
  {
    elementId: { type: String, required: true, unique: true },
    elementCode: { type: String, required: true, default: '' },
    elementName: { type: String, required: true },
    coverImgPath: { type: String, required: true },
    originalUrl: { type: String, required: true },
    pagUrl: { type: String, required: true },
    scope: { type: String, default: 'color_letter' },
    supportMultiFont: { type: Boolean, default: false },
    payload: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
)

export const Font = mongoose.model<IFontMaterial>('Font', FontSchema)
