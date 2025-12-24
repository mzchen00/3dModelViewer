    import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import './ThreeViewer.css'

const ThreeViewer = ({ file, theme }) => {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const controlsRef = useRef(null)
  const modelRef = useRef(null)
  const gridRef = useRef(null)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modelInfo, setModelInfo] = useState(null)
  const [exposure, setExposure] = useState(1.2)

  // Initialize scene
  useEffect(() => {
    if (!containerRef.current) return

    // Create scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(5, 5, 5)
    cameraRef.current = camera

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    // Enable tone mapping for better color and brightness
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = exposure
    renderer.outputColorSpace = THREE.SRGBColorSpace
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controlsRef.current = controls

    // Add lights - Enhanced lighting system
    // Ambient light provides basic lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    // Main light source
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
    directionalLight.position.set(10, 10, 10)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    // Fill light
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5)
    directionalLight2.position.set(-10, 5, -10)
    scene.add(directionalLight2)

    // Add back light
    const backLight = new THREE.DirectionalLight(0xffffff, 0.3)
    backLight.position.set(0, 5, -10)
    scene.add(backLight)


    // Add grid floor
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222)
    scene.add(gridHelper)
    gridRef.current = gridHelper

    // Add axes helper
    const axesHelper = new THREE.AxesHelper(2)
    scene.add(axesHelper)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      containerRef.current?.removeChild(renderer.domElement)
    }
  }, [])

  // Update theme colors
  useEffect(() => {
    if (!sceneRef.current || !gridRef.current) return

    if (theme === 'light') {
      sceneRef.current.background = new THREE.Color(0xf5f5f7)
      // Update grid colors for light theme
      sceneRef.current.remove(gridRef.current)
      const newGrid = new THREE.GridHelper(20, 20, 0xcccccc, 0xeeeeee)
      sceneRef.current.add(newGrid)
      gridRef.current = newGrid
    } else {
      sceneRef.current.background = new THREE.Color(0x0a0a0a)
      // Update grid colors for dark theme
      sceneRef.current.remove(gridRef.current)
      const newGrid = new THREE.GridHelper(20, 20, 0x444444, 0x222222)
      sceneRef.current.add(newGrid)
      gridRef.current = newGrid
    }
  }, [theme])

  // Update exposure
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.toneMappingExposure = exposure
    }
  }, [exposure])

  // Load model
  useEffect(() => {
    if (!file || !sceneRef.current) return

    setLoading(true)
    setError(null)

    // Remove old model
    if (modelRef.current) {
      sceneRef.current.remove(modelRef.current)
      modelRef.current = null
    }

    const fileExtension = file.name.split('.').pop().toLowerCase()
    const url = URL.createObjectURL(file)

    const onLoadSuccess = (object) => {
      setLoading(false)
      
      // Calculate model bounding box
      const box = new THREE.Box3().setFromObject(object)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())

      // Center model
      object.position.x = -center.x
      object.position.y = -center.y
      object.position.z = -center.z

      // Create a group to contain the model
      const group = new THREE.Group()
      group.add(object)
      sceneRef.current.add(group)
      modelRef.current = group

      // Adjust camera position
      const maxDim = Math.max(size.x, size.y, size.z)
      const fov = cameraRef.current.fov * (Math.PI / 180)
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2))
    //   cameraZ *= 2 
      
      cameraRef.current.position.set(cameraZ, cameraZ, cameraZ)
      cameraRef.current.lookAt(0, 0, 0)
      controlsRef.current.target.set(0, 0, 0)
      controlsRef.current.update()

      // Set model info
      setModelInfo({
        vertices: countVertices(object),
        triangles: countTriangles(object),
        size: `${size.x.toFixed(2)} × ${size.y.toFixed(2)} × ${size.z.toFixed(2)}`
      })

      URL.revokeObjectURL(url)
    }

    const onLoadError = (err) => {
      console.error('Error loading model:', err)
      setError(`Load failed: ${err.message || 'Unknown error'}`)
      setLoading(false)
      URL.revokeObjectURL(url)
    }

    try {
      switch (fileExtension) {
        case 'gltf':
        case 'glb':
          const gltfLoader = new GLTFLoader()
          gltfLoader.load(url, (gltf) => onLoadSuccess(gltf.scene), undefined, onLoadError)
          break

        case 'obj':
          const objLoader = new OBJLoader()
          objLoader.load(url, onLoadSuccess, undefined, onLoadError)
          break

        case 'fbx':
          const fbxLoader = new FBXLoader()
          fbxLoader.load(url, onLoadSuccess, undefined, onLoadError)
          break

        case 'stl':
          const stlLoader = new STLLoader()
          stlLoader.load(url, (geometry) => {
            // Use brighter material
            const material = new THREE.MeshStandardMaterial({ 
              color: 0xcccccc,
              metalness: 0.3,
              roughness: 0.4,
              flatShading: false
            })
            const mesh = new THREE.Mesh(geometry, material)
            onLoadSuccess(mesh)
          }, undefined, onLoadError)
          break

        default:
          setError(`Unsupported file format: .${fileExtension}`)
          setLoading(false)
          URL.revokeObjectURL(url)
      }
    } catch (err) {
      onLoadError(err)
    }
  }, [file])

  // Helper function: count vertices
  const countVertices = (object) => {
    let count = 0
    object.traverse((child) => {
      if (child.isMesh) {
        count += child.geometry.attributes.position.count
      }
    })
    return count
  }

  // Helper function: count triangles
  const countTriangles = (object) => {
    let count = 0
    object.traverse((child) => {
      if (child.isMesh) {
        if (child.geometry.index) {
          count += child.geometry.index.count / 3
        } else {
          count += child.geometry.attributes.position.count / 3
        }
      }
    })
    return Math.floor(count)
  }

  return (
    <div className="three-viewer-container">
      <div ref={containerRef} className="three-canvas-container" />
      
      {loading && (
        <div className="three-loading-overlay">
          <div className="spinner"></div>
          <p>Loading model...</p>
        </div>
      )}
      
      {error && (
        <div className="three-error-message">
          <p>❌ {error}</p>
        </div>
      )}
      
      {modelInfo && !loading && !error && (
        <div className="model-stats">
          <div className="stat-item">
            <span className="stat-label">Vertices:</span>
            <span className="stat-value">{modelInfo.vertices.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Triangles:</span>
            <span className="stat-value">{modelInfo.triangles.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Size:</span>
            <span className="stat-value">{modelInfo.size}</span>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="exposure-control">
          <div className="control-header">
            <span className="control-label">💡 Exposure</span>
            <span className="control-value">{exposure.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.1"
            value={exposure}
            onChange={(e) => setExposure(parseFloat(e.target.value))}
            className="exposure-slider"
          />
        
        </div>
      )}
    </div>
  )
}

export default ThreeViewer
