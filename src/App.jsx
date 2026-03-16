import React, { useState } from 'react';
import Navbar from './components/Navbar';
import VisualLogin from './components/VisualLogin';
import TeacherDashboard from './components/TeacherDashboard';
import ShowAndTell from './components/ShowAndTell';
import ActivityHub from './components/ActivityHub';

export default function App() {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'dashboard', 'feed', 'learning'

  return (
    <div style={{ paddingBottom: '8rem' }}>
      <Navbar currentView={currentView} setView={setCurrentView} />

      {/* Main Content Area */}
      <main>
        <div className="animate-pop">
          {currentView === 'login' && <VisualLogin />}
          {currentView === 'dashboard' && <TeacherDashboard />}
          {currentView === 'feed' && <ShowAndTell userRole="student" userName="מיה" />}
          {currentView === 'learning' && <ActivityHub />}
        </div>
      </main>
    </div>
  );
}
