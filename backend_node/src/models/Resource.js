import mongoose from 'mongoose'
const { Schema } = mongoose

const ResourceSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['document', 'link', 'video', 'image', 'audio'], required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  classLevel: { type: String, enum: ['S1', 'S2', 'S3', 'S4'], required: true },
  subject: { type: String, required: true }, // e.g., 'Luganda', 'Runyankole'
  fileUrl: { type: String }, // Download path for uploaded files
  externalUrl: { type: String }, // For external links
  fileSize: { type: Number }, // In bytes
  fileName: { type: String },
  fileMimeType: { type: String }, // Content-Type for downloads
  // Base64 file contents stored in the DB (reliable on ephemeral hosts).
  // select:false keeps this heavy field out of normal list queries.
  fileData: { type: String, select: false },
  isPublished: { type: Boolean, default: true },
  viewCount: { type: Number, default: 0 },
  downloadCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

export default mongoose.model('Resource', ResourceSchema)
