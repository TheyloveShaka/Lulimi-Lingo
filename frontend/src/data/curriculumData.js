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
          {
            id: 18,
            number: 1,
            title: 'Accommodation & Housing',
            topics: [
              'Types of homes',
              'House vocabulary',
              'Room descriptions',
              'Household items'
            ],
            learningObjectives: [
              'Name types of accommodations',
              'Describe rooms and features',
              'Use housing-related vocabulary'
            ],
            keywords: ['house', 'home', 'room', 'door', 'window'],
            difficulty: 'intermediate',
            estimatedHours: 3,
            progress: 0,
            locked: true
          },
          {
            id: 19,
            number: 2,
            title: 'Health & Wellness',
            topics: [
              'Health conditions',
              'Medical vocabulary',
              'Wellness practices',
              'Healthcare services'
            ],
            learningObjectives: [
              'Discuss health topics',
              'Use medical vocabulary',
              'Seek healthcare assistance'
            ],
            keywords: ['health', 'medicine', 'doctor', 'sick', 'hospital'],
            difficulty: 'intermediate',
            estimatedHours: 3,
            progress: 0,
            locked: true
          },
          {
            id: 20,
            number: 3,
            title: 'Entertainment & Leisure',
            topics: [
              'Sports and games',
              'Entertainment vocabulary',
              'Hobbies and interests',
              'Cultural events'
            ],
            learningObjectives: [
              'Discuss leisure activities',
              'Name popular games and sports',
              'Express preferences'
            ],
            keywords: ['play', 'game', 'sport', 'fun', 'entertainment'],
            difficulty: 'intermediate',
            estimatedHours: 3,
            progress: 0,
            locked: true
          },
          {
            id: 21,
            number: 4,
            title: 'Technology & Modern Life',
            topics: [
              'Modern technology',
              'Digital communication',
              'Internet vocabulary',
              'Contemporary issues'
            ],
            learningObjectives: [
              'Use technology vocabulary',
              'Discuss digital communication',
              'Navigate modern topics'
            ],
            keywords: ['technology', 'phone', 'internet', 'computer', 'modern'],
            difficulty: 'intermediate',
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
            id: 22,
            number: 1,
            title: 'Environment & Nature',
            topics: [
              'Environmental vocabulary',
              'Plants and vegetation',
              'Water sources',
              'Conservation awareness'
            ],
            learningObjectives: [
              'Use nature vocabulary',
              'Discuss environmental topics',
              'Understand conservation'
            ],
            keywords: ['nature', 'tree', 'water', 'environment', 'forest'],
            difficulty: 'intermediate',
            estimatedHours: 4,
            progress: 0,
            locked: true
          },
          {
            id: 23,
            number: 2,
            title: 'Community & Society',
            topics: [
              'Community structures',
              'Social relationships',
              'Community roles',
              'Civic responsibility'
            ],
            learningObjectives: [
              'Understand community structures',
              'Discuss social relationships',
              'Express civic values'
            ],
            keywords: ['community', 'society', 'neighbor', 'village', 'people'],
            difficulty: 'intermediate',
            estimatedHours: 4,
            progress: 0,
            locked: true
          },
          {
            id: 24,
            number: 3,
            title: 'Advanced Cultural Studies',
            topics: [
              'Deep cultural analysis',
              'Traditional practices',
              'Cultural preservation',
              'Modern cultural blending'
            ],
            learningObjectives: [
              'Analyze cultural practices',
              'Appreciate linguistic diversity',
              'Understand cultural evolution'
            ],
            keywords: ['culture', 'tradition', 'custom', 'heritage', 'identity'],
            difficulty: 'advanced',
            estimatedHours: 4,
            progress: 0,
            locked: true
          }
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
          {
            id: 25,
            number: 1,
            title: 'Complex Grammar & Syntax',
            topics: [
              'Advanced tense usage',
              'Complex sentence structures',
              'Subjunctive moods',
              'Conditional expressions'
            ],
            learningObjectives: [
              'Master complex grammatical structures',
              'Use advanced syntax correctly',
              'Express nuanced meanings'
            ],
            keywords: ['grammar', 'syntax', 'complex', 'structure', 'conditional'],
            difficulty: 'advanced',
            estimatedHours: 5,
            progress: 0,
            locked: true
          },
          {
            id: 26,
            number: 2,
            title: 'Professional Communication',
            topics: [
              'Formal language',
              'Business vocabulary',
              'Professional presentations',
              'Negotiation skills'
            ],
            learningObjectives: [
              'Use professional language',
              'Navigate business contexts',
              'Present ideas effectively'
            ],
            keywords: ['professional', 'business', 'formal', 'presentation', 'negotiation'],
            difficulty: 'advanced',
            estimatedHours: 5,
            progress: 0,
            locked: true
          },
          {
            id: 27,
            number: 3,
            title: 'Literature & Composition',
            topics: [
              'Literary analysis',
              'Writing styles',
              'Narrative techniques',
              'Poetic expression'
            ],
            learningObjectives: [
              'Analyze literary texts',
              'Master writing techniques',
              'Appreciate linguistic artistry'
            ],
            keywords: ['literature', 'writing', 'style', 'narrative', 'poetry'],
            difficulty: 'advanced',
            estimatedHours: 5,
            progress: 0,
            locked: true
          },
          {
            id: 28,
            number: 4,
            title: 'Sociolinguistics & Dialects',
            topics: [
              'Language variation',
              'Dialects and accents',
              'Social language use',
              'Code-switching'
            ],
            learningObjectives: [
              'Understand language variation',
              'Appreciate dialectal differences',
              'Understand sociolinguistic contexts'
            ],
            keywords: ['dialect', 'sociolinguistics', 'variation', 'accent', 'code-switching'],
            difficulty: 'advanced',
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
            id: 29,
            number: 1,
            title: 'Advanced Vocabulary & Idioms',
            topics: [
              'Idiomatic expressions',
              'Specialized vocabulary',
              'Metaphorical language',
              'Figurative speech'
            ],
            learningObjectives: [
              'Master idiomatic language',
              'Use advanced vocabulary',
              'Understand figurative meanings'
            ],
            keywords: ['idiom', 'vocabulary', 'metaphor', 'figurative', 'expression'],
            difficulty: 'advanced',
            estimatedHours: 4,
            progress: 0,
            locked: true
          },
          {
            id: 30,
            number: 2,
            title: 'Research & Academic Skills',
            topics: [
              'Academic writing',
              'Research methodology',
              'Critical analysis',
              'Citation practices'
            ],
            learningObjectives: [
              'Conduct academic research',
              'Write scholarly papers',
              'Analyze information critically'
            ],
            keywords: ['research', 'academic', 'analysis', 'critical', 'methodology'],
            difficulty: 'advanced',
            estimatedHours: 5,
            progress: 0,
            locked: true
          },
          {
            id: 31,
            number: 3,
            title: 'Intercultural Communication',
            topics: [
              'Cross-cultural understanding',
              'Intercultural dialogue',
              'Cultural sensitivity',
              'Global perspectives'
            ],
            learningObjectives: [
              'Communicate across cultures',
              'Appreciate cultural differences',
              'Develop cultural competence'
            ],
            keywords: ['intercultural', 'communication', 'culture', 'diversity', 'global'],
            difficulty: 'advanced',
            estimatedHours: 4,
            progress: 0,
            locked: true
          }
        ]
      },
      Term3: {
        name: 'Term 3',
        weeks: [
          {
            id: 32,
            number: 1,
            title: 'Media Literacy & Discourse Analysis',
            topics: [
              'Media language',
              'Discourse analysis',
              'Critical media literacy',
              'Information evaluation'
            ],
            learningObjectives: [
              'Analyze media critically',
              'Understand discourse patterns',
              'Evaluate information sources'
            ],
            keywords: ['media', 'discourse', 'literacy', 'analysis', 'critical'],
            difficulty: 'advanced',
            estimatedHours: 4,
            progress: 0,
            locked: true
          },
          {
            id: 33,
            number: 2,
            title: 'Applied Linguistics & Translation',
            topics: [
              'Translation theory',
              'Linguistic analysis',
              'Language application',
              'Comparative linguistics'
            ],
            learningObjectives: [
              'Understand translation principles',
              'Apply linguistic knowledge',
              'Compare language structures'
            ],
            keywords: ['translation', 'linguistics', 'applied', 'comparative', 'equivalence'],
            difficulty: 'advanced',
            estimatedHours: 5,
            progress: 0,
            locked: true
          },
          {
            id: 34,
            number: 3,
            title: 'Mastery & Integration',
            topics: [
              'Language integration',
              'Fluency development',
              'Mastery consolidation',
              'Lifelong learning'
            ],
            learningObjectives: [
              'Achieve language fluency',
              'Integrate all skills',
              'Plan continued learning'
            ],
            keywords: ['mastery', 'fluency', 'integration', 'proficiency', 'learning'],
            difficulty: 'advanced',
            estimatedHours: 5,
            progress: 0,
            locked: true
          }
        ]
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
          {
            id: 35,
            number: 1,
            title: 'Exam Preparation - Grammar Review',
            topics: [
              'Grammar fundamentals review',
              'Common errors',
              'Tense mastery',
              'Sentence construction'
            ],
            learningObjectives: [
              'Review all grammar',
              'Identify and correct errors',
              'Master exam-style questions'
            ],
            keywords: ['exam', 'grammar', 'review', 'preparation', 'mastery'],
            difficulty: 'advanced',
            estimatedHours: 5,
            progress: 0,
            locked: true
          },
          {
            id: 36,
            number: 2,
            title: 'Listening & Comprehension Skills',
            topics: [
              'Listening strategies',
              'Comprehension techniques',
              'Note-taking skills',
              'Listening assessment'
            ],
            learningObjectives: [
              'Develop listening strategies',
              'Improve comprehension',
              'Master listening assessments'
            ],
            keywords: ['listening', 'comprehension', 'strategies', 'assessment', 'skills'],
            difficulty: 'advanced',
            estimatedHours: 4,
            progress: 0,
            locked: true
          },
          {
            id: 37,
            number: 3,
            title: 'Reading & Interpretation',
            topics: [
              'Reading strategies',
              'Text interpretation',
              'Analytical reading',
              'Response techniques'
            ],
            learningObjectives: [
              'Develop advanced reading skills',
              'Interpret complex texts',
              'Master reading assessments'
            ],
            keywords: ['reading', 'interpretation', 'analysis', 'comprehension', 'strategy'],
            difficulty: 'advanced',
            estimatedHours: 4,
            progress: 0,
            locked: true
          },
          {
            id: 38,
            number: 4,
            title: 'Writing & Essay Composition',
            topics: [
              'Essay structure',
              'Writing techniques',
              'Argument development',
              'Proofreading skills'
            ],
            learningObjectives: [
              'Master essay writing',
              'Structure arguments effectively',
              'Polish written work'
            ],
            keywords: ['writing', 'essay', 'composition', 'argument', 'technique'],
            difficulty: 'advanced',
            estimatedHours: 5,
            progress: 0,
            locked: true
          }
        ]
      },
      Term2: {
        name: 'Term 2',
        weeks: [
          {
            id: 39,
            number: 1,
            title: 'Speaking & Oral Expression',
            topics: [
              'Oral fluency',
              'Pronunciation accuracy',
              'Public speaking',
              'Response skills'
            ],
            learningObjectives: [
              'Achieve oral fluency',
              'Perfect pronunciation',
              'Master oral assessments'
            ],
            keywords: ['speaking', 'oral', 'fluency', 'pronunciation', 'expression'],
            difficulty: 'advanced',
            estimatedHours: 4,
            progress: 0,
            locked: true
          },
          {
            id: 40,
            number: 2,
            title: 'Language in Context & Application',
            topics: [
              'Contextual usage',
              'Real-world scenarios',
              'Practical application',
              'Situational language'
            ],
            learningObjectives: [
              'Apply language in context',
              'Navigate real scenarios',
              'Use language authentically'
            ],
            keywords: ['context', 'application', 'scenario', 'practical', 'authentic'],
            difficulty: 'advanced',
            estimatedHours: 4,
            progress: 0,
            locked: true
          },
          {
            id: 41,
            number: 3,
            title: 'Final Practice Exams & Assessment',
            topics: [
              'Full-length practice tests',
              'Exam techniques',
              'Time management',
              'Performance analysis'
            ],
            learningObjectives: [
              'Complete practice exams',
              'Master exam techniques',
              'Manage time effectively'
            ],
            keywords: ['exam', 'practice', 'assessment', 'technique', 'performance'],
            difficulty: 'advanced',
            estimatedHours: 5,
            progress: 0,
            locked: true
          }
        ]
      },
      Term3: {
        name: 'Term 3',
        weeks: [
          {
            id: 42,
            number: 1,
            title: 'Final Review & Consolidation',
            topics: [
              'Comprehensive review',
              'Skill consolidation',
              'Error analysis',
              'Strength identification'
            ],
            learningObjectives: [
              'Review all materials',
              'Consolidate learning',
              'Identify strong areas'
            ],
            keywords: ['review', 'consolidation', 'comprehensive', 'mastery', 'final'],
            difficulty: 'advanced',
            estimatedHours: 5,
            progress: 0,
            locked: true
          },
          {
            id: 43,
            number: 2,
            title: 'Confidence Building & Mindset',
            topics: [
              'Exam confidence',
              'Stress management',
              'Mental preparation',
              'Positive mindset'
            ],
            learningObjectives: [
              'Build exam confidence',
              'Manage exam stress',
              'Develop positive mindset'
            ],
            keywords: ['confidence', 'mindset', 'stress', 'preparation', 'mental'],
            difficulty: 'advanced',
            estimatedHours: 3,
            progress: 0,
            locked: true
          },
          {
            id: 44,
            number: 3,
            title: 'Post-Exam & Fluency Goals',
            topics: [
              'Beyond the exam',
              'Fluency goals',
              'Continued learning',
              'Language mastery'
            ],
            learningObjectives: [
              'Plan post-exam learning',
              'Set fluency goals',
              'Achieve language mastery'
            ],
            keywords: ['mastery', 'fluency', 'goals', 'beyond', 'achievement'],
            difficulty: 'advanced',
            estimatedHours: 3,
            progress: 0,
            locked: true
          }
        ]
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
