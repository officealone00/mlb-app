import { useEffect } from "react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { BottomNav } from "./components/BottomNav";
import { StandingsPage } from "./pages/StandingsPage";
import { WildCardPage } from "./pages/WildCardPage";
import { KoreanPlayersPage } from "./pages/KoreanPlayersPage";
import { BattersPage } from "./pages/BattersPage";
import { GamesPage } from "./pages/GamesPage";
import { TeamReportPage } from "./pages/TeamReportPage";
import { showInterstitial } from "./components/InterstitialAd";
import { shouldShowInterstitial } from "./utils/storage";

function InterstitialTracker() {
  const location = useLocation();

  useEffect(() => {
    if (shouldShowInterstitial()) {
      showInterstitial();
    }
  }, [location.pathname]);

  return null;
}

export default function App() {
  return (
    <MemoryRouter>
      <InterstitialTracker />
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
