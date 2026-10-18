/**
 * MLB 공식 Stats API 실시간 조회 (2026-10-18)
 *
 * GitHub Actions 수집은 2~3시간 간격이라 경기 점수가 늦게 반영됐다
 * (예: 이미 끝난 ALCS 4차전이 '진행중 1-1'로 표시).
 * statsapi.mlb.com 은 CORS(*)를 허용하므로 앱에서 직접 불러온다.
 * 실패하면 기존 jsDelivr 데이터(fetchGames)로 대체한다.
 */
import { fetchGames, Game } from "./api";

const STATS_API = "https://statsapi.mlb.com/api/v1";

export interface LiveGame extends Game {
  /** 포스트시즌이면 'ALCS 5차전' 같은 라벨 */
  seriesLabel?: string;
  /** 'Series tied 2-2' → '시리즈 2-2 동률' 같은 한국어 요약 */
  seriesResult?: string;
  inningLabel?: string;
}

export interface PostseasonSeries {
  id: string;
  round: string; // 한국어 라운드 이름
  roundOrder: number;
  teamA: { teamId: number | null; name: string; wins: number };
  teamB: { teamId: number | null; name: string; wins: number };
  gamesToWin: number;
  done: boolean;
  nextGameTime?: string;
}

const ROUND_KO: Record<string, [string, number]> = {
  "World Series": ["월드시리즈", 0],
  "AL Championship Series": ["AL 챔피언십(ALCS)", 1],
  "NL Championship Series": ["NL 챔피언십(NLCS)", 1],
  "AL Division Series": ["AL 디비전시리즈", 2],
  "NL Division Series": ["NL 디비전시리즈", 2],
  "AL Wild Card Series": ["AL 와일드카드", 3],
  "NL Wild Card Series": ["NL 와일드카드", 3],
};

const SHORT_KO: Record<string, string> = {
  WS: "월드시리즈",
  ALCS: "ALCS",
  NLCS: "NLCS",
  ALDS: "ALDS",
  NLDS: "NLDS",
  ALWC: "AL 와일드카드",
  NLWC: "NL 와일드카드",
};

async function getJson(url: string, ms = 8000): Promise<any> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

/** 미국 동부 기준 날짜(YYYY-MM-DD). MLB 경기 날짜는 현지(미국) 기준이다. */
function etDate(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function statusCodeOf(g: any): string {
  const s = g?.status?.abstractGameCode || g?.status?.statusCode || "";
  if (s === "F" || g?.status?.abstractGameState === "Final") return "F";
  if (s === "L" || g?.status?.abstractGameState === "Live") return "I";
  return "S";
}

function statusTextOf(g: any): string {
  const st = g?.status?.detailedState || "";
  if (st === "Postponed") return "Postponed";
  const code = statusCodeOf(g);
  if (code === "F") return "Final";
  if (code === "I") return "In Progress";
  return "Scheduled";
}

function seriesResultKo(result?: string): string | undefined {
  if (!result) return undefined;
  // 예: "Series tied 2-2", "TB leads 3-2", "MIL wins 4-1"
  const tied = result.match(/tied (\d+)-(\d+)/i);
  if (tied) return `시리즈 ${tied[1]}-${tied[2]} 동률`;
  const lead = result.match(/^(\S+) leads? (\d+)-(\d+)/i);
  if (lead) return `${lead[1]} ${lead[2]}-${lead[3]} 리드`;
  const win = result.match(/^(\S+) wins? (\d+)-(\d+)/i);
  if (win) return `${win[1]} ${win[2]}-${win[3]} 시리즈 승리`;
  return result;
}

function mapGame(g: any, koreanTeamIds: Set<number>): LiveGame {
  const side = (t: any) => ({
    teamId: t?.team?.id,
    abbr: t?.team?.abbreviation || "",
    kr: "",
    score: typeof t?.score === "number" ? t.score : null,
    wins: t?.leagueRecord?.wins,
    losses: t?.leagueRecord?.losses,
  });
  const home = side(g.teams?.home);
  const away = side(g.teams?.away);
  const ss = g.seriesStatus;
  const isPost = ["F", "D", "L", "W"].includes(g.gameType);
  const ls = g.linescore;
  const code = statusCodeOf(g);
  return {
    gameId: g.gamePk,
    status: statusTextOf(g),
    statusCode: code,
    startTime: g.gameDate,
    home,
    away,
    koreanPlayerTeams: [home.teamId, away.teamId].filter((id) => koreanTeamIds.has(id)),
    seriesLabel: isPost
      ? `${SHORT_KO[ss?.abbreviation] || ss?.shortName || g.seriesDescription || ""} ${g.seriesGameNumber || ss?.gameNumber || ""}차전`.trim()
      : undefined,
    seriesResult: isPost ? seriesResultKo(ss?.result) : undefined,
    inningLabel:
      code === "I" && ls?.currentInning
        ? `${ls.currentInning}회${ls.isTopInning ? "초" : "말"}`
        : undefined,
  };
}

/** 오늘/어제 경기 (미국 날짜 기준). 실패 시 jsDelivr 데이터 사용 */
export async function fetchLiveGames(
  koreanTeamIds: number[] = []
): Promise<{ today: LiveGame[]; yesterday: LiveGame[]; live: boolean }> {
  const kset = new Set(koreanTeamIds);
  try {
    const start = etDate(-1);
    const end = etDate(0);
    const data = await getJson(
      `${STATS_API}/schedule?sportId=1&startDate=${start}&endDate=${end}&hydrate=linescore,seriesStatus`
    );
    const byDate: Record<string, LiveGame[]> = {};
    for (const d of data?.dates || []) {
      byDate[d.date] = (d.games || []).map((g: any) => mapGame(g, kset));
    }
    return { today: byDate[end] || [], yesterday: byDate[start] || [], live: true };
  } catch (e) {
    console.warn("[liveApi] 실시간 경기 조회 실패 → 저장 데이터 사용", e);
    const fb = await fetchGames();
    return { ...fb, live: false };
  }
}

/** 포스트시즌 대진·시리즈 스코어 (10월에만 의미 있음). 실패 시 빈 배열 */
export async function fetchPostseason(season: number): Promise<PostseasonSeries[]> {
  try {
    const data = await getJson(`${STATS_API}/schedule/postseason/series?season=${season}&sportId=1`);
    const out: PostseasonSeries[] = [];
    for (const s of data?.series || []) {
      const games: any[] = s.games || [];
      if (!games.length) continue;
      const first = games[0];
      const [round, roundOrder] = ROUND_KO[first.seriesDescription] || [first.seriesDescription, 9];
      const gamesInSeries = first.gamesInSeries || games.length;
      const gamesToWin = Math.floor(gamesInSeries / 2) + 1;
      const tA = first.teams?.away?.team;
      const tB = first.teams?.home?.team;
      const wins: Record<string, number> = {};
      let next: any = null;
      for (const g of games) {
        const done = statusCodeOf(g) === "F";
        if (done) {
          for (const k of ["home", "away"]) {
            const t = g.teams?.[k];
            if (t?.isWinner) wins[t.team.id] = (wins[t.team.id] || 0) + 1;
          }
        } else if (!next && g.status?.detailedState !== "Postponed") {
          next = g;
        }
      }
      const aw = tA?.id ? wins[tA.id] || 0 : 0;
      const bw = tB?.id ? wins[tB.id] || 0 : 0;
      out.push({
        id: s.series?.id || `${first.seriesDescription}-${tA?.id}-${tB?.id}`,
        round,
        roundOrder,
        teamA: { teamId: typeof tA?.id === "number" ? tA.id : null, name: tA?.name || "미정", wins: aw },
        teamB: { teamId: typeof tB?.id === "number" ? tB.id : null, name: tB?.name || "미정", wins: bw },
        gamesToWin,
        done: aw >= gamesToWin || bw >= gamesToWin,
        nextGameTime: next?.gameDate,
      });
    }
    return out.sort((a, b) => a.roundOrder - b.roundOrder);
  } catch (e) {
    console.warn("[liveApi] 포스트시즌 조회 실패", e);
    return [];
  }
}
