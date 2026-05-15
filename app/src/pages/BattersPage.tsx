import { useEffect, useState } from "react";
import { fetchBatters, fetchPitchers, BatterLeader, PitcherLeader } from "../utils/api";
import { TEAM_BY_ID } from "../data/teams";
import { TeamBadge } from "../components/TeamBadge";
import { BannerAd } from "../components/BannerAd";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { ErrorState } from "../components/ErrorState";

type Mode = "batter" | "pitcher";
type BatterCat = "avg" | "hr" | "rbi" | "sb";
type PitcherCat = "w" | "era" | "k" | "sv" | "whip";

const BATTER_LABELS: Record<BatterCat, string> = {
  avg: "타율",
  hr: "홈런",
  rbi: "타점",
  sb: "도루",
};

const PITCHER_LABELS: Record<PitcherCat, string> = {
  w: "승",
  era: "평균자책",
  k: "탈삼진",
  sv: "세이브",
  whip: "WHIP",
};

interface BatterData {
  avg: BatterLeader[];
  hr: BatterLeader[];
  rbi: BatterLeader[];
  sb: BatterLeader[];
}
interface PitcherData {
  w: PitcherLeader[];
  era: PitcherLeader[];
  k: PitcherLeader[];
  sv: PitcherLeader[];
  whip: PitcherLeader[];
}

export function BattersPage() {
  const [batterData, setBatterData] = useState<BatterData | null>(null);
  const [pitcherData, setPitcherData] = useState<PitcherData | null>(null);
  const [error, setError] = useState(false);
  const [mode, setMode] = useState<Mode>("batter");
  const [batterCat, setBatterCat] = useState<BatterCat>("avg");
  const [pitcherCat, setPitcherCat] = useState<PitcherCat>("era");

  useEffect(() => {
    Promise.all([fetchBatters(), fetchPitchers()])
      .then(([b, p]) => {
        setBatterData(b);
        setPitcherData(p);
      })
      .catch(() => setError(true));
  }, []);

  if (error) return <ErrorState onRetry={() => window.location.reload()} />;
  if (!batterData || !pitcherData) return <LoadingSkeleton rows={10} />;

  const list = mode === "batter" ? batterData[batterCat] || [] : pitcherData[pitcherCat] || [];
  const valueLabel = mode === "batter" ? BATTER_LABELS[batterCat] : PITCHER_LABELS[pitcherCat];

  return (
    <div className="pb-28">
      <div className="bg-mlbBlue text-white px-4 py-5">
        <h1 className="text-xl font-bold">⚾ 메이저리그 기록</h1>
        <p className="text-xs opacity-80 mt-1">부문별 Top 30</p>
      </div>

      {/* 타자/투수 토글 */}
      <div className="flex gap-2 px-4 pt-3 pb-2 bg-white">
        <button
          onClick={() => setMode("batter")}
          className={`flex-1 py-2 rounded-full text-sm font-bold transition-colors ${
            mode === "batter"
              ? "bg-mlbBlue text-white"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          타자
        </button>
        <button
          onClick={() => setMode("pitcher")}
          className={`flex-1 py-2 rounded-full text-sm font-bold transition-colors ${
            mode === "pitcher"
              ? "bg-mlbBlue text-white"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          투수
        </button>
      </div>

      {/* 카테고리 토글 (모드별로 다른 옵션) */}
      <div className="flex gap-2 px-4 py-3 bg-white border-b overflow-x-auto">
        {mode === "batter"
          ? (Object.keys(BATTER_LABELS) as BatterCat[]).map((c) => (
              <button
                key={c}
                onClick={() => setBatterCat(c)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                  batterCat === c ? "bg-mlbRed text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                {BATTER_LABELS[c]}
              </button>
            ))
          : (Object.keys(PITCHER_LABELS) as PitcherCat[]).map((c) => (
              <button
                key={c}
                onClick={() => setPitcherCat(c)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                  pitcherCat === c ? "bg-mlbRed text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                {PITCHER_LABELS[c]}
              </button>
            ))}
      </div>

      <div className="bg-white">
        {list.map((p, idx) => (
          <div
            key={`${p.playerId}-${idx}`}
            className="px-4 py-3 flex items-center gap-3 border-b border-gray-100"
          >
            <span
              className={`text-sm font-bold w-6 ${
                p.rank <= 3 ? "text-mlbRed" : "text-gray-500"
              }`}
            >
              {p.rank}
            </span>
            <TeamBadge teamId={p.teamId} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{p.playerName}</div>
              <div className="text-[11px] text-gray-500">
                {TEAM_BY_ID[p.teamId]?.shortName || p.teamAbbr}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-gray-900">{p.value}</div>
              <div className="text-[10px] text-gray-500">{valueLabel}</div>
            </div>
          </div>
        ))}
      </div>

      {list.length === 0 && (
        <div className="text-center py-16 text-gray-500 text-sm">데이터가 없어요</div>
      )}

      <div className="px-4 mt-4">
        <BannerAd />
      </div>
    </div>
  );
}
