/**
 * 포스트시즌 시리즈 상세 시트 (2026-10-18)
 * - 경기 일정·결과, 정규시즌 맞대결은 무료
 * - "시리즈 분석"은 [광고 보고 시리즈 분석 보기] → "짧은 광고를 볼까요?" → [광고 보기]를 눌러야만 광고가 나와요.
 *   끝까지 보면 그 시리즈 분석이 오늘 하루 열려요. 광고를 불러올 수 없으면 그냥 열어 줘요.
 */
import { useEffect, useState } from "react";
import { BottomSheet, ConfirmSheet } from "./BottomSheet";
import RewardedAd, { preloadReportAd } from "./RewardedAd";
import { TeamBadge } from "./TeamBadge";
import { TEAM_BY_ID } from "../data/teams";
import { fetchStandings, type Standing } from "../utils/api";
import { fetchHeadToHead, type PostseasonSeries } from "../utils/liveApi";
import { logEvent } from "../utils/tossGrowth";
import { nameOf, seriesStatus } from "./PostseasonCard";

/** 경기 줄에서는 약자(CLE·TB)로 짧게 */
const ab = (id: number | null, name: string) => (id && TEAM_BY_ID[id] ? TEAM_BY_ID[id].abbr : name);

/** 10.24 09:00 처럼 짧게 (한국 시간) */
function kst(iso: string) {
  const d = new Date(new Date(iso).getTime() + 9 * 3600e3);
  return `${d.getUTCMonth() + 1}.${d.getUTCDate()} ${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

const todayKey = (id: string) => {
  const d = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
  return `mlb-series-unlock-${id}-${d}`;
};
const readUnlock = (id: string) => {
  try {
    return localStorage.getItem(todayKey(id)) === "1";
  } catch {
    return false;
  }
};
const saveUnlock = (id: string) => {
  try {
    localStorage.setItem(todayKey(id), "1");
  } catch {
    /* noop */
  }
};

export function SeriesSheet({ season, series, onClose }: { season: number; series: PostseasonSeries | null; onClose: () => void }) {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [h2h, setH2h] = useState<{ w: number; l: number } | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [ask, setAsk] = useState(false);
  const [adShown, setAdShown] = useState(false);

  useEffect(() => {
    if (!series) return;
    setUnlocked(readUnlock(series.id));
    if (!readUnlock(series.id)) preloadReportAd();
    setH2h(null);
    void fetchStandings().then(setStandings).catch(() => {});
    if (series.teamA.teamId && series.teamB.teamId) {
      void fetchHeadToHead(season, series.teamA.teamId, series.teamB.teamId).then(setH2h);
    }
  }, [series, season]);

  if (!series) return null;
  const A = series.teamA;
  const B = series.teamB;
  const ta = A.teamId ? TEAM_BY_ID[A.teamId] : undefined;
  const tb = B.teamId ? TEAM_BY_ID[B.teamId] : undefined;
  const sa = standings.find((t) => t.teamId === A.teamId);
  const sb = standings.find((t) => t.teamId === B.teamId);

  return (
    <>
      <BottomSheet open={!!series} onClose={onClose} title={series.round}>
        <div className="rounded-2xl bg-gray-50 p-4 flex items-center justify-around">
          {[A, B].map((t) => {
            const lost = series.done && t.wins < Math.max(A.wins, B.wins);
            return (
              <div key={t.name} className="text-center" style={{ opacity: lost ? 0.45 : 1 }}>
                {t.teamId ? <TeamBadge teamId={t.teamId} size="lg" /> : null}
                <p className="font-bold text-gray-900 mt-1">{nameOf(t.teamId, t.name)}</p>
                <p className="text-3xl font-extrabold tabular-nums mt-1" style={{ color: t.teamId ? TEAM_BY_ID[t.teamId]?.color : "#333" }}>
                  {t.wins}
                </p>
              </div>
            );
          })}
        </div>
        <p className="text-center text-[14px] font-semibold text-gray-700 mt-2">{seriesStatus(series)}</p>
        <p className="text-center text-[12px] text-gray-500">{series.gamesToWin * 2 - 1}전 {series.gamesToWin}선승</p>

        <p className="mt-5 mb-2 font-bold text-gray-900">경기 일정 · 결과</p>
        <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100">
          {series.games.map((g, i) => {
            const done = g.state === "F" && g.homeScore != null;
            const winId = done ? ((g.homeScore ?? 0) > (g.awayScore ?? 0) ? g.homeId : g.awayId) : null;
            return (
              <div key={i} className="flex items-center px-3 py-3 text-[14px]">
                <span className="w-12 text-[12px] font-bold text-gray-500">{g.num || i + 1}차전</span>
                <span className="w-[72px] text-[12px] text-gray-500">{kst(g.gameDate)}</span>
                <span className="flex-1 font-semibold text-gray-900">
                  {ab(g.awayId, g.awayName)} {done || g.state === "I" ? `${g.awayScore ?? 0} : ${g.homeScore ?? 0}` : "vs"} {ab(g.homeId, g.homeName)}
                </span>
                <span className="text-[12px] font-bold" style={{ color: winId ? TEAM_BY_ID[winId]?.color : "#8B95A1" }}>
                  {winId ? `${ab(winId, "")} 승` : g.state === "I" ? "진행 중" : "예정"}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-1.5 text-[11px] text-gray-400">팀 순서: 원정 · 홈 · 한국 시간. 남은 경기는 시리즈가 먼저 끝나면 열리지 않아요.</p>

        {h2h && ta && tb && (
          <div className="mt-5 rounded-2xl bg-gray-50 p-4">
            <p className="font-bold text-gray-900 mb-2">{season} 정규시즌 맞대결</p>
            <div className="flex items-center justify-between text-[15px]">
              <span className="font-bold" style={{ color: ta.color }}>{ta.shortName} {h2h.w}승</span>
              <span className="text-gray-400 text-[13px]">vs</span>
              <span className="font-bold" style={{ color: tb.color }}>{h2h.l}승 {tb.shortName}</span>
            </div>
            <div className="mt-2 h-2 rounded-full overflow-hidden flex bg-gray-200">
              <div style={{ width: `${(h2h.w / Math.max(1, h2h.w + h2h.l)) * 100}%`, backgroundColor: ta.color }} />
              <div style={{ flex: 1, backgroundColor: tb.color }} />
            </div>
          </div>
        )}

        <p className="mt-5 mb-2 font-bold text-gray-900">🔍 시리즈 분석</p>
        {unlocked ? (
          sa && sb && ta && tb ? (
            <Analysis series={series} sa={sa} sb={sb} nameA={ta.shortName} nameB={tb.shortName} colorA={ta.color} colorB={tb.color} />
          ) : (
            <p className="rounded-2xl bg-gray-50 p-4 text-[14px] text-gray-600">기록을 불러오고 있어요</p>
          )
        ) : (
          <div className="relative rounded-2xl border border-gray-100 p-4">
            <div className="space-y-2 blur-sm select-none pointer-events-none" aria-hidden>
              <div className="h-4 w-2/3 rounded bg-gray-200" />
              <div className="h-4 w-1/2 rounded bg-gray-200" />
              <div className="h-16 rounded-xl bg-gray-100" />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
              <p className="text-[14px] font-semibold text-gray-800">승리 조건 · 득실점 비교 · 기대 승률</p>
              <button type="button" onClick={() => setAsk(true)} className="mt-3 w-full max-w-[260px] rounded-xl bg-mlbBlue py-3 text-[15px] font-bold text-white">
                광고 보고 시리즈 분석 보기
              </button>
            </div>
          </div>
        )}
      </BottomSheet>

      <ConfirmSheet
        open={ask}
        desc={"짧은 광고를 끝까지 보면\n오늘 하루 이 시리즈 분석을 볼 수 있어요."}
        onClose={() => setAsk(false)}
        onConfirm={() => {
          setAsk(false);
          setAdShown(true);
        }}
      />
      {adShown && (
        <RewardedAd
          onReward={() => {
            saveUnlock(series.id);
            setUnlocked(true);
            logEvent("series_analysis_unlocked", { series: series.round });
          }}
          onClose={() => setAdShown(false)}
        />
      )}
    </>
  );
}

function Analysis({
  series,
  sa,
  sb,
  nameA,
  nameB,
  colorA,
  colorB,
}: {
  series: PostseasonSeries;
  sa: Standing;
  sb: Standing;
  nameA: string;
  nameB: string;
  colorA: string;
  colorB: string;
}) {
  const g = (s: Standing) => Math.max(1, s.wins + s.losses);
  const pyth = (s: Standing) => (s.runsScored ** 1.83 / (s.runsScored ** 1.83 + s.runsAllowed ** 1.83 || 1)) || 0;
  const need = (w: number) => series.gamesToWin - w;
  const cond = (w: number, other: number) => {
    if (series.done) return w > other ? "다음 라운드 진출 확정" : "탈락";
    const n = need(w);
    return n === 1 ? "1승만 더하면 진출" : `${n}승이 더 필요해요`;
  };
  const rows: Array<[string, string, string]> = [
    ["정규시즌 성적", `${sa.wins}승 ${sa.losses}패`, `${sb.wins}승 ${sb.losses}패`],
    ["승률", sa.winningPct.toFixed(3), sb.winningPct.toFixed(3)],
    ["경기당 득점", (sa.runsScored / g(sa)).toFixed(2), (sb.runsScored / g(sb)).toFixed(2)],
    ["경기당 실점", (sa.runsAllowed / g(sa)).toFixed(2), (sb.runsAllowed / g(sb)).toFixed(2)],
    ["득실차", `${sa.runDifferential > 0 ? "+" : ""}${sa.runDifferential}`, `${sb.runDifferential > 0 ? "+" : ""}${sb.runDifferential}`],
    ["기대 승률", pyth(sa).toFixed(3), pyth(sb).toFixed(3)],
    ["마지막 10경기", sa.last10, sb.last10],
  ];
  const offense = sa.runsScored / g(sa) > sb.runsScored / g(sb) ? nameA : nameB;
  const defense = sa.runsAllowed / g(sa) < sb.runsAllowed / g(sb) ? nameA : nameB;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-gray-50 p-4">
        <p className="text-[13px] font-bold text-gray-600 mb-2">남은 승리 조건</p>
        <p className="text-[15px] text-gray-900">
          <b style={{ color: colorA }}>{nameA}</b> · {cond(series.teamA.wins, series.teamB.wins)}
        </p>
        <p className="text-[15px] text-gray-900">
          <b style={{ color: colorB }}>{nameB}</b> · {cond(series.teamB.wins, series.teamA.wins)}
        </p>
      </div>
      <div className="rounded-2xl border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-3 bg-gray-50 px-3 py-2 text-[12px] font-bold text-gray-600">
          <span>정규시즌</span>
          <span className="text-center" style={{ color: colorA }}>{nameA}</span>
          <span className="text-center" style={{ color: colorB }}>{nameB}</span>
        </div>
        {rows.map(([k, a, b]) => (
          <div key={k} className="grid grid-cols-3 px-3 py-2.5 text-[14px] border-t border-gray-100">
            <span className="text-gray-600 text-[13px]">{k}</span>
            <span className="text-center font-semibold text-gray-900">{a}</span>
            <span className="text-center font-semibold text-gray-900">{b}</span>
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-gray-50 p-4 text-[14px] leading-relaxed text-gray-800">
        정규시즌 기준으로 공격은 <b>{offense}</b>, 마운드·수비는 <b>{defense}</b> 쪽이 더 좋았어요.
      </div>
      <p className="text-[11px] text-gray-400">MLB 공식 기록으로 계산했어요. 결과를 예측하지는 않아요.</p>
    </div>
  );
}
