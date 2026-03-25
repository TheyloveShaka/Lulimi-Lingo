import React, { useState, useEffect } from 'react'
import { Download, Eye, Folder, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import './ResourcesPage.css'

const ResourcesPage = ({ user }) => {
  const [resources, setResources] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const mockResources = [
      { id: 1, title: 'Luganda Grammar Guide', type: 'PDF', uploadedBy: 'Mrs. Nakayima', classLevel: 'S1', views: 234, downloads: 56 },
      { id: 2, title: 'Pronunciation Guide', type: 'Video', uploadedBy: 'Mr. Sserwanga', classLevel: 'S1', views: 456, downloads: 89 },
      { id: 3, title: 'Cultural Context', type: 'Document', uploadedBy: 'Prof. Kabanza', classLevel: 'S2', views: 123, downloads: 34 }
    ]
    setResources(mockResources)
  }, [])

  const filteredResources = resources.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="resources-page">
      <div className="resources-header">
        <h1>Learning Resources</h1>
        <p>Access materials uploaded by your teachers</p>
      </div>

      <div className="search-box">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="resources-list">
        {filteredResources.length > 0 ? (
          filteredResources.map((resource, idx) => (
            <motion.div
              key={resource.id}
              className="resource-item"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="resource-icon">
                <Folder size={32} />
              </div>
              <div className="resource-info">
                <h3>{resource.title}</h3>
                <p className="sub-info">By {resource.uploadedBy} • {resource.type} • {resource.classLevel}</p>
                <div className="resource-stats">
                  <span><Eye size={14} /> {resource.views}</span>
                  <span><Download size={14} /> {resource.downloads}</span>
                </div>
              </div>
              <button className="btn-download">Download</button>
            </motion.div>
          ))
        ) : (
          <div className="no-resources"><p>No resources found</p></div>
        )}
      </div>
    </div>
  )
}

export default ResourcesPage
