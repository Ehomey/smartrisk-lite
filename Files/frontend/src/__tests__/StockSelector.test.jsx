import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StockSelector from '../components/StockSelector';
import axios from 'axios';

vi.mock('axios');

describe('StockSelector', () => {
  const mockData = {
    items: [
      { ticker: 'AAA', name: 'Alpha', sector: 'Tech', assetClass: 'Stock' },
      { ticker: 'BBB', name: 'Beta', sector: 'Energy', assetClass: 'Stock' }
    ],
    total: 2,
    asset_classes: ['Stock'],
    sectors: ['Tech', 'Energy']
  };

  beforeEach(() => {
    axios.get.mockResolvedValue({ data: mockData });
  });

  it('renders fetched assets and allows searching', async () => {
    render(<StockSelector />);
    await waitFor(() => expect(screen.getByText('Alpha')).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText(/search stocks/i), { target: { value: 'Beta' } });
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('calls onAddAsset when hitting + Add', async () => {
    const onAddAsset = vi.fn();
    render(<StockSelector onAddAsset={onAddAsset} />);
    await waitFor(() => expect(screen.getByText('Alpha')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('+ Add')[0]);
    expect(onAddAsset).toHaveBeenCalledWith(mockData.items[0]);
  });
});
