import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc, increment } from 'firebase/firestore';
import { Star, Trophy } from 'lucide-react';

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
                        // Reset stars and level up
                        await updateDoc(mascotRef, {
                            totalStars: 0,
                            level: increment(1)
                        });
                    } catch (e) {
                         console.error("Failed to level up mascot", e);
                    }
                }
            } else {
                // Initialize if not exists
                await setDoc(mascotRef, { totalStars: 0, level: 1 });
            }
        });
        return unsub;
    }, []);

    const progressPercentage = Math.min((mascotData.totalStars / 50) * 100, 100);

    return (
        <div className="animate-pop" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} dir="rtl">
            {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={600} gravity={0.15} />}
            
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: 'var(--primary-blue)', marginBottom: '0.5rem', fontWeight: 900, textShadow: '0 4px 15px rgba(255,255,255,0.8)' }}>
                חילזון ארגמון
            </h1>
            
            {/* Level Badge */}
            <div className="card" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8rem', background: 'white', padding: '0.8rem 1.8rem', borderRadius: '30px', marginBottom: '3rem', border: '3px solid var(--primary-yellow)', boxShadow: '0 10px 25px rgba(255, 209, 102, 0.4)' }}>
                <Trophy size={28} color="var(--primary-yellow)" fill="var(--primary-yellow)" />
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-blue)' }}>שלב {mascotData.level}</span>
            </div>

            {/* Snail SVG wrapper with gentle breathing */}
            <div style={{ animation: 'float 5s ease-in-out infinite', marginBottom: '3.5rem', position: 'relative', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.15))' }}>
                {/* A beautifully constructed vibrant vector snail */}
                <svg width="280" height="230" viewBox="0 0 280 230" xmlns="http://www.w3.org/2000/svg">
                    {/* Shadow underneath */}
                    <ellipse cx="140" cy="210" rx="90" ry="12" fill="rgba(0,0,0,0.08)" />
                    
                    {/* Body (Yellow/Orange gradient) */}
                    <defs>
                        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FFD166" />
                            <stop offset="100%" stopColor="#FF9F1C" />
                        </linearGradient>
                        <linearGradient id="shellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#EF476F" />
                            <stop offset="100%" stopColor="#c1121f" />
                        </linearGradient>
                    </defs>

                    <path d="M 50 200 Q 20 200 30 150 Q 40 110 60 110 Q 80 110 90 150 Q 100 200 160 200 L 230 200 Q 260 200 260 170 Q 260 140 230 140 L 160 140 Z" fill="url(#bodyGrad)" stroke="#f4a261" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                    
                    {/* Eyes */}
                    <circle cx="50" cy="120" r="7" fill="#333" />
                    <circle cx="52" cy="118" r="2" fill="#FFF" />
                    <circle cx="75" cy="120" r="7" fill="#333" />
                    <circle cx="77" cy="118" r="2" fill="#FFF" />
                    
                    {/* Smile */}
                    <path d="M 55 135 Q 62 145 70 135" fill="none" stroke="#e76f51" strokeWidth="4" strokeLinecap="round" />

                    {/* Antennae */}
                    <path d="M 50 110 Q 45 90 35 70" fill="none" stroke="#f4a261" strokeWidth="6" strokeLinecap="round" />
                    <circle cx="35" cy="70" r="8" fill="#e76f51" />
                    <circle cx="37" cy="68" r="3" fill="#FFF" opacity="0.6" />
                    
                    <path d="M 75 110 Q 80 90 90 70" fill="none" stroke="#f4a261" strokeWidth="6" strokeLinecap="round" />
                    <circle cx="90" cy="70" r="8" fill="#e76f51" />
                    <circle cx="92" cy="68" r="3" fill="#FFF" opacity="0.6" />

                    {/* Shell - Argaman Color */}
                    <circle cx="160" cy="125" r="75" fill="url(#shellGrad)" stroke="#780000" strokeWidth="8" />
                    
                    {/* Shell Spirals and highlights */}
                    <path d="M 160 125 M 160 125 Q 205 85 160 50 Q 115 85 160 125 Q 185 125 160 100" fill="none" stroke="#FFF" strokeWidth="8" strokeLinecap="round" opacity="0.5"/>
                    <path d="M 178 70 A 40 40 0 1 0 185 140" fill="none" stroke="#FFF" strokeWidth="8" strokeLinecap="round" opacity="0.5" />
                    <path d="M 150 95 A 20 20 0 1 0 165 115" fill="none" stroke="#FFF" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
                </svg>
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', width: '100%' }}>
                <Star size={36} color="var(--primary-yellow)" fill="var(--primary-yellow)" style={{ animation: 'spin 8s linear infinite' }} />
                עזרו לארגמון להגיע ל-50 כוכבים!
                <Star size={36} color="var(--primary-yellow)" fill="var(--primary-yellow)" style={{ animation: 'spin 8s linear infinite reverse' }} />
            </h2>

            {/* Giant Progress Bar */}
            <div style={{ width: '100%', maxWidth: '600px', background: 'white', borderRadius: '40px', padding: '8px', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.1)', border: '4px solid var(--primary-yellow)', position: 'relative', height: '65px', overflow: 'hidden' }}>
                <div style={{ 
                    height: '100%', 
                    width: `${progressPercentage}%`, 
                    minWidth: '5%',
                    background: 'linear-gradient(90deg, #FFD166 0%, #06D6A0 100%)', 
                    borderRadius: '25px', 
                    transition: 'width 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 4px 15px rgba(6, 214, 160, 0.4)'
                 }}>
                     {/* Glossy overlay */}
                     <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to bottom, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 100%)' }} />
                     {/* Animated diagonal stripes overlay */}
                     <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(255,255,255,0.2) 15px, rgba(255,255,255,0.2) 30px)', opacity: 0.5 }} />
                 </div>
                 
                 <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.8rem', color: progressPercentage > 50 ? 'white' : 'var(--primary-blue)', textShadow: progressPercentage > 50 ? '0 2px 4px rgba(0,0,0,0.4)' : 'none', zIndex: 10 }}>
                     {mascotData.totalStars} כוכבים חדשים
                 </div>
            </div>
            
            <p style={{ marginTop: '2.5rem', fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: 700, padding: '1rem', background: 'rgba(255,255,255,0.6)', borderRadius: '20px' }}>
                🌟 כל פעילות באפליקציה מזכה את הכיתה בכוכבים נוספים 🌟
            </p>
        </div>
    );
}
