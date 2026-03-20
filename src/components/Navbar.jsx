import React from 'react';
import { LogIn, LayoutGrid, Users, MessageSquare, ClipboardList, Star } from 'lucide-react';

const staffNav = [
  { id: 'dashboard', icon: Users, color: 'var(--primary-purple)', label: 'דשבורד' },
  { id: 'activity-manager', icon: ClipboardList, color: 'var(--primary-blue)', label: 'ניהול פעילויות' },
  { id: 'feed', icon: MessageSquare, color: 'var(--primary-green)', label: 'חברים' },
];

const kidNav = [
  { id: 'learning', icon: LayoutGrid, color: 'var(--primary-blue)', label: 'משחקים' },
  { id: 'feed', icon: MessageSquare, color: 'var(--primary-green)', label: 'חברים' },
  { id: 'mascot', icon: Star, color: 'var(--primary-yellow)', label: 'ארגמון' },
];

export default function Navbar({ currentView, setView, userRole }) {
  const items = userRole === 'staff' ? staffNav : kidNav;

  return (
    <nav style={{
      position: 'fixed',
      bottom: '2rem',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      display: 'flex',
      gap: '1rem',
      padding: '0.5rem',
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(12px)',
      borderRadius: '2rem',
      border: '1px solid var(--glass-border)',
      boxShadow: 'var(--shadow-soft)',
      maxWidth: 'min(90vw, 500px)',
      width: 'max-content'
    }}>
      {items.map((item) => {
        const isActive = currentView === item.id;
        const Icon = item.icon;
        
        return (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            style={{
              position: 'relative',
              padding: '0 0.5rem',
              height: 'calc(var(--touch-target) * 0.75)',
              borderRadius: '1.2rem',
              border: 'none',
              background: isActive ? item.color : 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.2rem',
              cursor: 'pointer',
              transition: 'var(--transition-bounce)',
              transform: isActive ? 'scale(1.05) translateY(-5px)' : 'scale(1)',
              boxShadow: isActive ? `0 8px 20px ${item.color}44` : 'none',
              minWidth: '60px'
            }}
            aria-label={item.label}
          >
            <Icon 
              size={isActive ? 24 : 20} 
              color={isActive ? 'white' : 'var(--text-muted)'} 
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                color: isActive ? 'white' : 'var(--text-muted)'
            }}>
                {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
