import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import App from '../js/App';
import { fetchAppConfigFromURL, fetchData, fetchRosterData, fetchSettingsData, getAppConfigFromURL } from '../js/Api';

jest.mock('../js/Summary', () => () => null);
jest.mock('../js/Roster', () => () => null);
jest.mock('../js/Suggestion', () => () => null);

jest.mock('../js/Api', () => ({
  ...jest.requireActual('../js/Api'),
  fetchData: jest.fn(),
  fetchRosterData: jest.fn(),
  fetchSettingsData: jest.fn(),
  fetchAppConfigFromURL: jest.fn(),
  getAppConfigFromURL: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test('renders loading state', () => {
  getAppConfigFromURL.mockReturnValue({
    league: 'dummy',
    view: 'default',
    title: 'Generic League',
    logo: 'generic',
    useDummyData: true,
    refreshInterval: 300000,
  });
  fetchData.mockImplementation(() => new Promise(() => {}));
  fetchRosterData.mockImplementation(() => new Promise(() => {}));
  fetchSettingsData.mockImplementation(() => new Promise(() => {}));
  fetchAppConfigFromURL.mockImplementation(() => new Promise(() => {}));
  render(<App />);
  expect(screen.getByText(/loading data/i)).toBeInTheDocument();
});

test('uses tessensohn logo when league is tessensohn', async () => {
  const tessensohnConfig = {
    league: 'tessensohn',
    view: 'default',
    title: 'Tessensohn League',
    logo: 'tessensohn',
    useDummyData: false,
    refreshInterval: 300000,
  };

  getAppConfigFromURL.mockReturnValue(tessensohnConfig);
  fetchAppConfigFromURL.mockResolvedValue(tessensohnConfig);

  render(<App />);

  const logoImage = await screen.findByAltText('Tessensohn League logo');
  expect(logoImage).toHaveAttribute('src', expect.stringContaining('tessensohn.png'));
});
