import React from 'react'
import { Download, ExternalLink } from 'lucide-react'
import './DownloadButton.css'

const DownloadButton = ({ downloadData }) => {
  const handleDownload = () => {
    window.open(downloadData.download_url, '_blank')
  }

  return (
    <div className="download-button-container">
      <div className="download-success-card">
        <div className="success-icon">
          <Download size={48} />
        </div>
        
        <h3 className="success-title">Ready to Download!</h3>
        <p className="success-subtitle">{downloadData.title}</p>
        
        <div className="download-details">
          <div className="detail-item">
            <span className="detail-label">Quality:</span>
            <span className="detail-value">{downloadData.extension.toUpperCase()}</span>
          </div>
          {downloadData.filesize_mb && (
            <div className="detail-item">
              <span className="detail-label">Size:</span>
              <span className="detail-value">{downloadData.filesize_mb} MB</span>
            </div>
          )}
          <div className="detail-item">
            <span className="detail-label">Platform:</span>
            <span className="detail-value">{downloadData.platform.toUpperCase()}</span>
          </div>
        </div>

        <button onClick={handleDownload} className="final-download-button">
          <ExternalLink size={20} />
          <span>Download Now</span>
        </button>
      </div>
    </div>
  )
}

export default DownloadButton
