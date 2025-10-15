import React, { useState } from 'react'
import { Download, FileVideo, Sparkles } from 'lucide-react'
import './FormatSelector.css'

const FormatSelector = ({ formats, onDownload, loading }) => {
  const [selectedFormat, setSelectedFormat] = useState(null)

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  const getQualityBadge = (resolution) => {
    if (resolution >= 2160) return { label: '4K', color: '#ef4444' }
    if (resolution >= 1440) return { label: '2K', color: '#f59e0b' }
    if (resolution >= 1080) return { label: 'FHD', color: '#10b981' }
    if (resolution >= 720) return { label: 'HD', color: '#3b82f6' }
    return { label: 'SD', color: '#6b7280' }
  }

  const handleDownload = () => {
    if (selectedFormat) {
      onDownload(selectedFormat.quality.replace('p', ''))
    }
  }

  return (
    <div className="format-selector-container">
      <div className="selector-header">
        <h3 className="selector-title">
          <FileVideo size={24} />
          Select Quality & Download
        </h3>
        <p className="selector-subtitle">Choose your preferred video quality</p>
      </div>

      <div className="formats-grid">
        {formats.slice(0, 8).map((format, index) => {
          const badge = getQualityBadge(format.resolution)
          const isSelected = selectedFormat?.format_id === format.format_id

          return (
            <div
              key={format.format_id}
              className={`format-card ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedFormat(format)}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="format-badge" style={{ background: badge.color }}>
                {badge.label}
              </div>
              
              <div className="format-info">
                <div className="format-quality">{format.quality}</div>
                <div className="format-size">
                  {format.filesize_mb ? `${format.filesize_mb} MB` : 'Size unknown'}
                </div>
                <div className="format-specs">
                  <span className="spec-badge">{format.extension.toUpperCase()}</span>
                  {format.has_audio && format.has_video && (
                    <span className="spec-badge merged">
                      <Sparkles size={12} />
                      Merged
                    </span>
                  )}
                </div>
              </div>

              {isSelected && (
                <div className="selected-indicator">
                  <Download size={16} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button
        onClick={handleDownload}
        disabled={!selectedFormat || loading}
        className="download-main-button"
      >
        {loading ? (
          <>
            <span className="button-loader"></span>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Download size={20} />
            <span>Download {selectedFormat?.quality || ''}</span>
          </>
        )}
      </button>
    </div>
  )
}

export default FormatSelector
