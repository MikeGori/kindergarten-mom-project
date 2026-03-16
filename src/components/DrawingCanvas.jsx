import React, { useRef, useEffect, useState } from 'react';
import { Eraser, Trash2, CheckCircle, Pencil, PaintBucket, Square, Circle } from 'lucide-react';

export default function DrawingCanvas({ onSave }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('var(--primary-red)');
  const [brushSize, setBrushSize] = useState(12);
  const [tool, setTool] = useState('brush'); // brush, rect, circle, fill
  const [snapshot, setSnapshot] = useState(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
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
  
  // Convert HEX or CSS var to RGBA for flood fill
  const getRgba = (cssColor) => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 1; tempCanvas.height = 1;
      const tCtx = tempCanvas.getContext('2d');
      if (cssColor.startsWith('var(')) {
          const varName = cssColor.slice(4, -1);
          tCtx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      } else {
          tCtx.fillStyle = cssColor;
      }
      tCtx.fillRect(0,0,1,1);
      return tCtx.getImageData(0,0,1,1).data;
  };

  const floodFill = (ctx, startX, startY, cssColor) => {
    const canvas = ctx.canvas;
    const canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = canvasData.data;
    startX = Math.round(startX);
    startY = Math.round(startY);
    const startPos = (startY * canvas.width + startX) * 4;
    
    const fillPixel = getRgba(cssColor);
    const startR = data[startPos], startG = data[startPos+1], startB = data[startPos+2], startA = data[startPos+3];
    const fR = fillPixel[0], fG = fillPixel[1], fB = fillPixel[2], fA = fillPixel[3];

    if (startR === fR && startG === fG && startB === fB && startA === fA) return;

    const matchStartColor = (pos) => data[pos] === startR && data[pos+1] === startG && data[pos+2] === startB && data[pos+3] === startA;
    const colorPixel = (pos) => { data[pos] = fR; data[pos+1] = fG; data[pos+2] = fB; data[pos+3] = fA; };

    const pixelStack = [[startX, startY]];
    
    while(pixelStack.length > 0) {
        const newPos = pixelStack.pop();
        const x = newPos[0];
        let y = newPos[1];
        let pixelPos = (y * canvas.width + x) * 4;
        
        while(y-- >= 0 && matchStartColor(pixelPos)) pixelPos -= canvas.width * 4;
        pixelPos += canvas.width * 4;
        ++y;
        
        let reachLeft = false;
        let reachRight = false;
        
        while(y++ < canvas.height - 1 && matchStartColor(pixelPos)) {
            colorPixel(pixelPos);
            if (x > 0) {
                if (matchStartColor(pixelPos - 4)) {
                    if (!reachLeft) { pixelStack.push([x - 1, y]); reachLeft = true; }
                } else if (reachLeft) { reachLeft = false; }
            }
            if (x < canvas.width - 1) {
                if (matchStartColor(pixelPos + 4)) {
                    if (!reachRight) { pixelStack.push([x + 1, y]); reachRight = true; }
                } else if (reachRight) { reachRight = false; }
            }
            pixelPos += canvas.width * 4;
        }
    }
    ctx.putImageData(canvasData, 0, 0);
  };

  const startDrawing = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    const ctx = canvasRef.current.getContext('2d');
    
    if (tool === 'fill') {
        floodFill(ctx, offsetX, offsetY, color);
        return;
    }
    
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setIsDrawing(true);
    setStartPos({ x: offsetX, y: offsetY });
    
    if (tool !== 'brush') {
        setSnapshot(ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    const ctx = canvasRef.current.getContext('2d');
    
    if (tool === 'brush') {
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    } else if (tool === 'rect' || tool === 'circle') {
        if (!snapshot) return;
        ctx.putImageData(snapshot, 0, 0);
        ctx.beginPath();
        if (tool === 'rect') {
            const w = offsetX - startPos.x;
            const h = offsetY - startPos.y;
            ctx.strokeRect(startPos.x, startPos.y, w, h);
            ctx.fillStyle = ctx.strokeStyle;
            ctx.fillRect(startPos.x, startPos.y, w, h);
        } else if (tool === 'circle') {
            const radius = Math.sqrt(Math.pow(startPos.x - offsetX, 2) + Math.pow(startPos.y - offsetY, 2));
            ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = ctx.strokeStyle;
            ctx.fill();
            ctx.stroke();
        }
    }
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
    // Replace transparency with white before saving
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.fillStyle = 'white';
    tempCtx.fillRect(0, 0, canvas.width, canvas.height);
    tempCtx.drawImage(canvas, 0, 0);
    
    const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.85);
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

  const toolsList = [
      { id: 'brush', icon: Pencil, label: 'מכחול' },
      { id: 'fill', icon: PaintBucket, label: 'דלי צבע' },
      { id: 'rect', icon: Square, label: 'ריבוע' },
      { id: 'circle', icon: Circle, label: 'עיגול' },
      { id: 'eraser', icon: Eraser, label: 'מחק' }
  ];

  return (
    <div className="card" style={{ background: 'white', padding: '1.5rem' }}>
      
      {/* Tools View */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', background: 'var(--bg-color)', padding: '1rem', borderRadius: '24px' }}>
         {toolsList.map(t => (
            <button 
                key={t.id}
                className={`giant-button ${tool === t.id ? 'selected' : ''}`}
                onClick={() => {
                    setTool(t.id);
                    if (t.id === 'eraser') setColor('white');
                    else if (color === 'white') setColor('var(--primary-red)'); // Auto revert color when leaving eraser
                }}
                style={{ width: '60px', height: '60px', borderRadius: '16px' }}
                aria-label={t.label}
            >
                <t.icon size={28} color={tool === t.id ? 'var(--primary-blue)' : 'var(--text-muted)'} />
            </button>
         ))}
      </div>

      {/* Colors View */}
      {tool !== 'eraser' && (
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
          </div>
      )}

      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={(e) => { e.preventDefault(); startDrawing({ nativeEvent: { offsetX: e.touches[0].clientX - canvasRef.current.getBoundingClientRect().left, offsetY: e.touches[0].clientY - canvasRef.current.getBoundingClientRect().top }}); }}
        onTouchMove={(e) => draw({ nativeEvent: { offsetX: e.touches[0].clientX - canvasRef.current.getBoundingClientRect().left, offsetY: e.touches[0].clientY - canvasRef.current.getBoundingClientRect().top }})}
        onTouchEnd={stopDrawing}
        style={{
          width: '100%',
          height: '400px',
          background: 'white',
          borderRadius: '24px',
          cursor: tool === 'fill' ? 'url(https://cdn-icons-png.flaticon.com/32/14/14109.png) 0 32, crosshair' : 'crosshair',
          touchAction: 'none',
          boxShadow: 'var(--shadow-inner)',
          border: '2px solid #eee'
        }}
      />

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button 
          className="giant-button" 
          onClick={clearCanvas}
          style={{ flex: 1, height: '70px', background: '#ffebee' }}
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
