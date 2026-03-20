import React, { useState } from 'react';
import { Cat, Dog, Bird, Fish, Circle, Square, Triangle, Star, Volume2 } from 'lucide-react';
import '../index.css';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';

const SHAPES = [
  { id: 'circle', icon: Circle, color: 'var(--primary-red)' },
  { id: 'square', icon: Square, color: 'var(--primary-blue)' },
  { id: 'triangle', icon: Triangle, color: 'var(--primary-green)' },
  { id: 'star', icon: Star, color: 'var(--primary-yellow)' }
];

const ICONS = { Cat, Dog, Bird, Fish };

export default function VisualLogin({ onLogin }) {
  const [step, setStep] = useState(1); // 1 = Pick Avatar, 2 = Enter Sequence, 3 = Success, 4 = Register, 5 = Set Registration Password
  const [students, setStudents] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [sequence, setSequence] = useState([]);
  const [regSequence, setRegSequence] = useState([]);
  const [loading, setLoading] = useState(true);

  // Registration states
  const [regName, setRegName] = useState('');
  const [regIcon, setRegIcon] = useState('Cat');
  const [regColor, setRegColor] = useState('var(--primary-blue)');

  React.useEffect(() => {
    const unsub = onSnapshot(collection(db, 'students'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const logAttendance = async (studentId, studentName) => {
    try {
      await addDoc(collection(db, 'attendance'), {
        studentId,
        studentName,
        timestamp: new Date()
      });
    } catch (err) {
      console.error("Attendance log failed:", err);
    }
  };

  const handleRegister = async () => {
    if (!regName || regSequence.length < 2) return;
    
    const newStudent = {
      name: regName,
      icon: regIcon,
      color: regColor,
      secret_sequence: regSequence,
      createdAt: new Date()
    };

    try {
      const docRef = await addDoc(collection(db, 'students'), newStudent);
      await logAttendance(docRef.id, newStudent.name);
      // Auto-login: Pass the new student object (with ID) to mother component
      if (onLogin) onLogin({ id: docRef.id, ...newStudent });
    } catch (err) {
      console.error("Registration failed:", err);
      alert("אופס! משהו השתבש בהרשמה.");
    }
  };

  const playAudioCue = (type) => {
    // Lead PM: Using Web Audio API for synthetic sounds (no external assets needed yet)
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      const notes = {
        'default': 329.63, // E4
        'circle': 523.25, // C5
        'square': 587.33, // D5
        'triangle': 659.25, // E5
        'star': 783.99,  // G5
        'success': 880.00 // A5
      };

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(notes[type] || notes['default'], audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn('Audio playback failed', e);
    }
  };

  const handleAvatarClick = (child) => {
    playAudioCue('default');
    setSelectedChild(child);
    setStep(2);
  };

  const handleShapeClick = (shape) => {
    playAudioCue(shape.id);
    
    if (step === 5) {
        // Setting registration password
        const newRegSeq = [...regSequence, shape.id];
        setRegSequence(newRegSeq);
        if (newRegSeq.length === 2) {
            // Registration sequence complete - let user review or finish
        }
        return;
    }

    // Normal Login
    const newSeq = [...sequence, shape.id];
    setSequence(newSeq);

    if (newSeq.length === 2) {
      // Validate sequence against the student's real sequence in DB
      const correctSeq = selectedChild.secret_sequence || ['circle', 'square']; // Fallback for old data
      const isMatch = newSeq.every((val, index) => val === correctSeq[index]);
      
      setTimeout(async () => {
        if (isMatch) {
            await logAttendance(selectedChild.id, selectedChild.name);
            setStep(3);
        } else {
            alert("אופס! סיסמה לא נכונה. נסו שוב!");
            setSequence([]);
        }
      }, 500);
    }
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', justifyContent: 'center' }}>
      
      {step === 1 && (
        <div className="card animate-pop" style={{ textAlign: 'center', maxWidth: '800px', width: '100%' }}>
          {loading ? (
             <div style={{ padding: '4rem' }}>מחפש חברים...</div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <h1>מי משחק היום?</h1>
                <button className="giant-button" style={{ width: '60px', height: '60px', borderRadius: '50%' }} onClick={() => playAudioCue('default')} aria-label="Read Question aloud">
                  <Volume2 size={32} color="var(--primary-blue)" />
                </button>
              </div>
              
              <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '2rem' }}>
                {students.map((child) => {
                  const IconComp = ICONS[child.icon] || Cat;
                  return (
                    <button
                      key={child.id}
                      className="giant-button"
                      style={{ width: '100%', height: '160px', flexDirection: 'column', gap: '1rem' }}
                      onClick={() => handleAvatarClick(child)}
                      aria-label={`בחר את ${child.name}`}
                    >
                      <IconComp size={64} color={child.color} />
                      <span style={{ fontSize: '1.5rem', fontWeight: '700' }}>{child.name}</span>
                    </button>
                  );
                })}
                
                {/* Registration Trigger */}
                <button
                  className="giant-button"
                  style={{ width: '100%', height: '160px', flexDirection: 'column', gap: '1rem', background: 'var(--primary-green)', color: 'white' }}
                  onClick={() => setStep(4)}
                  aria-label="תלמיד חדש? הצטרף אלינו"
                >
                  <div style={{ fontSize: '3rem' }}>+</div>
                  <span style={{ fontSize: '1.2rem', fontWeight: '700' }}>חבר חדש</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="card animate-pop" style={{ textAlign: 'center', maxWidth: '600px', width: '100%' }}>
          <h1>ברוכים הבאים!</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>בואו נכיר חבר חדש</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="איך קוראים לך?" 
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              style={{ padding: '1.5rem', borderRadius: '24px', border: '4px solid var(--primary-blue)', fontSize: '1.5rem', textAlign: 'center', width: '100%', outline: 'none' }}
            />
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              {Object.keys(ICONS).map(iconName => (
                <button 
                  key={iconName}
                  onClick={() => setRegIcon(iconName)}
                  style={{ padding: '1rem', borderRadius: '16px', border: regIcon === iconName ? '4px solid var(--primary-yellow)' : 'none', background: 'white', cursor: 'pointer' }}
                >
                  {React.createElement(ICONS[iconName], { size: 48, color: 'var(--primary-blue)' })}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              {['var(--primary-blue)', 'var(--primary-red)', 'var(--primary-green)', 'var(--primary-yellow)'].map(color => (
                <button 
                  key={color}
                  onClick={() => setRegColor(color)}
                  style={{ width: '50px', height: '50px', borderRadius: '50%', background: color, border: regColor === color ? '4px solid white' : 'none', cursor: 'pointer', boxShadow: 'var(--shadow-soft)' }}
                />
              ))}
            </div>

            <button 
              className="giant-button" 
              style={{ background: 'var(--primary-blue)', color: 'white', width: '100%', marginTop: '1rem' }}
              onClick={() => setStep(5)}
              disabled={!regName}
            >
              המשך לצייר סיסמה ←
            </button>
            
            <button 
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              onClick={() => setStep(1)}
            >
              ← ביטול
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="card animate-pop" style={{ textAlign: 'center', maxWidth: '600px', width: '100%' }}>
          <h1>הסיסמה הסודית שלך</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>תבחר שני צורות שאתה אוהב!</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
            {[0, 1].map((i) => (
              <div 
                key={i}
                onClick={() => i < regSequence.length && setRegSequence(regSequence.slice(0, i))}
                style={{ 
                  width: '90px', 
                  height: '90px', 
                  borderRadius: '24px', 
                  background: 'white', 
                  border: regSequence[i] ? '4px solid var(--primary-green)' : '4px dashed hsl(122, 39%, 80%)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  cursor: regSequence[i] ? 'pointer' : 'default'
                }}
              >
                {regSequence[i] && (
                  (() => {
                    const ShapeIcon = SHAPES.find(s => s.id === regSequence[i]).icon;
                    const shapeColor = SHAPES.find(s => s.id === regSequence[i]).color;
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
                disabled={regSequence.length >= 2}
                aria-label={`בחר ${shape.id === 'circle' ? 'עיגול' : shape.id === 'square' ? 'ריבוע' : shape.id === 'triangle' ? 'משולש' : 'כוכב'}`}
                data-testid={`reg-shape-button-${shape.id}`}
              >
                <shape.icon size={64} color={shape.color} />
              </button>
            ))}
          </div>

          {regSequence.length === 2 && (
             <button 
                className="giant-button" 
                style={{ background: 'var(--primary-green)', color: 'white', width: '100%', marginTop: '3rem' }}
                onClick={handleRegister}
              >
                זהו, הצטרפתי! 🎉
              </button>
          )}
          
          <button 
            style={{ marginTop: '2rem', padding: '1rem 2rem', fontSize: '1.2rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => { setStep(4); setRegSequence([]); }}
          >
            ← חזרה
          </button>
        </div>
      )}

      {step === 2 && selectedChild && (
        <div className="card animate-pop" style={{ textAlign: 'center', maxWidth: '600px', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <h1>הסיסמה הסודית</h1>
            <button className="giant-button" style={{ width: '60px', height: '60px', borderRadius: '50%' }} onClick={() => playAudioCue('default')} aria-label="Read Question aloud">
              <Volume2 size={32} color="var(--primary-blue)" />
            </button>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '2rem' }}>
            {React.createElement(ICONS[selectedChild.icon] || Cat, { size: 48, color: selectedChild.color })}
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
               if (onLogin) onLogin(selectedChild);
            }}
          >
            בואו נשחק!
          </button>
        </div>
      )}
    </div>
  );
}
