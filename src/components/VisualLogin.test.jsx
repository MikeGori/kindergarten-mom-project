import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VisualLogin from './VisualLogin';
import { onSnapshot, addDoc } from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  onSnapshot: vi.fn((col, callback) => {
    // Simulate initial data
    callback({
      docs: [
        { id: '1', data: () => ({ name: 'ליאו', icon: 'Cat', color: 'var(--primary-yellow)' }) }
      ]
    });
    return vi.fn(); // Unsubscribe mock
  }),
  addDoc: vi.fn()
}));

vi.mock('../lib/firebase', () => ({
  db: {}
}));

describe('VisualLogin Component (Firebase Version)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially then shows "מי משחק היום?"', async () => {
    render(<VisualLogin />);
    // Loading state is very brief because mock onSnapshot calls callback immediately
    await waitFor(() => {
        expect(screen.getByText(/מי משחק היום\?/i)).toBeDefined();
    });
  });

  it('selects a child and moves to the secret password step', async () => {
    render(<VisualLogin />);
    
    await waitFor(() => screen.getByLabelText(/בחר את ליאו/i));
    const leoButton = screen.getByLabelText(/בחר את ליאו/i);
    fireEvent.click(leoButton);

    expect(screen.getByText(/הסיסמה הסודית/i)).toBeDefined();
    expect(screen.getByText(/התור של ליאו/i)).toBeDefined();
  });

  it('navigates to registration step and calls addDoc on completion', async () => {
    render(<VisualLogin />);
    
    await waitFor(() => screen.getByLabelText(/תלמיד חדש\? הצטרף אלינו/i));
    fireEvent.click(screen.getByLabelText(/תלמיד חדש\? הצטרף אלינו/i));

    expect(screen.getByText(/ברוכים הבאים!/i)).toBeDefined();
    
    const input = screen.getByPlaceholderText(/איך קוראים לך\?/i);
    fireEvent.change(input, { target: { value: 'חדש' } });
    
    const nextBtn = screen.getByText(/המשך לצייר סיסמה/i);
    fireEvent.click(nextBtn);

    // Step 5: Pick secret password
    await waitFor(() => {
        expect(screen.getByText(/הסיסמה הסודית שלך/i)).toBeDefined();
    });

    fireEvent.click(screen.getByTestId('reg-shape-button-circle'));
    fireEvent.click(screen.getByTestId('reg-shape-button-square'));

    const finalSubmitBtn = await screen.findByText(/זהו, הצטרפתי!/i);
    fireEvent.click(finalSubmitBtn);

    await waitFor(() => {
        expect(addDoc).toHaveBeenCalled();
    });
  });

  it('allows entering a shape sequence and moves to success step', async () => {
    render(<VisualLogin />);
    
    await waitFor(() => screen.getByLabelText(/בחר את ליאו/i));
    fireEvent.click(screen.getByLabelText(/בחר את ליאו/i));

    // Wait for password step
    await waitFor(() => screen.getByText(/הסיסמה הסודית/i));

    // Click shapes (data-testids are still present in code)
    fireEvent.click(screen.getByTestId('shape-button-circle'));
    fireEvent.click(screen.getByTestId('shape-button-square'));

    // Should move to Step 3 after delay
    await waitFor(() => {
      expect(screen.getByText(/הידד, ליאו!/i)).toBeDefined();
    }, { timeout: 2000 });

    expect(screen.getByText(/הצלחת!/i)).toBeDefined();
  });
});
