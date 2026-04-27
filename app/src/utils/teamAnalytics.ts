// 응원팀 상세 리포트 분석 (리워드 광고 후 잠금 해제)
import { Standing } from "./api";

export interface TeamReport {
  teamId: number;
  divisionStanding: string;
  recentForm: string;
  insights: string[];
  matchups: { vs: string; record: string }[];
  prediction: string;
}

export function generateTeamReport(teamId: number, standings: Standing[]): TeamReport | null {
  const team = standings.find((s) => s.teamId === teamId);
  if (!team) return null;

  const divisionTeams = standings
    .filter((s) => s.league === team.league && s.division === team.division)
    .sort((a, b) => a.divisionRank - b.divisionRank);

  const aboveTeam = divisionTeams.find((t) => t.divisionRank === team.divisionRank - 1);
  const belowTeam = divisionTeams.find((t) => t.divisionRank === team.divisionRank + 1);

  // 인사이트 자동 생성
  const insights: string[] = [];

  if (team.runDifferential > 20) {
    insights.push(`📈 득실차 +${team.runDifferential}으로 리그 상위권의 강력한 공격력을 보여주고 있어요.`);
  } else if (team.runDifferential < -20) {
    insights.push(`📉 득실차 ${team.runDifferential}로 마운드 보강이 시급한 상황이에요.`);
  } else {
    insights.push(`📊 득실차 ${team.runDifferential >= 0 ? "+" : ""}${team.runDifferential}로 균형 잡힌 경기를 펼치고 있어요.`);
  }

  const last10Wins = parseInt(team.last10.split("-")[0] || "0", 10);
  if (last10Wins >= 7) {
    insights.push(`🔥 최근 10경기 ${team.last10} — 페이스가 매우 좋아요!`);
  } else if (last10Wins <= 3) {
    insights.push(`⚠️ 최근 10경기 ${team.last10} — 분위기 반전이 필요해요.`);
  } else {
    insights.push(`⚖️ 최근 10경기 ${team.last10} — 평이한 흐름이에요.`);
  }

  if (team.streak.startsWith("W") && parseInt(team.streak.slice(1), 10) >= 3) {
    insights.push(`✨ ${team.streak.slice(1)}연승 중! 모멘텀이 살아있어요.`);
  } else if (team.streak.startsWith("L") && parseInt(team.streak.slice(1), 10) >= 3) {
    insights.push(`😰 ${team.streak.slice(1)}연패 중. 빠른 분위기 전환이 필요해요.`);
  }

  if (team.divisionRank === 1) {
    insights.push(`👑 지구 1위! 와일드카드와 무관하게 직행 가능한 위치예요.`);
  } else if (team.divisionRank <= 3) {
    insights.push(`🎯 지구 ${team.divisionRank}위. 와일드카드 진출권에 근접해 있어요.`);
  }

  // 예측
  let prediction = "";
  if (team.winningPct >= 0.6) {
    prediction = "현재 페이스가 시즌 끝까지 유지된다면 포스트시즌 진출이 유력해요. 부상 관리가 핵심 변수예요.";
  } else if (team.winningPct >= 0.5) {
    prediction = "5할 이상의 페이스로 와일드카드 경쟁권에 있어요. 지구 라이벌과의 맞대결이 시즌을 좌우할 거예요.";
  } else {
    prediction = "현재 페이스로는 포스트시즌이 어려운 상황이에요. 트레이드 마감일까지의 보강이 시즌 운명을 결정할 거예요.";
  }

  return {
    teamId,
    divisionStanding:
      team.divisionRank === 1
        ? `${team.division === "East" ? "동부" : team.division === "Central" ? "중부" : "서부"}지구 1위, 2위 ${
            belowTeam?.krName || "-"
          }와 ${Math.abs(team.gamesBack - (belowTeam?.gamesBack || 0)).toFixed(1)}게임차`
        : `${team.division === "East" ? "동부" : team.division === "Central" ? "중부" : "서부"}지구 ${
            team.divisionRank
          }위, 1위 ${divisionTeams[0].krName}와 ${team.gamesBack.toFixed(1)}게임차`,
    recentForm: `${team.last10} (최근 10경기) · 현재 ${team.streak}`,
    insights,
    matchups: [
      { vs: "지구 라이벌", record: aboveTeam ? `${aboveTeam.krName}와 ${(team.gamesBack - aboveTeam.gamesBack).toFixed(1)}게임차` : "최상위" },
      { vs: "와일드카드 경쟁", record: team.wildCardGamesBack === 0 ? "와일드카드권" : `${team.wildCardGamesBack.toFixed(1)}게임 뒤` },
    ],
    prediction,
  };
}
