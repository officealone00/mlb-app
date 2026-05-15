import { useEffect, useState } from "react";
import { fetchKoreanPlayers, KoreanPlayer } from "../utils/api";
import { TEAM_BY_ID } from "../data/teams";
import { TeamBadge } from "../components/TeamBadge";
import { BannerAd } from "../components/BannerAd";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { ErrorState } from "../components/ErrorState";

export function KoreanPlayersPage() {
  const [players, setPlayers] = useState<KoreanPlayer[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchKoreanPlayers().then(setPlayers).catch(() => setError(true));
  }, []);

  if (error) return <ErrorState onRetry={() => window.location.reload()} />;
  if (!players) return <LoadingSkeleton rows={6} />;

  return (
    <div className="pb-28">
      {/* 헤더 — 태극 색상 */}
      <div
        className="px-4 py-5 text-white"
        style={{
          background: "linear-gradient(135deg, #CD2E3A 0%, #002D72 100%)",
        }}
      >
        <h1 className="text-xl font-bold">🇰🇷 한국 선수</h1>
        <p className="text-xs opacity-90 mt-1">
          MLB에서 활약 중인 우리 선수들의 시즌 성적이에요
        </p>
      </div>

      <div className="space-y-3 px-4 pt-4">
        {players.map((player) => (
          <PlayerCard key={player.playerId} player={player} />
        ))}
      </div>

      {players.length === 0 && (
        <div className="text-center py-16 text-gray-500 text-sm">
          현재 MLB에서 뛰는 한국 선수가 없어요
        </div>
      )}

      <div className="px-4 mt-4">
        <BannerAd />
      </div>
    </div>
  );
}

function PlayerCard({ player }: { player: KoreanPlayer }) {
  const team = TEAM_BY_ID[player.teamId];
  const stats = player.stats.hitting || player.stats.pitching;

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
      style={{ borderLeft: `4px solid ${team?.color || "#999"}` }}
    >
      <div className="flex items-center gap-3 mb-3">
        <TeamBadge teamId={player.teamId} size="md" />
        <div className="flex-1">
          <h3 className="font-bold text-base">{player.krName}</h3>
          <p className="text-xs text-gray-500">
            {player.enName} · {team?.shortName} · {positionLabel(player.position)}
          </p>
        </div>
      </div>

      {player.stats.hitting && (
        <div className="grid grid-cols-4 gap-2">
          <Stat label="타율" value={player.stats.hitting.avg} highlight />
          <Stat label="홈런" value={String(player.stats.hitting.homeRuns)} />
          <Stat label="타점" value={String(player.stats.hitting.rbi)} />
          <Stat label="OPS" value={player.stats.hitting.ops} />
        </div>
      )}

      {player.stats.pitching && (
        <div className="grid grid-cols-4 gap-2">
          <Stat label="ERA" value={player.stats.pitching.era} highlight />
          <Stat label="승" value={String(player.stats.pitching.wins)} />
          <Stat label="K" value={String(player.stats.pitching.strikeouts)} />
          <Stat label="WHIP" value={player.stats.pitching.whip} />
        </div>
      )}

      {!stats && (
        <div className="text-xs text-gray-400 text-center py-2">
          시즌 기록 없음
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="text-center">
      <div
        className={`text-base font-bold ${highlight ? "text-mlbRed" : "text-gray-900"}`}
      >
        {value}
      </div>
      <div className="text-[10px] text-gray-500">{label}</div>
    </div>
  );
}

function positionLabel(pos: string): string {
  const map: Record<string, string> = {
    P: "투수",
    OF: "외야수",
    IF: "내야수",
    C: "포수",
    DH: "지명타자",
  };
  return map[pos] || pos;
}
