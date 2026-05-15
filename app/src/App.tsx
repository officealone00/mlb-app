import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { BottomNav } from "./components/BottomNav";
import { StandingsPage } from "./pages/StandingsPage";
import { WildCardPage } from "./pages/WildCardPage";
import { KoreanPlayersPage } from "./pages/KoreanPlayersPage";
import { BattersPage } from "./pages/BattersPage";
import { GamesPage } from "./pages/GamesPage";
import { TeamReportPage } from "./pages/TeamReportPage";

// 전면광고는 사용하지 않음. (Rody 2026.05.15 결정)
// - 배너: 각 페이지 하단 1개만
// - 리워드: TeamReportPage 상세 분석 잠금 해제용

export default function App() {
  return (
    <MemoryRouter>
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
