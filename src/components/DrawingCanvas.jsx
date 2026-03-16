import React, { useRef, useEffect, useState } from 'react';
import { Eraser, Trash2, CheckCircle, Palette } from 'lucide-react';

export default function DrawingCanvas({ onSave }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('var(--primary-red)');
  const [brushSize, setBrushSize] = useState(12);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (color.startsWith('var(')) {
        const varName = color.slice(4, -1);
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    } else {
        ctx.strokeStyle = color;
    }
    
    ctx.lineWidth = brushSize;
  }, [color, brushSize]);

  const startDrawing = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL();
    onSave(dataUrl);
    clearCanvas();
  };

  const colors = [
    'var(--primary-red)', 
    'var(--primary-blue)', 
    'var(--primary-green)', 
    'var(--primary-yellow)',
    'var(--primary-purple)',
    '#333'
  ];

  return (
    <div className="card" style={{ background: 'white', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {colors.map(c => (
          <button
            key={c}
            onClick={() => setColor(c)}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: c,
              border: color === c ? '4px solid white' : 'none',
              boxShadow: color === c ? '0 0 0 2px var(--primary-blue)' : 'none',
              cursor: 'pointer',
              transition: 'var(--transition-bounce)',
              transform: color === c ? 'scale(1.1)' : 'scale(1)'
            }}
          />
        ))}
        <button 
          className="giant-button" 
          onClick={() => setColor('white')}
          style={{ width: '50px', height: '50px', borderRadius: '50%', background: color === 'white' ? '#eee' : 'white' }}
        >
          <Eraser size={24} color="var(--text-muted)" />
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        style={{
          width: '100%',
          height: '400px',
          background: '#f9f9f9',
          borderRadius: '24px',
          cursor: 'crosshair',
          touchAction: 'none',
          boxShadow: 'var(--shadow-inner)',
          border: '2px solid #eee'
        }}
      />

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button 
          className="giant-button" 
          onClick={clearCanvas}
          style={{ flex: 1, height: '70px', background: '#fff' }}
        >
          <Trash2 size={24} color="var(--primary-red)" />
        </button>
        <button 
          className="giant-button" 
          onClick={saveDrawing}
          style={{ flex: 2, height: '70px', background: 'var(--primary-green)', color: 'white', gap: '1rem' }}
        >
          <CheckCircle size={28} /> <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>שתף את היצירה שלי!</span>
        </button>
      </div>
    </div>
  );
}
