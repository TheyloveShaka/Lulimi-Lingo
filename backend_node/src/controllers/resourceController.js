import Resource from '../models/Resource.js'
import User from '../models/User.js'
import Progress from '../models/Progress.js'

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

// Upload a new resource (for teachers/admins). Accepts EITHER an external URL
// OR an uploaded file (stored in the DB so it survives redeploys), not both required.
export const uploadResource = async (req, res) => {
  try {
    const { title, description, type, classLevel, subject, externalUrl, fileName, fileSize, fileBase64, fileMimeType } = req.body
    const uploadedBy = req.user?.userId

    // Verify user is teacher or admin
    const user = await User.findById(uploadedBy)
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      return res.status(403).json({ success: false, error: 'Only teachers and admins can upload resources' })
    }

    const trimmedUrl = String(externalUrl || '').trim()
    const hasFile = Boolean(fileBase64 && fileName)

    // Clear, early validation so the teacher gets a helpful message either way.
    if (!title || !classLevel || !subject) {
      return res.status(400).json({ success: false, error: 'Title, class level, and subject are required' })
    }
    if (!trimmedUrl && !hasFile) {
      return res.status(400).json({ success: false, error: 'Provide either a URL or a file to upload' })
    }

    const newResource = new Resource({
      title,
      description,
      type,
      classLevel,
      subject,
      externalUrl: trimmedUrl || undefined,
      fileName: hasFile ? fileName : undefined,
      fileSize: hasFile ? fileSize : undefined,
      fileMimeType: hasFile ? (fileMimeType || 'application/octet-stream') : undefined,
      fileData: hasFile ? fileBase64 : undefined,
      uploadedBy
    })

    // The download path points at the file-serving endpoint below.
    if (hasFile) {
      newResource.fileUrl = `/api/resources/${newResource._id}/file`
    }

    await newResource.save()

    // Never return the heavy base64 blob to the client.
    const saved = newResource.toObject()
    delete saved.fileData

    res.status(201).json({
      success: true,
      data: saved
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// Stream a stored uploaded file back to the client (students or teachers).
export const downloadResourceFile = async (req, res) => {
  try {
    const { resourceId } = req.params
    const resource = await Resource.findById(resourceId).select('+fileData fileName fileMimeType')
    if (!resource || !resource.fileData) {
      return res.status(404).json({ success: false, error: 'File not found' })
    }

    await Resource.findByIdAndUpdate(resourceId, { $inc: { downloadCount: 1 } })

    const buffer = Buffer.from(resource.fileData, 'base64')
    res.setHeader('Content-Type', resource.fileMimeType || 'application/octet-stream')
    res.setHeader('Content-Disposition', `inline; filename="${(resource.fileName || 'resource').replace(/"/g, '')}"`)
    return res.send(buffer)
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
    const hasAccess = Array.isArray(teacher.assignedStudents)
      && teacher.assignedStudents.some((assignedId) => String(assignedId) === String(studentId))
    if (teacher.role === 'teacher' && !hasAccess) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this student' })
    }

    // Get progress data (all weeks for this learner)
    const progressData = await Progress.find({ user: studentId }).lean()

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

// Class-wide analytics aggregated from every assigned student's real attempts.
export const getTeacherAnalytics = async (req, res) => {
  try {
    const teacherId = req.user?.userId
    const teacher = await User.findById(teacherId).populate('assignedStudents')
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found' })
    }

    const students = Array.isArray(teacher.assignedStudents) ? teacher.assignedStudents : []
    const studentIds = students.map((s) => s._id)
    const progressRecords = await Progress.find({ user: { $in: studentIds } }).lean()

    // Group progress records per student so we can summarise each learner.
    const byStudent = new Map()
    progressRecords.forEach((rec) => {
      const key = String(rec.user)
      if (!byStudent.has(key)) byStudent.set(key, [])
      byStudent.get(key).push(rec)
    })

    let totalQuizAttempts = 0
    let quizScoreSum = 0
    let totalPracticeAttempts = 0
    let activeStudents = 0

    const perStudent = students.map((student) => {
      const records = byStudent.get(String(student._id)) || []
      const quizAttempts = records.flatMap((r) => r.quizAttempts || [])
      const practiceAttempts = records.flatMap((r) => r.practiceAttempts || [])
      const lessonsCompleted = records.filter((r) => r.lessonCompleted).length
      const avgQuiz = quizAttempts.length
        ? Math.round(quizAttempts.reduce((s, a) => s + (a.percentage || 0), 0) / quizAttempts.length)
        : 0

      if (quizAttempts.length || practiceAttempts.length || lessonsCompleted) activeStudents += 1
      totalQuizAttempts += quizAttempts.length
      quizScoreSum += quizAttempts.reduce((s, a) => s + (a.percentage || 0), 0)
      totalPracticeAttempts += practiceAttempts.length

      return {
        id: student._id,
        name: student.name,
        email: student.email,
        lin: student.lin,
        classLevel: student.classLevel,
        lessonsCompleted,
        quizCount: quizAttempts.length,
        avgQuizScore: avgQuiz,
        practiceCount: practiceAttempts.length
      }
    })

    return res.json({
      success: true,
      data: {
        totalStudents: students.length,
        activeStudents,
        totalQuizAttempts,
        totalPracticeAttempts,
        classAvgQuizScore: totalQuizAttempts ? Math.round(quizScoreSum / totalQuizAttempts) : 0,
        students: perStudent
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// Attach a student to a teacher by student email
export const attachStudentByEmail = async (req, res) => {
  try {
    const teacherId = req.user?.userId
    // Accept an email or a LIN so teachers can attach students by either identifier.
    const identifier = String(req.body?.identifier || req.body?.email || req.body?.lin || '').trim()

    if (!identifier) {
      return res.status(400).json({ success: false, error: 'Student email or LIN is required' })
    }

    const teacher = await User.findById(teacherId)
    if (!teacher || (teacher.role !== 'teacher' && teacher.role !== 'admin')) {
      return res.status(403).json({ success: false, error: 'Not authorized to attach students' })
    }

    // Match LIN case-insensitively (and exactly) so stored-casing differences
    // never cause a miss; email is already stored lowercased.
    const safeLin = identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const student = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { lin: new RegExp(`^${safeLin}$`, 'i') }
      ]
    })
    if (!student) {
      return res.status(404).json({ success: false, error: 'No student found with that email or LIN' })
    }

    if (student.role !== 'student') {
      return res.status(400).json({ success: false, error: 'Only student accounts can be attached' })
    }

    const teacherDoc = await User.findById(teacherId)
    teacherDoc.assignedStudents = Array.isArray(teacherDoc.assignedStudents) ? teacherDoc.assignedStudents : []
    if (!teacherDoc.assignedStudents.some((id) => String(id) === String(student._id))) {
      teacherDoc.assignedStudents.push(student._id)
      await teacherDoc.save()
    }

    const refreshedTeacher = await User.findById(teacherId).populate('assignedStudents')

    return res.json({
      success: true,
      message: 'Student attached successfully',
      data: refreshedTeacher.assignedStudents
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
