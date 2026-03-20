import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, doc, increment, deleteDoc } from 'firebase/firestore';
import { Smile, Mic, Palette, Heart, Star, User, Video, Image as ImageIcon, Send, Play, Trash2 } from 'lucide-react';
import DrawingCanvas from './DrawingCanvas';
import AudioRecorder from './AudioRecorder';
import { db } from '../lib/firebase';
import '../index.css';

export default function ShowAndTell({ userRole = 'student', userName = 'מיה', userId = null }) {
  const [posts, setPosts] = useState([]);
  const [activeTool, setActiveTool] = useState(null); // 'emoji', 'draw', 'audio'
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // guarantee descending order mathematically by timestamps
      data.sort((a, b) => {
          const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
          const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
          return tB - tA;
      });
      setPosts(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const addPost = async (type, content) => {
    const newPost = {
      author: userName,
      role: userRole,
      authorId: userId,
      type: type,
      content: content,
      likes: 0,
      stars: 0,
      color: type === 'draw' ? 'var(--primary-red)' : type === 'audio' ? 'var(--primary-blue)' : type === 'picture' ? 'var(--primary-yellow)' : 'var(--primary-green)',
      createdAt: new Date()
    };
    
    try {
      await addDoc(collection(db, 'posts'), newPost);
      setActiveTool(null);
      
      // Award star to global Mascot!
      try {
          await updateDoc(doc(db, 'settings', 'mascot'), { totalStars: increment(1) });
      } catch (e) {
          console.warn("Failed to award mascot star", e);
      }
    } catch (err) {
      console.error("Error adding post:", err);
      alert("אופס! משהו השתבש בשליחה.");
    }
  };

  const EMOJIS = ['😁', '🦁', '⭐', '🎨', '🚀', '🌈', '🍦', '🐶'];

  const handleReact = async (id, reactionType) => {
    try {
      await updateDoc(doc(db, 'posts', id), {
        [reactionType]: increment(1)
      });
    } catch (err) {
      console.error("Error updating reaction:", err);
    }
  };

  const handleDeletePost = async (id) => {
    try {
        await deleteDoc(doc(db, 'posts', id));
        setConfirmDeleteId(null);
    } catch (err) {
        console.error("Error deleting post:", err);
        alert(`שגיאה במחיקה: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', paddingBottom: '8rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>הצג וספר</h1>

      {/* Creation Tools */}
      <div className="card animate-pop" style={{ marginBottom: '2rem', background: 'var(--bg-color)', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '2px solid #fff' }}>
            <h2 style={{ textAlign: 'center', margin: 0 }}>מה קורה, {userName}?</h2>
        </div>
        
        <div style={{ padding: '2rem' }}>
            {activeTool === 'draw' && <DrawingCanvas onSave={(data) => addPost('draw', data)} />}
            {activeTool === 'audio' && <AudioRecorder onSave={(url) => addPost('audio', url)} />}
            {activeTool === 'picture' && (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                   <label className="giant-button" style={{ width: 'auto', padding: '1rem 2rem', background: 'var(--primary-yellow)', cursor: 'pointer', color: 'white' }}>
                     <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                         const file = e.target.files && e.target.files[0];
                         if (!file) return;
                         setLoading(true); // Optional: if we want to show loading, but addPost does it. Let's just do it fast.
                         const reader = new FileReader();
                         reader.onload = (ev) => {
                             const img = new Image();
                             img.onload = () => {
                                 const canvas = document.createElement('canvas');
                                 let width = img.width;
                                 let height = img.height;
                                 const maxDim = 800; // Resize to ensure it fits in Firestore <1MB
                                 if (width > height) {
                                     if (width > maxDim) { height *= maxDim / width; width = maxDim; }
                                 } else {
                                     if (height > maxDim) { width *= maxDim / height; height = maxDim; }
                                 }
                                 canvas.width = width; canvas.height = height;
                                 const ctx = canvas.getContext('2d');
                                 ctx.drawImage(img, 0, 0, width, height);
                                 const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                                 addPost('picture', compressedDataUrl);
                             };
                             img.src = ev.target.result;
                         };
                         reader.readAsDataURL(file);
                     }} />
                     <ImageIcon size={48} style={{ marginLeft: '1rem' }} />
                     <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>בחר תמונה</span>
                   </label>
                </div>
            )}
            {activeTool === 'emoji' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                    {EMOJIS.map(e => (
                        <button key={e} className="giant-button" onClick={() => addPost('emoji', e)} style={{ fontSize: '3rem' }}>
                            {e}
                        </button>
                    ))}
                </div>
            )}

            {!activeTool && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                    <button className="giant-button" onClick={() => setActiveTool('emoji')} style={{ background: 'white' }} aria-label="בחר אימוג'י">
                        <Smile size={48} color="var(--primary-green)" />
                    </button>
                    <button className="giant-button" onClick={() => setActiveTool('draw')} style={{ background: 'white' }} aria-label="צייר משהו">
                        <Palette size={48} color="var(--primary-red)" />
                    </button>
                    <button className="giant-button" onClick={() => setActiveTool('audio')} style={{ background: 'white' }} aria-label="הקלט משהו">
                        <Mic size={48} color="var(--primary-blue)" />
                    </button>
                    <button className="giant-button" onClick={() => setActiveTool('picture')} style={{ background: 'white' }} aria-label="העלה תמונה">
                        <ImageIcon size={48} color="var(--primary-yellow)" />
                    </button>
                </div>
            )}
            
            {activeTool && (
                <button 
                  onClick={() => setActiveTool(null)}
                  style={{ display: 'block', margin: '1rem auto 0', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }}
                >
                    ביטול
                </button>
            )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>טוען חברים...</div>
      ) : (
        <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {posts.map(post => (
            <div key={post.id} className="card animate-pop" style={{ borderTop: `12px solid ${post.color}`, padding: '1.5rem', position: 'relative' }}>
              
              {/* Moderation Tool */}
              {(userRole === 'staff' || userRole === 'teacher' || (userRole === 'student' && ((post.authorId && post.authorId === userId) || (!post.authorId && post.author === userName && userName)))) && (
                  <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10 }}>
                      {confirmDeleteId === post.id ? (
                          <div style={{ display: 'flex', gap: '0.5rem', background: 'white', padding: '0.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-soft)', border: '2px solid var(--primary-red)' }}>
                              <button onClick={() => handleDeletePost(post.id)} style={{ color: 'white', background: 'var(--primary-red)', border: 'none', borderRadius: '8px', padding: '0.4rem 0.8rem', cursor: 'pointer', fontWeight: 'bold' }}>מחק סופית</button>
                              <button onClick={() => setConfirmDeleteId(null)} style={{ background: '#eee', border: 'none', borderRadius: '8px', padding: '0.4rem 0.8rem', cursor: 'pointer', color: 'var(--text-main)' }}>ביטול</button>
                          </div>
                      ) : (
                          <button 
                            onClick={() => setConfirmDeleteId(post.id)}
                            style={{ background: 'white', border: 'none', color: 'var(--primary-red)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', boxShadow: 'var(--shadow-soft)', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            aria-label="מחק פוסט"
                          >
                            <Trash2 size={20} />
                          </button>
                      )}
                  </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: post.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: 'var(--shadow-soft)' }}>
                  <User size={32} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h3 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700 }}>{post.author}</h3>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {post.role === 'teacher' ? '🌟 המורה' : post.role === 'staff' ? '🌟 צוות הגן' : 'חבר/ה'}
                  </span>
                </div>
              </div>

              <div style={{ 
                  padding: '1rem', 
                  background: '#fafafa', 
                  borderRadius: '24px', 
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: post.type === 'emoji' ? '150px' : 'auto'
              }}>
                {post.type === 'emoji' && <span style={{ fontSize: '5rem', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={e => e.target.style.transform = 'scale(1.1)'} onMouseOut={e => e.target.style.transform = 'scale(1)'} onClick={() => setSelectedPost(post)}>{post.content}</span>}
                {post.type === 'draw' && <img src={post.content} alt="Drawing" style={{ width: '100%', height: 'auto', borderRadius: '16px', objectFit: 'contain', cursor: 'zoom-in', transition: 'filter 0.2s' }} onMouseOver={e => e.target.style.filter = 'brightness(0.9)'} onMouseOut={e => e.target.style.filter = 'brightness(1)'} onClick={() => setSelectedPost(post)} />}
                {post.type === 'picture' && <img src={post.content} alt="Picture" style={{ width: '100%', height: 'auto', borderRadius: '16px', objectFit: 'cover', cursor: 'zoom-in', transition: 'filter 0.2s' }} onMouseOver={e => e.target.style.filter = 'brightness(0.9)'} onMouseOut={e => e.target.style.filter = 'brightness(1)'} onClick={() => setSelectedPost(post)} />}
                {post.type === 'audio' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
                        <button className="giant-button" style={{ width: '60px', height: '60px', background: 'var(--primary-blue)' }} aria-label="הפעל הודעה קולית" onClick={() => {
                            const audio = new Audio(post.content);
                            audio.play();
                        }}>
                            <Play size={24} color="white" />
                        </button>
                        <span style={{ fontWeight: 700, color: 'var(--primary-blue)' }}>הודעה קולית</span>
                    </div>
                )}
                {post.type === 'text' && <p style={{ fontWeight: 600, cursor: 'pointer' }} onClick={() => setSelectedPost(post)}>{post.content}</p>}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: '2px dashed hsla(210, 20%, 90%, 1)', paddingTop: '1rem' }}>
                <button 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid #eee', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--primary-red)', padding: '0.75rem 1.5rem', borderRadius: '20px', boxShadow: 'var(--shadow-soft)' }}
                  onClick={() => handleReact(post.id, 'likes')}
                >
                  <Heart size={24} fill={post.likes > 0 ? "var(--primary-red)" : "none"} /> {post.likes}
                </button>
                <button 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid #eee', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--primary-yellow)', padding: '0.75rem 1.5rem', borderRadius: '20px', boxShadow: 'var(--shadow-soft)' }}
                  onClick={() => handleReact(post.id, 'stars')}
                >
                  <Star size={24} fill={post.stars > 0 ? "var(--primary-yellow)" : "none"} /> {post.stars}
                </button>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '4rem', color: 'var(--text-muted)' }}>
                עדיין אין פוסטים... תהיו הראשונים לשתף!
            </div>
          )}
        </div>
      )}

      {/* Fullscreen Post Modal */}
      {selectedPost && selectedPost.type !== 'audio' && (
          <div 
            onClick={() => setSelectedPost(null)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', cursor: 'zoom-out', backdropFilter: 'blur(4px)' }}
          >
              <div style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                  {selectedPost.type === 'emoji' && <span style={{ fontSize: '15rem', filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))' }}>{selectedPost.content}</span>}
                  {(selectedPost.type === 'draw' || selectedPost.type === 'picture') && (
                      <img src={selectedPost.content} alt="Enlarged Post" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', objectFit: 'contain', background: selectedPost.type === 'draw' ? 'white' : 'transparent', border: `8px solid ${selectedPost.color}` }} />
                  )}
                  {selectedPost.type === 'text' && <p style={{ fontSize: '4rem', fontWeight: 900, color: 'white', textShadow: '0 4px 10px rgba(0,0,0,0.5)', textAlign: 'center' }}>{selectedPost.content}</p>}
                  
                  <div style={{ color: 'white', fontSize: '2rem', fontWeight: 800, textShadow: '0 4px 10px rgba(0,0,0,0.5)', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 2rem', borderRadius: '99px' }}>
                      מאת: {selectedPost.author}
                  </div>
              </div>

              <button 
                onClick={() => setSelectedPost(null)}
                style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'white', border: 'none', width: '60px', height: '60px', borderRadius: '50%', fontSize: '2rem', fontWeight: 'bold', color: 'black', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.4)', transition: 'transform 0.2s' }}
                onMouseOver={e => e.target.style.transform = 'scale(1.1)'} 
                onMouseOut={e => e.target.style.transform = 'scale(1)'}
              >
                  ✕
              </button>
          </div>
      )}

    </div>
  );
}
