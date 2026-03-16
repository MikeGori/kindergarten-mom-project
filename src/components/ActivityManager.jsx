import React, { useState, useEffect } from 'react';
import { Video, FileText, Plus, Trash2, ToggleLeft, ToggleRight, Link, Image as ImageIcon, Gamepad2, Music, Palette, BookOpen, Rocket, Star, Heart, Smile, Sun } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { uploadMedia } from '../services/storage';

export default function ActivityManager() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', url: '', type: 'link', icon: 'Gamepad2', color: 'var(--primary-green)' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'activities'), (snap) => {
      setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error(err);
      setError('לא ניתן לטעון פעילויות. בדקו את ההגדרות.');
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title || !form.url) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'activities'), {
        title: form.title,
        url: form.url,
        type: form.type,
        icon: form.icon || 'Star',
        color: form.color || 'var(--primary-yellow)',
        active: true,
        createdAt: new Date()
      });
      setForm({ title: '', url: '', type: 'link', icon: 'Gamepad2', color: 'var(--primary-green)' });
      setShowForm(false);
    } catch (err) {
      alert('שגיאה בהוספה. בדקו את החיבור.');
    }
    setSaving(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800; // Resize to max 800px to ensure it fits in Firestore (1MB limit)

        if (width > height) {
          if (width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG to save space
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setForm(f => ({ ...f, url: dataUrl }));
      };
    };
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSaving(true);
    try {
        const result = await uploadMedia(file, 'activities/pdfs');
        setForm(f => ({ ...f, url: result.url, title: form.title || file.name }));
    } catch (err) {
        alert("שגיאה בהעלאת הקובץ: " + err.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
        await deleteDoc(doc(db, 'activities', id));
        setConfirmDeleteId(null);
    } catch (err) {
        alert(`שגיאה במחיקה: ${err.message}`);
    }
  };

  const handleToggle = async (id, current) => {
    await updateDoc(doc(db, 'activities', id), { active: !current });
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', paddingBottom: '8rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.5rem' }}>ניהול פעילויות</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '1.1rem' }}>
            הוסיפו סרטונים ודפי עבודה שהילדים יראו בטאב "משחקים"
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="giant-button"
          style={{
            background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-green))',
            color: 'white', padding: '1rem 2rem', gap: '0.75rem', width: 'auto'
          }}
        >
          <Plus size={24} />
          הוסף פעילות
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card animate-pop" style={{ marginBottom: '2rem', padding: '2rem', border: '2px solid var(--primary-blue)' }}>
          <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>פעילות חדשה</h2>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Type picker */}
            <div>
                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', marginTop: 0 }}>סוג הפעילות:</p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {[
                    { value: 'video', icon: Video, label: 'סרטון YouTube' },
                    { value: 'image', icon: ImageIcon, label: 'תמונה' },
                    { value: 'pdf', icon: FileText, label: 'PDF' },
                    { value: 'link', icon: Link, label: 'קישור' },
                  ].map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, type: value }))}
                      style={{
                        flex: 1, minWidth: '120px', padding: '1rem', borderRadius: '16px', cursor: 'pointer',
                        border: form.type === value ? '3px solid var(--primary-blue)' : '2px solid var(--glass-border)',
                        background: form.type === value ? 'hsla(207,90%,61%,0.1)' : 'white',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                        fontWeight: 700, fontSize: '0.9rem', color: form.type === value ? 'var(--primary-blue)' : 'var(--text-muted)'
                      }}
                    >
                      <Icon size={24} />
                      {label}
                    </button>
                  ))}
                </div>
            </div>

            {/* Icon picker */}
            <div>
                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', marginTop: 0 }}>בחרו סמל חמוד:</p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {[
                        { id: 'Gamepad2', icon: Gamepad2, color: 'var(--primary-green)' },
                        { id: 'Music', icon: Music, color: 'var(--primary-purple)' },
                        { id: 'Palette', icon: Palette, color: 'var(--primary-red)' },
                        { id: 'BookOpen', icon: BookOpen, color: 'var(--primary-blue)' },
                        { id: 'Rocket', icon: Rocket, color: 'hsl(25, 100%, 58%)' }, // Orange
                        { id: 'Star', icon: Star, color: 'var(--primary-yellow)' },
                        { id: 'Heart', icon: Heart, color: 'var(--primary-red)' },
                        { id: 'Smile', icon: Smile, color: 'var(--primary-green)' },
                        { id: 'Sun', icon: Sun, color: 'var(--primary-yellow)' },
                    ].map(t => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, icon: t.id, color: t.color }))}
                            style={{
                                width: '60px', height: '60px', borderRadius: '50%',
                                border: form.icon === t.id ? `4px solid ${t.color}` : 'none',
                                background: form.icon === t.id ? 'white' : t.color,
                                color: form.icon === t.id ? t.color : 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', boxShadow: 'var(--shadow-soft)',
                                transition: 'transform 0.2s', transform: form.icon === t.id ? 'scale(1.1)' : 'scale(1)'
                            }}
                        >
                            <t.icon size={28} />
                        </button>
                    ))}
                </div>
            </div>

            <input
              type="text"
              placeholder="כותרת"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              style={{ padding: '1rem', borderRadius: '12px', border: '2px solid var(--glass-border)', fontSize: '1.1rem', outline: 'none', textAlign: 'right' }}
              required
            />

            {form.type === 'link' || form.type === 'video' ? (
                <input
                  type="url"
                  placeholder="קישור (https://...)"
                  value={form.url}
                  onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                  style={{ padding: '1rem', borderRadius: '12px', border: '2px solid var(--glass-border)', fontSize: '1.1rem', outline: 'none' }}
                  required
                />
            ) : form.type === 'image' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ padding: '1rem', borderRadius: '12px', border: '2px dashed var(--primary-blue)', fontSize: '1.1rem', outline: 'none', background: 'white' }}
                      required={!form.url}
                    />
                    {form.url && <img src={form.url} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '12px', objectFit: 'contain' }} />}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handlePdfUpload}
                      disabled={saving}
                      style={{ padding: '1rem', borderRadius: '12px', border: '2px dashed var(--primary-blue)', fontSize: '1.1rem', outline: 'none', background: 'white' }}
                      required={!form.url}
                    />
                    {form.url && <p style={{ color: 'var(--primary-green)', fontWeight: 'bold' }}>✓ ה-PDF מוכן לשמירה</p>}
                </div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                disabled={saving}
                className="giant-button"
                style={{ flex: 1, background: 'var(--primary-blue)', color: 'white' }}
              >
                {saving ? 'שומר...' : 'שמור פעילות'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{ flex: 1, padding: '1rem', borderRadius: '16px', border: '2px solid var(--glass-border)', background: 'white', cursor: 'pointer', fontWeight: 700 }}
              >
                ביטול
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Activities List */}
      {loading && <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>טוען פעילויות...</div>}
      {error && <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--primary-red)' }}>{error}</div>}

      {!loading && !error && activities.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
          <h2 style={{ color: 'var(--text-muted)' }}>אין פעילויות עדיין</h2>
          <p style={{ color: 'var(--text-muted)' }}>לחצו על "הוסף פעילות" כדי להתחיל</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {activities.map(activity => {
          const typeInfo = {
            video: { label: 'סרטון' },
            image: { label: 'תמונה' },
            pdf: { label: 'PDF' },
            link: { label: 'קישור' },
          }[activity.type] || { label: activity.type };
          
          const iconMap = { Gamepad2, Music, Palette, BookOpen, Rocket, Star, Heart, Smile, Sun, Video, ImageIcon, FileText, Link };
          const TypeIcon = iconMap[activity.icon] || iconMap[activity.type === 'image' ? 'ImageIcon' : activity.type === 'pdf' ? 'FileText' : activity.type === 'video' ? 'Video' : 'Link'] || Star;
          const displayColor = activity.color || 'var(--primary-blue)';

          return (
            <div key={activity.id} className="card" style={{
              display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem',
              borderLeft: `6px solid ${displayColor}`,
              opacity: activity.active ? 1 : 0.5, transition: 'opacity 0.3s'
            }}>
              <div style={{ background: displayColor, color: 'white', padding: '1rem', borderRadius: '16px', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                <TypeIcon size={32} />
              </div>

              <div style={{ flex: 1, textAlign: 'right', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>{activity.title}</h3>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem',
                    borderRadius: '99px', background: '#f0f0f0', color: 'var(--text-muted)'
                  }}>{typeInfo.label}</span>
                </div>
                {activity.type === 'image' ? (
                  <img src={activity.url} alt={activity.title} style={{ height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                ) : (
                  <a href={activity.url} target="_blank" rel="noreferrer"
                    style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {activity.url}
                  </a>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                <button
                  onClick={() => handleToggle(activity.id, activity.active)}
                  title={activity.active ? 'הסתר מהילדים' : 'הצג לילדים'}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px' }}
                >
                  {activity.active
                    ? <ToggleRight size={36} color="var(--primary-green)" />
                    : <ToggleLeft size={36} color="var(--text-muted)" />}
                </button>

                {confirmDeleteId === activity.id ? (
                    <div style={{ display: 'flex', gap: '0.5rem', background: 'white', padding: '0.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-soft)', border: '2px solid var(--primary-red)' }}>
                        <button onClick={() => handleDelete(activity.id)} style={{ color: 'white', background: 'var(--primary-red)', border: 'none', borderRadius: '8px', padding: '0.4rem 0.8rem', cursor: 'pointer', fontWeight: 'bold' }}>מחק סופית</button>
                        <button onClick={() => setConfirmDeleteId(null)} style={{ background: '#eee', border: 'none', borderRadius: '8px', padding: '0.4rem 0.8rem', cursor: 'pointer', color: 'var(--text-main)' }}>ביטול</button>
                    </div>
                ) : (
                    <button
                      onClick={() => setConfirmDeleteId(activity.id)}
                      title="מחק פעילות"
                      style={{ background: '#ffebee', border: 'none', cursor: 'pointer', padding: '0.75rem', borderRadius: '12px' }}
                    >
                      <Trash2 size={20} color="var(--primary-red)" />
                    </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
