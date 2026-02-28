import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import api from '../api/axios';

import AddPlaceDialog from './AddPlaceDialog';
import PlaceDetailsDialog from './PlaceDetailsDialog';
import { useAuth } from '../contexts/AuthContext';

// Fix pro chybějící ikony u Leaflet react wrapperu
const customIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1046/1046774.png', // Food/restaurant icon
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -40]
});

interface Place {
  _id: string;
  name: string;
  rating: number;
  lat: number;
  lon: number;
  address?: string;
}

function MapEventsHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapView() {
  const { user } = useAuth();
  const [places, setPlaces] = useState<Place[]>([]);
  
  // Dialog States
  const [addingLocation, setAddingLocation] = useState<{lat: number, lon: number, address?: string} | null>(null);
  const [viewingPlaceId, setViewingPlaceId] = useState<string | null>(null);

  const loadPlaces = async () => {
    try {
      const resp = await api.get('/places');
      setPlaces(resp.data.places || []);
    } catch (e) {
      console.error("Failed to load map places", e);
    }
  };

  useEffect(() => {
    loadPlaces();
  }, []);

  const handleMapClick = async (lat: number, lon: number) => {
    if (!user) {
      alert("Pro přidávání skvělých kebabáren se musíš přihlásit :)");
      return;
    }
    
    let addressOpt = '';
    try {
        // Reverse geocoding over OSM Nominatim
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        const data = await res.json();
        if (data && data.display_name) {
            addressOpt = data.display_name;
        }
    } catch(e) {
        console.error("Reverse geocoding error", e);
    }
    
    setAddingLocation({ lat, lon, address: addressOpt });
  };

  const handleFabClick = async () => {
      if (!user) {
          alert("Pro přidávání skvělých kebabáren se musíš přihlásit :)");
          return;
      }
      const addr = prompt("Zadej adresu podniku, který chceš přidat:");
      if (!addr) return;

      try {
          // Forward geocoding over OSM Nominatim
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}`);
          const data = await res.json();
          if (data && data.length > 0) {
              const { lat, lon, display_name } = data[0];
              setAddingLocation({ lat: Number(lat), lon: Number(lon), address: display_name });
          } else {
              alert("Adresa nebyla nalezena, zkus zadat město nebo přesnější údaje.");
          }
      } catch (e) {
          console.error("Geocoding error", e);
          alert("Chyba při vyhledávání adresy.");
      }
  };

  return (
    <div className="map-container">
      <MapContainer center={[50.0755, 14.4378]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        
        <MapEventsHandler onMapClick={handleMapClick} />

        <MarkerClusterGroup>
          {places.map((place) => (
            <Marker 
              key={place._id} 
              position={[place.lat, place.lon]} 
              icon={customIcon}
              eventHandlers={{
                  click: () => setViewingPlaceId(place._id),
              }}
            >
              <Popup>
                 <h3 style={{color: '#000', margin: 0}}>{place.name}</h3>
                 <p style={{color: '#666', margin: '5px 0'}}>{place.address}</p>
                 <strong style={{color: '#fca311'}}>⭐ {place.rating} / 10</strong>
                 <br />
                 <small style={{color: '#888', cursor: 'pointer', textDecoration: 'underline'}} onClick={() => setViewingPlaceId(place._id)}>
                   Klikni pro detail / recenzi
                 </small>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {addingLocation && (
        <AddPlaceDialog 
          lat={addingLocation.lat} 
          lon={addingLocation.lon} 
          initialAddress={addingLocation.address}
          onClose={() => setAddingLocation(null)}
          onAdded={() => {
             loadPlaces();
             setAddingLocation(null);
          }}
        />
      )}

      {viewingPlaceId && (
        <PlaceDetailsDialog
          placeId={viewingPlaceId}
          isLoggedIn={!!user}
          onClose={() => setViewingPlaceId(null)}
          onRatingAdded={loadPlaces}
        />
      )}

      {/* Floating Action Button (FAB) for adding new spot via Address */}
      <button 
         onClick={handleFabClick}
         style={{
             position: 'absolute',
             bottom: '30px',
             right: '30px',
             zIndex: 1000,
             width: '60px',
             height: '60px',
             borderRadius: '50%',
             backgroundColor: '#fca311',
             color: '#fff',
             fontSize: '36px',
             fontWeight: 'bold',
             border: 'none',
             cursor: 'pointer',
             boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             transition: 'transform 0.2s',
         }}
         title="Přidat přes vyhledání adresy"
         onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
         onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
          +
      </button>
    </div>
  );
}
