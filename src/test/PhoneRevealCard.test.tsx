import { renderWithProviders, screen, fireEvent, waitFor } from './test-utils';
import PhoneRevealCard from '../components/PhoneRevealCard';
import { useAuthStore } from '../store/useAuthStore';
import { apiClient } from '../services/apiClient';

vi.mock('../services/apiClient', () => ({
  apiClient: {
    post: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

const mockedPost = vi.mocked(apiClient.post);

describe('PhoneRevealCard', () => {
  beforeEach(() => {
    mockedPost.mockClear();
    mockedPost.mockResolvedValue({ data: {} } as any);
    useAuthStore.setState({ token: 'tok' });
  });

  it('renders the masked phone number by default', () => {
    renderWithProviders(<PhoneRevealCard phone="9876543210" />);
    // maskPhone -> first 3 + ***** + last 2
    expect(screen.getByText('987*****10')).toBeInTheDocument();
    expect(screen.getByText('Phone Number')).toBeInTheDocument();
  });

  it('reveals the full phone number when the show button is clicked', () => {
    renderWithProviders(<PhoneRevealCard phone="9876543210" />);
    fireEvent.click(screen.getByRole('button', { name: /show phone number/i }));

    expect(screen.getByText('9876543210')).toBeInTheDocument();
    expect(screen.queryByText('987*****10')).not.toBeInTheDocument();
    // Button label flips to hide once revealed.
    expect(
      screen.getByRole('button', { name: /hide phone number/i })
    ).toBeInTheDocument();
  });

  it('posts to the tracking endpoint once when revealed with an aspirantId', async () => {
    renderWithProviders(<PhoneRevealCard phone="9876543210" aspirantId={42} />);
    fireEvent.click(screen.getByRole('button', { name: /show phone number/i }));

    await waitFor(() =>
      expect(mockedPost).toHaveBeenCalledWith('/users/track/phone-call', {
        aspirantId: 42,
      })
    );
    expect(mockedPost).toHaveBeenCalledTimes(1);
  });

  it('does not call the tracking endpoint when no aspirantId is provided', async () => {
    renderWithProviders(<PhoneRevealCard phone="9876543210" />);
    fireEvent.click(screen.getByRole('button', { name: /show phone number/i }));

    await Promise.resolve();
    expect(mockedPost).not.toHaveBeenCalled();
  });

  it('renders a Call button and fires onCall when clicked', () => {
    const onCall = vi.fn();
    renderWithProviders(<PhoneRevealCard phone="9876543210" onCall={onCall} />);
    fireEvent.click(screen.getByRole('button', { name: 'Call' }));
    expect(onCall).toHaveBeenCalledTimes(1);
  });

  it('renders the inline variant with a toggle button', () => {
    renderWithProviders(<PhoneRevealCard phone="9876543210" inline />);
    expect(screen.getByText('987*****10')).toBeInTheDocument();
    // Inline variant has no "Phone Number" heading.
    expect(screen.queryByText('Phone Number')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /show phone number/i }));
    expect(screen.getByText('9876543210')).toBeInTheDocument();
  });
});
