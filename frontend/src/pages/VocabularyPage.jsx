import React, { useState, useMemo } from 'react'
import { BookMarked, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLearning } from '../context/LearningContext'
import syllabusContent from '../data/syllabusContent.json'
import './VocabularyPage.css'

const normalize = (value) => String(value || '').trim().toLowerCase()

// Curriculum vocabulary is stored as "Word (Meaning)"; split it into parts so we
// can show the term and its translation separately.
const parseEntry = (raw) => {
  const match = String(raw).match(/^(.*?)\s*\((.*)\)\s*$/)
  if (match) {
    return { word: match[1].trim(), definition: match[2].trim() }
  }
  return { word: String(raw).trim(), definition: '' }
}

const VocabularyPage = ({ user }) => {
  const { language: contextLanguage, currentClass } = useLearning()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const classLevel = user?.classLevel || currentClass || 'S1'
  const language = user?.language || contextLanguage || 'luganda'
  const languageLabel = normalize(language) === 'runyankole' ? 'Runyankole' : 'Luganda'

  // Build the real vocabulary bank from every syllabus topic for this class/language.
  const { vocabulary, categories } = useMemo(() => {
    const entries = syllabusContent.filter(
      (entry) => entry.class === classLevel && normalize(entry.language) === normalize(language)
    )

    const words = []
    entries.forEach((entry) => {
      ;(entry.vocabulary || []).forEach((raw, idx) => {
        const parsed = parseEntry(raw)
        if (parsed.word) {
          words.push({ id: `${entry.topic}-${idx}`, ...parsed, category: entry.topic })
        }
      })
    })

    const cats = ['All', ...Array.from(new Set(entries.map((e) => e.topic)))]
    return { vocabulary: words, categories: cats }
  }, [classLevel, language])

  const filteredVocab = vocabulary.filter((v) => {
    const matchesSearch =
      v.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.definition.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || v.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="vocabulary-page">
      <div className="vocab-header">
        <h1>Vocabulary Bank</h1>
        <p>Learn and master {languageLabel} words from your {classLevel} curriculum</p>
      </div>

      {/* Search and filter controls narrow the word list without leaving the page. */}
      <div className="vocab-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search words..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-filters">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
              whileHover={{ scale: 1.05 }}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

      {/* The list updates live as the user searches or changes categories. */}
      <div className="vocab-list">
        {filteredVocab.length > 0 ? (
          filteredVocab.map((item, idx) => (
            <motion.div
              key={item.id}
              className="vocab-item"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.03, 0.4) }}
            >
              <div className="vocab-left">
                <h3>{item.word}</h3>
                {item.definition && <p className="definition">{item.definition}</p>}
              </div>
              <div className="vocab-right">
                <span className="category-badge">{item.category}</span>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="no-results">
            <BookMarked size={48} />
            <p>{vocabulary.length === 0 ? 'Vocabulary for this class is coming soon.' : 'No words found matching your search'}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default VocabularyPage
