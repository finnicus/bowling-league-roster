import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import Suggestion from '../js/Suggestion';
import { fetchData, fetchRosterData, fetchSettingsData } from '../js/Api';

jest.mock('../js/Api', () => ({
  fetchData: jest.fn(),
  fetchRosterData: jest.fn(),
  fetchSettingsData: jest.fn(),
}));

describe('Suggestion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders generated suggestions for the next fully unassigned match', async () => {
    const appConfig = { league: 'sgcc' };
    const futureDate = new Date(Date.UTC(2099, 0, 10));

    fetchSettingsData.mockResolvedValue({
      data: {
        A: 'LEAST',
        B: 'LEAST',
        C: 'LEAST',
        Reserved: 'LEAST',
      },
    });

    fetchRosterData.mockResolvedValue({
      data: [
        {
          league: 'sgcc',
          date: '10/Jan/2099',
          parsedDate: futureDate,
          opponent: 'Pin Crushers',
          slots: {
            A: { name: '', status: '' },
            B: { name: '', status: '' },
            C: { name: '', status: '' },
            Reserved: { name: '', status: '' },
          },
        },
      ],
    });

    fetchData.mockResolvedValue({
      data: [
        { bowler: '🟢\u00A0\u00A0Alice', active: true, hdcp: 10, average: 175, totalGames: 8 },
        { bowler: '🟢\u00A0\u00A0Bob', active: true, hdcp: 9, average: 178, totalGames: 9 },
        { bowler: '🟢\u00A0\u00A0Carol', active: true, hdcp: 8, average: 182, totalGames: 10 },
        { bowler: '🟢\u00A0\u00A0Derek', active: true, hdcp: 7, average: 170, totalGames: 11 },
      ],
    });

    render(<Suggestion appConfig={appConfig} />);

    await waitFor(() => {
      expect(screen.getByText('💡 Suggestion')).toBeInTheDocument();
    });

    expect(fetchSettingsData).toHaveBeenCalledWith(appConfig);
    expect(fetchRosterData).toHaveBeenCalledWith(appConfig);
    expect(fetchData).toHaveBeenCalledWith(appConfig);

    expect(screen.getByText('Team: Pin Crushers')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText(/\(Reserve\)$/)).toBeInTheDocument();
    expect(screen.getAllByText(/^H\s\d+$/).length).toBeGreaterThan(0);
  });

  test('renders nothing when there is no fully unassigned upcoming match', async () => {
    const appConfig = { league: 'sgcc' };
    const futureDate = new Date(Date.UTC(2099, 0, 10));

    fetchSettingsData.mockResolvedValue({
      data: {
        A: 'LEAST',
        B: 'LEAST',
        C: 'LEAST',
        Reserved: 'LEAST',
      },
    });

    fetchRosterData.mockResolvedValue({
      data: [
        {
          league: 'sgcc',
          date: '10/Jan/2099',
          parsedDate: futureDate,
          opponent: 'Pin Crushers',
          slots: {
            A: { name: 'Alice', status: 'YES' },
            B: { name: '', status: '' },
            C: { name: '', status: '' },
            Reserved: { name: '', status: '' },
          },
        },
      ],
    });

    fetchData.mockResolvedValue({
      data: [
        { bowler: '🟢\u00A0\u00A0Alice', active: true, hdcp: 10, average: 175, totalGames: 8 },
      ],
    });

    render(<Suggestion appConfig={appConfig} />);

    await waitFor(() => {
      expect(fetchSettingsData).toHaveBeenCalledWith(appConfig);
    });

    expect(screen.queryByText('💡 Suggestion')).not.toBeInTheDocument();
  });
});