export type AppRole = "PATHFINDER" | "LEADER" | "PARENT";

export function canManageClub(role: AppRole) {
  return role === "LEADER";
}

export function canViewChildData(role: AppRole) {
  return role === "PARENT" || role === "LEADER";
}

export function canUpdateProgress(role: AppRole) {
  return role === "LEADER";
}
