import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import VisualLogin from './VisualLogin';
import ShowAndTell from './ShowAndTell';

expect.extend(toHaveNoViolations);

describe('Accessibility Audits', () => {
  it('VisualLogin should have no accessibility violations', async () => {
    const { container } = render(<VisualLogin />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('ShowAndTell should have no accessibility violations', async () => {
    const { container } = render(<ShowAndTell />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
