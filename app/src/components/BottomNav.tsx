import { useNavigate, useLocation } from "react-router-dom";
import { Trophy, Star, Flag, BarChart3, Calendar } from "lucide-react";

const TABS = [
  { path: "/", label: "순위", icon: Trophy },
  { path: "/wildcard", label: "와일드", icon: Star },
  { path: "/korean", label: "한국선수", icon: Flag, highlight: true },
  { path: "/batters", label: "타자", icon: BarChart3 },
  { path: "/games", label: "경기", icon: Calendar },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
      <div className="bg-white shadow-lg rounded-full px-2 py-2 flex items-center gap-1 border border-gray-100">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-full transition-all ${
                active
                  ? "bg-mlbBlue text-white"
                  : tab.highlight
                  ? "text-mlbRed hover:bg-red-50"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Icon size={18} />
              <span className="text-[10px] mt-0.5 font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
