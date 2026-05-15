// 응원팀 상세 리포트 — 세이버메트릭스 기반 분석
// Bill James 피타고리안 승률(보정 지수 1.83) + 162경기 페이스 + 득실 컨텍스트
import { Standing } from "./api";

export interface SabermetricsReport {
  pythagoreanPct: string;        // ".525"
  expectedWins: number;
  expectedLosses: number;
  luckDelta: number;             // 실제 - 예상 (양수=클러치, 음수=운빨없음)
  luckLabel: string;
  paceWins: number;              // 162경기 환산
  paceLosses: number;
  paceLabel: string;
  runsPerGame: string;
  runsAllowedPerGame: string;
  runDiffPerGame: string;
  runDiffPerGameLabel: string;
}

export interface MatchupItem {
  vs: string;
  record: string;
  tone: "good" | "neutral" | "bad";
}

export interface TeamReport {
  teamId: number;
  divisionStanding: string;
  recentForm: string;
  sabermetrics: SabermetricsReport;
  insights: string[];
  matchups: MatchupItem[];
  prediction: string;
}

function divisionLabel(d: "East" | "Central" | "West"): string {
  return d === "East" ? "동부" : d === "Central" ? "중부" : "서부";
}

// Bill James Pythagorean expectation (Tango 보정 지수 1.83)
function pythagoreanWinPct(rs: number, ra: number): number {
  if (rs <= 0 && ra <= 0) return 0.5;
  const e = 1.83;
  return Math.pow(rs, e) / (Math.pow(rs, e) + Math.pow(ra, e));
}

// 소수점 첫 0 제거 (.524 형식)
function fmtPct(pct: number): string {
  const s = pct.toFixed(3);
  return s.startsWith("0") ? s.slice(1) : s;
}

export function generateTeamReport(teamId: number, standings: Standing[]): TeamReport | null {
  const team = standings.find((s) => s.teamId === teamId);
  if (!team) return null;

  const divisionTeams = standings
    .filter((s) => s.league === team.league && s.division === team.division)
    .sort((a, b) => a.divisionRank - b.divisionRank);

  const games = team.wins + team.losses;
  const divName = divisionLabel(team.division);

  // ─── 1) 세이버메트릭스 ───
  const pythPct = pythagoreanWinPct(team.runsScored, team.runsAllowed);
  const expectedWins = Math.round(pythPct * games);
  const expectedLosses = games - expectedWins;
  const luckDelta = team.wins - expectedWins;

  let luckLabel: string;
  if (luckDelta >= 3) {
    luckLabel = `예상보다 +${luckDelta}승 · 접전·1점차 게임에서 강한 모습`;
  } else if (luckDelta <= -3) {
    luckLabel = `예상보다 ${luckDelta}승 · 운이 따라주지 않는 중, 평균회귀로 반등 여지`;
  } else {
    luckLabel = `예상-실제 차이 ${Math.abs(luckDelta)}승 · 실력대로의 흐름`;
  }

  const paceWins = Math.round((team.wins / games) * 162);
  const paceLosses = 162 - paceWins;
  let paceLabel: string;
  if (paceWins >= 95) paceLabel = "지구 우승·1번 시드 경쟁권";
  else if (paceWins >= 88) paceLabel = "포스트시즌 진출 유력";
  else if (paceWins >= 82) paceLabel = "와일드카드 컷오프 경쟁권";
  else if (paceWins >= 75) paceLabel = "컷오프 부근, 분발 필요";
  else paceLabel = "포스트시즌 어려움, 재정비 시기";

  const rsPerGame = team.runsScored / games;
  const raPerGame = team.runsAllowed / games;
  const rdPerGame = rsPerGame - raPerGame;

  let rdLabel: string;
  if (rdPerGame > 1) rdLabel = "리그 상위권 압도력";
  else if (rdPerGame > 0.3) rdLabel = "확실한 우위";
  else if (rdPerGame > -0.3) rdLabel = "박빙";
  else if (rdPerGame > -1) rdLabel = "구조적 열세";
  else rdLabel = "하위권 페이스";

  const sabermetrics: SabermetricsReport = {
    pythagoreanPct: fmtPct(pythPct),
    expectedWins,
    expectedLosses,
    luckDelta,
    luckLabel,
    paceWins,
    paceLosses,
    paceLabel,
    runsPerGame: rsPerGame.toFixed(2),
    runsAllowedPerGame: raPerGame.toFixed(2),
    runDiffPerGame: (rdPerGame >= 0 ? "+" : "") + rdPerGame.toFixed(2),
    runDiffPerGameLabel: rdLabel,
  };

  // ─── 2) 인사이트 ───
  const insights: string[] = [];
  const LG_AVG_RPG = 4.5; // MLB 평균 추정치

  // (a) 공수 균형 진단
  if (rsPerGame >= LG_AVG_RPG + 0.5 && raPerGame <= LG_AVG_RPG - 0.3) {
    insights.push(
      `⚔️ 공격 ${rsPerGame.toFixed(2)} · 수비 ${raPerGame.toFixed(2)} — 양면에서 리그 평균을 능가하는 균형형 강팀.`
    );
  } else if (rsPerGame >= LG_AVG_RPG + 0.5) {
    insights.push(
      `💥 공격은 평균 이상(${rsPerGame.toFixed(2)})인데 실점 ${raPerGame.toFixed(
        2
      )} — 마운드 한 명 보강이 시즌 전체 그림을 바꿀 수 있는 구조.`
    );
  } else if (raPerGame <= LG_AVG_RPG - 0.3) {
    insights.push(
      `🧱 실점 ${raPerGame.toFixed(2)}로 마운드는 견고한데 득점 ${rsPerGame.toFixed(
        2
      )} — 점수 짜내기에 어려움, 클러치 타격이 시즌 후반을 가를 변수.`
    );
  } else {
    insights.push(
      `📊 경기당 ${rsPerGame.toFixed(2)}득 ${raPerGame.toFixed(
        2
      )}실 — 공수 모두 평균 부근, 결국 디테일과 클럽하우스 안정성이 시즌을 가를 거예요.`
    );
  }

  // (b) 피타고리안 vs 실적 (운빨 분석)
  if (luckDelta >= 3) {
    insights.push(
      `🎲 득실차 기준 예상 .${(pythPct * 1000).toFixed(0)} < 실제 .${(team.winningPct * 1000).toFixed(
        0
      )} — 접전에서 +${luckDelta}승 더 챙기는 중. 클러치 능력이거나 행운, 후반전 평균회귀 위험은 염두에 둘 것.`
    );
  } else if (luckDelta <= -3) {
    insights.push(
      `🎲 예상 .${(pythPct * 1000).toFixed(0)} > 실제 .${(team.winningPct * 1000).toFixed(
        0
      )} — ${Math.abs(luckDelta)}승만큼 손해 보고 있는 상황. 득실차 자체는 나쁘지 않아 후반 반등 가능성 있어요.`
    );
  } else {
    insights.push(
      `🎯 피타고리안 .${(pythPct * 1000).toFixed(0)} ≈ 실제 .${(team.winningPct * 1000).toFixed(
        0
      )} — 운빨 거의 없이 실력대로의 결과. 페이스가 시즌 끝까지 비슷하게 갈 가능성 높음.`
    );
  }

  // (c) 최근 10 vs 시즌
  const last10Wins = parseInt(team.last10.split("-")[0] || "0", 10);
  const last10Losses = 10 - last10Wins;
  const last10Pct = last10Wins / 10;
  const seasonPct = team.winningPct;
  const pctGap = last10Pct - seasonPct;

  if (pctGap >= 0.2) {
    insights.push(
      `🚀 최근 10경기 ${last10Wins}-${last10Losses} (.${(last10Pct * 1000).toFixed(
        0
      )}) — 시즌 평균(.${(seasonPct * 1000).toFixed(
        0
      )})보다 폭발적 상승. 트레이드 마감 전 컨텐더 분위기 조성 중.`
    );
  } else if (pctGap <= -0.2) {
    insights.push(
      `🩹 최근 10경기 ${last10Wins}-${last10Losses} (.${(last10Pct * 1000).toFixed(
        0
      )}) — 시즌 평균(.${(seasonPct * 1000).toFixed(
        0
      )})에서 급추락. 7월 31일 마감일 전까지의 흐름 회복이 시즌 분수령.`
    );
  } else {
    insights.push(
      `📈 최근 10경기 ${last10Wins}-${last10Losses} — 시즌 페이스와 거의 동일, 안정적 흐름 유지 중.`
    );
  }

  // (d) 연속 흐름 (의미있을 때만)
  const streakMatch = team.streak?.match(/^([WL])(\d+)/);
  if (streakMatch) {
    const isWin = streakMatch[1] === "W";
    const n = parseInt(streakMatch[2], 10);
    if (isWin && n >= 5) {
      insights.push(`🔥 ${n}연승 진행 중 — 시즌의 결정적 모멘텀. 라이벌과 격차 벌릴 절호의 시기.`);
    } else if (isWin && n >= 3) {
      insights.push(`✨ ${n}연승 — 클럽하우스 분위기 살아있어요.`);
    } else if (!isWin && n >= 5) {
      insights.push(
        `🆘 ${n}연패 진행 중 — 라인업·로테이션 점검 신호. 신인 콜업 또는 코치진 교체 카드까지 거론될 수 있는 위험 구간.`
      );
    } else if (!isWin && n >= 3) {
      insights.push(`⚠️ ${n}연패 — 분위기 반전 카드가 절실한 시점.`);
    }
  }

  // (e) 포지셔닝 (지구 / 와일드카드)
  if (team.divisionRank === 1) {
    const second = divisionTeams[1];
    const gap = second ? Math.abs(second.gamesBack - team.gamesBack) : 0;
    if (gap >= 6) {
      insights.push(`👑 ${divName}지구 1위, 2위와 ${gap.toFixed(1)}게임 차 — 안정적 리드, 매직넘버 점진적 감소 구간.`);
    } else if (gap >= 2) {
      insights.push(
        `👑 ${divName}지구 1위지만 2위와 ${gap.toFixed(1)}게임 차 — 추격 사정권, 직접 맞대결 시리즈가 분수령.`
      );
    } else {
      insights.push(
        `👑 ${divName}지구 1위, 2위와 ${gap.toFixed(1)}게임 차 — 사실상 공동선두, 한 시리즈로 뒤집힐 박빙 구도.`
      );
    }
  } else if (team.divisionRank <= 3 && team.gamesBack <= 5) {
    insights.push(
      `🎯 지구 ${team.divisionRank}위 · 1위와 ${team.gamesBack.toFixed(
        1
      )}게임 차 — sweep 한 번이면 단번에 뒤집을 수 있는 사정권.`
    );
  } else if (team.wildCardGamesBack <= 3 && team.divisionRank > 1) {
    insights.push(
      `🎫 WC 컷오프와 ${team.wildCardGamesBack.toFixed(
        1
      )}게임 차 — 지구 우승 어려워도 와일드카드 진출권 안에 있는 안전권.`
    );
  } else if (team.wildCardGamesBack >= 8 && team.divisionRank > 1) {
    insights.push(
      `📉 WC 컷오프와 ${team.wildCardGamesBack.toFixed(
        1
      )}게임 차 — 7월 31일 마감일에 셀러로 돌아설 가능성이 거론될 위치.`
    );
  }

  // ─── 3) 매치업 ───
  const matchups: MatchupItem[] = [];
  if (team.divisionRank === 1) {
    const second = divisionTeams[1];
    if (second) {
      const gap = Math.abs(second.gamesBack - team.gamesBack);
      matchups.push({
        vs: `2위 ${second.krName}`,
        record: `${gap.toFixed(1)}게임 앞`,
        tone: gap >= 5 ? "good" : "neutral",
      });
    }
  } else {
    const leader = divisionTeams[0];
    matchups.push({
      vs: `1위 ${leader.krName}`,
      record: `${team.gamesBack.toFixed(1)}게임 뒤`,
      tone: team.gamesBack <= 3 ? "good" : team.gamesBack >= 10 ? "bad" : "neutral",
    });
  }

  const aboveTeam = divisionTeams.find((t) => t.divisionRank === team.divisionRank - 1);
  const belowTeam = divisionTeams.find((t) => t.divisionRank === team.divisionRank + 1);

  if (aboveTeam && team.divisionRank > 1) {
    matchups.push({
      vs: `${team.divisionRank - 1}위 ${aboveTeam.krName}`,
      record: `${(team.gamesBack - aboveTeam.gamesBack).toFixed(1)}게임 뒤`,
      tone: "neutral",
    });
  }
  if (belowTeam) {
    const gap = Math.abs(belowTeam.gamesBack - team.gamesBack);
    matchups.push({
      vs: `${team.divisionRank + 1}위 ${belowTeam.krName}`,
      record: `${gap.toFixed(1)}게임 앞`,
      tone: "neutral",
    });
  }

  if (team.divisionRank > 1) {
    if (team.wildCardGamesBack === 0) {
      matchups.push({ vs: "WC 3번 시드", record: "진출권 안", tone: "good" });
    } else {
      matchups.push({
        vs: "WC 3번 시드",
        record: `${team.wildCardGamesBack.toFixed(1)}게임 뒤`,
        tone: team.wildCardGamesBack <= 3 ? "good" : team.wildCardGamesBack >= 8 ? "bad" : "neutral",
      });
    }
  }

  // ─── 4) 전망 ───
  let prediction: string;
  if (paceWins >= 95) {
    prediction = `현재 ${paceWins}승 페이스라면 지구 우승은 물론 리그 1번 시드까지 노릴 수 있는 강팀. 부상자 관리와 9월 로테이션 조율이 포스트시즌 성패를 가를 핵심 변수예요.`;
  } else if (paceWins >= 88) {
    prediction = `${paceWins}승이면 포스트시즌 진출 가능성이 매우 높지만, 지구 1위와의 맞대결 시리즈에서 결과가 갈릴 거예요. ${
      luckDelta < -2
        ? "운빨 마이너스 분량만큼 후반 반등 여력이 있고요."
        : "7월 트레이드 데드라인에서 마운드 보강 한 명이 결정타가 될 수 있어요."
    }`;
  } else if (paceWins >= 82) {
    prediction = `${paceWins}승 페이스로 와일드카드 컷오프(보통 84~86승) 부근. 같은 리그 내 비슷한 페이스의 5~6팀이 마지막 한 장을 두고 경쟁 중. 한 번의 winning streak이 시즌을 살리고, 한 번의 슬럼프가 시즌을 끝낼 수 있는 박빙 구간.`;
  } else if (paceWins >= 75) {
    prediction = `${paceWins}승 페이스는 컷오프에 부족. 7월 31일 마감일 전까지 .${(seasonPct * 1000).toFixed(
      0
    )} 이상으로 끌어올리지 못하면 셀러 모드로 돌아설 가능성. ${
      luckDelta < -2 ? "다만 피타고리안은 페이스보다 높아 운만 따라주면 반등 여지." : ""
    }`;
  } else {
    prediction = `${paceWins}승 페이스로 포스트시즌은 사실상 어려운 상황. ${
      rdPerGame < -0.8
        ? `경기당 ${Math.abs(rdPerGame).toFixed(2)}점씩 밀리는 구조적 약점이 있어 보강이 필수.`
        : "득실차는 페이스에 비해 나쁘지 않아 운이 따라주면 후반 반등 여지."
    } 트레이드 마감일에 베테랑 매각 + 유망주 수확 시나리오가 합리적.`;
  }

  // ─── 정리 ───
  return {
    teamId,
    divisionStanding:
      team.divisionRank === 1
        ? `${divName}지구 1위 · ${team.wins}승 ${team.losses}패 (.${(team.winningPct * 1000).toFixed(0)})`
        : `${divName}지구 ${team.divisionRank}위 · ${team.wins}승 ${team.losses}패 (.${(
            team.winningPct * 1000
          ).toFixed(0)}) · 1위 ${divisionTeams[0].krName}와 ${team.gamesBack.toFixed(1)}게임차`,
    recentForm: `최근 10경기 ${team.last10}${team.streak ? ` · ${team.streak}` : ""}`,
    sabermetrics,
    insights,
    matchups,
    prediction,
  };
}
