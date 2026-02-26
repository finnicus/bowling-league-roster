import axios from 'axios';
import { fetchRosterData, fetchSettingsData } from '../js/Api';

jest.mock('axios');

describe('fetchSettingsData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns null data when no settings row matches league', async () => {
    axios.get.mockResolvedValue({
      data: [
        'League,Active,A,B,C,Reserved,Season,Title',
        'tampines,TRUE,LEAST,LEAST,LEAST,LEAST,2026,Tampines League',
      ].join('\n'),
    });

    const result = await fetchSettingsData({
      league: 'sgcc',
      settingsSheetUrl: 'https://example.com/settings.csv',
    });

    expect(result.source).toBe('csv');
    expect(result.updatedAt).toBeInstanceOf(Date);
    expect(result.data).toBeNull();
  });
});

describe('fetchRosterData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('filters by league and parses/sorts valid roster dates', async () => {
    axios.get.mockResolvedValue({
      data: [
        'League,Date,Opponent,Bowler A,Status A,Bowler B,Status B,Bowler C,Status C,Bowler R,Status R',
        'sgcc,15/Jan/2026,Team B,Alice,YES,Bob,NO,,,ReserveOne,YES',
        'sgcc,02/Jan/2026,Team A,Carol,YES,,,,,,',
        'sgcc,invalid-date,Ignore Me,Zed,YES,,,,,,',
        'tampines,01/Jan/2026,Other Team,Nope,YES,,,,,,',
      ].join('\n'),
    });

    const result = await fetchRosterData({
      league: 'sgcc',
      rostersSheetUrl: 'https://example.com/rosters.csv',
    });

    expect(result.source).toBe('csv');
    expect(result.updatedAt).toBeInstanceOf(Date);
    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toMatchObject({
      league: 'sgcc',
      date: '02/Jan/2026',
      opponent: 'Team A',
    });
    expect(result.data[1]).toMatchObject({
      league: 'sgcc',
      date: '15/Jan/2026',
      opponent: 'Team B',
    });
    expect(result.data[1].bowlers).toHaveLength(3);
    expect(result.data[1].slots.Reserved).toMatchObject({
      name: 'ReserveOne',
      isReserve: true,
    });
  });
});