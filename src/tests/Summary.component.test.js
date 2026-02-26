import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import Summary from '../js/Summary';
import { fetchData } from '../js/Api';

jest.mock('../js/Api', () => ({
  fetchData: jest.fn(),
}));

describe('Summary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('loads bowlers and updates parent callbacks', async () => {
    const updatedAt = new Date('2099-01-01T00:00:00.000Z');
    const appConfig = { refreshInterval: 300000 };
    const onLoadingChange = jest.fn();
    const onLastUpdatedChange = jest.fn();

    fetchData.mockResolvedValue({
      data: [
        {
          bowler: 'Alice',
          gender: 'F',
          hdcp: 8,
          totalGames: 12,
          totalScore: 2040,
          average: 170,
        },
      ],
      updatedAt,
      source: 'dummy',
    });

    render(
      <Summary
        appConfig={appConfig}
        onLoadingChange={onLoadingChange}
        onLastUpdatedChange={onLastUpdatedChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    expect(fetchData).toHaveBeenCalledWith(appConfig);
    expect(onLastUpdatedChange).toHaveBeenCalledWith(updatedAt);
    expect(onLoadingChange).toHaveBeenCalledWith(false);
    expect(screen.getByText('Bowler')).toBeInTheDocument();
    expect(screen.getByText('Hdcp')).toBeInTheDocument();
  });

  test('sets loading false when data fetch fails', async () => {
    const appConfig = { refreshInterval: 300000 };
    const onLoadingChange = jest.fn();
    const onLastUpdatedChange = jest.fn();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    fetchData.mockRejectedValue(new Error('fetch failed'));

    render(
      <Summary
        appConfig={appConfig}
        onLoadingChange={onLoadingChange}
        onLastUpdatedChange={onLastUpdatedChange}
      />
    );

    await waitFor(() => {
      expect(fetchData).toHaveBeenCalledWith(appConfig);
    });

    expect(onLastUpdatedChange).not.toHaveBeenCalled();
    expect(onLoadingChange).toHaveBeenCalledWith(false);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});