import React, { useState, useEffect } from 'react'
import { Download, Eye, Folder, Search, PlayCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import './ResourcesPage.css'

const ResourcesPage = ({ user }) => {
  const [resources, setResources] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const NODE_BACKEND_URL = import.meta.env.VITE_NODE_BACKEND_URL || 'https://lulimi-lingo-production.up.railway.app'
  const languageLabel = user?.language === 'runyankole' ? 'Runyankole' : 'Luganda'

  const seedResources = [
    {
      id: 'luganda-playlist-1',
      title: 'Luganda Learning Playlist 1',
      type: 'video',
      uploadedBy: { name: 'Lulimi Lingo' },
      classLevel: 'S1',
      subject: 'Luganda',
      externalUrl: 'https://youtube.com/playlist?list=PLLksNIleBPcangqV-p0PHl76OxMrOHr6h&si=Tbs8iL7Fgf2Q3u5O'
    },
    {
      id: 'luganda-playlist-2',
      title: 'Luganda Learning Playlist 2',
      type: 'video',
      uploadedBy: { name: 'Lulimi Lingo' },
      classLevel: 'S1',
      subject: 'Luganda',
      externalUrl: 'https://youtube.com/playlist?list=PLLksNIleBPcby2OmCxxBfkOM3GQHjQ0zS&si=whLSGHzIyLdKJT1x'
    },
    {
      id: 'luganda-playlist-3',
      title: 'Luganda Learning Playlist 3',
      type: 'video',
      uploadedBy: { name: 'Lulimi Lingo' },
      classLevel: 'S1',
      subject: 'Luganda',
      externalUrl: 'https://youtube.com/playlist?list=PLLksNIleBPcbTjFKa_tSNRAwmUXh1moza&si=UtwSNHUU0zY6G5ca'
    },
    {
      id: 'runyankole-playlist-1',
      title: 'Runyankole Learning Playlist 1',
      type: 'video',
      uploadedBy: { name: 'Lulimi Lingo' },
      classLevel: 'S1',
      subject: 'Runyankole',
      externalUrl: 'https://youtube.com/playlist?list=PLvSZu8m8rKfH1xqjp4G7lR8jWJ-icK73f&si=_05J18SWUARm2SmT'
    },
    {
      id: 'runyankole-playlist-2',
      title: 'Runyankole Learning Playlist 2',
      type: 'video',
      uploadedBy: { name: 'Lulimi Lingo' },
      classLevel: 'S1',
      subject: 'Runyankole',
      externalUrl: 'https://youtube.com/playlist?list=PLo9rCgqpILQPbJcaF7JOMMHn8yB9BjKWw&si=j8_vWPasQEX3ags7'
    },
    {
      id: 'runyankole-video-1',
      title: 'Runyankole Learning Video',
      type: 'video',
      uploadedBy: { name: 'Lulimi Lingo' },
      classLevel: 'S1',
      subject: 'Runyankole',
      externalUrl: 'https://youtu.be/CI5o9O1acdA?si=I7m2B7b9PGtGeYuN'
    }
  ]

  const getEmbedUrl = (url) => {
    if (!url) return null
    try {
      const parsed = new URL(url)
      if (parsed.hostname.includes('youtu.be')) {
        return `https://www.youtube.com/embed/${parsed.pathname.replace('/', '')}`
      }
      if (parsed.hostname.includes('youtube.com')) {
        const videoId = parsed.searchParams.get('v')
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url
      }
      return url
    } catch (err) {
      return null
    }
  }

  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoading(true)
        setError(null)
        const classLevel = user?.classLevel || 'S1'
        const response = await fetch(
          `${NODE_BACKEND_URL}/api/resources/class/${classLevel}?subject=${encodeURIComponent(languageLabel)}`
        )

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load resources')
        }
        const fetched = data.data || []
        if (fetched.length > 0) {
          setResources(fetched)
        } else {
          const classLevel = user?.classLevel || 'S1'
          setResources(
            seedResources.filter(
              (resource) => resource.subject === languageLabel && resource.classLevel === classLevel
            )
          )
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadResources()
  }, [user?.classLevel, languageLabel])

  const filteredResources = resources.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="resources-page">
      <div className="resources-header">
        <h1>Learning Resources</h1>
        <p>Access materials uploaded by your teachers for {languageLabel}</p>
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
        {loading && <div className="no-resources"><p>Loading resources...</p></div>}
        {error && !loading && <div className="no-resources"><p>{error}</p></div>}
        {!loading && !error && filteredResources.length > 0 ? (
          filteredResources.map((resource, idx) => (
            <motion.div
              key={resource._id || resource.id}
              className={`resource-item ${resource.type === 'video' ? 'video-item' : ''}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="resource-icon">
                {resource.type === 'video' ? <PlayCircle size={32} /> : <Folder size={32} />}
              </div>
              <div className="resource-info">
                <h3>{resource.title}</h3>
                <p className="sub-info">
                  By {resource.uploadedBy?.name || resource.uploadedBy || 'Teacher'} • {resource.type} • {resource.classLevel} • {resource.subject || languageLabel}
                </p>
                <div className="resource-stats">
                  <span><Eye size={14} /> {resource.viewCount || resource.views || 0}</span>
                  <span><Download size={14} /> {resource.downloadCount || resource.downloads || 0}</span>
                </div>
                {resource.type === 'video' && resource.externalUrl && getEmbedUrl(resource.externalUrl) && (
                  <div className="resource-video">
                    <iframe
                      src={getEmbedUrl(resource.externalUrl)}
                      title={resource.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
              <button
                className="btn-download"
                onClick={() => resource.externalUrl && window.open(resource.externalUrl, '_blank')}
                disabled={!resource.externalUrl}
              >
                {resource.type === 'video' ? 'Watch' : 'Open'}
              </button>
            </motion.div>
          ))
        ) : (
          !loading && !error && <div className="no-resources"><p>No resources found</p></div>
        )}
      </div>
    </div>
  )
}

export default ResourcesPage
