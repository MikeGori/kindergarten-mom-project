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
        <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', overflowX: 'hidden', padding: '3vh 2vw 12vh', background: 'radial-gradient(circle at center, #cbf3f0 0%, #2ec4b6 100%)', margin: '-1rem -1rem -8rem -1rem', zIndex: 1 }} dir="rtl">
            
            {/* Massive Sunburst Ray Animation in Background */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: '200vw', height: '200vw', background: 'repeating-conic-gradient(rgba(255,255,255,0.4) 0 15deg, transparent 15deg 30deg)', transform: 'translate(-50%, -50%)', animation: 'spin 120s linear infinite', zIndex: 0, pointerEvents: 'none' }} />
            
            {/* Floating ambient particles */}
            <div style={{ position: 'absolute', top: '15%', left: '10%', animation: 'float 6s ease-in-out infinite' }}><Star size={80} color="#FFD166" fill="#FFD166" style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.2))' }} /></div>
            <div style={{ position: 'absolute', top: '25%', right: '15%', animation: 'float 8s ease-in-out infinite reverse' }}><Heart size={100} color="#EF476F" fill="#EF476F" style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.2))' }} /></div>
            <div style={{ position: 'absolute', bottom: '30%', left: '20%', animation: 'float 7s ease-in-out infinite' }}><Sparkles size={90} color="#FFD166" fill="#FFD166" style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.2))' }} /></div>

            {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={800} gravity={0.15} style={{ zIndex: 10000, pointerEvents: 'none' }} />}

            {/* Top Info Banner */}
            <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                {/* Level Badge Banner */}
                <div className="card animate-pop" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #FF9F1C 0%, #FFD166 100%)', padding: '0.8rem 2.5rem', borderRadius: '50px', marginBottom: '1vh', border: '4px solid white', boxShadow: '0 10px 25px rgba(255, 159, 28, 0.4)', transform: 'rotate(-2deg)' }}>
                    <Trophy size={36} color="white" fill="white" />
                    <span style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 900, color: 'white', textShadow: '0 3px 8px rgba(0,0,0,0.2)' }}>שלב {mascotData.level}</span>
                </div>

                <h1 className="animate-pop" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: 'white', margin: 0, fontWeight: 900, textShadow: '0 4px 15px rgba(0,0,0,0.3)', textAlign: 'center', lineHeight: 1.1 }}>
                    חילזון ארגמון
                </h1>
            </div>

            {/* Middle Container for the Dynamic SVG Mascot */}
            <div style={{ zIndex: 10, flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', position: 'relative' }}>
                <div style={{ width: 'clamp(250px, 55vh, 550px)', height: 'clamp(250px, 55vh, 550px)', animation: 'float 4s ease-in-out infinite', filter: 'drop-shadow(0 25px 35px rgba(0,0,0,0.4))' }}>
                    
                    {/* Exquisite Transparent Die-Cut Sticker PNG Snail */}
                    <img 
                        src="/argaman-sticker.png" 
                        alt="Argaman Snail Mascot" 
                        draggable="false"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'pointer', transition: 'transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
                        onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.85) translateY(15px)'; e.currentTarget.parentElement.style.animationPlayState = 'paused'; }}
                        onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.parentElement.style.animationPlayState = 'running'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.parentElement.style.animationPlayState = 'running'; }}
                    />

                </div>
            </div>

            {/* Bottom Progress UI */}
            <div style={{ zIndex: 10, width: '100%', maxWidth: '700px', flexShrink: 0, paddingBottom: '1vh' }}>
                <div className="card animate-pop" style={{ width: '100%', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderRadius: '30px', padding: '1.5vh 2vw', border: '5px solid white', boxShadow: '0 15px 40px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    
                    <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', fontWeight: 900, color: 'var(--primary-blue)', margin: '0 0 1.5vh 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', textAlign: 'center' }}>
                        <Star size={32} color="var(--primary-yellow)" fill="var(--primary-yellow)" style={{ animation: 'spin 6s linear infinite' }} />
                        עזרו לארגמון לאסוף 50 כוכבים!
                        <Star size={32} color="var(--primary-yellow)" fill="var(--primary-yellow)" style={{ animation: 'spin 6s linear infinite reverse' }} />
                    </h2>

                    {/* Glowing Track */}
                    <div style={{ width: '100%', background: '#eef2f5', borderRadius: '40px', padding: '8px', boxShadow: 'inset 0 6px 12px rgba(0,0,0,0.1)', position: 'relative', height: 'clamp(50px, 8vh, 70px)', overflow: 'hidden' }}>
                        
                        {/* Fill */}
                        <div style={{ 
                            height: '100%', 
                            width: `${Math.max(progressPercentage, 5)}%`, 
                            background: 'linear-gradient(90deg, #FF9F1C 0%, #FFD166 50%, #06D6A0 100%)', 
                            borderRadius: '30px', 
                            transition: 'width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 4px 15px rgba(6, 214, 160, 0.5)'
                        }}>
                             {/* Glossy top highlight */}
                             <div style={{ position: 'absolute', top: '5%', left: '2%', right: '2%', height: '35%', background: 'linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 100%)', borderRadius: '20px' }} />
                             {/* Moving diagonal barber stripes */}
                             <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.2) 20px, rgba(255,255,255,0.2) 40px)', opacity: 0.6, animation: 'barberpole 15s linear infinite' }} />
                        </div>
                        
                        {/* Exact number overlay */}
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', color: progressPercentage > 40 ? 'white' : 'var(--primary-blue)', textShadow: progressPercentage > 40 ? '0 2px 5px rgba(0,0,0,0.5)' : 'none', zIndex: 10, letterSpacing: '2px' }}>
                            {mascotData.totalStars} כוכבים 
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    );
}
