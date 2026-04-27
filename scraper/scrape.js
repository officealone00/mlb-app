/**
 * MLB 스크래퍼 v1.0
 *
 * MLB Stats API (statsapi.mlb.com) 사용
 * - 공식 API, 인증 불필요
 * - JSON 응답, 파싱 단순
 * - 매시간 GitHub Actions 실행
 *
 * 출력 파일:
 *   data/standings.json     - 30개 팀 순위 (지구별)
 *   data/wildcard.json      - AL/NL 와일드카드
 *   data/batters.json       - 타자 Top 30 (AVG/HR/RBI/SB)
 *   data/korean_players.json - 한국/한국계 선수 시즌 성적 (치트키!)
 *   data/games.json         - 오늘/어제 경기 (한국 선수 출전 여부 표시)
 *   data/meta.json          - 마지막 업데이트 시각
 */

import fs from 'node:fs/promises';
import path from 'node:path';

// ============================================================================
// 설정
// ============================================================================

const API_BASE = 'https://statsapi.mlb.com/api/v1';
const SEASON = new Date().getFullYear();
const DATA_DIR = path.resolve(process.cwd(), '..', 'data');

// MLB 30개 팀 (Stats API teamId 기준)
const MLB_TEAMS = [
  // AL East (지구 ID: 201)
  { id: 110, abbr: 'BAL', name: 'Baltimore Orioles', kr: '볼티모어', league: 'AL', division: 'East' },
  { id: 111, abbr: 'BOS', name: 'Boston Red Sox', kr: '보스턴', league: 'AL', division: 'East' },
  { id: 147, abbr: 'NYY', name: 'New York Yankees', kr: '뉴욕 양키스', league: 'AL', division: 'East' },
  { id: 139, abbr: 'TB',  name: 'Tampa Bay Rays', kr: '탬파베이', league: 'AL', division: 'East' },
  { id: 141, abbr: 'TOR', name: 'Toronto Blue Jays', kr: '토론토', league: 'AL', division: 'East' },
  // AL Central (202)
  { id: 145, abbr: 'CWS', name: 'Chicago White Sox', kr: '시카고 화이트삭스', league: 'AL', division: 'Central' },
  { id: 114, abbr: 'CLE', name: 'Cleveland Guardians', kr: '클리블랜드', league: 'AL', division: 'Central' },
  { id: 116, abbr: 'DET', name: 'Detroit Tigers', kr: '디트로이트', league: 'AL', division: 'Central' },
  { id: 118, abbr: 'KC',  name: 'Kansas City Royals', kr: '캔자스시티', league: 'AL', division: 'Central' },
  { id: 142, abbr: 'MIN', name: 'Minnesota Twins', kr: '미네소타', league: 'AL', division: 'Central' },
  // AL West (200)
  { id: 117, abbr: 'HOU', name: 'Houston Astros', kr: '휴스턴', league: 'AL', division: 'West' },
  { id: 108, abbr: 'LAA', name: 'Los Angeles Angels', kr: 'LA 에인절스', league: 'AL', division: 'West' },
  { id: 133, abbr: 'ATH', name: 'Athletics', kr: '애슬레틱스', league: 'AL', division: 'West' },
  { id: 136, abbr: 'SEA', name: 'Seattle Mariners', kr: '시애틀', league: 'AL', division: 'West' },
  { id: 140, abbr: 'TEX', name: 'Texas Rangers', kr: '텍사스', league: 'AL', division: 'West' },
  // NL East (204)
  { id: 144, abbr: 'ATL', name: 'Atlanta Braves', kr: '애틀랜타', league: 'NL', division: 'East' },
  { id: 146, abbr: 'MIA', name: 'Miami Marlins', kr: '마이애미', league: 'NL', division: 'East' },
  { id: 121, abbr: 'NYM', name: 'New York Mets', kr: '뉴욕 메츠', league: 'NL', division: 'East' },
  { id: 143, abbr: 'PHI', name: 'Philadelphia Phillies', kr: '필라델피아', league: 'NL', division: 'East' },
  { id: 120, abbr: 'WSH', name: 'Washington Nationals', kr: '워싱턴', league: 'NL', division: 'East' },
  // NL Central (205)
  { id: 112, abbr: 'CHC', name: 'Chicago Cubs', kr: '시카고 컵스', league: 'NL', division: 'Central' },
  { id: 113, abbr: 'CIN', name: 'Cincinnati Reds', kr: '신시내티', league: 'NL', division: 'Central' },
  { id: 158, abbr: 'MIL', name: 'Milwaukee Brewers', kr: '밀워키', league: 'NL', division: 'Central' },
  { id: 134, abbr: 'PIT', name: 'Pittsburgh Pirates', kr: '피츠버그', league: 'NL', division: 'Central' },
  { id: 138, abbr: 'STL', name: 'St. Louis Cardinals', kr: '세인트루이스', league: 'NL', division: 'Central' },
  // NL West (203)
  { id: 109, abbr: 'ARI', name: 'Arizona Diamondbacks', kr: '애리조나', league: 'NL', division: 'West' },
  { id: 115, abbr: 'COL', name: 'Colorado Rockies', kr: '콜로라도', league: 'NL', division: 'West' },
  { id: 119, abbr: 'LAD', name: 'Los Angeles Dodgers', kr: 'LA 다저스', league: 'NL', division: 'West' },
  { id: 135, abbr: 'SD',  name: 'San Diego Padres', kr: '샌디에이고', league: 'NL', division: 'West' },
  { id: 137, abbr: 'SF',  name: 'San Francisco Giants', kr: '샌프란시스코', league: 'NL', division: 'West' },
];

const TEAM_BY_ID = Object.fromEntries(MLB_TEAMS.map(t => [t.id, t]));

// 한국/한국계 선수 (이름으로 검색해서 ID 얻음)
// fullName은 MLB Stats API에서 사용하는 영문 정식 이름
const KOREAN_PLAYERS_QUERY = [
  { searchName: 'Jung Hoo Lee',     krName: '이정후',      type: 'korean',        teamHint: 137, position: 'OF' },
  { searchName: 'Hyeseong Kim',     krName: '김혜성',      type: 'korean',        teamHint: 119, position: 'IF' },
  { searchName: 'Dane Dunning',     krName: '데인 더닝',   type: 'korean_heritage', teamHint: 136, position: 'P' },
  { searchName: "Riley O'Brien",    krName: '라일리 오브라이언', type: 'korean_heritage', teamHint: 138, position: 'P' },
  { searchName: 'Jamai Jones',      krName: '저마이 존스', type: 'korean_heritage', teamHint: 116, position: 'OF' },
  { searchName: 'Shay Whitcomb',    krName: '셰이 위트컴', type: 'korean_heritage', teamHint: 117, position: 'IF' },
];

// ============================================================================
// HTTP 유틸
// ============================================================================

async function fetchJson(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'mlb-app-scraper/1.0 (github.com/officealone00/mlb-app)',
          'Accept': 'application/json',
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`  ⚠ 시도 ${attempt}/${retries} 실패: ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
}

// ============================================================================
// 1. 순위 (Standings)
// ============================================================================

async function fetchStandings() {
  console.log('📊 순위 데이터 가져오는 중...');
  // leagueId=103(AL), 104(NL)
  const url = `${API_BASE}/standings?leagueId=103,104&season=${SEASON}&standingsTypes=regularSeason`;
  const data = await fetchJson(url);

  const standings = [];
  for (const record of data.records || []) {
    for (const team of record.teamRecords || []) {
      const meta = TEAM_BY_ID[team.team.id];
      if (!meta) continue;

      standings.push({
        teamId: team.team.id,
        abbr: meta.abbr,
        name: meta.name,
        krName: meta.kr,
        league: meta.league,
        division: meta.division,
        divisionRank: parseInt(team.divisionRank, 10) || 0,
        leagueRank: parseInt(team.leagueRank, 10) || 0,
        wins: team.wins || 0,
        losses: team.losses || 0,
        winningPct: parseFloat(team.winningPercentage) || 0,
        gamesBack: team.gamesBack === '-' ? 0 : parseFloat(team.gamesBack) || 0,
        wildCardGamesBack: team.wildCardGamesBack === '-' ? 0 : parseFloat(team.wildCardGamesBack) || 0,
        runsScored: team.runsScored || 0,
        runsAllowed: team.runsAllowed || 0,
        runDifferential: team.runDifferential || 0,
        streak: team.streak?.streakCode || '-',
        last10: team.records?.splitRecords?.find(r => r.type === 'lastTen')
          ? `${team.records.splitRecords.find(r => r.type === 'lastTen').wins}-${team.records.splitRecords.find(r => r.type === 'lastTen').losses}`
          : '-',
      });
    }
  }

  console.log(`  ✓ ${standings.length}개 팀 순위 수집`);
  return standings;
}

// ============================================================================
// 2. 와일드카드 (Wild Card)
// ============================================================================

function buildWildCard(standings) {
  console.log('🎫 와일드카드 계산 중...');
  const result = { AL: [], NL: [] };

  for (const league of ['AL', 'NL']) {
    // 지구 1위가 아닌 팀들 중 승률 높은 순으로 정렬
    const candidates = standings
      .filter(t => t.league === league && t.divisionRank > 1)
      .sort((a, b) => b.winningPct - a.winningPct);

    result[league] = candidates.slice(0, 6).map((t, idx) => ({
      ...t,
      wildCardRank: idx + 1,
      inWildCard: idx < 3,
    }));
  }

  console.log(`  ✓ AL ${result.AL.length}팀, NL ${result.NL.length}팀`);
  return result;
}

// ============================================================================
// 3. 타자 Top 30
// ============================================================================

async function fetchBatters() {
  console.log('⚾ 타자 Top 30 가져오는 중...');
  const url = `${API_BASE}/stats/leaders?leaderCategories=battingAverage,homeRuns,runsBattedIn,stolenBases&season=${SEASON}&limit=30&statGroup=hitting&sportId=1`;
  const data = await fetchJson(url);

  const result = { avg: [], hr: [], rbi: [], sb: [] };
  const categoryMap = {
    battingAverage: 'avg',
    homeRuns: 'hr',
    runsBattedIn: 'rbi',
    stolenBases: 'sb',
  };

  for (const cat of data.leagueLeaders || []) {
    const key = categoryMap[cat.leaderCategory];
    if (!key) continue;

    result[key] = (cat.leaders || []).slice(0, 30).map((p, idx) => ({
      rank: idx + 1,
      playerId: p.person?.id,
      playerName: p.person?.fullName,
      teamId: p.team?.id,
      teamAbbr: TEAM_BY_ID[p.team?.id]?.abbr || '',
      value: p.value,
    }));
  }

  console.log(`  ✓ AVG/HR/RBI/SB 각 ${result.avg.length}명 수집`);
  return result;
}

// ============================================================================
// 4. 한국 선수 (치트키 탭!)
// ============================================================================

async function searchPlayer(name) {
  // MLB Stats API 선수 검색 (이름으로)
  const url = `${API_BASE}/people/search?names=${encodeURIComponent(name)}&sportIds=1`;
  try {
    const data = await fetchJson(url);
    if (data.people && data.people.length > 0) {
      return data.people[0];
    }
  } catch (err) {
    console.warn(`  ⚠ ${name} 검색 실패: ${err.message}`);
  }
  return null;
}

async function fetchPlayerStats(playerId) {
  const url = `${API_BASE}/people/${playerId}/stats?stats=season&group=hitting,pitching&season=${SEASON}`;
  try {
    const data = await fetchJson(url);
    const result = { hitting: null, pitching: null };

    for (const statGroup of data.stats || []) {
      const split = statGroup.splits?.[0];
      if (!split) continue;
      const stat = split.stat;

      if (statGroup.group?.displayName === 'hitting') {
        result.hitting = {
          games: stat.gamesPlayed,
          atBats: stat.atBats,
          hits: stat.hits,
          homeRuns: stat.homeRuns,
          rbi: stat.rbi,
          stolenBases: stat.stolenBases,
          avg: stat.avg,
          obp: stat.obp,
          slg: stat.slg,
          ops: stat.ops,
        };
      } else if (statGroup.group?.displayName === 'pitching') {
        result.pitching = {
          wins: stat.wins,
          losses: stat.losses,
          era: stat.era,
          gamesPlayed: stat.gamesPlayed,
          gamesStarted: stat.gamesStarted,
          inningsPitched: stat.inningsPitched,
          strikeouts: stat.strikeOuts,
          whip: stat.whip,
          saves: stat.saves,
        };
      }
    }
    return result;
  } catch (err) {
    console.warn(`  ⚠ playerId=${playerId} 성적 가져오기 실패`);
    return null;
  }
}

async function fetchKoreanPlayers() {
  console.log('🇰🇷 한국 선수 데이터 가져오는 중...');
  const result = [];

  for (const player of KOREAN_PLAYERS_QUERY) {
    const found = await searchPlayer(player.searchName);
    if (!found) {
      console.warn(`  ⚠ ${player.krName} (${player.searchName}) 검색 결과 없음 - 건너뜀`);
      continue;
    }

    const stats = await fetchPlayerStats(found.id);
    const currentTeam = found.currentTeam?.id;
    const teamMeta = TEAM_BY_ID[currentTeam] || TEAM_BY_ID[player.teamHint];

    result.push({
      playerId: found.id,
      enName: found.fullName,
      krName: player.krName,
      type: player.type, // korean | korean_heritage
      position: player.position,
      teamId: currentTeam,
      teamAbbr: teamMeta?.abbr || '?',
      teamKrName: teamMeta?.kr || '?',
      stats: stats || { hitting: null, pitching: null },
    });

    // API rate limit 방지
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`  ✓ 한국/한국계 선수 ${result.length}명 수집`);
  return result;
}

// ============================================================================
// 5. 오늘/어제 경기
// ============================================================================

function ymd(d) {
  return d.toISOString().split('T')[0];
}

async function fetchGames() {
  console.log('📅 오늘/어제 경기 가져오는 중...');
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  const games = { today: [], yesterday: [] };

  for (const [label, date] of [['today', today], ['yesterday', yesterday]]) {
    const url = `${API_BASE}/schedule?sportId=1&date=${ymd(date)}`;
    try {
      const data = await fetchJson(url);
      for (const dayData of data.dates || []) {
        for (const g of dayData.games || []) {
          const home = TEAM_BY_ID[g.teams?.home?.team?.id];
          const away = TEAM_BY_ID[g.teams?.away?.team?.id];
          if (!home || !away) continue;

          games[label].push({
            gameId: g.gamePk,
            status: g.status?.detailedState,
            statusCode: g.status?.statusCode,
            startTime: g.gameDate,
            home: {
              teamId: home.id,
              abbr: home.abbr,
              kr: home.kr,
              score: g.teams?.home?.score ?? null,
              wins: g.teams?.home?.leagueRecord?.wins,
              losses: g.teams?.home?.leagueRecord?.losses,
            },
            away: {
              teamId: away.id,
              abbr: away.abbr,
              kr: away.kr,
              score: g.teams?.away?.score ?? null,
              wins: g.teams?.away?.leagueRecord?.wins,
              losses: g.teams?.away?.leagueRecord?.losses,
            },
            // 한국 선수 출전 가능성 표시 (팀 매칭으로 추정 - 실제 출전은 lineup API 필요)
            koreanPlayerTeams: [],
          });
        }
      }
    } catch (err) {
      console.warn(`  ⚠ ${label} 경기 가져오기 실패: ${err.message}`);
    }
  }

  console.log(`  ✓ 오늘 ${games.today.length}경기, 어제 ${games.yesterday.length}경기`);
  return games;
}

// 한국 선수 팀 ID로 경기에 표시 추가
function tagKoreanGames(games, koreanPlayers) {
  const koreanTeamIds = new Set(koreanPlayers.map(p => p.teamId).filter(Boolean));
  for (const day of ['today', 'yesterday']) {
    for (const g of games[day]) {
      const teams = [];
      if (koreanTeamIds.has(g.home.teamId)) teams.push(g.home.teamId);
      if (koreanTeamIds.has(g.away.teamId)) teams.push(g.away.teamId);
      g.koreanPlayerTeams = teams;
    }
  }
  return games;
}

// ============================================================================
// 메인
// ============================================================================

async function writeJson(filename, data) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const filepath = path.join(DATA_DIR, filename);
  await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`  💾 ${filename} 저장됨`);
}

async function main() {
  console.log(`\n🏟️  MLB 스크래퍼 시작 (시즌: ${SEASON})\n`);
  const startTime = Date.now();
  const errors = [];

  let standings = [], wildcard = {}, batters = {}, koreanPlayers = [], games = {};

  try {
    standings = await fetchStandings();
    await writeJson('standings.json', standings);
  } catch (err) { errors.push(`standings: ${err.message}`); console.error('❌ 순위 실패:', err.message); }

  try {
    wildcard = buildWildCard(standings);
    await writeJson('wildcard.json', wildcard);
  } catch (err) { errors.push(`wildcard: ${err.message}`); console.error('❌ 와일드카드 실패:', err.message); }

  try {
    batters = await fetchBatters();
    await writeJson('batters.json', batters);
  } catch (err) { errors.push(`batters: ${err.message}`); console.error('❌ 타자 실패:', err.message); }

  try {
    koreanPlayers = await fetchKoreanPlayers();
    await writeJson('korean_players.json', koreanPlayers);
  } catch (err) { errors.push(`korean: ${err.message}`); console.error('❌ 한국선수 실패:', err.message); }

  try {
    games = await fetchGames();
    games = tagKoreanGames(games, koreanPlayers);
    await writeJson('games.json', games);
  } catch (err) { errors.push(`games: ${err.message}`); console.error('❌ 경기 실패:', err.message); }

  // 메타데이터
  const meta = {
    updatedAt: new Date().toISOString(),
    season: SEASON,
    durationMs: Date.now() - startTime,
    errors,
    counts: {
      standings: standings.length,
      koreanPlayers: koreanPlayers.length,
      gamesToday: games.today?.length || 0,
      gamesYesterday: games.yesterday?.length || 0,
    },
  };
  await writeJson('meta.json', meta);

  console.log(`\n✅ 완료 (${(Date.now() - startTime) / 1000}초)`);
  if (errors.length > 0) {
    console.log(`⚠️  ${errors.length}개 섹션 부분 실패: ${errors.join(', ')}`);
    process.exit(0); // 부분 실패도 OK (다른 데이터는 살아있음)
  }
}

main().catch(err => {
  console.error('💥 치명적 오류:', err);
  process.exit(1);
});
