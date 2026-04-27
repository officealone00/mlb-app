import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchStandings, Standing } from "../utils/api";
import { TEAM_BY_ID } from "../data/teams";
import { TeamBadge } from "../components/TeamBadge";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { ErrorState } from "../components/ErrorState";
import { showRewardedAd } from "../components/RewardedAd";
import { generateTeamReport, TeamReport } from "../utils/teamAnalytics";
import { getFavoriteTeam } from "../utils/storage";
import { ChevronLeft, Lock, Sparkles } from "lucide-react";

export function TeamReportPage() {
  const navigate = useNavigate();
  const [standings, setStandings] = useState<Standing[] | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const favoriteId = getFavoriteTeam();

  useEffect(() => {
    fetchStandings().then(setStandings).catch(() => setError(true));
  }, []);

  if (!favoriteId) {
    return (
      <div className="p-6 text-center pb-28">
        <div className="text-4xl mb-3">⭐</div>
        <p className="text-gray-600 text-sm mb-4">먼저 응원팀을 설정해주세요</p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-mlbBlue text-white rounded-full text-sm font-medium"
        >
          순위 화면으로
        </button>
      </div>
    );
  }

  if (error) return <ErrorState onRetry={() => window.location.reload()} />;
  if (!standings) return <LoadingSkeleton rows={5} />;

  const report = generateTeamReport(favoriteId, standings);
  const team = TEAM_BY_ID[favoriteId];

  if (!report || !team) {
    return <ErrorState message="리포트를 만들 수 없어요" />;
  }

  const handleUnlock = async () => {
    setLoading(true);
    const rewarded = await showRewardedAd();
    setLoading(false);
    if (rewarded) {
      setUnlocked(true);
    }
  };

  return (
    <div className="pb-28">
      <div
        className="px-4 py-5 text-white relative"
        style={{ backgroundColor: team.color }}
      >
        <button
          onClick={() => navigate(-1)}
          className="absolute left-3 top-5 p-1 rounded-full bg-white/20"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3 ml-8">
          <TeamBadge teamId={favoriteId} size="lg" />
          <div>
            <h1 className="text-lg font-bold">{team.shortName} 상세 리포트</h1>
            <p className="text-xs opacity-80">{report.divisionStanding}</p>
          </div>
        </div>
      </div>

      {!unlocked ? (
        <ReportLockScreen team={team} loading={loading} onUnlock={handleUnlock} />
      ) : (
        <ReportContent report={report} />
      )}
    </div>
  );
}

function ReportLockScreen({ team, loading, onUnlock }: any) {
  return (
    <div className="px-6 py-8 text-center">
      <div className="bg-gray-50 rounded-2xl p-6 mb-4">
        <Lock size={32} className="mx-auto text-gray-400 mb-3" />
        <h2 className="font-bold text-lg mb-2">상세 분석 리포트</h2>
        <p className="text-sm text-gray-600 mb-4">
          {team.shortName}의 시즌 분석, 인사이트, 와일드카드 경쟁 상황을 확인하세요
        </p>
        <ul className="text-xs text-gray-500 space-y-1 text-left mb-5">
          <li className="flex items-start gap-2">
            <Sparkles size={14} className="text-mlbRed mt-0.5 shrink-0" />
            <span>지구 라이벌과의 게임차 분석</span>
          </li>
          <li className="flex items-start gap-2">
            <Sparkles size={14} className="text-mlbRed mt-0.5 shrink-0" />
            <span>최근 폼과 모멘텀 진단</span>
          </li>
          <li className="flex items-start gap-2">
            <Sparkles size={14} className="text-mlbRed mt-0.5 shrink-0" />
            <span>포스트시즌 진출 전망</span>
          </li>
        </ul>
        <button
          onClick={onUnlock}
          disabled={loading}
          className="w-full py-3 bg-mlbRed text-white rounded-full font-bold text-sm disabled:opacity-50"
        >
          {loading ? "광고 로딩중..." : "광고 보고 무료로 보기"}
        </button>
      </div>
      <p className="text-[11px] text-gray-400">짧은 광고 시청 후 리포트가 잠금 해제돼요</p>
    </div>
  );
}

function ReportContent({ report }: { report: TeamReport }) {
  return (
    <div className="px-4 py-4 space-y-4">
      <Card title="📊 현재 위치">
        <p className="text-sm text-gray-700">{report.divisionStanding}</p>
        <p className="text-xs text-gray-500 mt-1">{report.recentForm}</p>
      </Card>

      <Card title="💡 인사이트">
        <ul className="space-y-2">
          {report.insights.map((insight, i) => (
            <li key={i} className="text-sm text-gray-700 leading-relaxed">
              {insight}
            </li>
          ))}
        </ul>
      </Card>

      <Card title="🎯 경쟁 구도">
        {report.matchups.map((m, i) => (
          <div key={i} className="flex justify-between py-1.5 border-b last:border-0 border-gray-100">
            <span className="text-sm text-gray-600">{m.vs}</span>
            <span className="text-sm font-medium">{m.record}</span>
          </div>
        ))}
      </Card>

      <Card title="🔮 시즌 전망">
        <p className="text-sm text-gray-700 leading-relaxed">{report.prediction}</p>
      </Card>

      <p className="text-[10px] text-center text-gray-400 mt-2">
        ⓘ 자동 생성된 분석이며, 실제 결과와 다를 수 있어요
      </p>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <h3 className="font-bold text-sm mb-2 text-gray-800">{title}</h3>
      {children}
    </div>
  );
}
