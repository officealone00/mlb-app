/**
 * 데이터 페치 유틸
 *
 * ⚠️ 중요 학습:
 * KBO 앱에서 상대 경로(`data/standings.json`) 쓰니까 번들 폴백만 읽혀서 stale 데이터 표시됨.
 * 반드시 jsdelivr CDN 절대 URL 사용해야 함.
 */

const CONFIG = {
  githubUser: "officealone00",
  repo: "mlb-app",
  branch: "main",
};

// jsdelivr CDN을 통해 GitHub raw 파일 서빙 (글로벌 캐시, 빠름)
const BASE_URL = `https://cdn.jsdelivr.net/gh/${CONFIG.githubUser}/${CONFIG.repo}@${CONFIG.branch}/data`;

// 폴백: 번들된 시드 데이터 (네트워크 실패 시 사용)
import FALLBACK_STANDINGS from "../../../data/standings.json";
import FALLBACK_WILDCARD from "../../../data/wildcard.json";
import FALLBACK_BATTERS from "../../../data/batters.json";
import FALLBACK_KOREAN_PLAYERS from "../../../data/korean_players.json";
import FALLBACK_GAMES from "../../../data/games.json";
import FALLBACK_META from "../../../data/meta.json";

async function fetchWithRetry<T>(url: string, fallback: T, retries = 2): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      // 캐시 우회 위해 ?t={timestamp} 파라미터 추가
      const res = await fetch(`${url}?t=${Math.floor(Date.now() / 60000)}`, {
        cache: "no-cache",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`[api] fetch ${url} 시도 ${i + 1} 실패:`, err);
      if (i === retries - 1) {
        console.warn(`[api] fallback 데이터 사용`);
        return fallback;
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  return fallback;
}

export interface Standing {
  teamId: number;
  abbr: string;
  name: string;
  krName: string;
  league: "AL" | "NL";
  division: "East" | "Central" | "West";
  divisionRank: number;
  leagueRank: number;
  wins: number;
  losses: number;
  winningPct: number;
  gamesBack: number;
  wildCardGamesBack: number;
  runsScored: number;
  runsAllowed: number;
  runDifferential: number;
  streak: string;
  last10: string;
}

export interface WildCardEntry extends Standing {
  wildCardRank: number;
  inWildCard: boolean;
}

export interface BatterLeader {
  rank: number;
  playerId: number;
  playerName: string;
  teamId: number;
  teamAbbr: string;
  value: string;
}

export interface KoreanPlayer {
  playerId: number;
  enName: string;
  krName: string;
  type: "korean" | "korean_heritage";
  position: string;
  teamId: number;
  teamAbbr: string;
  teamKrName: string;
  stats: {
    hitting: HittingStats | null;
    pitching: PitchingStats | null;
  };
}

export interface HittingStats {
  games: number;
  atBats: number;
  hits: number;
  homeRuns: number;
  rbi: number;
  stolenBases: number;
  avg: string;
  obp: string;
  slg: string;
  ops: string;
}

export interface PitchingStats {
  wins: number;
  losses: number;
  era: string;
  gamesPlayed: number;
  gamesStarted: number;
  inningsPitched: string;
  strikeouts: number;
  whip: string;
  saves: number;
}

export interface Game {
  gameId: number;
  status: string;
  statusCode: string;
  startTime: string;
  home: GameTeam;
  away: GameTeam;
  koreanPlayerTeams: number[];
}

export interface GameTeam {
  teamId: number;
  abbr: string;
  kr: string;
  score: number | null;
  wins?: number;
  losses?: number;
}

export const fetchStandings = () =>
  fetchWithRetry<Standing[]>(`${BASE_URL}/standings.json`, FALLBACK_STANDINGS as Standing[]);

export const fetchWildCard = () =>
  fetchWithRetry<{ AL: WildCardEntry[]; NL: WildCardEntry[] }>(
    `${BASE_URL}/wildcard.json`,
    FALLBACK_WILDCARD as { AL: WildCardEntry[]; NL: WildCardEntry[] }
  );

export const fetchBatters = () =>
  fetchWithRetry<{ avg: BatterLeader[]; hr: BatterLeader[]; rbi: BatterLeader[]; sb: BatterLeader[] }>(
    `${BASE_URL}/batters.json`,
    FALLBACK_BATTERS as { avg: BatterLeader[]; hr: BatterLeader[]; rbi: BatterLeader[]; sb: BatterLeader[] }
  );

export const fetchKoreanPlayers = () =>
  fetchWithRetry<KoreanPlayer[]>(`${BASE_URL}/korean_players.json`, FALLBACK_KOREAN_PLAYERS as KoreanPlayer[]);

export const fetchGames = () =>
  fetchWithRetry<{ today: Game[]; yesterday: Game[] }>(
    `${BASE_URL}/games.json`,
    FALLBACK_GAMES as { today: Game[]; yesterday: Game[] }
  );

export const fetchMeta = () =>
  fetchWithRetry<{ updatedAt: string; season: number; counts: any }>(
    `${BASE_URL}/meta.json`,
    FALLBACK_META as any
  );
