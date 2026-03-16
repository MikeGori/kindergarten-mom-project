import React from 'react';
import { Play, FileText, CheckCircle, Video } from 'lucide-react';
import '../index.css';

export default function ActivityHub() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', textAlign: 'right' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>מרכז הלמידה</h1>

      {/* Video Section */}
      <div className="card animate-pop" style={{ marginBottom: '3rem', background: '#ffebee' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-red)' }}>
          <Video size={32} /> שעת סיפור
        </h2>
        
        <div style={{ width: '100%', height: '300px', background: 'black', borderRadius: '24px', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          {/* Mock Video Thumbnail */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(45deg, var(--primary-blue), var(--primary-green))', opacity: 0.8 }}></div>
          <button className="giant-button" style={{ zIndex: 10, width: '100px', height: '100px', borderRadius: '50%', background: 'white' }}>
            <Play size={48} color="var(--primary-red)" style={{ marginRight: '8px' }} />
          </button>
        </div>
      </div>

      {/* Interactive Worksheets Section */}
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
        <FileText size={32} color="var(--primary-blue)" /> הפעילויות של היום
      </h2>

      <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        
        {/* Worksheet 1 */}
        <div className="card animate-pop" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: '100%', height: '150px', background: '#e8f5e9', borderRadius: '16px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ border: '4px dashed var(--primary-green)', width: '80px', height: '80px', borderRadius: '50%' }}></div>
          </div>
          <h3>התאמת צורות</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', marginTop: '0.5rem' }}>גרור את הריבוע הכחול לתיבה הנכונה.</p>
          <button style={{ padding: '1rem 2rem', borderRadius: '32px', border: 'none', background: 'var(--primary-green)', color: 'white', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer', width: '100%' }}>
            בואו נשחק
          </button>
        </div>

        {/* Worksheet 2 (Completed) */}
        <div className="card animate-pop" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', opacity: 0.8 }}>
          <div style={{ width: '100%', height: '150px', background: '#fff8e1', borderRadius: '16px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
             <CheckCircle size={64} color="var(--primary-green)" style={{ position: 'absolute' }} />
          </div>
          <h3>ספר צביעה</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', marginTop: '0.5rem' }}>זכית בכוכב!</p>
          <button style={{ padding: '1rem 2rem', borderRadius: '32px', border: 'none', background: '#ccc', color: 'white', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'not-allowed', width: '100%' }} disabled>
            סיימתי ✓
          </button>
        </div>

      </div>

    </div>
  );
}
