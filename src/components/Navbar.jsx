import React from 'react';
import { LogIn, LayoutGrid, Users, MessageSquare } from 'lucide-react';

const navItems = [
  { id: 'login', icon: LogIn, color: 'var(--primary-yellow)', label: 'כניסה' },
  { id: 'learning', icon: LayoutGrid, color: 'var(--primary-blue)', label: 'משחקים' },
  { id: 'feed', icon: MessageSquare, color: 'var(--primary-green)', label: 'חברים' },
  { id: 'dashboard', icon: Users, color: 'var(--primary-purple)', label: 'מורה' },
];

export default function Navbar({ currentView, setView }) {
  return (
    <nav style={{
      position: 'fixed',
      bottom: '2rem',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      display: 'flex',
      gap: '1rem',
      padding: '0.75rem',
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(12px)',
      borderRadius: '2rem',
      border: '1px solid var(--glass-border)',
      boxShadow: 'var(--shadow-soft)',
      maxWidth: 'min(90vw, 500px)',
      width: 'max-content'
    }}>
      {navItems.map((item) => {
        const isActive = currentView === item.id;
        const Icon = item.icon;
        
        return (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            style={{
              position: 'relative',
              width: 'var(--touch-target)',
              height: 'var(--touch-target)',
              borderRadius: '1.5rem',
              border: 'none',
              background: isActive ? item.color : 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem',
              cursor: 'pointer',
              transition: 'var(--transition-bounce)',
              transform: isActive ? 'scale(1.1) translateY(-8px)' : 'scale(1)',
              boxShadow: isActive ? `0 8px 20px ${item.color}44` : 'none',
            }}
            aria-label={item.label}
          >
            <Icon 
              size={isActive ? 32 : 28} 
              color={isActive ? 'white' : 'var(--text-muted)'} 
              strokeWidth={isActive ? 2.5 : 2}
            />
            {!isActive && (
                <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    color: 'var(--text-muted)' 
                }}>
                    {item.label}
                </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
