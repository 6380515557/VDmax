import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vdmax-backend.onrender.com'
const API_KEY = import.meta.env.VITE_API_KEY || 'VDmax-YourSecureKey-2025-ChangeME'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY
  },
  timeout: 600000
})

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMessage = error.response?.data?.detail || error.message || 'An error occurred'
    console.error('API Error:', errorMessage)
    throw new Error(errorMessage)
  }
)

// API Endpoints
export const checkServerStatus = () => apiClient.get('/')

export const getVideoInfo = (url) => 
  apiClient.post('/api/video-info', { url })

export const getDownloadUrl = (url, quality = 'best') => 
  apiClient.post(`/api/get-download-url?quality=${quality}`, { url })

export default apiClient
