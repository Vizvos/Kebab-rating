import { useState } from 'react';
import api from '../api/axios';

interface Props {
  lat: number;
  lon: number;
  onClose: () => void;
  onAdded: (newPlace: any) => void;
  initialAddress?: string;
}

export default function AddPlaceDialog({ lat, lon, onClose, onAdded, initialAddress }: Props) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState(initialAddress || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    setLoading(true);
    try {
      const resp = await api.post('/places', {
        name,
        address,
        lat,
        lon
      });
      onAdded(resp.data.place);
      onClose();
    } catch (err) {
      console.error("Error creating place", err);
      alert("Chyba při zakládání místa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dialog-overlay" onClick={(e) => { if(e.target === e.currentTarget) onClose(); }}>
      <div className="dialog-box">
        <h2>Přidat Kebab Místo</h2>
        <p>Souřadnice: {lat.toFixed(4)}, {lon.toFixed(4)}</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Název podniku</label>
            <input 
              required 
              type="text" 
              placeholder="Např. Ali Kebab" 
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label>Adresa (volitelné)</label>
            <input 
              type="text" 
              placeholder="Masarykova 10..." 
              value={address} 
              onChange={e => setAddress(e.target.value)} 
            />
          </div>

          <div className="dialog-buttons">
            <button type="button" className="btn-cancel" onClick={onClose}>Zrušit</button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Ukládám..." : "Vytvořit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
