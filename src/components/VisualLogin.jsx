import React, { useState } from 'react';
import { Cat, Dog, Bird, Fish, Circle, Square, Triangle, Star, Volume2 } from 'lucide-react';
import '../index.css';

const MOCK_CHILDREN = [
  { id: 1, name: 'ליאו', icon: Cat, color: 'var(--primary-yellow)' },
  { id: 2, name: 'מיה', icon: Dog, color: 'var(--primary-blue)' },
  { id: 3, name: 'סם', icon: Bird, color: 'var(--primary-green)' },
  { id: 4, name: 'זואי', icon: Fish, color: 'var(--primary-red)' }
];

const SHAPES = [
  { id: 'circle', icon: Circle, color: 'var(--primary-red)' },
  { id: 'square', icon: Square, color: 'var(--primary-blue)' },
  { id: 'triangle', icon: Triangle, color: 'var(--primary-green)' },
  { id: 'star', icon: Star, color: 'var(--primary-yellow)' }
];

export default function VisualLogin() {
  const [step, setStep] = useState(1); // 1 = Pick Avatar, 2 = Enter Sequence
  const [selectedChild, setSelectedChild] = useState(null);
  const [sequence, setSequence] = useState([]);

  const playAudioCue = (type) => {
    // Lead PM: Using Web Audio API for synthetic sounds (no external assets needed yet)
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      const notes = {
        'Leo': 261.63, // C4
        'Mia': 329.63, // E4
        'Sam': 392.00, // G4
        'Zoe': 440.00, // A4
        'circle': 523.25, // C5
        'square': 587.33, // D5
        'triangle': 659.25, // E5
        'star': 783.99,  // G5
        'success': 880.00 // A5
      };

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(notes[type] || 440, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn('Audio playback failed', e);
    }
  };

  const handleAvatarClick = (child) => {
    playAudioCue(child.name);
    setSelectedChild(child);
    setStep(2);
  };

  const handleShapeClick = (shape) => {
    playAudioCue(shape.id);
    const newSeq = [...sequence, shape.id];
    setSequence(newSeq);

    if (newSeq.length === 2) {
      // Validate sequence (Mock successful login after short delay)
      setTimeout(() => {
        setStep(3);
        setSequence([]);
      }, 500);
    }
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', justifyContent: 'center' }}>
      
      {step === 1 && (
        <div className="card animate-pop" style={{ textAlign: 'center', maxWidth: '800px', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <h1>מי משחק היום?</h1>
            <button className="giant-button" style={{ width: '60px', height: '60px', borderRadius: '50%' }} onClick={() => playAudioCue('Who is playing today')} aria-label="Read Question aloud">
              <Volume2 size={32} color="var(--primary-blue)" />
            </button>
          </div>
          
          <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '2rem' }}>
            {MOCK_CHILDREN.map((child) => (
              <button
                key={child.id}
                className="giant-button"
                style={{ width: '100%', height: '160px', flexDirection: 'column', gap: '1rem' }}
                onClick={() => handleAvatarClick(child)}
                aria-label={`בחר את ${child.name}`}
                data-testid={`child-button-${child.id}`}
              >
                <child.icon size={64} color={child.color} />
                <span style={{ fontSize: '1.5rem', fontWeight: '700' }}>{child.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && selectedChild && (
        <div className="card animate-pop" style={{ textAlign: 'center', maxWidth: '600px', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <h1>הסיסמה הסודית</h1>
            <button className="giant-button" style={{ width: '60px', height: '60px', borderRadius: '50%' }} onClick={() => playAudioCue('Secret Password')} aria-label="Read Question aloud">
              <Volume2 size={32} color="var(--primary-blue)" />
            </button>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '2rem' }}>
            <selectedChild.icon size={48} color={selectedChild.color} />
            <h2 style={{ margin: '0 1rem' }}>התור של {selectedChild.name}</h2>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
            {/* Sequence Placeholders */}
            {[0, 1].map((i) => (
              <div 
                key={i}
                style={{ 
                  width: '90px', 
                  height: '90px', 
                  borderRadius: '24px', 
                  background: 'white', 
                  border: sequence[i] ? '4px solid var(--primary-blue)' : '4px dashed hsl(210, 20%, 90%)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: sequence[i] ? 'var(--shadow-soft)' : 'none',
                  transition: 'var(--transition-bounce)',
                  transform: sequence[i] ? 'scale(1.1)' : 'scale(1)'
                }}
              >
                {sequence[i] && (
                  (() => {
                    const ShapeIcon = SHAPES.find(s => s.id === sequence[i]).icon;
                    const shapeColor = SHAPES.find(s => s.id === sequence[i]).color;
                    return <ShapeIcon size={48} color={shapeColor} />;
                  })()
                )}
              </div>
            ))}
          </div>

          <div className="grid-container" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', maxWidth: '400px', margin: '0 auto' }}>
            {SHAPES.map((shape) => (
              <button
                key={shape.id}
                className="giant-button"
                style={{ width: '100%', height: '140px', borderRadius: '32px' }}
                onClick={() => handleShapeClick(shape)}
                aria-label={`בחר ${shape.id === 'circle' ? 'עיגול' : shape.id === 'square' ? 'ריבוע' : shape.id === 'triangle' ? 'משולש' : 'כוכב'}`}
                data-testid={`shape-button-${shape.id}`}
              >
                <shape.icon size={64} color={shape.color} />
              </button>
            ))}
          </div>
          
          <button 
            style={{ marginTop: '2rem', padding: '1rem 2rem', fontSize: '1.2rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => { setStep(1); setSequence([]); }}
          >
            ← חזרה
          </button>
        </div>
      )}
      {step === 3 && selectedChild && (
        <div className="card animate-pop" style={{ textAlign: 'center', maxWidth: '600px', width: '100%', padding: '4rem' }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🎉🌟✨</div>
          <h1 style={{ fontSize: '3rem', color: 'var(--primary-blue)', marginBottom: '1rem' }}>הידד, {selectedChild.name}!</h1>
          <p style={{ fontSize: '1.5rem', color: 'var(--text-muted)', marginBottom: '3rem' }}>הצלחת!</p>
          <button 
            className="giant-button" 
            style={{ padding: '1.5rem 3rem', width: 'auto', margin: '0 auto' }}
            onClick={() => {
               setStep(1);
               setSelectedChild(null);
               setSequence([]);
            }}
          >
            בואו נשחק!
          </button>
        </div>
      )}
    </div>
  );
}
