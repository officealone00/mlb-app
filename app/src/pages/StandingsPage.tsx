import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchStandings, Standing, fetchMeta } from "../utils/api";
import { DIVISIONS, TEAM_BY_ID } from "../data/teams";
import { TeamBadge } from "../components/TeamBadge";
import { BannerAd } from "../components/BannerAd";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { ErrorState } from "../components/ErrorState";
import { getFavoriteTeam, setFavoriteTeam } from "../utils/storage";
import { Star } from "lucide-react";

export function StandingsPage() {
  const navigate = useNavigate();
  const [standings, setStandings] = useState<Standing[] | null>(null);
  const [meta, setMeta] = useState<any>(null);
  const [error, setError] = useState(false);
  const [favorite, setFavorite] = useState<number | null>(getFavoriteTeam());

  useEffect(() => {
    Promise.all([fetchStandings(), fetchMeta()])
      .then(([s, m]) => {
        setStandings(s);
        setMeta(m);
      })
      .catch(() => setError(true));
  }, []);

  if (error) return <ErrorState onRetry={() => window.location.reload()} />;
  if (!standings) return <LoadingSkeleton rows={10} />;

  const handleFavorite = (teamId: number) => {
    setFavoriteTeam(teamId);
    setFavorite(teamId);
  };

  return (
    <div className="pb-28">
      {/* 헤더 */}
      <div className="bg-mlbBlue text-white px-4 py-5">
        <h1 className="text-xl font-bold">⚾ MLB 순위</h1>
        <p className="text-xs opacity-80 mt-1">
          {meta?.updatedAt && `${new Date(meta.updatedAt).toLocaleString("ko-KR")} 업데이트`}
        </p>
      </div>

      {/* 응원팀 빠른 진입 */}
      {favorite && TEAM_BY_ID[favorite] && (
        <div className="bg-yellow-50 border-y border-yellow-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star size={16} className="text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium">내 응원팀</span>
            <TeamBadge teamId={favorite} size="sm" showName />
          </div>
          <button
            onClick={() => navigate("/report")}
            className="text-xs px-3 py-1 bg-mlbRed text-white rounded-full font-medium"
          >
            상세 리포트
          </button>
        </div>
      )}

      <BannerAd />

      {/* 지구별 순위 */}
      {DIVISIONS.map(({ league, division, label }) => {
        const teams = standings
          .filter((s) => s.league === league && s.division === division)
          .sort((a, b) => a.divisionRank - b.divisionRank);
        return (
          <section key={`${league}-${division}`} className="mb-4">
            <div className="bg-gray-50 px-4 py-2 sticky top-0 z-10">
              <h2 className="text-sm font-bold text-gray-700">{label}</h2>
            </div>
            <div className="bg-white">
              {teams.map((t) => (
                <button
                  key={t.teamId}
                  onClick={() => handleFavorite(t.teamId)}
                  className={`w-full px-4 py-3 flex items-center gap-3 border-b border-gray-100 ${
                    favorite === t.teamId ? "bg-yellow-50" : "active:bg-gray-50"
                  }`}
                >
                  <span className="text-sm font-bold w-5 text-gray-500">{t.divisionRank}</span>
                  <TeamBadge teamId={t.teamId} size="sm" />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{TEAM_BY_ID[t.teamId]?.shortName}</div>
                    <div className="text-[11px] text-gray-500">
                      {t.wins}승 {t.losses}패 · 최근 {t.last10} · {t.streak}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{(t.winningPct * 1000).toFixed(0)}</div>
                    <div className="text-[11px] text-gray-500">
                      {t.gamesBack === 0 ? "-" : `${t.gamesBack.toFixed(1)}GB`}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        );
      })}

      <BannerAd />

      <div className="px-4 py-4 text-center text-xs text-gray-400">
        팀을 탭하면 응원팀으로 설정돼요
      </div>
    </div>
  );
}
