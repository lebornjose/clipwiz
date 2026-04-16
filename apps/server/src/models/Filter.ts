import mongoose, { Schema, Document } from 'mongoose'

export interface IFilter extends Document {
  elementId: string
  name: string
  coverImgPath: string
  cubeUrl: string
  elementCode: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

const FilterSchema = new Schema<IFilter>(
  {
    elementId:    { type: String, required: true, unique: true },
    name:         { type: String, required: true },
    coverImgPath: { type: String, required: true },
    cubeUrl:      { type: String, required: true },
    elementCode:  { type: String, required: true },
    tags:         { type: [String], default: [] },
  },
  { timestamps: true }
)

export const Filter = mongoose.model<IFilter>('Filter', FilterSchema)
