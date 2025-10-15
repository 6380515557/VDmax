import React, { useState, useEffect } from 'react'
import VideoInput from './components/VideoInput'
import VideoInfo from './components/VideoInfo'
import FormatSelector from './components/FormatSelector'
import DownloadButton from './components/DownloadButton'
import Loader from './components/Loader'
import { getVideoInfo, getDownloadUrl, checkServerStatus } from './services/api'
import { AlertCircle, RefreshCw } from 'lucide-react'
import './App.css'

function App() {
  const [loading, setLoading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [videoData, setVideoData] = useState(null)
  const [downloadData, setDownloadData] = useState(null)
  const [error, setError] = useState(null)
  const [serverStatus, setServerStatus] = useState(null)

  useEffect(() => {
    checkServer()
  }, [])

  const checkServer = async () => {
    try {
      const status = await checkServerStatus()
      setServerStatus(status)
    } catch (err) {
      console.error('Server check failed:', err)
    }
  }

  const handleFetchVideo = async (url) => {
    setLoading(true)
    setError(null)
    setVideoData(null)
    setDownloadData(null)

    try {
      const data = await getVideoInfo(url)
      setVideoData(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch video information')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (quality) => {
    if (!videoData) return

    setDownloadLoading(true)
    setError(null)

    try {
      const data = await getDownloadUrl(videoData.formats[0].url.split('?')[0], quality)
      setDownloadData(data)
    } catch (err) {
      setError(err.message || 'Failed to generate download link')
    } finally {
      setDownloadLoading(false)
    }
  }

  const handleReset = () => {
    setVideoData(null)
    setDownloadData(null)
    setError(null)
  }

  return (
    <div className="app">
      <div className="app-background">
        <div className="gradient-blob blob-1"></div>
        <div className="gradient-blob blob-2"></div>
        <div className="gradient-blob blob-3"></div>
      </div>

      <div className="app-container">
        {serverStatus && (
          <div className="server-status">
            <div className="status-indicator online"></div>
            <span>{serverStatus.service} - {serverStatus.supported_sites} Sites</span>
          </div>
        )}

        <VideoInput onSubmit={handleFetchVideo} loading={loading} />

        {error && (
          <div className="error-container">
            <AlertCircle size={24} />
            <div>
              <h4>Error</h4>
              <p>{error}</p>
            </div>
          </div>
        )}

        {loading && <Loader message="Fetching video information..." />}

        {videoData && !loading && (
          <>
            <VideoInfo videoData={videoData} />
            <FormatSelector 
              formats={videoData.formats} 
              onDownload={handleDownload}
              loading={downloadLoading}
            />
          </>
        )}

        {downloadLoading && <Loader message="Generating download link..." />}

        {downloadData && !downloadLoading && (
          <DownloadButton downloadData={downloadData} />
        )}

        {(videoData || downloadData) && (
          <button onClick={handleReset} className="reset-button">
            <RefreshCw size={18} />
            <span>Download Another Video</span>
          </button>
        )}

        <footer className="app-footer">
          <p>Supports 1700+ websites including YouTube, Instagram, TikTok, Facebook, Twitter & more</p>
          <p className="footer-note">VDmax © 2025 - Universal Video Downloader</p>
        </footer>
      </div>
    </div>
  )
}

export default App
