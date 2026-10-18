import { useEffect, useState } from "react";
import { fetchKoreanPlayers } from "../utils/api";
import { fetchLiveGames, LiveGame } from "../utils/liveApi";
import { TEAM_BY_ID } from "../data/teams";
import { TeamBadge } from "../components/TeamBadge";
import { BannerAd } from "../components/BannerAd";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { ErrorState } from "../components/ErrorState";

export function GamesPage() {
  const [data, setData] = useState<{ today: LiveGame[]; yesterday: LiveGame[]; live: boolean } | null>(null);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<"today" | "yesterday">("today");

  // (2026-10-18) MLB 공식 API에서 실시간으로 불러온다 — 저장 데이터는 2~3시간 늦어 점수가 틀렸음
  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = async () => {
      try {
        const kp = await fetchKoreanPlayers().catch(() => []);
        const ids = (kp as any[]).map((p) => p.teamId).filter(Boolean);
        const d = await fetchLiveGames(ids);
        if (!alive) return;
        setData(d);
        // 진행 중인 경기가 있으면 1분마다 점수 갱신
        const hasLive = [...d.today, ...d.yesterday].some((g) => g.statusCode === "I");
        if (hasLive) timer = setTimeout(load, 60000);
      } catch {
        if (alive) setError(true);
      }
    };
    load();
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (error) return <ErrorState onRetry={() => window.location.reload()} />;
  if (!data) return <LoadingSkeleton rows={6} />;

  const games = data[tab];
  // 한국 선수 출전 경기를 상단에 정렬
  const sorted = [...games].sort((a, b) => b.koreanPlayerTeams.length - a.koreanPlayerTeams.length);

  return (
    <div className="pb-28">
      <div className="bg-white px-4 pt-5 pb-3">
        <h1 className="text-xl font-bold text-gray-900">📅 경기 일정</h1>
        <p className="text-xs text-gray-500 mt-1">{data.live ? "MLB 공식 실시간 · " : ""}미국 현지 날짜 기준 · 한국 선수 출전 경기는 위에 표시돼요</p>
      </div>

      <div className="flex gap-2 px-4 py-3 bg-white border-b">
        {(["today", "yesterday"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-full text-sm font-medium ${
              tab === t ? "bg-mlbBlue text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {t === "today" ? "오늘" : "어제"}
          </button>
        ))}
      </div>

      <div className="space-y-3 px-4 pt-2">
        {sorted.map((game) => (
          <GameCard key={game.gameId} game={game} />
        ))}
        {sorted.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm">예정된 경기가 없어요</div>
        )}
      </div>

      <div className="px-4 mt-4">
        <BannerAd />
      </div>
    </div>
  );
}

function GameCard({ game }: { game: LiveGame }) {
  const hasKorean = game.koreanPlayerTeams.length > 0;
  const isFinal = game.statusCode === "F";
  const isLive = game.statusCode === "I";

  return (
    <div
      className={`bg-white rounded-xl shadow-sm p-4 ${
        hasKorean ? "border-2 border-mlbRed" : "border border-gray-100"
      }`}
    >
      {(game.seriesLabel || hasKorean) && (
        <div className="flex items-center justify-between mb-2">
          {game.seriesLabel ? (
            <span className="text-[11px] font-bold text-mlbBlue">🏆 {game.seriesLabel}</span>
          ) : (
            <span />
          )}
          {hasKorean && <span className="text-[10px] text-mlbRed font-bold">🇰🇷 한국 선수 출전</span>}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2 flex-1">
          <TeamRow team={game.away} side="away" />
          <TeamRow team={game.home} side="home" />
        </div>
        <div className="text-right ml-3">
          <div className={`text-[10px] font-medium ${isFinal ? "text-gray-500" : isLive ? "text-mlbRed" : "text-mlbBlue"}`}>
            {isFinal ? "종료" : isLive ? `🔴 ${game.inningLabel || "진행중"}` : statusLabel(game.status)}
          </div>
          {!isFinal && !isLive && game.startTime && (
            <div className="text-[10px] text-gray-400 mt-0.5">
              {new Date(game.startTime).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </div>
          )}
          {game.seriesResult && (
            <div className="text-[10px] text-gray-500 mt-0.5">{game.seriesResult}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function TeamRow({ team, side }: { team: any; side: "home" | "away" }) {
  return (
    <div className="flex items-center gap-2">
      <TeamBadge teamId={team.teamId} size="sm" />
      <span className="text-sm font-medium flex-1">{TEAM_BY_ID[team.teamId]?.shortName}</span>
      {team.score !== null && (
        <span className="text-base font-bold w-7 text-right">{team.score}</span>
      )}
      <span className="text-[10px] text-gray-400 w-8">{side === "home" ? "(홈)" : "(원정)"}</span>
    </div>
  );
}

function statusLabel(status: string): string {
  if (status === "Scheduled") return "예정";
  if (status === "In Progress") return "진행중";
  if (status === "Postponed") return "연기";
  return status;
}
