import React, { useState } from 'react'
import { Search, Link2, Youtube, Instagram } from 'lucide-react'
import './VideoInput.css'

const VideoInput = ({ onSubmit, loading }) => {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!url.trim()) {
      setError('Please enter a video URL')
      return
    }

    const urlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|instagram\.com|tiktok\.com|facebook\.com|fb\.watch|twitter\.com|x\.com)/i
    if (!urlPattern.test(url)) {
      setError('Please enter a valid video URL from supported platforms')
      return
    }

    onSubmit(url.trim())
  }

  return (
    <div className="video-input-container">
      <div className="input-header">
        <h1 className="input-title">
          <span className="gradient-text">VDmax</span> Video Downloader
        </h1>
        <p className="input-subtitle">Download videos from 1700+ websites in high quality</p>
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <div className="input-wrapper">
          <Link2 className="input-icon" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste video URL here (YouTube, Instagram, TikTok, Facebook, Twitter...)"
            className="video-input"
            disabled={loading}
          />
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? (
              <span className="button-loader"></span>
            ) : (
              <>
                <Search size={20} />
                <span>Fetch</span>
              </>
            )}
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </form>

      <div className="supported-platforms">
        <p className="platforms-label">Supported Platforms:</p>
        <div className="platform-icons">
          <Youtube size={24} className="platform-icon youtube" />
          <Instagram size={24} className="platform-icon instagram" />
          <svg viewBox="0 0 24 24" className="platform-icon tiktok" width="24" height="24">
            <path fill="currentColor" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
          </svg>
        </div>
      </div>
    </div>
  )
}

export default VideoInput
