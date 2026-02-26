import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import Roster from '../js/Roster';
import { fetchData, fetchRosterData } from '../js/Api';

jest.mock('../js/Api', () => ({
  fetchData: jest.fn(),
  fetchRosterData: jest.fn(),
}));

describe('Roster', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders upcoming roster card with bowlers and handicap', async () => {
    const appConfig = { league: 'sgcc' };
    const futureDate = new Date(Date.UTC(2099, 0, 1));

    fetchRosterData.mockResolvedValue({
      data: [
        {
          league: 'sgcc',
          date: '01/Jan/2099',
          parsedDate: futureDate,
          opponent: 'Strikers',
          bowlers: [
            { name: 'Alice', status: 'YES', isReserve: false },
            { name: 'Bob', status: 'NO', isReserve: true },
          ],
        },
      ],
    });

    fetchData.mockResolvedValue({
      data: [
        { bowler: '🟢\u00A0\u00A0Alice', hdcp: 10, average: 180, totalGames: 20 },
        { bowler: '🟢\u00A0\u00A0Bob', hdcp: 7, average: 170, totalGames: 18 },
      ],
    });

    render(<Roster appConfig={appConfig} />);

    await waitFor(() => {
      expect(screen.getByText('Team: Strikers')).toBeInTheDocument();
    });

    expect(fetchRosterData).toHaveBeenCalledWith(appConfig);
    expect(fetchData).toHaveBeenCalledWith(appConfig);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob (Reserve)')).toBeInTheDocument();
    expect(screen.getByText('H 10')).toBeInTheDocument();
    expect(screen.getByLabelText('confirmed')).toBeInTheDocument();
    expect(screen.getByLabelText('pending response')).toBeInTheDocument();
  });

  test('handles roster fetch failure without crashing', async () => {
    const appConfig = { league: 'sgcc' };
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    fetchRosterData.mockRejectedValue(new Error('network down'));
    fetchData.mockResolvedValue({ data: [] });

    render(<Roster appConfig={appConfig} />);

    await waitFor(() => {
      expect(fetchRosterData).toHaveBeenCalledWith(appConfig);
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(screen.queryByText(/Team:/)).not.toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });
});