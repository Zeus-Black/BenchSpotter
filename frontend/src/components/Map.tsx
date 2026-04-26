'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { Bench } from '@/types'

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'your_mapbox_public_token_here'

// Streets-v12 = look le plus proche Google Maps
const MAP_STYLE = 'mapbox://styles/mapbox/streets-v12'
const PARIS: [number, number] = [2.3522, 48.8566]

/* ─── Marker HTML ─────────────────────────────────────────────────────────── */
function injectMarkerStyles() {
  if (document.getElementById('bench-marker-styles')) return
  const s = document.createElement('style')
  s.id = 'bench-marker-styles'
  s.textContent = `
    .bench-pin {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: transform 0.18s cubic-bezier(.34,1.56,.64,1);
      transform-origin: bottom center;
    }
    .bench-pin:hover  { transform: translateY(-4px) scale(1.06); }
    .bench-pin.sel    { transform: translateY(-5px) scale(1.08); }

    .pin-head {
      width: 48px; height: 48px;
      border-radius: 50%;
      background: #ffffff;
      border: 2.5px solid #1c1814;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 14px rgba(0,0,0,0.22), 0 1px 4px rgba(0,0,0,0.10);
      transition: background 0.18s, border-color 0.18s, box-shadow 0.18s;
    }
    .bench-pin:hover .pin-head {
      border-color: #a67c45;
      box-shadow: 0 6px 20px rgba(166,124,69,0.35), 0 2px 6px rgba(0,0,0,0.10);
    }
    .bench-pin.sel .pin-head {
      background: #a67c45;
      border-color: #a67c45;
      box-shadow: 0 6px 24px rgba(166,124,69,0.50), 0 2px 8px rgba(0,0,0,0.12);
    }
    .bench-pin.sel .pin-head svg rect,
    .bench-pin.sel .pin-head svg path { fill: #fff; }

    .pin-stem {
      width: 2.5px; height: 9px;
      background: #1c1814;
      border-radius: 0 0 2px 2px;
      margin-top: -1px;
      transition: background 0.18s;
    }
    .bench-pin.sel .pin-stem  { background: #a67c45; }
    .bench-pin:hover .pin-stem { background: #a67c45; }

    .pin-dot {
      width: 5px; height: 5px;
      border-radius: 50%;
      background: rgba(0,0,0,0.2);
      filter: blur(2px);
      margin-top: 1px;
      transition: opacity 0.18s;
    }
    .bench-pin.sel .pin-dot { opacity: 0.4; }
  `
  document.head.appendChild(s)
}

function createPinEl(selected = false): HTMLElement {
  injectMarkerStyles()
  const wrap = document.createElement('div')
  wrap.className = `bench-pin${selected ? ' sel' : ''}`
  wrap.innerHTML = `
    <div class="pin-head">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="10" width="18" height="3.5" rx="1.75" fill="#1c1814"/>
        <rect x="4.5" y="7.5" width="15" height="2" rx="1" fill="#1c1814" opacity="0.45"/>
        <rect x="4.5" y="13.5" width="3.5" height="5" rx="1" fill="#1c1814"/>
        <rect x="16" y="13.5" width="3.5" height="5" rx="1" fill="#1c1814"/>
      </svg>
    </div>
    <div class="pin-stem"></div>
    <div class="pin-dot"></div>
  `
  return wrap
}

/* ─── Component ───────────────────────────────────────────────────────────── */
interface Props {
  benches: Bench[]
  selectedId: number | null
  onBenchClick: (b: Bench) => void
  onMapClick: (lat: number, lng: number) => void
  placingMode: boolean
}

export default function MapView({ benches, selectedId, onBenchClick, onMapClick, placingMode }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<mapboxgl.Map | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const markersRef   = useRef<globalThis.Map<number, { marker: mapboxgl.Marker; el: HTMLElement }>>(new globalThis.Map())

  // Always-fresh refs — no stale closures in map event handlers
  const onMapClickRef   = useRef(onMapClick)
  const onBenchClickRef = useRef(onBenchClick)
  const benchesRef      = useRef(benches)
  const selectedIdRef   = useRef(selectedId)

  useEffect(() => { onMapClickRef.current   = onMapClick },   [onMapClick])
  useEffect(() => { onBenchClickRef.current = onBenchClick }, [onBenchClick])
  useEffect(() => { benchesRef.current      = benches },      [benches])
  useEffect(() => { selectedIdRef.current   = selectedId },   [selectedId])

  /* fly to a spot */
  const flyTo = useCallback((lat: number, lng: number) => {
    mapRef.current?.flyTo({
      center: [lng, lat], zoom: 16.5, pitch: 55,
      bearing: Math.random() * 30 - 15,
      duration: 1300, essential: true,
    })
  }, [])

  /* add one marker to the map */
  const addMarker = useCallback((bench: Bench, map: mapboxgl.Map) => {
    if (markersRef.current.has(bench.id)) return
    const el = createPinEl(bench.id === selectedIdRef.current)
    const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([bench.longitude, bench.latitude])
      .addTo(map)
    const id = bench.id
    el.addEventListener('click', ev => {
      ev.stopPropagation()
      const cur = benchesRef.current.find(b => b.id === id)
      if (cur) onBenchClickRef.current(cur)
    })
    markersRef.current.set(bench.id, { marker, el })
  }, [])

  /* ── Map initialisation (runs once) ── */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    mapboxgl.accessToken = TOKEN

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: PARIS,
      zoom: 12,
      pitch: 40,
      bearing: -10,
      antialias: true,
    })

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right')
    map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
    }), 'top-right')

    map.on('load', () => {
      // 3D buildings — ton gris chaud Google Maps
      const labelId = map.getStyle().layers?.find(
        l => l.type === 'symbol' && (l as mapboxgl.SymbolLayer).layout?.['text-field']
      )?.id
      map.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 14,
        paint: {
          'fill-extrusion-color': '#e8e3da',
          'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 14, 0, 14.5, ['get', 'height']],
          'fill-extrusion-base':   ['interpolate', ['linear'], ['zoom'], 14, 0, 14.5, ['get', 'min_height']],
          'fill-extrusion-opacity': 0.75,
        },
      }, labelId)

      // Ajouter les marqueurs déjà chargés
      benchesRef.current.forEach(b => addMarker(b, map))
      setMapReady(true)
    })

    // Use ref so handler always sees latest callback
    map.on('click', e => onMapClickRef.current(e.lngLat.lat, e.lngLat.lng))

    mapRef.current = map

    // Géolocalisation
    navigator.geolocation?.getCurrentPosition(pos => {
      map.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 14, pitch: 40, duration: 1800 })
    })

    return () => { map.remove(); mapRef.current = null; setMapReady(false) }
  }, [addMarker]) // addMarker is stable (useCallback with no deps)

  /* ── Sync markers when benches list changes ── */
  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map) return

    // Supprimer les bancs retirés
    markersRef.current.forEach((_, id) => {
      if (!benches.find(b => b.id === id)) {
        markersRef.current.get(id)?.marker.remove()
        markersRef.current.delete(id)
      }
    })

    // Ajouter les nouveaux
    benches.forEach(b => addMarker(b, map))
  }, [benches, mapReady, addMarker])

  /* ── Highlight selected marker + fly ── */
  useEffect(() => {
    markersRef.current.forEach(({ el }, id) => {
      el.classList.toggle('sel', id === selectedId)
    })
    if (selectedId !== null) {
      const b = benches.find(b => b.id === selectedId)
      if (b) flyTo(b.latitude, b.longitude)
    }
  }, [selectedId, benches, flyTo])

  /* ── Cursor en placing mode ── */
  useEffect(() => {
    const c = mapRef.current?.getCanvas()
    if (c) c.style.cursor = placingMode ? 'crosshair' : ''
  }, [placingMode])

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" style={{ touchAction: 'none' }} />
}
