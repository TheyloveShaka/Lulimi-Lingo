import React, { useState } from 'react'
import { BookMarked, Volume2, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import './VocabularyPage.css'

const VocabularyPage = () => {
  const [vocabulary, setVocabulary] = useState([
    { id: 1, word: 'Olwadde', definition: 'Good morning', pronunciation: 'ohl-WAH-deh', category: 'Greetings' },
    { id: 2, word: 'Agandi', definition: 'How are you?', pronunciation: 'ah-GAHN-dee', category: 'Greetings' },
    { id: 3, word: 'Nsuubi', definition: 'Good', pronunciation: 'n-SOO-bee', category: 'Adjectives' },
    { id: 4, word: 'Omuntu', definition: 'Person', pronunciation: 'oh-MOON-too', category: 'Nouns' },
    { id: 5, word: 'Enkooko', definition: 'Chicken', pronunciation: 'en-KOH-koh', category: 'Animals' }
  ])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = ['All', 'Greetings', 'Nouns', 'Verbs', 'Adjectives', 'Animals', 'Food']

  const filteredVocab = vocabulary.filter(v => {
    const matchesSearch = v.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          v.definition.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || v.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="vocabulary-page">
      <div className="vocab-header">
        <h1>Vocabulary Bank</h1>
        <p>Learn and master new words in {localStorage.getItem('lulimiLingoCurrentUser') && JSON.parse(localStorage.getItem('lulimiLingoCurrentUser')).language === 'luganda' ? 'Luganda' : 'Runyankole'}</p>
      </div>

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
          {categories.map(cat => (
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

      <div className="vocab-list">
        {filteredVocab.length > 0 ? (
          filteredVocab.map((item, idx) => (
            <motion.div
              key={item.id}
              className="vocab-item"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="vocab-left">
                <h3>{item.word}</h3>
                <p className="pronunciation">{item.pronunciation}</p>
                <p className="definition">{item.definition}</p>
              </div>
              <div className="vocab-right">
                <span className="category-badge">{item.category}</span>
                <button className="btn-audio">
                  <Volume2 size={20} />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="no-results">
            <BookMarked size={48} />
            <p>No words found matching your search</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default VocabularyPage
