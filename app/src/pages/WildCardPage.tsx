import { useEffect, useState } from "react";
import { fetchWildCard, WildCardEntry } from "../utils/api";
import { TEAM_BY_ID } from "../data/teams";
import { TeamBadge } from "../components/TeamBadge";
import { BannerAd } from "../components/BannerAd";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { ErrorState } from "../components/ErrorState";

export function WildCardPage() {
  const [data, setData] = useState<{ AL: WildCardEntry[]; NL: WildCardEntry[] } | null>(null);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<"AL" | "NL">("AL");

  useEffect(() => {
    fetchWildCard().then(setData).catch(() => setError(true));
  }, []);

  if (error) return <ErrorState onRetry={() => window.location.reload()} />;
  if (!data) return <LoadingSkeleton rows={6} />;

  const teams = data[tab];

  return (
    <div className="pb-28">
      <div className="bg-mlbBlue text-white px-4 py-5">
        <h1 className="text-xl font-bold">🌟 와일드카드</h1>
        <p className="text-xs opacity-80 mt-1">지구 1위가 아닌 팀들 중 상위 3팀이 진출</p>
      </div>

      {/* AL/NL 토글 */}
      <div className="flex gap-2 px-4 py-3 bg-white border-b">
        {(["AL", "NL"] as const).map((l) => (
          <button
            key={l}
            onClick={() => setTab(l)}
            className={`flex-1 py-2 rounded-full text-sm font-medium ${
              tab === l ? "bg-mlbBlue text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {l === "AL" ? "아메리칸리그" : "내셔널리그"}
          </button>
        ))}
      </div>

      <BannerAd />

      <div className="bg-white">
        {teams.map((t) => (
          <div
            key={t.teamId}
            className={`px-4 py-3 flex items-center gap-3 border-b border-gray-100 ${
              t.inWildCard ? "bg-green-50" : ""
            }`}
          >
            <span
              className={`text-sm font-bold w-6 ${
                t.inWildCard ? "text-green-600" : "text-gray-400"
              }`}
            >
              {t.wildCardRank}
            </span>
            <TeamBadge teamId={t.teamId} size="sm" />
            <div className="flex-1">
              <div className="text-sm font-medium">{TEAM_BY_ID[t.teamId]?.shortName}</div>
              <div className="text-[11px] text-gray-500">
                {t.league} {t.division === "East" ? "동부" : t.division === "Central" ? "중부" : "서부"}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold">
                {t.wins}-{t.losses}
              </div>
              <div className="text-[11px] text-gray-500">{(t.winningPct * 1000).toFixed(0)}</div>
            </div>
            {t.inWildCard && (
              <div className="ml-2 px-2 py-1 bg-green-500 text-white text-[10px] rounded-full font-bold">
                IN
              </div>
            )}
          </div>
        ))}
      </div>

      <BannerAd />

      <div className="px-4 py-3 text-xs text-gray-500">
        💡 초록색은 현재 와일드카드 진출권 (3팀)이에요. 정규시즌 종료 시점 기준으로 결정돼요.
      </div>
    </div>
  );
}
