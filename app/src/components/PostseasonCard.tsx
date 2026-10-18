import { useEffect, useState } from "react";
import { fetchPostseason, PostseasonSeries } from "../utils/liveApi";
import { TEAM_BY_ID } from "../data/teams";
import { TeamBadge } from "./TeamBadge";

/**
 * 🏆 포스트시즌 대진 카드 (2026-10-18 추가)
 * - MLB 공식 API에서 시리즈별 승수를 실시간으로 계산해 보여준다.
 * - 포스트시즌이 아닐 때(시리즈 없음)는 아무것도 그리지 않는다.
 */
export function PostseasonCard({ season }: { season: number }) {
  const [series, setSeries] = useState<PostseasonSeries[] | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchPostseason(season).then((s) => alive && setSeries(s));
    return () => {
      alive = false;
    };
  }, [season]);

  if (!series || series.length === 0) return null;

  // 진행 중인 라운드(가장 위 라운드)부터 보여주고, 끝난 라운드는 '더보기'로
  const topOrder = Math.min(...series.map((s) => s.roundOrder));
  const ongoing = series.filter((s) => s.roundOrder <= topOrder + 1);
  const visible = showAll ? series : ongoing;

  return (
    <section className="mx-4 mt-2 mb-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900">🏆 {season} 포스트시즌</h2>
        <span className="text-[10px] text-gray-400">MLB 공식 실시간</span>
      </div>
      <div className="divide-y divide-gray-100">
        {visible.map((s) => (
          <SeriesRow key={s.id} s={s} />
        ))}
      </div>
      {series.length > ongoing.length && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="w-full py-2.5 text-xs font-semibold text-mlbBlue bg-gray-50"
        >
          {showAll ? "접기" : `지난 라운드 결과 보기 (${series.length - ongoing.length})`}
        </button>
      )}
    </section>
  );
}

function SeriesRow({ s }: { s: PostseasonSeries }) {
  const status = (() => {
    if (s.done) {
      const w = s.teamA.wins > s.teamB.wins ? s.teamA : s.teamB;
      return `${nameOf(w.teamId, w.name)} 진출`;
    }
    if (s.teamA.wins === 0 && s.teamB.wins === 0) {
      return s.nextGameTime ? `${kst(s.nextGameTime)} 시작` : "예정";
    }
    if (s.teamA.wins === s.teamB.wins) return `${s.teamA.wins}-${s.teamB.wins} 동률`;
    const lead = s.teamA.wins > s.teamB.wins ? s.teamA : s.teamB;
    return `${nameOf(lead.teamId, lead.name)} ${Math.max(s.teamA.wins, s.teamB.wins)}-${Math.min(s.teamA.wins, s.teamB.wins)} 리드`;
  })();

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-bold text-mlbRed">{s.round}</span>
        <span className="text-[11px] text-gray-500">
          {status}
          {!s.done && s.nextGameTime && (s.teamA.wins > 0 || s.teamB.wins > 0) ? ` · 다음 ${kst(s.nextGameTime)}` : ""}
        </span>
      </div>
      <TeamLine teamId={s.teamA.teamId} name={s.teamA.name} wins={s.teamA.wins} win={s.done && s.teamA.wins > s.teamB.wins} />
      <TeamLine teamId={s.teamB.teamId} name={s.teamB.name} wins={s.teamB.wins} win={s.done && s.teamB.wins > s.teamA.wins} />
    </div>
  );
}

function TeamLine({ teamId, name, wins, win }: { teamId: number | null; name: string; wins: number; win: boolean }) {
  const known = teamId !== null && TEAM_BY_ID[teamId];
  return (
    <div className="flex items-center gap-2 py-0.5">
      {known ? <TeamBadge teamId={teamId!} size="sm" /> : <div className="w-6 h-6 rounded-full bg-gray-200" />}
      <span className={`text-sm flex-1 ${win ? "font-bold text-gray-900" : "text-gray-700"}`}>{nameOf(teamId, name)}</span>
      <span className={`text-base tabular-nums ${win ? "font-extrabold text-gray-900" : "font-semibold text-gray-500"}`}>{wins}</span>
    </div>
  );
}

function nameOf(teamId: number | null, fallback: string): string {
  if (teamId !== null && TEAM_BY_ID[teamId]) return TEAM_BY_ID[teamId].shortName;
  return fallback.replace(/\//g, " / ") + " 승자";
}

function kst(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}
