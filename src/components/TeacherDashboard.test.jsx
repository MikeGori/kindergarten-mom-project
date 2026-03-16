import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TeacherDashboard from './TeacherDashboard';
import { onSnapshot, getDoc, collection } from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn(),
  collection: vi.fn(),
  getDoc: vi.fn(),
  onSnapshot: vi.fn(),
  updateDoc: vi.fn(),
  addDoc: vi.fn(),
  deleteDoc: vi.fn()
}));

vi.mock('../lib/firebase', () => ({
  db: {}
}));

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div style={{width: '100%', height: '100%'}}>{children}</div>,
  BarChart: ({ data }) => <div data-testid="bar-chart">{JSON.stringify(data)}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  PieChart: () => <div />,
  Pie: () => null,
  Cell: () => null
}));

describe('TeacherDashboard Component Resilience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    onSnapshot.mockReturnValue(vi.fn()); 
    render(<TeacherDashboard />);
    expect(screen.getByText(/טוען נתונים/i)).toBeInTheDocument();
  });

  it('shows error message when Firebase listener fails', async () => {
    onSnapshot.mockImplementation((col, success, error) => {
      // Trigger error for the first listener (students)
      if (error) {
        Promise.resolve().then(() => error(new Error('Network Error')));
      }
      return vi.fn();
    });
    getDoc.mockResolvedValue({ exists: () => false });

    render(<TeacherDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/שגיאה בחיבור למאגר הנתונים/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('renders dashboard correctly when data is loaded', async () => {
    onSnapshot.mockImplementation((col, success) => {
      // col is the result of collection(db, 'name')
      // Let's assume the first call is students, second is attendance
      const isStudents = col?.name === 'students' || !col; // Fallback for simple mocks
      
      Promise.resolve().then(() => {
        if (isStudents) {
          success({
            docs: [
              { id: '1', data: () => ({ name: 'Child 1' }) },
              { id: '2', data: () => ({ name: 'Child 2' }) }
            ]
          });
        } else {
          success({
            docs: [
              { id: 'a1', data: () => ({ studentId: '1', timestamp: new Date().toISOString() }) }
            ]
          });
        }
      });
      return vi.fn();
    });
    
    collection.mockImplementation((db, name) => ({ name }));

    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ name: 'גן תמר', teacherName: 'המורה שרה' })
    });

    render(<TeacherDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/גן תמר/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText(/המורה שרה/i)).toBeInTheDocument();
    expect(screen.getByTestId('stat-value-child-count')).toHaveTextContent('2'); // 2 students in mock
  });
});
