import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AboutInsights from '../components/AboutInsights';

describe('AboutInsights', () => {
  it('toggles accordion and shows content', () => {
    render(<AboutInsights />);
    expect(screen.queryByText(/SmartRisk Lite is more than/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /about these insights/i }));
    expect(screen.getByText(/SmartRisk Lite is more than/)).toBeInTheDocument();
  });
});
