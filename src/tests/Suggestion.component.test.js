import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import Suggestion from '../js/Suggestion';
import { fetchData, fetchExceptionsData, fetchRosterData, fetchSettingsData } from '../js/Api';

jest.mock('../js/Api', () => ({
  fetchData: jest.fn(),
  fetchExceptionsData: jest.fn(),
  fetchRosterData: jest.fn(),
  fetchSettingsData: jest.fn(),
}));

describe('Suggestion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders suggestions only for the match immediately after the last rostered upcoming match', async () => {
    const appConfig = { league: 'sgcc' };
    const firstUpcoming = new Date(Date.UTC(2099, 0, 10));
    const nextUpcoming = new Date(Date.UTC(2099, 0, 17));

    fetchSettingsData.mockResolvedValue({
      data: {
        A: 'LEAST',
        B: 'LEAST',
        C: 'LEAST',
        Reserved: 'LEAST',
        season: '2026',
      },
    });

    fetchExceptionsData.mockResolvedValue({ data: [] });

    fetchRosterData.mockResolvedValue({
      data: [
        {
          league: 'sgcc',
          date: '10/Jan/2099',
          parsedDate: firstUpcoming,
          opponent: 'Lane Masters',
          slots: {
            A: { name: 'Alice', status: 'YES' },
            B: { name: 'Bob', status: 'YES' },
            C: { name: 'Carol', status: 'YES' },
            Reserved: { name: '', status: '' },
          },
        },
        {
          league: 'sgcc',
          date: '17/Jan/2099',
          parsedDate: nextUpcoming,
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
    expect(fetchExceptionsData).toHaveBeenCalledWith(appConfig, '2026');
    expect(fetchRosterData).toHaveBeenCalledWith(appConfig);
    expect(fetchData).toHaveBeenCalledWith(appConfig);

    expect(screen.getByText('Team: Pin Crushers')).toBeInTheDocument();
    expect(screen.getByText('Derek')).toBeInTheDocument();
    expect(screen.getByText(/\(Reserve\)$/)).toBeInTheDocument();
    expect(screen.getAllByText(/^H\s\d+$/).length).toBeGreaterThan(0);
  });

  test('renders nothing when the last rostered upcoming match has fewer than three main bowlers', async () => {
    const appConfig = { league: 'sgcc' };
    const firstUpcoming = new Date(Date.UTC(2099, 0, 10));
    const nextUpcoming = new Date(Date.UTC(2099, 0, 17));

    fetchSettingsData.mockResolvedValue({
      data: {
        A: 'LEAST',
        B: 'LEAST',
        C: 'LEAST',
        Reserved: 'LEAST',
        season: '2026',
      },
    });

    fetchExceptionsData.mockResolvedValue({ data: [] });

    fetchRosterData.mockResolvedValue({
      data: [
        {
          league: 'sgcc',
          date: '10/Jan/2099',
          parsedDate: firstUpcoming,
          opponent: 'Pin Crushers',
          slots: {
            A: { name: 'Alice', status: 'YES' },
            B: { name: '', status: '' },
            C: { name: '', status: '' },
            Reserved: { name: '', status: '' },
          },
        },
        {
          league: 'sgcc',
          date: '17/Jan/2099',
          parsedDate: nextUpcoming,
          opponent: 'Strikers',
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
      expect(fetchSettingsData).toHaveBeenCalledWith(appConfig);
    });

    expect(screen.queryByText('💡 Suggestion')).not.toBeInTheDocument();
  });

  test('renders nothing when there is no match after the last rostered upcoming match', async () => {
    const appConfig = { league: 'sgcc' };
    const futureDate = new Date(Date.UTC(2099, 0, 10));

    fetchSettingsData.mockResolvedValue({
      data: {
        A: 'LEAST',
        B: 'LEAST',
        C: 'LEAST',
        Reserved: 'LEAST',
        season: '2026',
      },
    });

    fetchExceptionsData.mockResolvedValue({ data: [] });

    fetchRosterData.mockResolvedValue({
      data: [
        {
          league: 'sgcc',
          date: '10/Jan/2099',
          parsedDate: futureDate,
          opponent: 'Pin Crushers',
          slots: {
            A: { name: 'Alice', status: 'YES' },
            B: { name: 'Bob', status: 'YES' },
            C: { name: 'Carol', status: 'YES' },
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
      expect(fetchSettingsData).toHaveBeenCalledWith(appConfig);
    });

    expect(screen.queryByText('💡 Suggestion')).not.toBeInTheDocument();
  });

  test('renders nothing when latest roster card is exception-only and has fewer than three main bowlers', async () => {
    const appConfig = { league: 'sgcc' };
    const firstUpcoming = new Date(Date.UTC(2099, 2, 17));
    const secondUpcoming = new Date(Date.UTC(2099, 2, 24));
    const thirdUpcoming = new Date(Date.UTC(2099, 2, 31));

    fetchSettingsData.mockResolvedValue({
      data: {
        A: 'LEAST',
        B: 'LEAST',
        C: 'LEAST',
        Reserved: 'LEAST',
        season: '2026',
      },
    });

    fetchRosterData.mockResolvedValue({
      data: [
        {
          league: 'sgcc',
          date: '17/Mar/2099',
          parsedDate: firstUpcoming,
          opponent: 'Lane Masters',
          slots: {
            A: { name: 'Alice', status: 'YES' },
            B: { name: 'Bob', status: 'YES' },
            C: { name: 'Carol', status: 'YES' },
            Reserved: { name: '', status: '' },
          },
          bowlers: [
            { slot: 'A', name: 'Alice', status: 'YES', isReserve: false },
            { slot: 'B', name: 'Bob', status: 'YES', isReserve: false },
            { slot: 'C', name: 'Carol', status: 'YES', isReserve: false },
          ],
        },
        {
          league: 'sgcc',
          date: '24/Mar/2099',
          parsedDate: secondUpcoming,
          opponent: 'Pin Crushers',
          slots: {
            A: { name: '', status: '' },
            B: { name: '', status: '' },
            C: { name: '', status: '' },
            Reserved: { name: '', status: '' },
          },
          bowlers: [],
        },
        {
          league: 'sgcc',
          date: '31/Mar/2099',
          parsedDate: thirdUpcoming,
          opponent: 'Strikers',
          slots: {
            A: { name: '', status: '' },
            B: { name: '', status: '' },
            C: { name: '', status: '' },
            Reserved: { name: '', status: '' },
          },
          bowlers: [],
        },
      ],
    });

    fetchExceptionsData.mockResolvedValue({
      data: [
        {
          parsedDate: secondUpcoming,
          bowlers: ['Aaron'],
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
      expect(fetchExceptionsData).toHaveBeenCalledWith(appConfig, '2026');
    });

    expect(screen.queryByText('💡 Suggestion')).not.toBeInTheDocument();
  });

  test('ignores reserve-only match for participation count', async () => {
    const appConfig = { league: 'sgcc' };
    const firstUpcoming = new Date(Date.UTC(2099, 2, 17));
    const reserveOnlyMatchDate = new Date(Date.UTC(2099, 2, 24));
    const nextUpcoming = new Date(Date.UTC(2099, 2, 31));

    fetchSettingsData.mockResolvedValue({
      data: {
        A: 'LEAST',
        B: 'LEAST',
        C: 'LEAST',
        Reserved: 'LEAST',
        season: '2026',
      },
    });

    fetchRosterData.mockResolvedValue({
      data: [
        {
          league: 'sgcc',
          date: '17/Mar/2099',
          parsedDate: firstUpcoming,
          opponent: 'Lane Masters',
          slots: {
            A: { name: 'Alice', status: 'YES' },
            B: { name: 'Bob', status: 'YES' },
            C: { name: 'Carol', status: 'YES' },
            Reserved: { name: '', status: '' },
          },
          bowlers: [
            { slot: 'A', name: 'Alice', status: 'YES', isReserve: false },
            { slot: 'B', name: 'Bob', status: 'YES', isReserve: false },
            { slot: 'C', name: 'Carol', status: 'YES', isReserve: false },
          ],
        },
        {
          league: 'sgcc',
          date: '24/Mar/2099',
          parsedDate: reserveOnlyMatchDate,
          opponent: 'Pin Crushers',
          slots: {
            A: { name: '', status: '' },
            B: { name: '', status: '' },
            C: { name: '', status: '' },
            Reserved: { name: 'Reserve One', status: 'YES' },
          },
          bowlers: [
            { slot: 'Reserved', name: 'Reserve One', status: 'YES', isReserve: true },
          ],
        },
        {
          league: 'sgcc',
          date: '31/Mar/2099',
          parsedDate: nextUpcoming,
          opponent: 'Strikers',
          slots: {
            A: { name: '', status: '' },
            B: { name: '', status: '' },
            C: { name: '', status: '' },
            Reserved: { name: '', status: '' },
          },
          bowlers: [],
        },
      ],
    });

    fetchExceptionsData.mockResolvedValue({ data: [] });

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

    expect(screen.getByText('Team: Pin Crushers')).toBeInTheDocument();
  });
});