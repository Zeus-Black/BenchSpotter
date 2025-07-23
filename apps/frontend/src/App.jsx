import { useState, useEffect } from 'react'
import Map from './components/Map'
import AddSpotModal from './components/AddSpotModal'

function App() {
  const [spots, setSpots] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchSpots()
  }, [])

  const fetchSpots = () => {
    fetch('http://localhost:3001/api/spots')
      .then(res => res.json())
      .then(data => {
        setSpots(data.spots)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  const handleAddSpot = (newSpot) => {
    setSpots(prev => [...prev, newSpot])
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-sky-blue to-rose-powder">
      {/* Header fixe */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🪑</span>
              <h1 className="text-2xl font-bold text-sage-green">BenchSpotter</h1>
              <span className="text-sm text-gray-600">
                {loading ? 'Chargement...' : `${spots.length} spots`}
              </span>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-sage-green to-peach-coral text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition-all"
            >
              ➕ Ajouter un banc
            </button>
          </div>
        </div>
      </header>

      {/* Carte plein écran */}
      <div className="flex-1">
        <Map spots={spots} />
      </div>

      {/* Modal d'ajout */}
      <AddSpotModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAddSpot={handleAddSpot}
      />
    </div>
  )
}

export default App
