import { TEAM_BY_ID } from "../data/teams";

interface Props {
  teamId: number;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
}

export function TeamBadge({ teamId, size = "md", showName = false }: Props) {
  const team = TEAM_BY_ID[teamId];
  if (!team) return null;

  const sizeClass = size === "sm" ? "w-6 h-6 text-xs" : size === "lg" ? "w-12 h-12 text-base" : "w-9 h-9 text-sm";

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizeClass} flex items-center justify-center rounded-full font-bold text-white shrink-0`}
        style={{ backgroundColor: team.color }}
      >
        {team.abbr}
      </div>
      {showName && <span className="font-medium text-sm">{team.shortName}</span>}
    </div>
  );
}
