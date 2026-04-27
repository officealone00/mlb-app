import { useEffect, useState } from "react";
import { fetchBatters, BatterLeader } from "../utils/api";
import { TEAM_BY_ID } from "../data/teams";
import { TeamBadge } from "../components/TeamBadge";
import { BannerAd } from "../components/BannerAd";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { ErrorState } from "../components/ErrorState";

type Cat = "avg" | "hr" | "rbi" | "sb";
const CAT_LABELS: Record<Cat, string> = { avg: "타율", hr: "홈런", rbi: "타점", sb: "도루" };

export function BattersPage() {
  const [data, setData] = useState<{ avg: BatterLeader[]; hr: BatterLeader[]; rbi: BatterLeader[]; sb: BatterLeader[] } | null>(null);
  const [error, setError] = useState(false);
  const [cat, setCat] = useState<Cat>("avg");

  useEffect(() => {
    fetchBatters().then(setData).catch(() => setError(true));
  }, []);

  if (error) return <ErrorState onRetry={() => window.location.reload()} />;
  if (!data) return <LoadingSkeleton rows={10} />;

  const list = data[cat] || [];

  return (
    <div className="pb-28">
      <div className="bg-mlbBlue text-white px-4 py-5">
        <h1 className="text-xl font-bold">⚾ 타자 순위</h1>
        <p className="text-xs opacity-80 mt-1">메이저리그 부문별 Top 30</p>
      </div>

      <div className="flex gap-2 px-4 py-3 bg-white border-b overflow-x-auto">
        {(Object.keys(CAT_LABELS) as Cat[]).map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
              cat === c ? "bg-mlbBlue text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {CAT_LABELS[c]}
          </button>
        ))}
      </div>

      <BannerAd />

      <div className="bg-white">
        {list.map((p, idx) => (
          <div key={`${p.playerId}-${idx}`} className="px-4 py-3 flex items-center gap-3 border-b border-gray-100">
            <span className={`text-sm font-bold w-6 ${p.rank <= 3 ? "text-mlbRed" : "text-gray-500"}`}>
              {p.rank}
            </span>
            <TeamBadge teamId={p.teamId} size="sm" />
            <div className="flex-1">
              <div className="text-sm font-medium">{p.playerName}</div>
              <div className="text-[11px] text-gray-500">{TEAM_BY_ID[p.teamId]?.shortName}</div>
            </div>
            <div className="text-base font-bold text-mlbBlue">{p.value}</div>
          </div>
        ))}
      </div>

      {list.length === 0 && (
        <div className="text-center py-16 text-gray-500 text-sm">데이터가 없어요</div>
      )}

      <BannerAd />
    </div>
  );
}
