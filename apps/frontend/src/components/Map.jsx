import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet'
import L from 'leaflet'

// Fix pour les icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

export default function Map({ spots = [] }) {
  const mapRef = useRef()
  const center = [48.8566, 2.3522]

  // Force le refresh de la carte après le rendu
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize()
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [spots])

  console.log('🗺️ Spots à afficher:', spots)

  return (
    <div className="h-full w-full" style={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={12}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        ref={mapRef}
        whenReady={() => {
          console.log('🗺️ Carte prête!')
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        
        <ZoomControl position="bottomright" />
        
        {spots && spots.length > 0 && spots.map((spot) => (
          <Marker
            key={spot.id}
            position={[parseFloat(spot.latitude), parseFloat(spot.longitude)]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg">🪑 {spot.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{spot.description}</p>
                <div className="flex items-center mt-2">
                  <span className="text-yellow-500">⭐</span>
                  <span className="ml-1 text-sm">Nouveau spot!</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
