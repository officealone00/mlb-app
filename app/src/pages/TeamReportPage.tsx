import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchStandings, Standing } from "../utils/api";
import { TEAM_BY_ID } from "../data/teams";
import { TeamBadge } from "../components/TeamBadge";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { ErrorState } from "../components/ErrorState";
import RewardedAd from "../components/RewardedAd";
import { generateTeamReport, TeamReport, MatchupItem } from "../utils/teamAnalytics";
import { getFavoriteTeam } from "../utils/storage";
import { ChevronLeft, Lock, Sparkles } from "lucide-react";

export function TeamReportPage() {
  const navigate = useNavigate();
  const [standings, setStandings] = useState<Standing[] | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [showAd, setShowAd] = useState(false);
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

  const handleUnlock = () => {
    setLoading(true);
    setShowAd(true);
  };

  const handleReward = () => {
    setUnlocked(true);
  };

  const handleAdClose = () => {
    setShowAd(false);
    setLoading(false);
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

      {showAd && (
        <RewardedAd onReward={handleReward} onClose={handleAdClose} />
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
          {team.shortName}의 세이버메트릭스 기반 시즌 분석을 확인하세요
        </p>
        <ul className="text-xs text-gray-500 space-y-1 text-left mb-5">
          <li className="flex items-start gap-2">
            <Sparkles size={14} className="text-mlbRed mt-0.5 shrink-0" />
            <span>피타고리안 승률 · 162경기 페이스 환산</span>
          </li>
          <li className="flex items-start gap-2">
            <Sparkles size={14} className="text-mlbRed mt-0.5 shrink-0" />
            <span>공수 균형 · 클러치 능력 진단</span>
          </li>
          <li className="flex items-start gap-2">
            <Sparkles size={14} className="text-mlbRed mt-0.5 shrink-0" />
            <span>지구·와일드카드 경쟁 구도 + 트레이드 시나리오</span>
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
  const sm = report.sabermetrics;

  return (
    <div className="px-4 py-4 space-y-4">
      <Card title="📊 현재 위치">
        <p className="text-sm text-gray-800 font-medium">{report.divisionStanding}</p>
        <p className="text-xs text-gray-500 mt-1">{report.recentForm}</p>
      </Card>

      <Card title="🧮 세이버메트릭스">
        <div className="space-y-3">
          {/* 피타고리안 */}
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-gray-600">피타고리안 예상 승률</span>
              <span className="text-sm font-bold text-gray-900">
                {sm.pythagoreanPct}{" "}
                <span className="text-[11px] text-gray-500 font-normal">
                  ({sm.expectedWins}-{sm.expectedLosses} 예상)
                </span>
              </span>
            </div>
            <p className="text-[11px] text-gray-500 italic mt-0.5">{sm.luckLabel}</p>
          </div>

          {/* 162경기 페이스 */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-gray-600">162경기 페이스</span>
              <span className="text-sm font-bold text-gray-900">
                {sm.paceWins}-{sm.paceLosses}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 italic mt-0.5">{sm.paceLabel}</p>
          </div>

          {/* 경기당 득실 */}
          <div className="pt-2 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-2">
              <StatBlock label="경기당 득점" value={sm.runsPerGame} color="text-blue-600" />
              <StatBlock label="경기당 실점" value={sm.runsAllowedPerGame} color="text-red-600" />
              <StatBlock label="차이" value={sm.runDiffPerGame} color="text-gray-900" />
            </div>
            <p className="text-[11px] text-gray-500 italic text-center mt-2">
              {sm.runDiffPerGameLabel}
            </p>
          </div>
        </div>
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
          <MatchupRow key={i} matchup={m} isLast={i === report.matchups.length - 1} />
        ))}
      </Card>

      <Card title="🔮 시즌 전망">
        <p className="text-sm text-gray-700 leading-relaxed">{report.prediction}</p>
      </Card>

      <p className="text-[10px] text-center text-gray-400 mt-2">
        ⓘ Bill James 피타고리안(보정 지수 1.83) · 162경기 페이스 기반 자동 분석. 실제 결과와 다를 수 있어요.
      </p>
    </div>
  );
}

function StatBlock({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center">
      <div className={`text-base font-bold ${color}`}>{value}</div>
      <div className="text-[10px] text-gray-500">{label}</div>
    </div>
  );
}

function MatchupRow({ matchup, isLast }: { matchup: MatchupItem; isLast: boolean }) {
  const toneColor =
    matchup.tone === "good" ? "text-green-600" : matchup.tone === "bad" ? "text-red-600" : "text-gray-900";
  return (
    <div
      className={`flex justify-between py-2 ${
        isLast ? "" : "border-b border-gray-100"
      }`}
    >
      <span className="text-sm text-gray-600">{matchup.vs}</span>
      <span className={`text-sm font-medium ${toneColor}`}>{matchup.record}</span>
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
