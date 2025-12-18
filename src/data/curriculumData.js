// Uganda Local Language Curriculum Data Structure
// This file contains the complete curriculum structure for S1-S4
// Ready for AI integration and lesson generation

export const curriculumData = {
  S1: {
    name: 'Senior 1',
    description: 'Introduction to local language fundamentals',
    terms: {
      Term1: {
        name: 'Term 1',
        weeks: [
          {
            id: 1,
            number: 1,
            title: 'Greetings & Introductions',
            topics: [
              'Basic greetings (morning, afternoon, evening)',
              'Self-introduction',
              'Asking someone\'s name',
              'Responding to greetings'
            ],
            learningObjectives: [
              'Master common greeting phrases',
              'Introduce oneself in the local language',
              'Understand cultural greeting etiquette'
            ],
            keywords: ['greeting', 'introduction', 'name', 'hello', 'good morning'],
            difficulty: 'beginner',
            estimatedHours: 3,
            progress: 100,
            locked: false
          },
          {
            id: 2,
            number: 2,
            title: 'Family & Relations',
            topics: [
              'Family member names (father, mother, siblings)',
              'Extended family relationships',
              'Possessive pronouns for family'
            ],
            learningObjectives: [
              'Identify and name family members',
              'Describe family relationships',
              'Use possessive structures correctly'
            ],
            keywords: ['family', 'father', 'mother', 'brother', 'sister', 'relations'],
            difficulty: 'beginner',
            estimatedHours: 3,
            progress: 75,
            locked: false
          },
          {
            id: 3,
            number: 3,
            title: 'Numbers & Counting',
            topics: [
              'Numbers 1-100',
              'Counting objects',
              'Basic arithmetic vocabulary',
              'Age-related expressions'
            ],
            learningObjectives: [
              'Count from 1-100 accurately',
              'Ask and answer questions about quantity',
              'Express age'
            ],
            keywords: ['numbers', 'counting', 'age', 'quantity', 'how many'],
            difficulty: 'beginner',
            estimatedHours: 4,
            progress: 30,
            locked: false
          },
          {
            id: 4,
            number: 4,
            title: 'Colors & Objects',
            topics: [
              'Primary and secondary colors',
              'Common household objects',
              'Describing objects using colors'
            ],
            learningObjectives: [
              'Identify and name colors',
              'Describe objects using color adjectives',
              'Build basic descriptive sentences'
            ],
            keywords: ['colors', 'objects', 'describe', 'red', 'blue', 'green'],
            difficulty: 'beginner',
            estimatedHours: 3,
            progress: 0,
            locked: false
          },
          {
            id: 5,
            number: 5,
            title: 'Days & Time',
            topics: [
              'Days of the week',
              'Telling time',
              'Daily routines vocabulary',
              'Time expressions (morning, noon, night)'
            ],
            learningObjectives: [
              'Name all days of the week',
              'Tell and ask about time',
              'Describe daily activities'
            ],
            keywords: ['days', 'time', 'week', 'morning', 'evening', 'clock'],
            difficulty: 'beginner',
            estimatedHours: 4,
            progress: 0,
            locked: true
          }
        ]
      },
      Term2: {
        name: 'Term 2',
        weeks: [
          {
            id: 6,
            number: 6,
            title: 'Food & Meals',
            topics: [
              'Common food items',
              'Meal names (breakfast, lunch, dinner)',
              'Food preparation verbs',
              'Expressing hunger and thirst'
            ],
            learningObjectives: [
              'Name common food items',
              'Discuss meals and eating habits',
              'Use food-related verbs'
            ],
            keywords: ['food', 'eat', 'meal', 'hungry', 'drink'],
            difficulty: 'beginner',
            estimatedHours: 3,
            progress: 0,
            locked: true
          },
          {
            id: 7,
            number: 7,
            title: 'Body Parts',
            topics: [
              'External body parts',
              'Basic health vocabulary',
              'Expressing pain or discomfort'
            ],
            learningObjectives: [
              'Identify body parts',
              'Describe physical sensations',
              'Communicate basic health needs'
            ],
            keywords: ['body', 'head', 'hand', 'leg', 'pain', 'health'],
            difficulty: 'beginner',
            estimatedHours: 3,
            progress: 0,
            locked: true
          },
          {
            id: 8,
            number: 8,
            title: 'Animals',
            topics: [
              'Domestic animals',
              'Wild animals',
              'Animal sounds and behaviors',
              'Animal habitats'
            ],
            learningObjectives: [
              'Name common animals',
              'Describe animal characteristics',
              'Understand cultural significance of animals'
            ],
            keywords: ['animals', 'cow', 'goat', 'lion', 'domestic', 'wild'],
            difficulty: 'beginner',
            estimatedHours: 3,
            progress: 0,
            locked: true
          },
          {
            id: 9,
            number: 9,
            title: 'Weather & Seasons',
            topics: [
              'Weather conditions',
              'Seasonal vocabulary',
              'Climate-related expressions',
              'Agricultural connections to seasons'
            ],
            learningObjectives: [
              'Describe weather conditions',
              'Understand seasonal patterns',
              'Use weather-related vocabulary'
            ],
            keywords: ['weather', 'rain', 'sun', 'season', 'hot', 'cold'],
            difficulty: 'beginner',
            estimatedHours: 3,
            progress: 0,
            locked: true
          }
        ]
      },
      Term3: {
        name: 'Term 3',
        weeks: [
          {
            id: 10,
            number: 10,
            title: 'Directions & Location',
            topics: [
              'Cardinal directions',
              'Location prepositions',
              'Giving and following directions',
              'Landmark vocabulary'
            ],
            learningObjectives: [
              'Understand directional vocabulary',
              'Give simple directions',
              'Describe locations'
            ],
            keywords: ['direction', 'left', 'right', 'near', 'far', 'location'],
            difficulty: 'intermediate',
            estimatedHours: 4,
            progress: 0,
            locked: true
          },
          {
            id: 11,
            number: 11,
            title: 'Shopping & Market',
            topics: [
              'Market vocabulary',
              'Bargaining phrases',
              'Currency and prices',
              'Common goods and services'
            ],
            learningObjectives: [
              'Navigate market conversations',
              'Negotiate prices',
              'Handle basic transactions'
            ],
            keywords: ['market', 'buy', 'sell', 'price', 'money', 'bargain'],
            difficulty: 'intermediate',
            estimatedHours: 4,
            progress: 0,
            locked: true
          },
          {
            id: 12,
            number: 12,
            title: 'Cultural Stories & Proverbs',
            topics: [
              'Traditional folktales',
              'Common proverbs',
              'Moral lessons',
              'Cultural wisdom'
            ],
            learningObjectives: [
              'Understand cultural narratives',
              'Interpret proverbs',
              'Appreciate linguistic heritage'
            ],
            keywords: ['story', 'proverb', 'culture', 'wisdom', 'tradition'],
            difficulty: 'intermediate',
            estimatedHours: 4,
            progress: 0,
            locked: true
          }
        ]
      }
    }
  },
  S2: {
    name: 'Senior 2',
    description: 'Building intermediate language skills',
    terms: {
      Term1: {
        name: 'Term 1',
        weeks: [
          {
            id: 13,
            number: 1,
            title: 'Advanced Grammar - Tenses',
            topics: [
              'Present tense structures',
              'Past tense formations',
              'Future tense expressions',
              'Tense agreement'
            ],
            learningObjectives: [
              'Master basic tense structures',
              'Use tenses correctly in context',
              'Understand time markers'
            ],
            keywords: ['grammar', 'tense', 'present', 'past', 'future', 'verb'],
            difficulty: 'intermediate',
            estimatedHours: 4,
            progress: 0,
            locked: true
          },
          {
            id: 14,
            number: 2,
            title: 'Conversation Skills',
            topics: [
              'Dialogue construction',
              'Question formation',
              'Appropriate responses',
              'Cultural conversation norms'
            ],
            learningObjectives: [
              'Build coherent conversations',
              'Ask and answer questions naturally',
              'Apply cultural communication norms'
            ],
            keywords: ['conversation', 'dialogue', 'question', 'answer', 'speaking'],
            difficulty: 'intermediate',
            estimatedHours: 4,
            progress: 0,
            locked: true
          },
          {
            id: 15,
            number: 3,
            title: 'Occupations & Work',
            topics: [
              'Common professions',
              'Work-related vocabulary',
              'Career aspirations',
              'Workplace interactions'
            ],
            learningObjectives: [
              'Name various occupations',
              'Discuss career plans',
              'Use work-related language'
            ],
            keywords: ['work', 'job', 'teacher', 'doctor', 'profession'],
            difficulty: 'intermediate',
            estimatedHours: 3,
            progress: 0,
            locked: true
          },
          {
            id: 16,
            number: 4,
            title: 'School & Education',
            topics: [
              'School vocabulary',
              'Subjects and learning',
              'Classroom language',
              'Education system'
            ],
            learningObjectives: [
              'Use academic vocabulary',
              'Discuss educational topics',
              'Navigate school contexts'
            ],
            keywords: ['school', 'learn', 'study', 'subject', 'classroom'],
            difficulty: 'intermediate',
            estimatedHours: 3,
            progress: 0,
            locked: true
          },
          {
            id: 17,
            number: 5,
            title: 'Transportation',
            topics: [
              'Modes of transport',
              'Travel vocabulary',
              'Journey descriptions',
              'Public transport phrases'
            ],
            learningObjectives: [
              'Discuss transportation',
              'Describe journeys',
              'Use travel-related language'
            ],
            keywords: ['transport', 'travel', 'car', 'bus', 'journey'],
            difficulty: 'intermediate',
            estimatedHours: 3,
            progress: 0,
            locked: true
          }
        ]
      },
      Term2: {
        name: 'Term 2',
        weeks: [
          // Additional S2 Term 2 weeks would go here
        ]
      },
      Term3: {
        name: 'Term 3',
        weeks: [
          // Additional S2 Term 3 weeks would go here
        ]
      }
    }
  },
  S3: {
    name: 'Senior 3',
    description: 'Advanced language proficiency',
    terms: {
      Term1: {
        name: 'Term 1',
        weeks: [
          // S3 weeks would go here
        ]
      },
      Term2: {
        name: 'Term 2',
        weeks: []
      },
      Term3: {
        name: 'Term 3',
        weeks: []
      }
    }
  },
  S4: {
    name: 'Senior 4',
    description: 'Exam preparation and mastery',
    terms: {
      Term1: {
        name: 'Term 1',
        weeks: [
          // S4 weeks would go here
        ]
      },
      Term2: {
        name: 'Term 2',
        weeks: []
      },
      Term3: {
        name: 'Term 3',
        weeks: []
      }
    }
  }
}

// Helper functions for working with curriculum data

export const getClassData = (classId) => {
  return curriculumData[classId] || null
}

export const getTermData = (classId, termId) => {
  const classData = getClassData(classId)
  return classData ? classData.terms[termId] : null
}

export const getWeekData = (classId, termId, weekId) => {
  const termData = getTermData(classId, termId)
  if (!termData) return null
  return termData.weeks.find(week => week.id === weekId) || null
}

export const getAllWeeks = (classId) => {
  const classData = getClassData(classId)
  if (!classData) return []
  
  const allWeeks = []
  Object.values(classData.terms).forEach(term => {
    allWeeks.push(...term.weeks)
  })
  return allWeeks
}

export const getProgressStats = (classId) => {
  const weeks = getAllWeeks(classId)
  if (weeks.length === 0) return { total: 0, completed: 0, inProgress: 0, locked: 0 }
  
  const stats = {
    total: weeks.length,
    completed: weeks.filter(w => w.progress === 100).length,
    inProgress: weeks.filter(w => w.progress > 0 && w.progress < 100).length,
    locked: weeks.filter(w => w.locked).length,
    averageProgress: Math.round(weeks.reduce((sum, w) => sum + w.progress, 0) / weeks.length)
  }
  
  return stats
}

export const getNextUnlockedWeek = (classId, termId) => {
  const termData = getTermData(classId, termId)
  if (!termData) return null
  
  return termData.weeks.find(week => !week.locked && week.progress < 100) || null
}

// Export for use in components
export default curriculumData
