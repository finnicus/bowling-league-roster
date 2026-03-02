import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { within } from '@testing-library/dom';
import Roster from '../js/Roster';
import { fetchData, fetchExceptionsData, fetchRosterData, fetchSettingsData } from '../js/Api';

jest.mock('../js/Api', () => ({
  fetchData: jest.fn(),
  fetchExceptionsData: jest.fn(),
  fetchRosterData: jest.fn(),
  fetchSettingsData: jest.fn(),
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
        { bowler: '🟢\u00A0\u00A0Charlie', hdcp: 11, average: 190, totalGames: 22 },
      ],
    });

    fetchSettingsData.mockResolvedValue({
      data: {
        season: '2026',
      },
    });

    fetchExceptionsData.mockResolvedValue({
      data: [
        {
          parsedDate: futureDate,
          bowlers: ['Charlie', 'Aaron'],
        },
      ],
    });

    render(<Roster appConfig={appConfig} />);

    await waitFor(() => {
      expect(screen.getByText('Team: Strikers')).toBeInTheDocument();
    });

    expect(fetchRosterData).toHaveBeenCalledWith(appConfig);
    expect(fetchData).toHaveBeenCalledWith(appConfig);
    expect(fetchSettingsData).toHaveBeenCalledWith(appConfig);
    expect(fetchExceptionsData).toHaveBeenCalledWith(appConfig, '2026');
    expect(screen.getByText('❌ Unable to Play')).toBeInTheDocument();
    expect(screen.getByText('Aaron')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.getByText('Bob (Reserve)')).toBeInTheDocument();
    expect(screen.getByText('H 10')).toBeInTheDocument();
    expect(screen.getByLabelText('confirmed')).toBeInTheDocument();
    expect(screen.getByLabelText('pending response')).toBeInTheDocument();
    expect(screen.queryByLabelText('exception')).not.toBeInTheDocument();

    const table = screen.getByRole('table', { name: 'Bowlers for 01/Jan/2099' });
    const nameCells = Array.from(table.querySelectorAll('td.roster-item-name')).map((cell) => cell.textContent);
    expect(nameCells).toEqual(['Alice', 'Bob (Reserve)', 'Aaron', 'Charlie']);
    expect(within(table).getByText('Bob (Reserve)').closest('tr').nextElementSibling).toHaveClass('roster-item-exceptions-label');
  });

  test('handles roster fetch failure without crashing', async () => {
    const appConfig = { league: 'sgcc' };
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    fetchRosterData.mockRejectedValue(new Error('network down'));
    fetchData.mockResolvedValue({ data: [] });
    fetchSettingsData.mockResolvedValue({ data: null });
    fetchExceptionsData.mockResolvedValue({ data: [] });

    render(<Roster appConfig={appConfig} />);

    await waitFor(() => {
      expect(fetchRosterData).toHaveBeenCalledWith(appConfig);
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(screen.queryByText(/Team:/)).not.toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });
});