import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc, increment } from 'firebase/firestore';
import { Star, Trophy, Sparkles, Heart } from 'lucide-react';
import '../index.css';

export default function Mascot() {
    const [mascotData, setMascotData] = useState({ totalStars: 0, level: 1 });
    const [showConfetti, setShowConfetti] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    useEffect(() => {
        const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const mascotRef = doc(db, 'settings', 'mascot');
        const unsub = onSnapshot(mascotRef, async (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setMascotData({ totalStars: data.totalStars || 0, level: data.level || 1 });
                
                // Check level up condition
                if (data.totalStars >= 50) {
                    setShowConfetti(true);
                    setTimeout(() => setShowConfetti(false), 8000); // Stop confetti after 8s
                    
                    try {
                        await updateDoc(mascotRef, {
                            totalStars: 0,
                            level: increment(1)
                        });
                    } catch (e) {
                         console.error("Failed to level up mascot", e);
                    }
                }
            } else {
                await setDoc(mascotRef, { totalStars: 0, level: 1 });
            }
        });
        return unsub;
    }, []);

    const progressPercentage = Math.min((mascotData.totalStars / 50) * 100, 100);

    return (
        <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflowX: 'hidden', paddingBottom: '6rem', background: 'radial-gradient(circle at center, #cbf3f0 0%, #2ec4b6 100%)' }} dir="rtl">
            
            {/* Massive Sunburst Ray Animation in Background */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: '200vw', height: '200vw', background: 'repeating-conic-gradient(rgba(255,255,255,0.4) 0 15deg, transparent 15deg 30deg)', transform: 'translate(-50%, -50%)', animation: 'spin 120s linear infinite', zIndex: 0, pointerEvents: 'none' }} />
            
            {/* Floating ambient particles */}
            <div style={{ position: 'absolute', top: '15%', left: '10%', animation: 'float 6s ease-in-out infinite' }}><Star size={80} color="#FFD166" fill="#FFD166" style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.2))' }} /></div>
            <div style={{ position: 'absolute', top: '25%', right: '15%', animation: 'float 8s ease-in-out infinite reverse' }}><Heart size={100} color="#EF476F" fill="#EF476F" style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.2))' }} /></div>
            <div style={{ position: 'absolute', bottom: '20%', left: '20%', animation: 'float 7s ease-in-out infinite' }}><Sparkles size={90} color="#FFD166" fill="#FFD166" style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.2))' }} /></div>

            {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={800} gravity={0.15} style={{ zIndex: 999 }} />}

            <div style={{ zIndex: 10, width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
                
                {/* Level Badge Banner */}
                <div className="card animate-pop" style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', background: 'linear-gradient(135deg, #FF9F1C 0%, #FFD166 100%)', padding: '1rem 3rem', borderRadius: '50px', marginBottom: '2rem', border: '6px solid white', boxShadow: '0 15px 35px rgba(255, 159, 28, 0.4)', transform: 'rotate(-3deg)' }}>
                    <Trophy size={48} color="white" fill="white" />
                    <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', textShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>שלב {mascotData.level}</span>
                </div>

                <h1 className="animate-pop" style={{ fontSize: 'clamp(4rem, 10vw, 7rem)', color: 'white', marginBottom: '2rem', fontWeight: 900, textShadow: '0 6px 20px rgba(0,0,0,0.3)', textAlign: 'center', lineHeight: 1.1 }}>
                    חילזון ארגמון
                </h1>

                {/* The 3D Pixar Mascot Asset */}
                <div style={{ position: 'relative', width: 'clamp(300px, 50vw, 550px)', height: 'clamp(300px, 50vw, 550px)', marginBottom: '3rem', animation: 'float 4s ease-in-out infinite', filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.4))' }}>
                    <img 
                        src="/argaman-snail.png" 
                        alt="Argaman Snail Mascot" 
                        style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'pointer', transition: 'transform 0.1s' }}
                        onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.9) translateY(10px)'; e.currentTarget.parentElement.style.animationPlayState = 'paused'; }}
                        onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.parentElement.style.animationPlayState = 'running'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.parentElement.style.animationPlayState = 'running'; }}
                    />
                </div>

                {/* Giant Glass Game UI Progress Box */}
                <div className="card animate-pop" style={{ width: '100%', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderRadius: '40px', padding: '3rem', border: '6px solid white', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    
                    <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--primary-blue)', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', width: '100%', textAlign: 'center' }}>
                        <Star size={40} color="var(--primary-yellow)" fill="var(--primary-yellow)" style={{ animation: 'spin 6s linear infinite' }} />
                        עזרו לארגמון להגיע ל-50 כוכבים!
                        <Star size={40} color="var(--primary-yellow)" fill="var(--primary-yellow)" style={{ animation: 'spin 6s linear infinite reverse' }} />
                    </h2>

                    {/* Glowing Track */}
                    <div style={{ width: '100%', background: '#eef2f5', borderRadius: '50px', padding: '12px', boxShadow: 'inset 0 8px 15px rgba(0,0,0,0.1)', position: 'relative', height: '100px', overflow: 'hidden' }}>
                        
                        {/* Fill */}
                        <div style={{ 
                            height: '100%', 
                            width: `${Math.max(progressPercentage, 5)}%`, 
                            background: 'linear-gradient(90deg, #FF9F1C 0%, #FFD166 50%, #06D6A0 100%)', 
                            borderRadius: '40px', 
                            transition: 'width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 5px 20px rgba(6, 214, 160, 0.6)'
                        }}>
                             {/* Glossy top highlight */}
                             <div style={{ position: 'absolute', top: '5%', left: '2%', right: '2%', height: '35%', background: 'linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 100%)', borderRadius: '20px' }} />
                             {/* Moving diagonal barber stripes */}
                             <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(45deg, transparent, transparent 30px, rgba(255,255,255,0.2) 30px, rgba(255,255,255,0.2) 60px)', opacity: 0.6, animation: 'barberpole 15s linear infinite' }} />
                        </div>
                        
                        {/* Exact number overlay */}
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '3rem', color: progressPercentage > 40 ? 'white' : 'var(--primary-blue)', textShadow: progressPercentage > 40 ? '0 3px 6px rgba(0,0,0,0.5)' : 'none', zIndex: 10, letterSpacing: '2px' }}>
                            {mascotData.totalStars} כוכבים 
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
