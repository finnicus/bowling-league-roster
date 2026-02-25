export const REFRESH_INTERVAL = 300000; // 5 minutes in milliseconds
export const MASTER_SHEET = "2PACX-1vQLJDJ0tRftkDJQ8v0DO35q6Kymvp2GmdMwfeP8r6GuHcEAL97EJp1K9qlF8oOLTWvTW-Xg8d0l3UtP"
export const TAMPINES_GID = "1560652729";
export const LEAGUE_CONFIG = {
	tampines: {
		title: 'Pinfinity Tampines Wednesday',
		logo: 'tampines',
		useDummyData: false,
	},
	dummy: {
		title: 'Pinfinity Dummy',
		logo: 'pinfinity',
		useDummyData: true,
	},
};

export const DEFAULT_LEAGUE = 'dummy';
export const DEFAULT_VIEW = 'default';

export const buildBowlersSheetUrl = (gid) => (
	'https://docs.google.com/spreadsheets/d/e/' + MASTER_SHEET + '/pub?gid=' + gid + '&single=true&output=csv'
);

export const BOWLERS_SHEET_URL = buildBowlersSheetUrl(TAMPINES_GID);

export const DUMMY_BOWLERS_DATA = [
	{
		bowler: '🟢\u00A0\u00A0Dummy Alpha',
		gender: 'M',
		active: true,
		hdcp: 0,
		totalGames: 30,
		totalScore: 6200,
		average: 206,
	},
	{
		bowler: '🟢\u00A0\u00A0Dummy Bravo',
		gender: 'F',
		active: true,
		hdcp: 8,
		totalGames: 24,
		totalScore: 4152,
		average: 173,
	},
	{
		bowler: '🔴\u00A0\u00A0Dummy Charlie',
		gender: 'M',
		active: false,
		hdcp: 12,
		totalGames: 18,
		totalScore: 2880,
		average: 160,
	},
];

export const getAppConfigFromUrl = (search = '') => {
	const query = new URLSearchParams(search);
	const leagueParam = (query.get('league') || '').trim().toLowerCase();
	const viewParam = (query.get('view') || DEFAULT_VIEW).trim().toLowerCase();
	const league = LEAGUE_CONFIG[leagueParam] ? leagueParam : DEFAULT_LEAGUE;
	const leagueSettings = LEAGUE_CONFIG[league];

	return {
		league,
		view: viewParam || DEFAULT_VIEW,
		title: leagueSettings.title,
		logo: leagueSettings.logo || 'pinfinity',
		useDummyData: Boolean(leagueSettings.useDummyData),
		bowlersSheetUrl: BOWLERS_SHEET_URL,
	};
};