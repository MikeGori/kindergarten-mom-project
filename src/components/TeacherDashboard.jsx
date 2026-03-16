import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Video, Edit3, Settings, MessageSquare, CheckCircle } from 'lucide-react';
import '../index.css';

const ATTENDANCE_DATA = [
  { name: 'שני', logins: 18 },
  { name: 'שלישי', logins: 20 },
  { name: 'רביעי', logins: 19 },
  { name: 'חמישי', logins: 22 },
  { name: 'שישי', logins: 17 }
];

const ENGAGEMENT_DATA = [
  { name: 'צפייה בסרטונים', value: 45 },
  { name: 'דפי עבודה', value: 30 },
  { name: 'פוסטים בפיד', value: 25 }
];

const PIE_COLORS = ['var(--primary-blue)', 'var(--primary-green)', 'var(--primary-yellow)'];

export default function TeacherDashboard() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', paddingBottom: '6rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem', fontSize: '2.8rem' }}>תובנות כיתה</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 600 }}>ברוכה השבה, המורה שרה. הכיתה שלך ב-90% פעילות היום!</p>
        </div>
        <button className="giant-button" style={{ width: '70px', height: '70px', borderRadius: '50%' }}>
          <Settings size={32} color="var(--text-muted)" />
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {[
            { label: 'ילדים מחוברים', value: '20 / 22', icon: Users, color: 'var(--primary-blue)', bg: 'hsla(207, 90%, 61%, 0.1)' },
            { label: 'פוסטים חדשים', value: '12', icon: MessageSquare, color: 'var(--primary-green)', bg: 'hsla(122, 39%, 57%, 0.1)' },
            { label: 'ממתין לבדיקה', value: '5', icon: CheckCircle, color: 'var(--primary-red)', bg: 'hsla(1, 83%, 63%, 0.1)' }
        ].map((stat, i) => (
            <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
                <div style={{ background: stat.bg, padding: '1.25rem', borderRadius: '24px' }}>
                    <stat.icon size={36} color={stat.color} />
                </div>
                <div>
                    <h3 style={{ fontSize: '1.8rem', marginBottom: '0.2rem', fontWeight: 700 }}>{stat.value}</h3>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{stat.label}</span>
                </div>
            </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))' }}>
        
        {/* Attendance Bar Chart */}
        <div className="card" style={{ padding: '2.5rem' }}>
          <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.8rem', margin: 0 }}>מגמות נוכחות</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>כניסות יומיות השבוע (יעד: 20+)</p>
          </div>
          <div style={{ width: '100%', height: '350px' }}>
            <ResponsiveContainer>
              <BarChart data={ATTENDANCE_DATA}>
                <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary-blue)" stopOpacity={1}/>
                        <stop offset="100%" stopColor="var(--primary-blue)" stopOpacity={0.6}/>
                    </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontWeight: 600}} />
                <Tooltip 
                    cursor={{ fill: 'hsla(210, 20%, 95%, 1)' }} 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: 'var(--shadow-soft)' }}
                />
                <Bar dataKey="logins" fill="url(#barGradient)" radius={[12, 12, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement Pie Chart */}
        <div className="card" style={{ padding: '2.5rem' }}>
          <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.8rem', margin: 0 }}>השתתפות בפעילויות</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>איפה הילדים מבלים את זמנם</p>
          </div>
          <div style={{ width: '100%', height: '350px' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={ENGAGEMENT_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {ENGAGEMENT_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: 'var(--shadow-soft)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            {ENGAGEMENT_DATA.map((entry, index) => (
              <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: PIE_COLORS[index % PIE_COLORS.length], boxShadow: `0 0 10px ${PIE_COLORS[index % PIE_COLORS.length]}55` }}></div>
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
      
      {/* Management Actions */}
      <h2 style={{ marginTop: '4rem', marginBottom: '1.5rem' }}>פעולות מהירות</h2>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <button style={{ padding: '1.5rem 2.5rem', borderRadius: '24px', border: 'none', background: 'var(--primary-blue)', color: 'white', fontWeight: 700, fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: 'var(--shadow-soft)' }}>
          <Video size={24} /> פרסום שיעור שבועי
        </button>
        <button style={{ padding: '1.5rem 2.5rem', borderRadius: '24px', border: 'none', background: 'var(--primary-purple)', color: 'white', fontWeight: 700, fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: 'var(--shadow-soft)' }}>
          <Edit3 size={24} /> דף עבודה חדש
        </button>
      </div>

    </div>
  );
}
