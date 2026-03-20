import React, { useState, useEffect } from 'react';
import { Users, Video, Edit3, Settings, MessageSquare, CheckCircle, Save, Trash2, GraduationCap, Calendar, X, Smile, Palette, Mic, Image as ImageIcon, Cat, Dog, Bird, Fish, Circle, Square, Triangle, Star } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, collection, onSnapshot, addDoc, deleteDoc } from 'firebase/firestore';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import '../index.css';

const SHAPES = [
  { id: 'circle', icon: Circle, color: 'var(--primary-red)' },
  { id: 'square', icon: Square, color: 'var(--primary-blue)' },
  { id: 'triangle', icon: Triangle, color: 'var(--primary-green)' },
  { id: 'star', icon: Star, color: 'var(--primary-yellow)' }
];

const ICONS = { Cat, Dog, Bird, Fish };

export default function TeacherDashboard() {
  const [schoolName, setSchoolName] = useState('');
  const [teacherName, setTeacherName] = useState('המורה');
  const [isEditingNames, setIsEditingNames] = useState(false);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [posts, setPosts] = useState([]);
  const [activityClicks, setActivityClicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Registration States
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [regStep, setRegStep] = useState(1);
  const [regName, setRegName] = useState('');
  const [regIcon, setRegIcon] = useState('Cat');
  const [regColor, setRegColor] = useState('var(--primary-blue)');
  const [regSequence, setRegSequence] = useState([]);

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
        setAttendance(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
    }, (err) => console.error("Attendance listener failed:", err));

    // Listen to Posts
    const unsubPosts = onSnapshot(collection(db, 'posts'), (snap) => {
        setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error("Posts listener failed:", err));

    // Listen to Activity Clicks
    const unsubClicks = onSnapshot(collection(db, 'activityClicks'), (snap) => {
        setActivityClicks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error("Clicks listener failed:", err));

    return () => {
        unsubStudents();
        unsubAttendance();
        unsubPosts();
        unsubClicks();
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
        alert(`שגיאה במחיקה: ${err.message}`);
    }
  };

  const handleAddActivity = async (type) => {
    const title = type === 'video' ? 'שעת סיפור חדשה' : 'דף עבודה חדש';
    const message = type === 'video' 
       ? 'הזן קישור לסרטון או משחק:\n(טיפ: ניתן להדביק קישורי YouTube רגילים - המערכת תתאים אותם אוטומטית!)'
       : 'הזן קישור לקובץ PDF:';
    const url = prompt(message);
    if (!url) return;
    
    let requiresNewTab = false;
    if (type !== 'pdf') {
        requiresNewTab = window.confirm("האם לפתוח משחק זה בחלון חדש?\n(חובה עבור Wordwall וסרטוני יוטיוב חסומי-זכויות)\n\nלחצו 'אישור/OK' כדי לפתוח בחלון חדש, או 'ביטול/Cancel' כדי לשמור את הילד לכוד בתוך האפליקציה.");
    }

    try {
        await addDoc(collection(db, 'activities'), {
            title,
            type,
            url,
            active: true,
            requiresNewTab,
            createdAt: new Date()
        });
        alert('הפעילות נוספה בהצלחה!');
    } catch (err) {
        alert('הוספה נכשלה.');
    }
  };

  const handleRegisterStudent = async () => {
    if (!regName || regSequence.length < 2) return;
    
    const newStudent = {
      name: regName,
      icon: regIcon,
      color: regColor,
      secret_sequence: regSequence,
      createdAt: new Date()
    };

    try {
      await addDoc(collection(db, 'students'), newStudent);
      alert("תלמיד נוסף בהצלחה!");
      setIsAddingStudent(false);
      setRegStep(1);
      setRegName('');
      setRegIcon('Cat');
      setRegColor('var(--primary-blue)');
      setRegSequence([]);
    } catch (err) {
      console.error("Registration failed:", err);
      alert("אופס! משהו השתבש בהוספה.");
    }
  };

  // Process Stats correctly filtered by `selectedMonth`
  const isCorrectMonth = (timestamp) => {
    if (!timestamp) return false;
    const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return d.getMonth() === selectedMonth;
  };

  const monthAttendance = attendance.filter(a => isCorrectMonth(a.timestamp));
  const monthPosts = posts.filter(p => isCorrectMonth(p.createdAt));
  const monthActivityClicks = activityClicks.filter(c => isCorrectMonth(c.timestamp));
  const todayStr = new Date().toLocaleDateString();

  const studentStats = students.map(s => {
      // Find logins precisely for today
      const todayLoginsList = attendance.filter(a => {
          if (!a.timestamp) return false;
          const dateObj = a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
          return a.studentId === s.id && dateObj.toLocaleDateString() === todayStr;
      });
      
      const studentMonthLogins = monthAttendance.filter(a => a.studentId === s.id);
      const studentMonthPosts = monthPosts.filter(p => p.author === s.name); // Using name to match ShowAndTell format
      const studentMonthClicks = monthActivityClicks.filter(c => c.studentId === s.id);
      
      const uniqueLoginDays = new Set(
          studentMonthLogins.map(a => {
              const d = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
              return d.toLocaleDateString();
          })
      ).size;
      
      return { 
          ...s, 
          todayLogins: todayLoginsList.length > 0,
          monthLogins: uniqueLoginDays,
          monthPosts: studentMonthPosts.length,
          clickedActivities: studentMonthClicks,
          postTypes: {
              emoji: studentMonthPosts.filter(p => p.type === 'emoji').length,
              draw: studentMonthPosts.filter(p => p.type === 'draw').length,
              audio: studentMonthPosts.filter(p => p.type === 'audio').length,
              picture: studentMonthPosts.filter(p => p.type === 'picture').length,
          }
      };
  });

  const getDailyData = () => {
    // Array of days 1 to 31
    const data = Array.from({ length: 31 }, (_, i) => ({ name: `${i+1}`, logins: 0, posts: 0 }));
    
    monthAttendance.forEach(a => {
        const d = a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
        data[d.getDate() - 1].logins += 1;
    });
    
    monthPosts.forEach(p => {
        const d = p.createdAt.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
        data[d.getDate() - 1].posts += 1;
    });
    
    return data;
  };

  const getUniqueActivities = (clicks) => {
     if (!clicks) return [];
     const counts = {};
     clicks.forEach(c => {
         // handle missing title fallback gracefully
         const title = c.activityTitle || 'פעילות לא ידועה';
         counts[title] = (counts[title] || 0) + 1;
     });
     return Object.entries(counts).map(([title, count]) => ({ title, count })).sort((a,b) => b.count - a.count);
  };

  const dailyData = getDailyData();

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
            { label: 'כניסות היום', value: `${studentStats.filter(s => s.todayLogins).length}`, icon: CheckCircle, color: 'var(--primary-green)', bg: 'hsla(122, 39%, 57%, 0.1)' },
            { label: 'כניסות החודש', value: `${monthAttendance.length}`, icon: Calendar, color: 'var(--primary-purple)', bg: 'hsla(262, 70%, 68%, 0.1)' },
            { label: 'שיתופים החודש', value: `${monthPosts.length}`, icon: MessageSquare, color: 'var(--primary-yellow)', bg: 'hsla(45, 100%, 50%, 0.1)' }
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
                    border: !student.todayLogins ? '2px solid var(--primary-red)' : '1px solid var(--glass-border)',
                    boxShadow: 'var(--shadow-soft)',
                    opacity: !student.todayLogins ? 0.8 : 1,
                    cursor: 'pointer'
                }}
                onClick={() => { setSelectedStudent(student); setActiveTab('overview'); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: !student.todayLogins ? 'var(--primary-red)' : student.color || 'var(--primary-blue)', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                            {student.todayLogins ? '✓' : '!'}
                        </div>
                        <div>
                            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: !student.todayLogins ? 'var(--primary-red)' : 'inherit' }}>{student.name}</span>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                לחץ לצפייה בסטטיסטיקות אישיות
                            </div>
                        </div>
                    </div>
                    {confirmDeleteId === student.id ? (
                        <div style={{ display: 'flex', gap: '0.5rem', background: '#ffebee', padding: '0.5rem', borderRadius: '12px' }} onClick={e => e.stopPropagation()}>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteStudent(student.id); }} style={{ color: 'white', background: 'var(--primary-red)', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 'bold' }}>אישור מחיקה</button>
                            <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }} style={{ background: '#eee', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', color: 'var(--text-main)' }}>ביטול</button>
                        </div>
                    ) : (
                        <button 
                            onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(student.id); }}
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

        {/* Monthly Chart */}
        <div className="card" style={{ padding: '2.5rem' }}>
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                  <h2 style={{ fontSize: '1.8rem', margin: 0 }}>מגמות פעילות</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>כניסות ושיתופים לאורך החודש</p>
              </div>
              <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  style={{ padding: '0.5rem 1rem', borderRadius: '12px', border: '2px solid var(--glass-border)', fontSize: '1.1rem', outline: 'none', background: 'white', fontWeight: 'bold', cursor: 'pointer' }}
              >
                  {['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'].map((m, i) => (
                      <option key={i} value={i}>{m}</option>
                  ))}
              </select>
          </div>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
              <BarChart data={dailyData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontWeight: 600}} />
                <Tooltip 
                    cursor={{ fill: 'hsla(210, 20%, 95%, 1)' }} 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: 'var(--shadow-soft)' }}
                />
                <Bar dataKey="logins" name="כניסות לאפליקציה" fill="var(--primary-blue)" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="posts" name="שיתופי תוכן (פוסטים)" fill="var(--primary-yellow)" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
      
      {/* Management Actions */}
      <h2 style={{ marginTop: '4rem', marginBottom: '1.5rem' }}>פעולות מהירות (קיצורי דרך לניהול תוכן)</h2>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <button 
            onClick={() => handleAddActivity('video')}
            style={{ padding: '1.5rem 2.5rem', borderRadius: '24px', border: 'none', background: 'var(--primary-blue)', color: 'white', fontWeight: 700, fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: 'var(--shadow-soft)' }}
        >
          <Video size={24} /> פרסום מהיר של שיעור
        </button>
        <button 
            onClick={() => handleAddActivity('pdf')}
            style={{ padding: '1.5rem 2.5rem', borderRadius: '24px', border: 'none', background: 'var(--primary-purple)', color: 'white', fontWeight: 700, fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: 'var(--shadow-soft)' }}
        >
          <Edit3 size={24} /> יצירת דף עבודה
        </button>
        <button 
            onClick={() => setIsAddingStudent(true)}
            style={{ padding: '1.5rem 2.5rem', borderRadius: '24px', border: 'none', background: 'var(--primary-green)', color: 'white', fontWeight: 700, fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: 'var(--shadow-soft)' }}
        >
          <Users size={24} /> רישום חבר חדש
        </button>
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
          <div 
             onClick={() => setSelectedStudent(null)}
             style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          >
              <div 
                 onClick={(e) => e.stopPropagation()}
                 className="card animate-pop" 
                 style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative', background: 'white' }}
              >
                  <button onClick={() => setSelectedStudent(null)} style={{ position: 'absolute', top: '1rem', left: '1rem', background: '#ffebee', padding: '0.4rem', borderRadius: '50%', border: 'none', cursor: 'pointer', zIndex: 10 }}>
                      <X size={32} color="var(--primary-red)" />
                  </button>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: selectedStudent.color || 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '3rem', fontWeight: 'bold', flexShrink: 0 }}>
                          {selectedStudent.name.charAt(0)}
                      </div>
                      <div>
                          <h2 style={{ fontSize: '2.2rem', margin: 0 }}>{selectedStudent.name}</h2>
                          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0 }}>סטטיסטיקות עבור החודש הנבחר</p>
                      </div>
                  </div>

                  {/* Tabs */}
                  <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-color)', padding: '0.5rem', borderRadius: '16px', marginBottom: '2rem' }}>
                      <button onClick={() => setActiveTab('overview')} style={{ flex: 1, padding: '0.75rem', border: 'none', borderRadius: '12px', background: activeTab === 'overview' ? 'white' : 'transparent', color: activeTab === 'overview' ? 'var(--primary-blue)' : 'var(--text-muted)', fontWeight: 700, boxShadow: activeTab === 'overview' ? 'var(--shadow-soft)' : 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '1.1rem' }}>סקירה</button>
                      <button onClick={() => setActiveTab('posts')} style={{ flex: 1, padding: '0.75rem', border: 'none', borderRadius: '12px', background: activeTab === 'posts' ? 'white' : 'transparent', color: activeTab === 'posts' ? 'var(--primary-blue)' : 'var(--text-muted)', fontWeight: 700, boxShadow: activeTab === 'posts' ? 'var(--shadow-soft)' : 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '1.1rem' }}>שיתופים</button>
                      <button onClick={() => setActiveTab('activities')} style={{ flex: 1, padding: '0.75rem', border: 'none', borderRadius: '12px', background: activeTab === 'activities' ? 'white' : 'transparent', color: activeTab === 'activities' ? 'var(--primary-blue)' : 'var(--text-muted)', fontWeight: 700, boxShadow: activeTab === 'activities' ? 'var(--shadow-soft)' : 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '1.1rem' }}>פעילויות</button>
                  </div>

                  {activeTab === 'overview' && (
                      <div className="grid-container animate-pop" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                          <div style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '16px', textAlign: 'center' }}>
                              <h3 style={{ fontSize: '3rem', color: 'var(--primary-blue)', margin: 0 }}>{selectedStudent.monthLogins}</h3>
                              <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '1.1rem' }}>כניסות לאפליקציה</span>
                          </div>
                          <div style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '16px', textAlign: 'center' }}>
                              <h3 style={{ fontSize: '3rem', color: 'var(--primary-red)', margin: 0 }}>{selectedStudent.monthPosts}</h3>
                              <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '1.1rem' }}>שיתופים בפיד</span>
                          </div>
                      </div>
                  )}

                  {activeTab === 'posts' && (
                      <div className="animate-pop">
                          <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', borderBottom: '2px solid #eee', paddingBottom: '0.5rem' }}>סוגי התוכן ש{selectedStudent.name} שיתפ/ה</h3>
                          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1rem', background: '#fafafa', padding: '1.5rem', borderRadius: '16px' }}>
                              <div style={{ textAlign: 'center' }}>
                                  <Smile size={32} color="var(--primary-green)" style={{ marginBottom: '0.5rem' }} />
                                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{selectedStudent.postTypes.emoji}</div>
                                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>אימוג'ים</div>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                  <Palette size={32} color="var(--primary-red)" style={{ marginBottom: '0.5rem' }} />
                                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{selectedStudent.postTypes.draw}</div>
                                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>ציורים</div>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                  <Mic size={32} color="var(--primary-blue)" style={{ marginBottom: '0.5rem' }} />
                                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{selectedStudent.postTypes.audio}</div>
                                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>הקלטות</div>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                  <ImageIcon size={32} color="var(--primary-yellow)" style={{ marginBottom: '0.5rem' }} />
                                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{selectedStudent.postTypes.picture}</div>
                                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>תמונות</div>
                              </div>
                          </div>
                      </div>
                  )}

                  {activeTab === 'activities' && (
                      <div className="animate-pop">
                          <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', borderBottom: '2px solid #eee', paddingBottom: '0.5rem' }}>משחקים ופעילויות מועדפים (החודש)</h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', background: '#fafafa', padding: '1.5rem', borderRadius: '16px' }}>
                              {selectedStudent.clickedActivities && getUniqueActivities(selectedStudent.clickedActivities).length > 0 ? (
                                  getUniqueActivities(selectedStudent.clickedActivities).map((act, i) => (
                                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #eee' }}>
                                         <span style={{ fontWeight: 600 }}>{act.title}</span>
                                         <span style={{ background: 'var(--primary-blue)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700 }}>נכנס/ה {act.count} פעמים</span>
                                      </div>
                                  ))
                              ) : (
                                  <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>לא נרשמו הקלקות על פעילויות החודש.</div>
                              )}
                          </div>
                      </div>
                  )}

              </div>
          </div>
      )}

      {/* Add New Student Modal */}
      {isAddingStudent && (
          <div 
             style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          >
              <div 
                 className="card animate-pop" 
                 style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative', background: 'white', textAlign: 'center' }}
              >
                  <button onClick={() => { setIsAddingStudent(false); setRegStep(1); setRegSequence([]); }} style={{ position: 'absolute', top: '1rem', left: '1rem', background: '#ffebee', padding: '0.4rem', borderRadius: '50%', border: 'none', cursor: 'pointer', zIndex: 10 }}>
                      <X size={32} color="var(--primary-red)" />
                  </button>

                  {regStep === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center', paddingTop: '1rem' }}>
                      <h2 style={{ fontSize: '2rem', color: 'var(--primary-blue)', margin: 0 }}>רישום תלמיד חדש</h2>
                      <input 
                        type="text" 
                        placeholder="איך קוראים לילד/ה?" 
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        style={{ padding: '1.5rem', borderRadius: '24px', border: '4px solid var(--primary-blue)', fontSize: '1.5rem', textAlign: 'center', width: '100%', outline: 'none' }}
                      />
                      
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        {Object.keys(ICONS).map(iconName => (
                          <button 
                            key={iconName}
                            onClick={() => setRegIcon(iconName)}
                            style={{ padding: '1rem', borderRadius: '16px', border: regIcon === iconName ? '4px solid var(--primary-yellow)' : 'none', background: 'white', cursor: 'pointer' }}
                          >
                            {React.createElement(ICONS[iconName], { size: 48, color: 'var(--primary-blue)' })}
                          </button>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: '1rem' }}>
                        {['var(--primary-blue)', 'var(--primary-red)', 'var(--primary-green)', 'var(--primary-yellow)'].map(color => (
                          <button 
                            key={color}
                            onClick={() => setRegColor(color)}
                            style={{ width: '50px', height: '50px', borderRadius: '50%', background: color, border: regColor === color ? '4px solid #333' : 'none', cursor: 'pointer', boxShadow: 'var(--shadow-soft)' }}
                          />
                        ))}
                      </div>

                      <button 
                        className="giant-button" 
                        style={{ background: 'var(--primary-blue)', color: 'white', width: '100%', marginTop: '1rem' }}
                        onClick={() => setRegStep(2)}
                        disabled={!regName}
                      >
                        המשך להגדרת סיסמה ←
                      </button>
                    </div>
                  )}

                  {regStep === 2 && (
                    <div style={{ paddingTop: '1rem' }}>
                      <h2 style={{ fontSize: '2rem', color: 'var(--primary-blue)', margin: 0 }}>קביעת סיסמה מבוססת צורות</h2>
                      <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>בחרו שתי צורות כשילוב הסודי</p>
                      
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
                        {[0, 1].map((i) => (
                          <div 
                            key={i}
                            onClick={() => i < regSequence.length && setRegSequence(regSequence.slice(0, i))}
                            style={{ 
                              width: '90px', 
                              height: '90px', 
                              borderRadius: '24px', 
                              background: 'white', 
                              border: regSequence[i] ? '4px solid var(--primary-green)' : '4px dashed hsl(122, 39%, 80%)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              cursor: regSequence[i] ? 'pointer' : 'default'
                            }}
                          >
                            {regSequence[i] && (
                              (() => {
                                const ShapeIcon = SHAPES.find(s => s.id === regSequence[i]).icon;
                                const shapeColor = SHAPES.find(s => s.id === regSequence[i]).color;
                                return <ShapeIcon size={48} color={shapeColor} />;
                              })()
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="grid-container" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', maxWidth: '400px', margin: '0 auto' }}>
                        {SHAPES.map((shape) => (
                          <button
                            key={shape.id}
                            className="giant-button"
                            style={{ width: '100%', height: '140px', borderRadius: '32px' }}
                            onClick={() => regSequence.length < 2 && setRegSequence([...regSequence, shape.id])}
                            disabled={regSequence.length >= 2}
                          >
                            <shape.icon size={64} color={shape.color} />
                          </button>
                        ))}
                      </div>

                      {regSequence.length === 2 && (
                         <button 
                            className="giant-button" 
                            style={{ background: 'var(--primary-green)', color: 'white', width: '100%', marginTop: '3rem' }}
                            onClick={handleRegisterStudent}
                          >
                            שמירת תלמיד 🎉
                          </button>
                      )}
                      
                      <button 
                        style={{ marginTop: '2rem', padding: '1rem 2rem', fontSize: '1.2rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 'bold' }}
                        onClick={() => { setRegStep(1); setRegSequence([]); }}
                      >
                        ← תכנון מחדש
                      </button>
                    </div>
                  )}
              </div>
          </div>
      )}

    </div>
  );
}
