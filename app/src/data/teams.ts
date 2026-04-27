// MLB 30개 팀 메타데이터 (색상, 약어, 한글명)
// teamId는 MLB Stats API teamId

export interface MlbTeam {
  id: number;
  abbr: string;
  name: string;       // 영문 정식명
  krName: string;     // 한글명
  shortName: string;  // 짧은 한글명 (UI용)
  league: "AL" | "NL";
  division: "East" | "Central" | "West";
  color: string;      // 메인 컬러
  emoji: string;
}

export const MLB_TEAMS: MlbTeam[] = [
  // AL East
  { id: 110, abbr: "BAL", name: "Baltimore Orioles",     krName: "볼티모어 오리올스",   shortName: "볼티모어",     league: "AL", division: "East",    color: "#DF4601", emoji: "🟧" },
  { id: 111, abbr: "BOS", name: "Boston Red Sox",        krName: "보스턴 레드삭스",     shortName: "보스턴",       league: "AL", division: "East",    color: "#BD3039", emoji: "🟥" },
  { id: 147, abbr: "NYY", name: "New York Yankees",      krName: "뉴욕 양키스",         shortName: "양키스",       league: "AL", division: "East",    color: "#003087", emoji: "🟦" },
  { id: 139, abbr: "TB",  name: "Tampa Bay Rays",        krName: "탬파베이 레이스",     shortName: "탬파베이",     league: "AL", division: "East",    color: "#092C5C", emoji: "🌊" },
  { id: 141, abbr: "TOR", name: "Toronto Blue Jays",     krName: "토론토 블루제이스",   shortName: "토론토",       league: "AL", division: "East",    color: "#134A8E", emoji: "🐦" },
  // AL Central
  { id: 145, abbr: "CWS", name: "Chicago White Sox",     krName: "시카고 화이트삭스",   shortName: "화이트삭스",   league: "AL", division: "Central", color: "#27251F", emoji: "⚪" },
  { id: 114, abbr: "CLE", name: "Cleveland Guardians",   krName: "클리블랜드 가디언스", shortName: "클리블랜드",   league: "AL", division: "Central", color: "#00385D", emoji: "🛡️" },
  { id: 116, abbr: "DET", name: "Detroit Tigers",        krName: "디트로이트 타이거스", shortName: "디트로이트",   league: "AL", division: "Central", color: "#0C2340", emoji: "🐅" },
  { id: 118, abbr: "KC",  name: "Kansas City Royals",    krName: "캔자스시티 로열스",   shortName: "캔자스시티",   league: "AL", division: "Central", color: "#004687", emoji: "👑" },
  { id: 142, abbr: "MIN", name: "Minnesota Twins",       krName: "미네소타 트윈스",     shortName: "미네소타",     league: "AL", division: "Central", color: "#002B5C", emoji: "🅼" },
  // AL West
  { id: 117, abbr: "HOU", name: "Houston Astros",        krName: "휴스턴 애스트로스",   shortName: "휴스턴",       league: "AL", division: "West",    color: "#EB6E1F", emoji: "🚀" },
  { id: 108, abbr: "LAA", name: "Los Angeles Angels",    krName: "LA 에인절스",         shortName: "에인절스",     league: "AL", division: "West",    color: "#BA0021", emoji: "👼" },
  { id: 133, abbr: "ATH", name: "Athletics",             krName: "애슬레틱스",           shortName: "애슬레틱스",   league: "AL", division: "West",    color: "#003831", emoji: "🅰️" },
  { id: 136, abbr: "SEA", name: "Seattle Mariners",      krName: "시애틀 매리너스",     shortName: "시애틀",       league: "AL", division: "West",    color: "#0C2C56", emoji: "⚓" },
  { id: 140, abbr: "TEX", name: "Texas Rangers",         krName: "텍사스 레인저스",     shortName: "텍사스",       league: "AL", division: "West",    color: "#003278", emoji: "🤠" },
  // NL East
  { id: 144, abbr: "ATL", name: "Atlanta Braves",        krName: "애틀랜타 브레이브스", shortName: "애틀랜타",     league: "NL", division: "East",    color: "#CE1141", emoji: "🪶" },
  { id: 146, abbr: "MIA", name: "Miami Marlins",         krName: "마이애미 말린스",     shortName: "마이애미",     league: "NL", division: "East",    color: "#00A3E0", emoji: "🐟" },
  { id: 121, abbr: "NYM", name: "New York Mets",         krName: "뉴욕 메츠",           shortName: "메츠",         league: "NL", division: "East",    color: "#002D72", emoji: "🟦" },
  { id: 143, abbr: "PHI", name: "Philadelphia Phillies", krName: "필라델피아 필리스",   shortName: "필라델피아",   league: "NL", division: "East",    color: "#E81828", emoji: "🔔" },
  { id: 120, abbr: "WSH", name: "Washington Nationals",  krName: "워싱턴 내셔널스",     shortName: "워싱턴",       league: "NL", division: "East",    color: "#AB0003", emoji: "🇺🇸" },
  // NL Central
  { id: 112, abbr: "CHC", name: "Chicago Cubs",          krName: "시카고 컵스",         shortName: "컵스",         league: "NL", division: "Central", color: "#0E3386", emoji: "🐻" },
  { id: 113, abbr: "CIN", name: "Cincinnati Reds",       krName: "신시내티 레즈",       shortName: "신시내티",     league: "NL", division: "Central", color: "#C6011F", emoji: "🟥" },
  { id: 158, abbr: "MIL", name: "Milwaukee Brewers",     krName: "밀워키 브루어스",     shortName: "밀워키",       league: "NL", division: "Central", color: "#12284B", emoji: "🍺" },
  { id: 134, abbr: "PIT", name: "Pittsburgh Pirates",    krName: "피츠버그 파이리츠",   shortName: "피츠버그",     league: "NL", division: "Central", color: "#FDB827", emoji: "🏴‍☠️" },
  { id: 138, abbr: "STL", name: "St. Louis Cardinals",   krName: "세인트루이스 카디널스", shortName: "세인트루이스", league: "NL", division: "Central", color: "#C41E3A", emoji: "🐦" },
  // NL West
  { id: 109, abbr: "ARI", name: "Arizona Diamondbacks",  krName: "애리조나 다이아몬드백스", shortName: "애리조나",   league: "NL", division: "West",    color: "#A71930", emoji: "🐍" },
  { id: 115, abbr: "COL", name: "Colorado Rockies",      krName: "콜로라도 로키스",     shortName: "콜로라도",     league: "NL", division: "West",    color: "#33006F", emoji: "⛰️" },
  { id: 119, abbr: "LAD", name: "Los Angeles Dodgers",   krName: "LA 다저스",           shortName: "다저스",       league: "NL", division: "West",    color: "#005A9C", emoji: "🔵" },
  { id: 135, abbr: "SD",  name: "San Diego Padres",      krName: "샌디에이고 파드리스", shortName: "샌디에이고",   league: "NL", division: "West",    color: "#2F241D", emoji: "🟫" },
  { id: 137, abbr: "SF",  name: "San Francisco Giants",  krName: "샌프란시스코 자이언츠", shortName: "샌프란시스코", league: "NL", division: "West",    color: "#FD5A1E", emoji: "🟧" },
];

export const TEAM_BY_ID: Record<number, MlbTeam> = Object.fromEntries(
  MLB_TEAMS.map((t) => [t.id, t])
);

export const DIVISIONS: { league: "AL" | "NL"; division: "East" | "Central" | "West"; label: string }[] = [
  { league: "AL", division: "East", label: "AL 동부" },
  { league: "AL", division: "Central", label: "AL 중부" },
  { league: "AL", division: "West", label: "AL 서부" },
  { league: "NL", division: "East", label: "NL 동부" },
  { league: "NL", division: "Central", label: "NL 중부" },
  { league: "NL", division: "West", label: "NL 서부" },
];
