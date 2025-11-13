import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PortfolioBuilder from '../components/PortfolioBuilder';

const basePortfolio = {
  tickers: ['AAA', 'BBB'],
  weights: [0.6, 0.4],
};

const renderComponent = (props = {}) =>
  render(
    <PortfolioBuilder
      portfolio={basePortfolio}
      onDrop={vi.fn()}
      onWeightChange={vi.fn()}
      onRemoveStock={vi.fn()}
      {...props}
    />
  );

describe('PortfolioBuilder', () => {
  it('shows percentage inputs and total allocation', () => {
    renderComponent();
    expect(screen.getByDisplayValue('60.0')).toBeInTheDocument();
    expect(screen.getByText('Total Allocation')).toBeInTheDocument();
    expect(screen.getByText('100.0%')).toBeInTheDocument();
  });

  it('invokes onWeightChange with normalized value', () => {
    const onWeightChange = vi.fn();
    renderComponent({ onWeightChange });
    const input = screen.getByDisplayValue('60.0');
    fireEvent.change(input, { target: { value: '55.5' } });
    expect(onWeightChange).toHaveBeenCalledWith(0, 0.555);
  });

  it('shows error state when weights do not sum to 100%', () => {
    renderComponent({ portfolio: { tickers: ['AAA'], weights: [0.8] } });
    expect(screen.getByText(/must sum to 100%/i)).toBeInTheDocument();
  });
});
