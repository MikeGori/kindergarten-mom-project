import React, { useState, useRef } from 'react';
import { Mic, Square, Play, Send } from 'lucide-react';

export default function AudioRecorder({ onSave }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setAudioUrl(reader.result);
        };
        audioChunks.current = [];
      };
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied", err);
      // For demo purposes, we'll simulate recording
      setIsRecording(true);
      setTimeout(() => {
          stopRecording();
          setAudioUrl("mock-audio-url");
      }, 2000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
    }
    setIsRecording(false);
  };

  const handleSend = () => {
    onSave(audioUrl);
    setAudioUrl(null);
  };

  return (
    <div className="card" style={{ background: '#f5f5f5', textAlign: 'center' }}>
      {!audioUrl ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <h2 style={{ color: isRecording ? 'var(--primary-red)' : 'var(--text-main)' }}>
            {isRecording ? 'מקשיב...' : 'רוצה לדבר?'}
          </h2>
          
          <button 
            className="giant-button"
            onClick={isRecording ? stopRecording : startRecording}
            style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '50%', 
              background: isRecording ? 'var(--primary-red)' : 'var(--primary-blue)',
              boxShadow: isRecording ? '0 0 30px var(--primary-red)' : 'var(--shadow-soft)',
              animation: isRecording ? 'pulse 1.5s infinite' : 'none'
            }}
          >
            {isRecording ? <Square size={48} color="white" /> : <Mic size={48} color="white" />}
          </button>
          
          {isRecording && (
              <div style={{ display: 'flex', gap: '4px' }}>
                  {[...Array(6)].map((_, i) => (
                      <div key={i} className="voice-bar" style={{ animationDelay: `${i * 0.1}s` }}></div>
                   ))}
              </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <h2>עבודה מצוינת!</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="giant-button" style={{ width: '80px', height: '80px', background: 'white' }} onClick={() => {
                const audio = new Audio(audioUrl);
                audio.play();
            }}>
              <Play size={32} color="var(--primary-blue)" />
            </button>
            <button className="giant-button" onClick={handleSend} style={{ width: '80px', height: '80px', background: 'var(--primary-green)' }}>
              <Send size={32} color="white" />
            </button>
          </div>
          <button 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }}
            onClick={() => setAudioUrl(null)}
          >
            נסה שוב
          </button>
        </div>
      )}
      
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        .voice-bar {
            width: 8px;
            height: 20px;
            background: var(--primary-red);
            border-radius: 4px;
            animation: bounce 0.5s infinite alternate;
        }
        @keyframes bounce {
            from { height: 10px; }
            to { height: 40px; }
        }
      `}</style>
    </div>
  );
}
