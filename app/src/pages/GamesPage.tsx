import { useEffect, useState } from "react";
import { fetchGames, Game } from "../utils/api";
import { TEAM_BY_ID } from "../data/teams";
import { TeamBadge } from "../components/TeamBadge";
import { BannerAd } from "../components/BannerAd";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { ErrorState } from "../components/ErrorState";

export function GamesPage() {
  const [data, setData] = useState<{ today: Game[]; yesterday: Game[] } | null>(null);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<"today" | "yesterday">("today");

  useEffect(() => {
    fetchGames().then(setData).catch(() => setError(true));
  }, []);

  if (error) return <ErrorState onRetry={() => window.location.reload()} />;
  if (!data) return <LoadingSkeleton rows={6} />;

  const games = data[tab];
  // 한국 선수 출전 경기를 상단에 정렬
  const sorted = [...games].sort((a, b) => b.koreanPlayerTeams.length - a.koreanPlayerTeams.length);

  return (
    <div className="pb-28">
      <div className="bg-mlbBlue text-white px-4 py-5">
        <h1 className="text-xl font-bold">📅 경기 일정</h1>
        <p className="text-xs opacity-80 mt-1">한국 선수 출전 경기는 상단에 표시돼요</p>
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

      <BannerAd />

      <div className="space-y-3 px-4 pt-2">
        {sorted.map((game) => (
          <GameCard key={game.gameId} game={game} />
        ))}
        {sorted.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm">예정된 경기가 없어요</div>
        )}
      </div>

      <BannerAd />
    </div>
  );
}

function GameCard({ game }: { game: Game }) {
  const hasKorean = game.koreanPlayerTeams.length > 0;
  const isFinal = game.statusCode === "F";

  return (
    <div
      className={`bg-white rounded-xl shadow-sm p-4 ${
        hasKorean ? "border-2 border-mlbRed" : "border border-gray-100"
      }`}
    >
      {hasKorean && (
        <div className="text-[10px] text-mlbRed font-bold mb-2 flex items-center gap-1">
          🇰🇷 한국 선수 출전
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2 flex-1">
          <TeamRow team={game.away} side="away" />
          <TeamRow team={game.home} side="home" />
        </div>
        <div className="text-right ml-3">
          <div className={`text-[10px] font-medium ${isFinal ? "text-gray-500" : "text-mlbBlue"}`}>
            {isFinal ? "종료" : statusLabel(game.status)}
          </div>
          {!isFinal && game.startTime && (
            <div className="text-[10px] text-gray-400 mt-0.5">
              {new Date(game.startTime).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
            </div>
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
