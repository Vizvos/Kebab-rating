import { useState, useEffect } from 'react';
import api from '../api/axios';

interface Rating {
  _id: string;
  foodName: string;
  score: number;
  description: string;
  createdAt: string;
  authorName?: string;
}

interface Place {
  _id: string;
  name: string;
  rating: number;
  address?: string;
  lat: number;
  lon: number;
}

interface Props {
  placeId: string;
  onClose: () => void;
  onRatingAdded: () => void;
  isLoggedIn: boolean;
}

export default function PlaceDetailsDialog({ placeId, onClose, onRatingAdded, isLoggedIn }: Props) {
  const [place, setPlace] = useState<Place | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [foodName, setFoodName] = useState('');
  const [score, setScore] = useState(5);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const { data } = await api.get(`/places/${placeId}`);
        setPlace(data.place);
        setRatings(data.ratings);
      } catch (e) {
        console.error("Failed to load details");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [placeId]);

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/places/${placeId}/ratings`, {
        foodName,
        score: Number(score),
        description
      });
      // Fetch fresh data
      const { data } = await api.get(`/places/${placeId}`);
      setPlace(data.place);
      setRatings(data.ratings);
      setShowForm(false);
      onRatingAdded();
      
      // Clear form
      setFoodName(''); setScore(5); setDescription('');
    } catch (err) {
      console.error("Něco se pokazilo", err);
      alert("Přihlášení nebo data narazila na problém");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;
  if (!place) return null;

  return (
    <div className="dialog-overlay" onClick={(e) => { if(e.target === e.currentTarget) onClose(); }}>
      <div className="dialog-box">
        <h2>{place.name} <span style={{color: 'white', fontWeight: 300}}>⭐ {place.rating}</span></h2>
        {place.address && <p>{place.address}</p>}

        {!showForm ? (
          <>
            <div className="ratings-list">
              {ratings.length === 0 ? <p>Zatím žádná hodnocení.</p> : ratings.map(r => (
                <div key={r._id} className="rating-item">
                  <h4>{r.foodName} <span style={{float: 'right', color: '#fff'}}> {r.score} / 10</span></h4>
                  <p>{r.description}</p>
                  <p style={{textAlign: 'right', fontSize: '0.8em', fontStyle: 'italic', margin: '5px 0 0 0', color: '#aaa'}}>
                     - {r.authorName || 'Anonym'}
                  </p>
                </div>
              ))}
            </div>

            <div className="dialog-buttons">
              <button type="button" className="btn-cancel" onClick={onClose}>Zavřít</button>
              {isLoggedIn ? (
                 <button type="button" className="btn-submit" onClick={() => setShowForm(true)}>Napsat Recenzi</button>
              ) : (
                 <p style={{marginLeft: 'auto'}}>Přihlas se pro recenzování</p>
              )}
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmitRating}>
            <div className="form-group">
              <label>Název Jídla</label>
              <input required type="text" value={foodName} onChange={e => setFoodName(e.target.value)} />
            </div>
            
            <div className="form-group">
              <label>Skóre: <strong style={{color: '#fca311'}}>{score} / 10</strong></label>
              <div className="stars-container">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(star => (
                   <span 
                     key={star} 
                     onClick={() => setScore(star)} 
                     style={{ 
                         opacity: score >= star ? 1 : 0.3,
                         transition: 'opacity 0.2s',
                         userSelect: 'none'
                     }}
                   >
                       ⭐
                   </span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Recenze / Hodnocení</label>
              <textarea required rows={3} value={description} onChange={e => setDescription(e.target.value)}></textarea>
            </div>

            <div className="dialog-buttons">
              <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Zpět</button>
              <button type="submit" className="btn-submit" disabled={submitting}>
                 {submitting ? 'Odesílám...' : 'Odeslat recenzi'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
