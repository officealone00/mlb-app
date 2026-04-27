// 사용자 응원팀 저장 (localStorage)
const KEY = "mlb_favorite_team";

export function getFavoriteTeam(): number | null {
  try {
    const v = localStorage.getItem(KEY);
    return v ? parseInt(v, 10) : null;
  } catch {
    return null;
  }
}

export function setFavoriteTeam(teamId: number): void {
  try {
    localStorage.setItem(KEY, String(teamId));
  } catch {
    /* no-op */
  }
}

export function clearFavoriteTeam(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* no-op */
  }
}

// 광고 시청 카운터 (전면 광고 5탭 주기)
const VIEW_COUNT_KEY = "mlb_view_count";

export function incrementViewCount(): number {
  try {
    const v = parseInt(localStorage.getItem(VIEW_COUNT_KEY) || "0", 10) + 1;
    localStorage.setItem(VIEW_COUNT_KEY, String(v));
    return v;
  } catch {
    return 0;
  }
}

export function shouldShowInterstitial(): boolean {
  const v = incrementViewCount();
  return v > 0 && v % 5 === 0;
}
