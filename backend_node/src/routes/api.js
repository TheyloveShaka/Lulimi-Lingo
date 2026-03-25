import express from 'express'
import { generateLesson, generatePractice, generateQuiz, chatWithTutor } from '../controllers/aiController.js'
import { getProgress, upsertProgress } from '../controllers/progressController.js'
import { signup, login, getCurrentUser, updateProgress, teacherSignup } from '../controllers/userController.js'
import { 
  getResourcesByClass, 
  getTeacherResources, 
  uploadResource, 
  deleteResource, 
  getResource,
  getStudentProgress,
  getTeacherStudents
} from '../controllers/resourceController.js'
import {
  getCurriculum,
  getClassCurriculumHandler,
  getTermCurriculumHandler,
  getMilestoneDetailsHandler,
  generateLessonContent,
  generateQuizContent,
  generatePracticeContent,
  generateResourceContent
} from '../controllers/curriculumController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

// Auth endpoints (no auth required)
router.post('/auth/signup', signup)
router.post('/auth/teacher-signup', teacherSignup)
router.post('/auth/login', login)

// Protected endpoints (require auth)
router.get('/auth/me', authMiddleware, getCurrentUser)
router.put('/auth/progress', authMiddleware, updateProgress)

// Curriculum endpoints (no auth required - public curriculum)
router.get('/curriculum', getCurriculum)
router.get('/curriculum/:classLevel', getClassCurriculumHandler)
router.get('/curriculum/:classLevel/:term', getTermCurriculumHandler)
router.get('/curriculum/:classLevel/:term/:milestoneId', getMilestoneDetailsHandler)

// Content generation endpoints (AI-powered)
router.post('/content/lesson', generateLessonContent)
router.post('/content/quiz', generateQuizContent)
router.post('/content/practice', generatePracticeContent)
router.post('/content/resource', generateResourceContent)

// Legacy AI endpoints (fallback to mock data)
router.post('/lesson', generateLesson)
router.post('/practice', generatePractice)
router.post('/quiz', generateQuiz)
router.post('/chat', chatWithTutor)

// New AI endpoints (explicit naming)
router.post('/ai/lesson', generateLesson)
router.post('/ai/practice', generatePractice)
router.post('/ai/quiz', generateQuiz)
router.post('/ai/chat', chatWithTutor)

// Progress endpoints (optional - can use /auth/progress instead)
router.get('/progress/:userId', getProgress)
router.post('/progress/:userId', upsertProgress)

// Resource endpoints
router.get('/resources/class/:classLevel', getResourcesByClass)
router.get('/resources/:resourceId', getResource)
router.get('/teacher/resources', authMiddleware, getTeacherResources)
router.post('/resources', authMiddleware, uploadResource)
router.delete('/resources/:resourceId', authMiddleware, deleteResource)

// Teacher dashboard endpoints
router.get('/teacher/students', authMiddleware, getTeacherStudents)
router.get('/teacher/student/:studentId/progress', authMiddleware, getStudentProgress)

export default router
