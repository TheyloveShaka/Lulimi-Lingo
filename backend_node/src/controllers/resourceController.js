import Resource from '../models/Resource.js'
import User from '../models/User.js'

// Get all resources for a specific class level
export const getResourcesByClass = async (req, res) => {
  try {
    const { classLevel } = req.params
    const resources = await Resource.find({ classLevel, isPublished: true })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      data: resources
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// Get all resources uploaded by a teacher
export const getTeacherResources = async (req, res) => {
  try {
    const teacherId = req.userId
    const resources = await Resource.find({ uploadedBy: teacherId })
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      data: resources
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// Upload a new resource (for teachers/admins)
export const uploadResource = async (req, res) => {
  try {
    const { title, description, type, classLevel, subject, externalUrl, fileName, fileSize } = req.body
    const uploadedBy = req.userId

    // Verify user is teacher or admin
    const user = await User.findById(uploadedBy)
    if (user.role !== 'teacher' && user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only teachers and admins can upload resources' })
    }

    const newResource = new Resource({
      title,
      description,
      type,
      classLevel,
      subject,
      externalUrl,
      fileName,
      fileSize,
      uploadedBy
    })

    await newResource.save()

    res.status(201).json({
      success: true,
      data: newResource
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// Delete a resource
export const deleteResource = async (req, res) => {
  try {
    const { resourceId } = req.params
    const userId = req.userId

    const resource = await Resource.findById(resourceId)
    if (!resource) {
      return res.status(404).json({ success: false, error: 'Resource not found' })
    }

    // Check if user is the uploader or admin
    const user = await User.findById(userId)
    if (resource.uploadedBy.toString() !== userId && user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this resource' })
    }

    await Resource.findByIdAndDelete(resourceId)

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// Get single resource and increment view count
export const getResource = async (req, res) => {
  try {
    const { resourceId } = req.params

    const resource = await Resource.findByIdAndUpdate(
      resourceId,
      { $inc: { viewCount: 1 } },
      { new: true }
    ).populate('uploadedBy', 'name email')

    if (!resource) {
      return res.status(404).json({ success: false, error: 'Resource not found' })
    }

    res.json({
      success: true,
      data: resource
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// Get student progress for a specific student (for teachers)
export const getStudentProgress = async (req, res) => {
  try {
    const { studentId } = req.params
    const teacherId = req.userId

    // Get student and verify teacher has access
    const student = await User.findById(studentId)
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' })
    }

    const teacher = await User.findById(teacherId)
    if (teacher.role === 'teacher' && !teacher.assignedStudents.includes(studentId)) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this student' })
    }

    // Get progress data
    const Progress = require('../models/Progress.js').default
    const progressData = await Progress.find({ user: studentId })

    res.json({
      success: true,
      data: {
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          classLevel: student.classLevel,
          language: student.language
        },
        progress: progressData
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// Get all students for a teacher
export const getTeacherStudents = async (req, res) => {
  try {
    const teacherId = req.userId

    const teacher = await User.findById(teacherId).populate('assignedStudents')
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found' })
    }

    res.json({
      success: true,
      data: teacher.assignedStudents
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}
