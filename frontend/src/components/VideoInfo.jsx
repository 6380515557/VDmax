import React from 'react'
import { Clock, User, Monitor, CheckCircle2 } from 'lucide-react'
import './VideoInfo.css'

const VideoInfo = ({ videoData }) => {
  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getPlatformBadge = (platform) => {
    const colors = {
      youtube: '#ff0000',
      instagram: '#e4405f',
      tiktok: '#000000',
      facebook: '#1877f2',
      twitter: '#1da1f2',
      other: '#8b5cf6'
    }
    return colors[platform] || colors.other
  }

  return (
    <div className="video-info-container">
      <div className="video-card">
        {videoData.thumbnail && (
          <div className="thumbnail-wrapper">
            <img 
              src={videoData.thumbnail} 
              alt={videoData.title}
              className="video-thumbnail"
            />
            <div className="platform-badge" style={{ background: getPlatformBadge(videoData.platform) }}>
              {videoData.platform.toUpperCase()}
            </div>
          </div>
        )}
        
        <div className="video-details">
          <h2 className="video-title">{videoData.title}</h2>
          
          <div className="video-meta">
            {videoData.uploader && (
              <div className="meta-item">
                <User size={16} />
                <span>{videoData.uploader}</span>
              </div>
            )}
            {videoData.duration && (
              <div className="meta-item">
                <Clock size={16} />
                <span>{formatDuration(videoData.duration)}</span>
              </div>
            )}
            <div className="meta-item">
              <Monitor size={16} />
              <span>{videoData.formats?.length || 0} formats</span>
            </div>
            <div className="meta-item success">
              <CheckCircle2 size={16} />
              <span>Ready to download</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoInfo
