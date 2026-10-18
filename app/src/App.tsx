import { MemoryRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import { BottomNav } from "./components/BottomNav";
import { StandingsPage } from "./pages/StandingsPage";
import { WildCardPage } from "./pages/WildCardPage";
import { KoreanPlayersPage } from "./pages/KoreanPlayersPage";
import { BattersPage } from "./pages/BattersPage";
import { GamesPage } from "./pages/GamesPage";
import { TeamReportPage } from "./pages/TeamReportPage";
import { useTossBackEvent } from "./hooks/useTossBackEvent";

// 전면광고는 사용하지 않음. (Rody 2026.05.15 결정)
// - 배너: 각 페이지 하단 1개만
// - 리워드: TeamReportPage 상세 분석 잠금 해제용

export default function App() {
  return (
    <MemoryRouter>
      <TossBackHandler />
      <Routes>
        <Route path="/" element={<StandingsPage />} />
        <Route path="/wildcard" element={<WildCardPage />} />
        <Route path="/korean" element={<KoreanPlayersPage />} />
        <Route path="/batters" element={<BattersPage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/report" element={<TeamReportPage />} />
      </Routes>
      <BottomNav />
      <Toaster position="top-center" />
    </MemoryRouter>
  );
}

// ─── 앱인토스 뒤로가기 (내비게이션 바 + 안드로이드 시스템 뒤로가기) ───
// - 이전 화면이 있으면: 이전 화면으로 이동
// - 첫 화면이면: 미니앱 종료(closeView)
function TossBackHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useTossBackEvent(() => {
    if (location.key !== "default") {
      navigate(-1);
      return true;
    }
    return false;
  });

  return null;
}
