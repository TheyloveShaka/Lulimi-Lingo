import React, { useState, useEffect, useMemo } from 'react'
import { Download, Eye, Search, PlayCircle, FileText, Video, ExternalLink } from 'lucide-react'
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
      id: 'luganda-doc-1',
      title: 'Luganda Topic Notes - Greetings',
      type: 'document',
      uploadedBy: { name: 'Lulimi Lingo' },
      classLevel: 'S1',
      subject: 'Luganda',
      description: 'Class notes and key examples for greeting forms, responses, and usage.',
      fileName: 'luganda-greetings-notes.pdf'
    },
    {
      id: 'runyankole-doc-1',
      title: 'Runyankole Topic Notes - Greetings',
      type: 'document',
      uploadedBy: { name: 'Lulimi Lingo' },
      classLevel: 'S1',
      subject: 'Runyankole',
      description: 'Class notes and key examples for greeting forms, responses, and usage.',
      fileName: 'runyankole-greetings-notes.pdf'
    },
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
        const playlistId = parsed.searchParams.get('list')
        if (playlistId) {
          return `https://www.youtube.com/embed/videoseries?list=${playlistId}`
        }
        const videoId = parsed.searchParams.get('v')
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url
      }
      return url
    } catch (err) {
      return null
    }
  }

  const getYoutubeThumbnail = (url) => {
    if (!url) return null

    try {
      const parsed = new URL(url)
      let videoId = null

      if (parsed.hostname.includes('youtu.be')) {
        videoId = parsed.pathname.replace('/', '')
      }

      if (parsed.hostname.includes('youtube.com')) {
        videoId = parsed.searchParams.get('v') || parsed.pathname.split('/').pop()
      }

      return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null
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

  const filteredResources = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return resources.filter((resource) => {
      const haystack = [resource.title, resource.description, resource.subject, resource.type, resource.classLevel]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
  }, [resources, searchQuery])

  const documentResources = filteredResources.filter((resource) => resource.type === 'document')
  const videoResources = filteredResources.filter((resource) => resource.type === 'video')

  const ResourceCard = ({ resource, idx }) => {
    const isVideo = resource.type === 'video'
    const previewImage = isVideo ? getYoutubeThumbnail(resource.externalUrl) : null
    const embedUrl = isVideo ? getEmbedUrl(resource.externalUrl) : null

    return (
      <motion.div
        key={resource._id || resource.id}
        className={`resource-item ${isVideo ? 'video-item' : 'document-item'}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
      >
        <div className="resource-icon">
          {isVideo ? <Video size={32} /> : <FileText size={32} />}
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

          {isVideo && (
            <div className="resource-preview">
              {previewImage ? (
                <img
                  className="resource-thumbnail"
                  src={previewImage}
                  alt={`${resource.title} thumbnail`}
                  loading="lazy"
                />
              ) : (
                <div className="resource-thumbnail placeholder">
                  <PlayCircle size={42} />
                  <span>YouTube video</span>
                </div>
              )}

              {embedUrl && (
                <iframe
                  src={embedUrl}
                  title={resource.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          )}

          {!isVideo && resource.description && <p className="resource-description">{resource.description}</p>}
        </div>

        <button
          className="btn-download"
          onClick={() => resource.externalUrl && window.open(resource.externalUrl, '_blank')}
          disabled={!resource.externalUrl}
        >
          {resource.type === 'video' ? 'Watch' : 'Open'} <ExternalLink size={14} />
        </button>
      </motion.div>
    )
  }

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
          <>
            <section className="resource-group">
              <div className="resource-group-header">
                <h2>Documents</h2>
                <span>{documentResources.length}</span>
              </div>
              {documentResources.length > 0 ? (
                documentResources.map((resource, idx) => <ResourceCard key={resource._id || resource.id} resource={resource} idx={idx} />)
              ) : (
                <div className="no-resources compact"><p>No document resources found</p></div>
              )}
            </section>

            <section className="resource-group">
              <div className="resource-group-header">
                <h2>Videos</h2>
                <span>{videoResources.length}</span>
              </div>
              {videoResources.length > 0 ? (
                videoResources.map((resource, idx) => <ResourceCard key={resource._id || resource.id} resource={resource} idx={idx} />)
              ) : (
                <div className="no-resources compact"><p>No video resources found</p></div>
              )}
            </section>
          </>
        ) : (
          !loading && !error && <div className="no-resources"><p>No resources found</p></div>
        )}
      </div>
    </div>
  )
}

export default ResourcesPage
