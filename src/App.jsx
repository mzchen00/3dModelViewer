import { useState, useRef, useEffect } from 'react'
import ThreeViewer from './components/ThreeViewer'
import './App.css'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileName, setFileName] = useState('')
  const [theme, setTheme] = useState('dark')
  const fileInputRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
      setFileName(file.name)
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
      setFileName(file.name)
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const handleClearFile = () => {
    setSelectedFile(null)
    setFileName('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <h1>3D PRINT VIEWER</h1>
            <p>Professional CAD & Mesh Visualization Studio</p>
          </div>
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </header>

      <div className="app-container">
        <aside className="sidebar">
          <div className="upload-section">
            <h2>Upload 3D Model</h2>
            
            <div 
              className="drop-zone"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="drop-zone-content">
                <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="drop-text">Drag and drop file here</p>
                <p className="drop-subtext">or click to select file</p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".glb,.gltf,.obj,.fbx,.stl"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            {fileName && (
              <div className="file-info">
                <div className="file-name">
                  <span className="file-icon">📄</span>
                  <span className="file-text">{fileName}</span>
                </div>
                <button className="clear-btn" onClick={handleClearFile}>
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className="supported-formats">
            <h3>Supported Formats</h3>
            <ul>
              <li><strong>GLB/GLTF</strong> - glTF 2.0 format</li>
              <li><strong>OBJ</strong> - Wavefront OBJ</li>
              <li><strong>FBX</strong> - Autodesk FBX</li>
              <li><strong>STL</strong> - STereoLithography</li>
            </ul>
          </div>

          <div className="tips">
            <h3>💡 Usage Tips</h3>
            <ul>
              <li>🖱️ Left click & drag: Rotate model</li>
              <li>🖱️ Right click & drag: Pan view</li>
              <li>📏 Scroll: Zoom in/out</li>
            </ul>
          </div>
        </aside>

        <main className="main-content">
          {selectedFile ? (
            <>
              <div className="model-info">
                <h2>{fileName}</h2>
                <p>Rendering your 3D model...</p>
              </div>
              <div className="viewer-wrapper">
                <ThreeViewer file={selectedFile} theme={theme} />
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-content">
                <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h2>Get Started</h2>
                <p>Upload a 3D model file to start viewing</p>
                <button 
                  className="upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Select File
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <footer className="app-footer">
        <p>&copy; 2025 3D Model Viewer. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
