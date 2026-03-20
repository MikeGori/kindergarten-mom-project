import React, { useState, useEffect } from 'react';
import { Play, FileText, CheckCircle, Video, ExternalLink, Image as ImageIcon, Gamepad2, Music, Palette, BookOpen, Rocket, Star, Heart, Smile, Sun } from 'lucide-react';
import '../index.css';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, where, addDoc, doc, updateDoc } from 'firebase/firestore';

export default function ActivityHub({ userRole, student }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [activeIframe, setActiveIframe] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'activities'), where('active', '==', true));
    const unsub = onSnapshot(q, (snap) => {
      const loadedActivities = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => {
          const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
          const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
          return timeB - timeA;
      });
      setActivities(loadedActivities);
      setLoading(false);
    }, (err) => {
      console.error("Activities listener failed:", err);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleToggleRouting = async (activity, e) => {
      if (e) e.stopPropagation();
      try {
          await updateDoc(doc(db, 'activities', activity.id), {
              requiresNewTab: !activity.requiresNewTab
          });
      } catch (err) {
          console.error("Failed to toggle activity routing", err);
      }
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>טוען פעילויות...</div>;

  const handleActivityClick = async (activity) => {
    if (activity.type === 'image') {
       setSelectedImage(activity.url);
    } else if (activity.type === 'audio') {
       setSelectedAudio({ url: activity.url, title: activity.title, bgImage: activity.bgImage || null });
    } else if (activity.requiresNewTab) {
       // Teacher explicitly flagged this activity to bypass the sandbox due to blockages
       window.open(activity.url, '_blank');
    } else {
       let finalUrl = activity.url;
       
       // Transform YouTube links to embed format to bypass X-Frame-Options blocks
       try {
           if (finalUrl.includes('youtube.com/watch?v=')) {
               finalUrl = finalUrl.replace('watch?v=', 'embed/');
               const ampersandIndex = finalUrl.indexOf('&');
               if (ampersandIndex !== -1) finalUrl = finalUrl.substring(0, ampersandIndex);
           } else if (finalUrl.includes('youtu.be/')) {
               const videoId = finalUrl.split('youtu.be/')[1].split('?')[0];
               finalUrl = `https://www.youtube.com/embed/${videoId}`;
           } else if (finalUrl.includes('youtube.com/shorts/')) {
               const videoId = finalUrl.split('youtube.com/shorts/')[1].split('?')[0];
               finalUrl = `https://www.youtube.com/embed/${videoId}`;
           } else if (finalUrl.includes('vimeo.com/')) {
               const videoId = finalUrl.split('vimeo.com/')[1].split('?')[0];
               finalUrl = `https://player.vimeo.com/video/${videoId}`;
           }
       } catch (e) {
           console.warn("Failed to parse URL:", e);
       }

       setActiveIframe({ url: finalUrl, title: activity.title });
    }
    
    if (userRole === 'student' && student) {
       try {
           await addDoc(collection(db, 'activityClicks'), {
               studentId: student.id,
               studentName: student.name,
               activityId: activity.id,
               activityTitle: activity.title,
               timestamp: new Date()
           });
       } catch (err) {
           console.error("Failed to log activity click", err);
       }
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', textAlign: 'right', paddingBottom: '8rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>מרכז הלמידה</h1>

      {activities.filter(a => a.type === 'video').map(activity => {
        const iconMap = { Gamepad2, Music, Palette, BookOpen, Rocket, Star, Heart, Smile, Sun, Video, ImageIcon, FileText, Link: ExternalLink };
        const TypeIcon = iconMap[activity.icon] || Video;
        const displayColor = activity.color || 'var(--primary-red)';

        return (
        <div key={activity.id} className="card animate-pop" style={{ position: 'relative', marginBottom: '3rem', background: '#fafafa', border: `3px solid ${displayColor}` }}>
          {userRole === 'teacher' && (
             <button 
                onClick={(e) => handleToggleRouting(activity, e)}
                style={{ position: 'absolute', top: '10px', left: '10px', background: activity.requiresNewTab ? '#ffebee' : '#e8f5e9', color: activity.requiresNewTab ? 'var(--primary-red)' : 'var(--primary-green)', padding: '0.5rem 1rem', borderRadius: '12px', border: 'none', cursor: 'pointer', zIndex: 10, boxShadow: 'var(--shadow-soft)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                title="החלף פתיחה בחלון חדש / לכוד באפליקציה"
             >
                {activity.requiresNewTab ? '🔗 נפתח בחלון חדש' : '🏠 לכוד באפליקציה'}
             </button>
          )}

          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: displayColor, marginTop: userRole === 'teacher' ? '2.5rem' : '0' }}>
            <TypeIcon size={32} /> {activity.title}
          </h2>
          <div style={{ width: '100%', height: '300px', background: 'black', borderRadius: '24px', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', boxShadow: `0 10px 30px ${displayColor}40` }}>
            {activity.bgImage && (
                <img src={activity.bgImage} alt={activity.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
            )}
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(45deg, ${displayColor}, var(--primary-blue))`, opacity: activity.bgImage ? 0.3 : 0.8 }}></div>
            <button 
              className="giant-button" 
              style={{ zIndex: 10, width: '100px', height: '100px', borderRadius: '50%', background: 'white', border: `4px solid ${displayColor}` }}
              onClick={() => handleActivityClick(activity)}
            >
              <Play size={44} color={displayColor} style={{ marginLeft: '6px' }} />
            </button>
          </div>
        </div>
        );
      })}

      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
        <FileText size={32} color="var(--primary-blue)" /> הפעילויות של היום
      </h2>

      <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {activities.filter(a => a.type !== 'video').map(activity => {
          const iconMap = { Gamepad2, Music, Palette, BookOpen, Rocket, Star, Heart, Smile, Sun, Video, ImageIcon, FileText, Link: ExternalLink };
          const TypeIcon = iconMap[activity.icon] || iconMap[activity.type === 'image' ? 'ImageIcon' : activity.type === 'pdf' ? 'FileText' : 'Link'] || Star;
          const displayColor = activity.color || 'var(--primary-green)';

          return (
          <div key={activity.id} className="card animate-pop" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', borderTop: `8px solid ${displayColor}` }}>
            {userRole === 'teacher' && activity.type !== 'image' && activity.type !== 'audio' && (
               <button 
                  onClick={(e) => handleToggleRouting(activity, e)}
                  style={{ position: 'absolute', top: '10px', left: '10px', background: activity.requiresNewTab ? '#ffebee' : '#e8f5e9', color: activity.requiresNewTab ? 'var(--primary-red)' : 'var(--primary-green)', padding: '0.4rem 0.8rem', borderRadius: '12px', border: 'none', cursor: 'pointer', zIndex: 10, boxShadow: 'var(--shadow-soft)', fontWeight: 'bold', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  title="החלף פתיחה בחלון חדש / לכוד באפליקציה"
               >
                  {activity.requiresNewTab ? '🔗 נפתח בנפרד' : '🏠 לכוד בגן'}
               </button>
            )}

            <div style={{ position: 'relative', width: '100%', height: '150px', background: activity.type === 'image' ? '#f3e5f5' : '#fafafa', borderRadius: '16px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginTop: userRole === 'teacher' && activity.type !== 'image' && activity.type !== 'audio' ? '2.5rem' : '0' }}>
                {(activity.bgImage || activity.type === 'image') ? (
                    <img src={activity.bgImage || activity.url} alt={activity.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <TypeIcon size={72} color={displayColor} />
                )}
                
                {(activity.bgImage || activity.type === 'image') && (
                    <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'white', padding: '6px', borderRadius: '50%', boxShadow: '0 4px 8px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <TypeIcon size={24} color={displayColor} />
                    </div>
                )}
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>{activity.title}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', marginTop: '0.5rem', fontWeight: 600 }}>{activity.type === 'image' ? 'תמונה מהמורה' : 'לחצו כדי להתחיל'}</p>
            {activity.type === 'image' ? (
                <button 
                  onClick={() => handleActivityClick(activity)}
                  style={{ padding: '1rem 2rem', borderRadius: '32px', border: 'none', background: 'var(--primary-purple)', color: 'white', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 8px 20px hsla(262, 70%, 68%, 0.3)' }}
                >
                  הגדל תמונה <ImageIcon size={20} />
                </button>
            ) : activity.type === 'audio' ? (
                <button 
                  onClick={() => handleActivityClick(activity)}
                  style={{ padding: '1rem 2rem', borderRadius: '32px', border: 'none', background: 'var(--primary-purple)', color: 'white', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 8px 20px hsla(262, 70%, 68%, 0.3)' }}
                >
                  בואו נשיר <Music size={20} />
                </button>
            ) : (
                <button 
                    onClick={() => handleActivityClick(activity)}
                    style={{ padding: '1rem 2rem', borderRadius: '32px', border: 'none', background: displayColor, color: 'white', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: `0 8px 20px ${displayColor}66` }}
                >
                  בואו נשחק <ExternalLink size={20} />
                </button>
            )}
          </div>
          );
        })}

        {activities.length === 0 && (
            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
                <p style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>אין פעילויות פעילות כרגע. חכו למורה!</p>
            </div>
        )}
      </div>

      {/* Fullscreen Image Modal */}
      {selectedImage && (
          <div 
            onClick={() => setSelectedImage(null)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', cursor: 'zoom-out' }}
          >
              <img src={selectedImage} alt="Enlarged Activity" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', objectFit: 'contain' }} />
              <button 
                onClick={() => setSelectedImage(null)}
                style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'white', border: 'none', width: '50px', height: '50px', borderRadius: '50%', fontSize: '1.5rem', fontWeight: 'bold', color: 'black', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                  ✕
              </button>
          </div>
      )}

      {/* Audio Player Modal */}
      {selectedAudio && (
          <div 
            onClick={() => setSelectedAudio(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', cursor: 'zoom-out' }}
          >
              <div 
                 onClick={e => e.stopPropagation()} 
                 className="card animate-pop" 
                 style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '32px', maxWidth: '400px', width: '100%', cursor: 'default' }}
              >
                 <div style={{ width: '150px', height: '150px', margin: '0 auto 2rem auto', borderRadius: '50%', background: 'var(--primary-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: 'var(--shadow-soft)' }}>
                    {selectedAudio.bgImage ? (
                        <img src={selectedAudio.bgImage} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <Music size={80} color="white" />
                    )}
                 </div>
                 <h2 style={{ fontSize: '2rem', color: 'var(--primary-blue)', marginBottom: '2rem' }}>{selectedAudio.title}</h2>
                 <audio 
                    src={selectedAudio.url} 
                    controls 
                    autoPlay 
                    style={{ width: '100%', outline: 'none' }}
                 />
                  <button 
                   onClick={() => setSelectedAudio(null)}
                   className="giant-button"
                   style={{ width: '100%', height: 'auto', padding: '1rem', marginTop: '2rem', background: '#ffebee', color: 'var(--primary-red)', fontSize: '1.2rem', fontWeight: 'bold' }}
                 >
                   סגור שיר
                 </button>
              </div>
          </div>
      )}

      {/* Web IFrame Sandbox Modal */}
      {activeIframe && (
          <div 
            onClick={() => setActiveIframe(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          >
              <div 
                  onClick={(e) => e.stopPropagation()}
                  className="card animate-pop" 
                  style={{ width: '100%', maxWidth: '1000px', height: '85vh', display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.9)', padding: '1.5rem', overflow: 'hidden', borderRadius: '32px', border: '4px solid var(--primary-blue)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
              >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexShrink: 0 }} dir="rtl">
                      <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary-blue)' }}>{activeIframe.title}</h2>
                      <button 
                         onClick={() => setActiveIframe(null)}
                         style={{ background: '#ffebee', border: 'none', color: 'var(--primary-red)', width: '50px', height: '50px', borderRadius: '50%', fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-soft)' }}
                      >
                         ✕
                      </button>
                  </div>

                  <div style={{ flex: 1, backgroundColor: 'black', width: '100%', borderRadius: '24px', overflow: 'hidden', border: '4px solid #333' }}>
                      <iframe 
                        src={activeIframe.url} 
                        title={activeIframe.title}
                        style={{ width: '100%', height: '100%', border: 'none' }} 
                        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                        allowFullScreen
                      />
                  </div>
                  
                  <div style={{ paddingTop: '1.5rem', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                     <button 
                        onClick={() => setActiveIframe(null)}
                        className="giant-button"
                        style={{ background: 'var(--primary-red)', border: 'none', color: 'white', fontSize: '1.3rem', padding: '1rem 3rem', height: 'auto', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', maxWidth: '400px', boxShadow: '0 4px 15px rgba(255,0,0,0.4)' }}
                      >
                        סיימתי, חזרה למרכז הלמידה 🏠
                      </button>
                  </div>

              </div>
          </div>
      )}
    </div>
  );
}
