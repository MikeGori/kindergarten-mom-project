import React, { useState } from 'react';
import { Smile, Mic, Palette, Heart, Star, User, Video, Image as ImageIcon, Send } from 'lucide-react';
import DrawingCanvas from './DrawingCanvas';
import AudioRecorder from './AudioRecorder';
import '../index.css';

const INITIAL_POSTS = [
  {
    id: 1,
    author: 'המורה שרה',
    role: 'teacher',
    type: 'text',
    content: 'בוקר טוב כיתה! היום נלמד על חיות!',
    likes: 5,
    stars: 2,
    color: 'var(--primary-blue)'
  },
  {
    id: 2,
    author: 'ליאו',
    role: 'student',
    type: 'emoji',
    content: '🦁',
    likes: 8,
    stars: 5,
    color: 'var(--primary-yellow)'
  }
];

export default function ShowAndTell({ userRole = 'student', userName = 'מיה' }) {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [activeTool, setActiveTool] = useState(null); // 'emoji', 'draw', 'audio'

  const addPost = (type, content) => {
    const newPost = {
      id: Date.now(),
      author: userName,
      role: userRole,
      type: type,
      content: content,
      likes: 0,
      stars: 0,
      color: type === 'draw' ? 'var(--primary-red)' : type === 'audio' ? 'var(--primary-blue)' : 'var(--primary-green)'
    };
    setPosts([newPost, ...posts]);
    setActiveTool(null);
  };

  const EMOJIS = ['😁', '🦁', '⭐', '🎨', '🚀', '🌈', '🍦', '🐶'];

  const handleReact = (id, reactionType) => {
    setPosts(posts.map(post => {
      if (post.id === id) {
        return { ...post, [reactionType]: post[reactionType] + 1 };
      }
      return post;
    }));
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>הצג וספר</h1>

      {/* Creation Tools */}
      <div className="card animate-pop" style={{ marginBottom: '2rem', background: 'var(--bg-color)', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '2px solid #fff' }}>
            <h2 style={{ textAlign: 'center', margin: 0 }}>מה קורה, {userName}?</h2>
        </div>
        
        <div style={{ padding: '2rem' }}>
            {activeTool === 'draw' && <DrawingCanvas onSave={(data) => addPost('draw', data)} />}
            {activeTool === 'audio' && <AudioRecorder onSave={(url) => addPost('audio', url)} />}
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
                    <button className="giant-button" onClick={() => setActiveTool('emoji')} style={{ background: 'white' }} aria-label="בחר אימוג'י" data-testid="select-emoji-tool">
                        <Smile size={48} color="var(--primary-green)" />
                    </button>
                    <button className="giant-button" onClick={() => setActiveTool('draw')} style={{ background: 'white' }} aria-label="צייר משהו" data-testid="select-drawing-tool">
                        <Palette size={48} color="var(--primary-red)" />
                    </button>
                    <button className="giant-button" onClick={() => setActiveTool('audio')} style={{ background: 'white' }} aria-label="הקלט משהו" data-testid="select-audio-tool">
                        <Mic size={48} color="var(--primary-blue)" />
                    </button>
                </div>
            )}
            
            {activeTool && (
                <button 
                  onClick={() => setActiveTool(null)}
                  style={{ display: 'block', margin: '1rem auto 0', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }}
                  aria-label="ביטול"
                  data-testid="cancel-tool"
                >
                    ביטול
                </button>
            )}
        </div>
      </div>

      {/* Feed */}
      <div className="grid-container" style={{ gap: '2rem' }}>
        {posts.map(post => (
          <div key={post.id} className="card animate-pop" style={{ borderTop: `12px solid ${post.color}`, padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: post.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: 'var(--shadow-soft)' }}>
                <User size={32} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700 }}>{post.author}</h3>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {post.role === 'teacher' ? '🌟 המורה' : 'חבר/ה'}
                </span>
              </div>
            </div>

            <div style={{ 
                padding: '1rem', 
                background: '#fafafa', 
                borderRadius: '24px', 
                marginBottom: '1rem',
                display: 'flex',
                justifyContent: 'center'
            }}>
              {post.type === 'emoji' && <span style={{ fontSize: '6rem' }}>{post.content}</span>}
              {post.type === 'draw' && <img src={post.content} alt="Drawing" style={{ maxWidth: '100%', borderRadius: '16px' }} />}
              {post.type === 'audio' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
                      <button className="giant-button" style={{ width: '60px', height: '60px', background: 'var(--primary-blue)' }} aria-label="הפעל הודעה קולית" data-testid={`play-audio-${post.id}`}>
                          <Play size={24} color="white" />
                      </button>
                      <span style={{ fontWeight: 700, color: 'var(--primary-blue)' }}>הודעה קולית</span>
                  </div>
              )}
              {post.type === 'text' && <p style={{ fontWeight: 600 }}>{post.content}</p>}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: '2px dashed hsla(210, 20%, 90%, 1)', paddingTop: '1rem' }}>
              <button 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid #eee', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--primary-red)', padding: '0.75rem 1.5rem', borderRadius: '20px', boxShadow: 'var(--shadow-soft)' }}
                onClick={() => handleReact(post.id, 'likes')}
                aria-label="אהבתי"
                data-testid={`like-post-${post.id}`}
              >
                <Heart size={24} fill={post.likes > 0 ? "var(--primary-red)" : "none"} /> {post.likes}
              </button>
              <button 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid #eee', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--primary-yellow)', padding: '0.75rem 1.5rem', borderRadius: '20px', boxShadow: 'var(--shadow-soft)' }}
                onClick={() => handleReact(post.id, 'stars')}
                aria-label="כוכב"
                data-testid={`star-post-${post.id}`}
              >
                <Star size={24} fill={post.stars > 0 ? "var(--primary-yellow)" : "none"} /> {post.stars}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
