# 3D Model Viewer

Online 3D model viewer built with React + Vite + Sketchfab API

## Features

- ✨ Real-time loading and rendering of 3D models
- 🎮 Interactive 3D viewing (rotate, zoom, pan)
- 📦 Built-in example models
- 🔗 Support for custom Sketchfab model IDs
- 📱 Responsive design
- 🚀 Fast build with Vite

## Installation

```bash
npm install
```

## Running the Project

```bash
npm run dev
```

The project will start at `http://localhost:3000`

## Usage Instructions

1. **Select Preset Model**: Click on the model list on the left to select different 3D models.
2. **Load Custom Model**:
   - Visit [Sketchfab](https://sketchfab.com)
   - Find a model you like
   - Copy the ID from the model URL
   - Paste it into the input box and click "Load Model"

## Tech Stack

- React 18
- Vite
- Sketchfab Viewer API
- CSS3

## Project Structure

```
3dModelProj/
├── src/
│   ├── components/
│   │   ├── SketchfabViewer.jsx    # 3D Viewer Component
│   │   └── SketchfabViewer.css    # Viewer Styles
│   ├── App.jsx                     # Main App Component
│   ├── App.css                     # App Styles
│   ├── main.jsx                    # App Entry
│   └── index.css                   # Global Styles
├── index.html
├── vite.config.js
└── package.json
```

## Notes

This project requires loading the Sketchfab API, please ensure:
1. Stable internet connection
2. Access to Sketchfab CDN
3. The model ID used is publicly accessible
