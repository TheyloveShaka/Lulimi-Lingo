import Resource from '../models/Resource.js'
import User from '../models/User.js'

const getDefaultSeedResources = () => ([
  {
    title: 'Luganda Learning Playlist 1',
    description: 'Core Luganda lessons playlist',
    type: 'video',
    classLevel: 'S1',
    subject: 'Luganda',
    externalUrl: 'https://youtube.com/playlist?list=PLLksNIleBPcangqV-p0PHl76OxMrOHr6h&si=Tbs8iL7Fgf2Q3u5O'
  },
  {
    title: 'Luganda Learning Playlist 2',
    description: 'Luganda pronunciation and grammar series',
    type: 'video',
    classLevel: 'S1',
    subject: 'Luganda',
    externalUrl: 'https://youtube.com/playlist?list=PLLksNIleBPcby2OmCxxBfkOM3GQHjQ0zS&si=whLSGHzIyLdKJT1x'
  },
  {
    title: 'Luganda Learning Playlist 3',
    description: 'Luganda practice and conversation lessons',
    type: 'video',
    classLevel: 'S1',
    subject: 'Luganda',
    externalUrl: 'https://youtube.com/playlist?list=PLLksNIleBPcbTjFKa_tSNRAwmUXh1moza&si=UtwSNHUU0zY6G5ca'
  },
  {
    title: 'Runyankole Learning Playlist 1',
    description: 'Runyankole basics playlist',
    type: 'video',
    classLevel: 'S1',
    subject: 'Runyankole',
    externalUrl: 'https://youtube.com/playlist?list=PLvSZu8m8rKfH1xqjp4G7lR8jWJ-icK73f&si=_05J18SWUARm2SmT'
  },
  {
    title: 'Runyankole Learning Playlist 2',
    description: 'Runyankole practice playlist',
    type: 'video',
    classLevel: 'S1',
    subject: 'Runyankole',
    externalUrl: 'https://youtube.com/playlist?list=PLo9rCgqpILQPbJcaF7JOMMHn8yB9BjKWw&si=j8_vWPasQEX3ags7'
  },
  {
    title: 'Runyankole Learning Video',
    description: 'Runyankole lesson video',
    type: 'video',
    classLevel: 'S1',
    subject: 'Runyankole',
    externalUrl: 'https://youtu.be/CI5o9O1acdA?si=I7m2B7b9PGtGeYuN'
  }
])

// Get all resources for a specific class level
export const getResourcesByClass = async (req, res) => {
  try {
    const { classLevel } = req.params
    const { subject } = req.query
    const filter = { classLevel, isPublished: true }

    if (subject) {
      filter.subject = new RegExp(`^${subject}$`, 'i')
    }

    const resources = await Resource.find(filter)
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
    const teacherId = req.user?.userId
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
    const uploadedBy = req.user?.userId

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
    const userId = req.user?.userId

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
    const teacherId = req.user?.userId

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
    const teacherId = req.user?.userId

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

// Seed or import resources (admin/teacher only)
export const seedResources = async (req, res) => {
  try {
    const userId = req.user?.userId
    const user = await User.findById(userId)
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      return res.status(403).json({ success: false, error: 'Only teachers and admins can seed resources' })
    }

    const seedPayload = Array.isArray(req.body?.resources) && req.body.resources.length > 0
      ? req.body.resources
      : getDefaultSeedResources()

    const results = []
    for (const entry of seedPayload) {
      if (!entry?.title || !entry?.externalUrl || !entry?.subject || !entry?.classLevel) {
        continue
      }

      const update = {
        title: entry.title,
        description: entry.description || '',
        type: entry.type || 'video',
        classLevel: entry.classLevel,
        subject: entry.subject,
        externalUrl: entry.externalUrl,
        uploadedBy: userId,
        updatedAt: new Date()
      }

      const doc = await Resource.findOneAndUpdate(
        {
          externalUrl: entry.externalUrl,
          subject: entry.subject,
          classLevel: entry.classLevel
        },
        update,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )

      results.push(doc)
    }

    return res.json({ success: true, count: results.length, data: results })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}
