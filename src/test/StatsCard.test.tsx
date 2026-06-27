// Tests for StatsCard: displays a label + a numeric/string value (numbers are
// run through toLocaleString) and an optional icon, defaulting to a trending
// icon when none is supplied.
import { renderWithProviders, screen } from './test-utils';
import StatsCard from '../components/StatsCard';

describe('StatsCard', () => {
  it('renders the label and value', () => {
    renderWithProviders(<StatsCard label="Total Aspirants" value={42} />);
    expect(screen.getByText('Total Aspirants')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('formats large numbers with locale separators', () => {
    renderWithProviders(<StatsCard label="Votes" value={1234567} />);
    // toLocaleString() separator varies by system locale (comma, thin-space, etc.)
    // — use a regex that matches any single separator character.
    expect(screen.getByText(/1.234.567/)).toBeInTheDocument();
  });

  it('renders string values as-is', () => {
    renderWithProviders(<StatsCard label="Status" value="Active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders a custom icon when provided', () => {
    renderWithProviders(
      <StatsCard label="Custom" value={1} icon={<span data-testid="custom-icon">★</span>} />
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders the default icon when none is provided', () => {
    const { container } = renderWithProviders(<StatsCard label="Default" value={1} />);
    // MUI icons render an <svg>; default TrendingUpIcon should appear.
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
