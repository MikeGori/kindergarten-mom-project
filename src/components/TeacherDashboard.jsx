import React, { useState, useEffect } from 'react';
import { Users, Video, Edit3, Settings, MessageSquare, CheckCircle, Save, Trash2, GraduationCap } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, collection, onSnapshot, addDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import '../index.css';

export default function TeacherDashboard() {
  const [schoolName, setSchoolName] = useState('');
  const [teacherName, setTeacherName] = useState('המורה');
  const [isEditingNames, setIsEditingNames] = useState(false);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmClearStats, setConfirmClearStats] = useState(false);

  useEffect(() => {
    // Fetch Settings
    getDoc(doc(db, 'settings', 'school')).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        setSchoolName(data.name || 'גן הילדים שלנו');
        setTeacherName(data.teacherName || 'המורה');
      }
    }).catch(err => console.error("Settings fetch failed:", err));

    // Listen to Students
    const unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
        setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => {
        console.error("Students listener failed:", err);
        setError("שגיאה בחיבור למאגר הנתונים");
        setLoading(false);
    });

    // Listen to Attendance
    const unsubAttendance = onSnapshot(collection(db, 'attendance'), (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setAttendance(data);
        setLoading(false);
    }, (err) => {
        console.error("Attendance listener failed:", err);
        setLoading(false);
    });

    return () => {
        unsubStudents();
        unsubAttendance();
    };
  }, []);

  const handleSaveNames = async () => {
    try {
        await updateDoc(doc(db, 'settings', 'school'), { 
            name: schoolName,
            teacherName: teacherName
        });
        setIsEditingNames(false);
    } catch (err) {
        alert('שמירה נכשלה.');
    }
  };

  const handleDeleteStudent = async (id) => {
    try {
        await deleteDoc(doc(db, 'students', id));
        setConfirmDeleteId(null);
    } catch (err) {
        console.error("Delete failed", err);
        alert(`שגיאה במחיקה: ${err.message}`);
    }
  };

  const handleClearStats = async () => {
    try {
        const batch = writeBatch(db);
        attendance.forEach(a => {
            const ref = doc(db, 'attendance', a.id);
            batch.delete(ref);
        });
        await batch.commit();
        setConfirmClearStats(false);
        alert('הנתונים אופסו בהצלחה!');
    } catch (err) {
        console.error("Clear failed", err);
        alert(`שגיאה באיפוס: ${err.message}`);
    }
  };

  const handleAddActivity = async (type) => {
    const title = type === 'video' ? 'שעת סיפור חדשה' : 'דף עבודה חדש';
    const url = prompt(`הזן קישור ל-${type === 'video' ? 'סרטון' : 'קובץ PDF'}:`);
    if (!url) return;
    
    try {
        await addDoc(collection(db, 'activities'), {
            title,
            type,
            url,
            active: true,
            createdAt: new Date()
        });
        alert('הפעילות נוספה בהצלחה!');
    } catch (err) {
        alert('הוספה נכשלה.');
    }
  };

  // Process Stats correctly
  const todayStr = new Date().toLocaleDateString();
  const studentStats = students.map(s => {
      const todayLogins = attendance.filter(a => {
          if (!a.timestamp) return false;
          // Handle both Firestore Timestamp and regular Date objects just in case
          const dateObj = a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
          return a.studentId === s.id && dateObj.toLocaleDateString() === todayStr;
      }).length;
      return { ...s, todayLogins };
  });

  const getWeeklyData = () => {
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const data = days.map(day => ({ name: day, logins: 0 }));
    
    attendance.forEach(a => {
        if (!a.timestamp) return;
        const dateObj = a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
        const dayIdx = dateObj.getDay();
        if (dayIdx >= 0 && dayIdx <= 6) {
           data[dayIdx].logins += 1;
        }
    });
    return data;
  };

  const weeklyData = getWeeklyData();

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>טוען נתונים...</div>;
  if (error) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--primary-red)' }}>{error} - אנא בדקו את החיבור לאינטרנט</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', paddingBottom: '8rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div style={{ flex: 1 }}>
          {isEditingNames ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>שם הגן:</span>
                    <input 
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        style={{ fontSize: '1.2rem', padding: '0.5rem 1rem', borderRadius: '12px', border: '2px solid var(--primary-blue)', width: '250px' }}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>שם המורה:</span>
                    <input 
                        value={teacherName}
                        onChange={(e) => setTeacherName(e.target.value)}
                        style={{ fontSize: '1.2rem', padding: '0.5rem 1rem', borderRadius: '12px', border: '2px solid var(--primary-blue)', width: '250px' }}
                    />
                </div>
                <button onClick={handleSaveNames} className="giant-button" style={{ width: '60px', height: '60px', background: 'var(--primary-green)', marginTop: '1.4rem' }}>
                    <Save size={28} color="white" />
                </button>
            </div>
          ) : (
            <div onClick={() => setIsEditingNames(true)} style={{ cursor: 'pointer' }}>
                <h1 style={{ marginBottom: '0.5rem', fontSize: '2.8rem' }}>
                    {schoolName}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 600 }}>
                    ברוכה השבה, <span style={{ color: 'var(--primary-blue)' }}>{teacherName}</span>! הכיתה שלך בשיא המרץ.
                </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {[
            { label: 'ילדים רשומים', value: `${students.length}`, icon: Users, color: 'var(--primary-blue)', bg: 'hsla(207, 90%, 61%, 0.1)' },
            { label: 'כניסות היום', value: `${studentStats.filter(s => s.todayLogins > 0).length}`, icon: CheckCircle, color: 'var(--primary-green)', bg: 'hsla(122, 39%, 57%, 0.1)' },
            { label: 'סה"כ כניסות השבוע', value: `${attendance.length}`, icon: MessageSquare, color: 'var(--primary-red)', bg: 'hsla(1, 83%, 63%, 0.1)' }
        ].map((stat, i) => (
            <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
                <div style={{ background: stat.bg, padding: '1.25rem', borderRadius: '24px' }}>
                    <stat.icon size={36} color={stat.color} />
                </div>
                <div>
                    <h3 data-testid={i === 0 ? "stat-value-child-count" : undefined} style={{ fontSize: '1.8rem', marginBottom: '0.2rem', fontWeight: 700 }}>{stat.value}</h3>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{stat.label}</span>
                </div>
            </div>
        ))}
      </div>

      <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
        
        {/* Student List & Management */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <GraduationCap size={32} color="var(--primary-blue)" />
            נוכחות וניהול
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {studentStats.map(student => (
                <div key={student.id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '1rem', 
                    background: 'white', 
                    borderRadius: '16px',
                    border: student.todayLogins === 0 ? '2px solid var(--primary-red)' : '1px solid var(--glass-border)',
                    boxShadow: 'var(--shadow-soft)',
                    opacity: student.todayLogins === 0 ? 0.8 : 1
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: student.todayLogins === 0 ? 'var(--primary-red)' : student.color || 'var(--primary-blue)', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                            {student.todayLogins > 0 ? '✓' : '!'}
                        </div>
                        <div>
                            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: student.todayLogins === 0 ? 'var(--primary-red)' : 'inherit' }}>{student.name}</span>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {student.todayLogins > 0 ? `נכנס/ה ${student.todayLogins} פעמים היום` : 'לא נכנס/ה היום'}
                            </div>
                        </div>
                    </div>
                    {confirmDeleteId === student.id ? (
                        <div style={{ display: 'flex', gap: '0.5rem', background: '#ffebee', padding: '0.5rem', borderRadius: '12px' }}>
                            <button onClick={() => handleDeleteStudent(student.id)} style={{ color: 'white', background: 'var(--primary-red)', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 'bold' }}>אישור מחיקה</button>
                            <button onClick={() => setConfirmDeleteId(null)} style={{ background: '#eee', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer' }}>ביטול</button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setConfirmDeleteId(student.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}
                            aria-label={`מחק את ${student.name}`}
                        >
                            <Trash2 size={24} />
                        </button>
                    )}
                </div>
            ))}
            {students.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>אין תלמידים רשומים עדיין.</p>}
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="card" style={{ padding: '2.5rem' }}>
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                  <h2 style={{ fontSize: '1.8rem', margin: 0 }}>מגמות פעילות</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>כניסות שבועיות (סה"כ: {attendance.length})</p>
              </div>
              {confirmClearStats ? (
                  <div style={{ display: 'flex', gap: '0.5rem', background: '#ffebee', padding: '0.5rem', borderRadius: '12px' }}>
                      <button onClick={handleClearStats} style={{ background: 'var(--primary-red)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>אישור מחיקה</button>
                      <button onClick={() => setConfirmClearStats(false)} style={{ background: '#eee', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-main)' }}>ביטול</button>
                  </div>
              ) : (
                  <button 
                      onClick={() => setConfirmClearStats(true)}
                      style={{ background: '#ffebee', color: 'var(--primary-red)', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}
                  >
                      אפס נתונים
                  </button>
              )}
          </div>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
              <BarChart data={weeklyData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontWeight: 600}} />
                <Tooltip 
                    cursor={{ fill: 'hsla(210, 20%, 95%, 1)' }} 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: 'var(--shadow-soft)' }}
                />
                <Bar dataKey="logins" fill="var(--primary-blue)" radius={[8, 8, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
      
      {/* Management Actions */}
      <h2 style={{ marginTop: '4rem', marginBottom: '1.5rem' }}>פעולות מהירות</h2>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <button 
            onClick={() => handleAddActivity('video')}
            style={{ padding: '1.5rem 2.5rem', borderRadius: '24px', border: 'none', background: 'var(--primary-blue)', color: 'white', fontWeight: 700, fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: 'var(--shadow-soft)' }}
        >
          <Video size={24} /> פרסום שיעור שבועי
        </button>
        <button 
            onClick={() => handleAddActivity('pdf')}
            style={{ padding: '1.5rem 2.5rem', borderRadius: '24px', border: 'none', background: 'var(--primary-purple)', color: 'white', fontWeight: 700, fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: 'var(--shadow-soft)' }}
        >
          <Edit3 size={24} /> דף עבודה חדש
        </button>
      </div>

    </div>
  );
}
