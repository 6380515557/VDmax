import React from 'react'
import { Loader2 } from 'lucide-react'
import './Loader.css'

const Loader = ({ message = 'Loading...' }) => {
  return (
    <div className="loader-container">
      <div className="loader-content">
        <Loader2 className="loader-icon" />
        <p className="loader-message">{message}</p>
      </div>
    </div>
  )
}

export default Loader
