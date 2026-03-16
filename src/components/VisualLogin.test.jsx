import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import VisualLogin from './VisualLogin';

describe('VisualLogin Component', () => {
  it('renders "מי משחק היום?" on initial step', () => {
    render(<VisualLogin />);
    expect(screen.getByText(/מי משחק היום\?/i)).toBeDefined();
  });

  it('selects a child and moves to the secret password step', async () => {
    render(<VisualLogin />);
    
    const leoButton = screen.getByTestId('child-button-1'); // ליאו
    fireEvent.click(leoButton);

    expect(screen.getByText(/הסיסמה הסודית/i)).toBeDefined();
    expect(screen.getByText(/התור של ליאו/i)).toBeDefined();
  });

  it('allows entering a shape sequence and moves to success step', async () => {
    render(<VisualLogin />);
    
    // Step 1: Select ליאו
    fireEvent.click(screen.getByTestId('child-button-1'));

    // Step 2: Click two shapes
    fireEvent.click(screen.getByTestId('shape-button-circle'));
    fireEvent.click(screen.getByTestId('shape-button-square'));

    // Should move to Step 3 after tiny delay
    await waitFor(() => {
      expect(screen.getByText(/הידד, ליאו!/i)).toBeDefined();
    }, { timeout: 2000 });

    expect(screen.getByText(/הצלחת!/i)).toBeDefined();
  });
});
