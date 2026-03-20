import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import VisualLogin from './components/VisualLogin';
import TeacherDashboard from './components/TeacherDashboard';
import ShowAndTell from './components/ShowAndTell';
import ActivityHub from './components/ActivityHub';
import StaffLogin from './components/StaffLogin'; // Keeping this import as it was in the original, though the new landing page logic doesn't use it directly.
import ActivityManager from './components/ActivityManager';
import { getSchoolSettings, db } from './lib/firebase'; // Assuming db is exported from firebase.js
import { onSnapshot, doc } from 'firebase/firestore';
import { Users, Baby, GraduationCap, Sun, Star, Heart, Music, Sparkles, Cloud, Rocket, Smile } from 'lucide-react'; // Added GraduationCap and Floating Background Icons

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [userRole, setUserRole] = useState(null); // 'staff', 'student'
  const [schoolName, setSchoolName] = useState('הגן שלנו');
  const [teacherName, setTeacherName] = useState('המורה');
  const [activeKid, setActiveKid] = useState(null);
  
  // Security & Landing states
  const [staffPassInput, setStaffPassInput] = useState('');
  const [isStaffLogining, setIsStaffLogining] = useState(false);
  const [error, setError] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (currentView !== 'landing') return;
    const handleMouseMove = (e) => {
      // Calculate offset from center (-1 to 1)
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [currentView]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'school'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setSchoolName(data.name || 'הגן שלנו');
        setTeacherName(data.teacherName || 'המורה');
      }
    });
    return unsub;
  }, []);

  const handleStaffLogin = () => {
    if (staffPassInput === 'Argaman') {
        setUserRole('staff');
        setCurrentView('dashboard');
        setIsStaffLogining(false);
        setStaffPassInput('');
        setError('');
    } else {
        setError('סיסמה לא נכונה. נסו שוב!');
        setStaffPassInput('');
    }
  };

  const handleExit = () => {
    setActiveKid(null);
    setUserRole(null);
    setCurrentView('landing');
    setIsStaffLogining(false);
    setStaffPassInput('');
    setError('');
  };

  const renderView = () => {
    switch(currentView) {
      case 'dashboard':
        return <TeacherDashboard />;
      case 'learning':
      case 'games': // alias for backwards compatibility
        return <ActivityHub userRole={userRole} student={activeKid} />;
      case 'feed':
      case 'friends': // alias
        return <ShowAndTell userRole={userRole} userName={userRole === 'staff' ? teacherName : activeKid?.name} userId={userRole === 'staff' ? 'staff' : activeKid?.id} />;
      case 'activity-manager':
        return <ActivityManager />;
      case 'login':
        return <VisualLogin onLogin={(kid) => {
          setActiveKid(kid);
          setCurrentView('learning');
        }} />;
      default:
         // If activeKid exists and currentView is not 'login', default to 'learning' (ActivityHub)
        if (activeKid && userRole === 'student') {
          return <ActivityHub userRole={userRole} student={activeKid} />;
        }
        // For staff, if currentView is not recognized, default to dashboard
        if (userRole === 'staff') {
          return <TeacherDashboard />;
        }
        return <ActivityHub userRole={userRole} student={activeKid} />; // Fallback
    }
  };

  const showNavbar = (userRole === 'staff') || (userRole === 'student' && activeKid);

  if (currentView === 'landing') {
    return (
        <div className="app-container" dir="rtl" style={{ background: '#f8faff', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem', position: 'relative', overflowX: 'hidden' }}>
          
          {/* Vibrant Animated Background Blobs */}
          <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(255,209,102,0.4) 0%, rgba(255,209,102,0) 70%)', filter: 'blur(40px)', animation: 'float 8s ease-in-out infinite', zIndex: 0, transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)` }} />
          <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(17,138,178,0.25) 0%, rgba(17,138,178,0) 70%)', filter: 'blur(60px)', animation: 'float 12s ease-in-out infinite reverse', zIndex: 0, transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)` }} />
          <div style={{ position: 'absolute', top: '15%', right: '5%', width: '45vw', height: '45vw', background: 'radial-gradient(circle, rgba(239,71,111,0.2) 0%, rgba(239,71,111,0) 70%)', filter: 'blur(50px)', animation: 'float 10s ease-in-out infinite 2s', zIndex: 0, transform: `translate(${mousePos.x * 15}px, ${mousePos.y * 15}px)` }} />

          {/* Interactive 3D Parallax Icons */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
              <div style={{ position: 'absolute', top: '8%', right: '12%', transform: `translate(${mousePos.x * 40}px, ${mousePos.y * 40}px)`, transition: 'transform 0.1s ease-out' }}>
                  <Sun size={140} color="#FFD166" fill="#FFD166" style={{ opacity: 0.9, animation: 'spin 25s linear infinite', filter: 'drop-shadow(0 15px 25px rgba(255,209,102,0.6))' }} />
              </div>
              <div style={{ position: 'absolute', top: '15%', left: '20%', transform: `translate(${mousePos.x * -35}px, ${mousePos.y * -35}px)`, transition: 'transform 0.1s ease-out' }}>
                  <Cloud size={110} color="#ffffff" fill="#ffffff" style={{ opacity: 0.8, animation: 'float 8s ease-in-out infinite 1s', filter: 'drop-shadow(0 15px 25px rgba(255,255,255,0.7))' }} />
              </div>
              <div style={{ position: 'absolute', top: '25%', left: '8%', transform: `translate(${mousePos.x * -50}px, ${mousePos.y * -50}px)`, transition: 'transform 0.1s ease-out' }}>
                  <Star size={90} color="#118AB2" fill="#118AB2" style={{ opacity: 0.8, animation: 'float 6s ease-in-out infinite', filter: 'drop-shadow(0 15px 25px rgba(17,138,178,0.5))' }} />
              </div>
              <div style={{ position: 'absolute', top: '40%', right: '8%', transform: `translate(${mousePos.x * 25}px, ${mousePos.y * 25}px)`, transition: 'transform 0.1s ease-out' }}>
                  <Sparkles size={80} color="#06D6A0" fill="#06D6A0" style={{ opacity: 0.8, animation: 'spin 15s linear infinite reverse', filter: 'drop-shadow(0 15px 25px rgba(6,214,160,0.5))' }} />
              </div>
              <div style={{ position: 'absolute', bottom: '35%', left: '10%', transform: `translate(${mousePos.x * -45}px, ${mousePos.y * -45}px)`, transition: 'transform 0.1s ease-out' }}>
                  <Rocket size={100} color="#FF9F1C" fill="#FF9F1C" style={{ opacity: 0.9, animation: 'float 7s ease-in-out infinite 0.5s', transform: 'rotate(45deg)', filter: 'drop-shadow(0 15px 25px rgba(255,159,28,0.5))' }} />
              </div>
              <div style={{ position: 'absolute', bottom: '15%', right: '15%', transform: `translate(${mousePos.x * 60}px, ${mousePos.y * 60}px)`, transition: 'transform 0.1s ease-out' }}>
                  <Heart size={120} color="#EF476F" fill="#EF476F" style={{ opacity: 0.9, animation: 'float 5s ease-in-out infinite 1s', filter: 'drop-shadow(0 15px 25px rgba(239,71,111,0.5))' }} />
              </div>
              <div style={{ position: 'absolute', bottom: '25%', right: '25%', transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)`, transition: 'transform 0.1s ease-out' }}>
                  <Smile size={90} color="#118AB2" fill="#118AB2" style={{ opacity: 0.85, animation: 'float 9s ease-in-out infinite 2s', filter: 'drop-shadow(0 15px 25px rgba(17,138,178,0.5))' }} />
              </div>
              <div style={{ position: 'absolute', bottom: '10%', left: '20%', transform: `translate(${mousePos.x * -70}px, ${mousePos.y * -70}px)`, transition: 'transform 0.1s ease-out' }}>
                  <Music size={100} color="#06D6A0" fill="#06D6A0" style={{ opacity: 0.9, animation: 'float 7s ease-in-out infinite 2s', filter: 'drop-shadow(0 15px 25px rgba(6,214,160,0.5))' }} />
              </div>
          </div>

          <div style={{ maxWidth: '1200px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <h1 className="animate-pop" style={{ fontSize: 'clamp(3.5rem, 8vw, 6rem)', color: 'var(--primary-blue)', marginBottom: '1vh', fontWeight: 900, textShadow: '0 4px 20px rgba(255,255,255,0.8)' }}>
              {schoolName} ✨
            </h1>
            <p style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', color: 'var(--text-main)', marginBottom: 'clamp(2rem, 6vh, 5rem)', fontWeight: 800, textShadow: '0 2px 4px rgba(255,255,255,0.7)' }}>ברוכים הבאים לעולם הלמידה שלנו!</p>
            
            <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(1.5rem, 4vh, 3rem)', width: '100%', maxWidth: '900px' }}>
                
                {/* Student Entrance */}
                {!isStaffLogining && (
                  <button 
                      className="card animate-pop landing-card" 
                      onClick={() => { setUserRole('student'); setCurrentView('login'); }}
                      style={{ padding: 'clamp(2rem, 4vh, 4rem) 2rem', cursor: 'pointer', border: 'none', background: 'white', position: 'relative', overflow: 'hidden' }}
                  >
                      <div style={{ background: 'hsla(122, 39%, 57%, 0.15)', padding: 'clamp(1.5rem, 3vh, 2.5rem)', borderRadius: '50%', width: 'clamp(100px, 15vh, 160px)', height: 'clamp(100px, 15vh, 160px)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto clamp(1rem, 3vh, 2.5rem)' }}>
                           <Baby size="60%" color="var(--primary-green)" />
                      </div>
                      <h2 style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', color: 'var(--primary-green)', marginBottom: '1vh' }}>כניסת ילדים</h2>
                      <p style={{ fontSize: '1.3rem', color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>משחקים, יצירה וחברים</p>
                  </button>
                )}

                {/* Staff Entrance */}
                <div className="card animate-pop landing-card" style={{ padding: 'clamp(2rem, 4vh, 4rem) 2rem', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'hsla(207, 90%, 61%, 0.15)', padding: 'clamp(1.5rem, 3vh, 2.5rem)', borderRadius: '50%', width: 'clamp(100px, 15vh, 160px)', height: 'clamp(100px, 15vh, 160px)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto clamp(1rem, 3vh, 2.5rem)' }}>
                         <GraduationCap size="60%" color="var(--primary-blue)" />
                    </div>
                    <h2 style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', color: 'var(--primary-blue)', marginBottom: '1.5vh' }}>כניסת צוות</h2>
                    
                    {isStaffLogining ? (
                        <div style={{ width: '100%', animation: 'slideUp 0.4s ease' }}>
                             <input 
                                type="password" 
                                placeholder="הזן סיסמת צוות" 
                                value={staffPassInput}
                                onChange={(e) => setStaffPassInput(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleStaffLogin()}
                                style={{ width: '100%', padding: 'clamp(0.8rem, 2vh, 1.2rem)', borderRadius: '20px', border: '3px solid var(--primary-blue)', fontSize: '1.4rem', textAlign: 'center', marginBottom: '1vh', outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}
                             />
                             {error && <p style={{ color: 'var(--primary-red)', fontWeight: 800, marginBottom: '1vh', fontSize: '1.1rem' }}>{error}</p>}
                             <div style={{ display: 'flex', gap: '1.2rem', width: '100%' }}>
                                <button className="giant-button" onClick={handleStaffLogin} style={{ flex: 1.5, fontSize: '1.3rem', padding: '1vh' }}>אישור ✅</button>
                                <button className="giant-button" onClick={() => { setIsStaffLogining(false); setError(''); }} style={{ flex: 1, background: 'var(--bg-color)', color: 'var(--text-muted)', fontSize: '1.3rem', padding: '1vh' }}>ביטול</button>
                             </div>
                        </div>
                    ) : (
                        <button 
                            className="giant-button" 
                            onClick={() => setIsStaffLogining(true)}
                            style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', padding: 'clamp(1rem, 2vh, 1.2rem) clamp(2rem, 4vw, 4rem)' }}
                        >
                            כניסה למערכת
                        </button>
                    )}
                </div>

            </div>
          </div>
        </div>
    );
  }

  return (
    <div className="app-container" dir="rtl" style={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      {/* Global Vibrant Background Blobs */}
      <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(255,209,102,0.35) 0%, rgba(255,209,102,0) 70%)', filter: 'blur(40px)', animation: 'float 8s ease-in-out infinite', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(17,138,178,0.25) 0%, rgba(17,138,178,0) 70%)', filter: 'blur(60px)', animation: 'float 12s ease-in-out infinite reverse', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', top: '15%', right: '5%', width: '45vw', height: '45vw', background: 'radial-gradient(circle, rgba(239,71,111,0.20) 0%, rgba(239,71,111,0) 70%)', filter: 'blur(50px)', animation: 'float 10s ease-in-out infinite 2s', zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 10, paddingBottom: '2rem' }}>
          {showNavbar && (
            <header className="app-header animate-pop" style={{ position: 'sticky', top: 0, zIndex: 1000, margin: '0.5rem 1rem', borderRadius: '12px', padding: '0.5rem 1.5rem' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                 <div className="avatar-small" style={{ background: userRole === 'staff' ? 'var(--primary-blue)' : 'var(--primary-green)', padding: '0.5rem', width: '40px', height: '40px', borderRadius: '12px' }}>
                   {userRole === 'staff' ? <GraduationCap size={20} color="white" /> : <Baby size={20} color="white" />}
                 </div>
                 <div style={{ textAlign: 'right' }}>
                   <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 800 }}>{schoolName}</h2>
                   <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>
                     שלום, <span style={{ color: userRole === 'staff' ? 'var(--primary-blue)' : 'var(--primary-green)' }}>{userRole === 'staff' ? teacherName : activeKid?.name}</span>
                   </p>
                 </div>
               </div>
               <button onClick={handleExit} className="giant-button" style={{ width: 'auto', height: 'auto', padding: '0.5rem 1rem', fontSize: '0.9rem', background: 'hsla(1, 83%, 63%, 0.1)', color: 'var(--primary-red)', border: 'none', borderRadius: '10px' }}>
                 יציאה 🚪
               </button>
            </header>
          )}

          {showNavbar && <Navbar currentView={currentView} setView={setCurrentView} userRole={userRole} />}

          <main style={{ marginTop: '1rem' }}>
            {renderView()}
          </main>

          {/* Floating Info for staff when in non-dashboard views */}
          {userRole === 'staff' && currentView !== 'dashboard' && (
              <div style={{ position: 'fixed', bottom: '6rem', left: '2rem', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', padding: '0.75rem 1.5rem', borderRadius: '30px', boxShadow: 'var(--shadow-soft)', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '2px solid var(--primary-blue)', zIndex: 100 }}>
                  <Users size={20} color="var(--primary-blue)" />
                  <span style={{ fontWeight: 700 }}>מצב עריכה: {teacherName}</span>
              </div>
          )}
      </div>
    </div>
  );
}
