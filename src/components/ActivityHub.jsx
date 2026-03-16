import React, { useState, useEffect } from 'react';
import { Play, FileText, CheckCircle, Video, ExternalLink } from 'lucide-react';
import '../index.css';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

export default function ActivityHub() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'activities'), where('active', '==', true));
    const unsub = onSnapshot(q, (snap) => {
      setActivities(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      console.error("Activities listener failed:", err);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>טוען פעילויות...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', textAlign: 'right' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>מרכז הלמידה</h1>

      {activities.filter(a => a.type === 'video').map(activity => (
        <div key={activity.id} className="card animate-pop" style={{ marginBottom: '3rem', background: '#ffebee' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-red)' }}>
            <Video size={32} /> {activity.title}
          </h2>
          <div style={{ width: '100%', height: '300px', background: 'black', borderRadius: '24px', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(45deg, var(--primary-blue), var(--primary-green))', opacity: 0.8 }}></div>
            <button 
              className="giant-button" 
              style={{ zIndex: 10, width: '100px', height: '100px', borderRadius: '50%', background: 'white' }}
              onClick={() => window.open(activity.url, '_blank')}
            >
              <Play size={48} color="var(--primary-red)" style={{ marginRight: '8px' }} />
            </button>
          </div>
        </div>
      ))}

      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
        <FileText size={32} color="var(--primary-blue)" /> הפעילויות של היום
      </h2>

      <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {activities.filter(a => a.type !== 'video').map(activity => (
          <div key={activity.id} className="card animate-pop" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: '100%', height: '150px', background: '#e8f5e9', borderRadius: '16px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {activity.type === 'pdf' ? <FileText size={64} color="var(--primary-blue)" /> : <div style={{ border: '4px dashed var(--primary-green)', width: '80px', height: '80px', borderRadius: '50%' }}></div>}
            </div>
            <h3>{activity.title}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', marginTop: '0.5rem' }}>לחצו כדי להתחיל</p>
            <button 
                onClick={() => window.open(activity.url, '_blank')}
                style={{ padding: '1rem 2rem', borderRadius: '32px', border: 'none', background: 'var(--primary-green)', color: 'white', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              בואו נשחק <ExternalLink size={20} />
            </button>
          </div>
        ))}

        {activities.length === 0 && (
            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
                <p style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>אין פעילויות פעילות כרגע. חכו למורה!</p>
            </div>
        )}
      </div>
    </div>
  );
}
