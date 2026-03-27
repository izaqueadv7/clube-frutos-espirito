type UserLike = {
  role?: string;
  primaryFunction?: string | null;
  secondaryFunction?: string | null;
  isAdmin?: boolean;
  isMedia?: boolean;
};

export function hasFunction(user: UserLike | null | undefined, fn: string) {
  if (!user) return false;

  const primary = (user.primaryFunction ?? "").toLowerCase().trim();
  const secondary = (user.secondaryFunction ?? "").toLowerCase().trim();
  const target = fn.toLowerCase().trim();

  return primary === target || secondary === target;
}

export function isDirector(user: UserLike | null | undefined) {
  return !!user && user.role === "LEADER" && (user.isAdmin || hasFunction(user, "Diretor"));
}

export function isSecretary(user: UserLike | null | undefined) {
  return !!user && user.role === "LEADER" && (user.isAdmin || hasFunction(user, "Secretária"));
}

export function isMedia(user: UserLike | null | undefined) {
  return !!user && user.role === "LEADER" && (user.isAdmin || user.isMedia || hasFunction(user, "Mídia"));
}

export function isCounselor(user: UserLike | null | undefined) {
  return !!user && user.role === "LEADER" && (user.isAdmin || hasFunction(user, "Conselheiro"));
}

export function canAccessFullLeaderPanel(user: UserLike | null | undefined) {
  return !!user && user.role === "LEADER" && (
    user.isAdmin ||
    hasFunction(user, "Diretor") ||
    hasFunction(user, "Secretária")
  );
}

export function canAccessMediaPanel(user: UserLike | null | undefined) {
  return !!user && user.role === "LEADER" && (
    user.isAdmin ||
    hasFunction(user, "Diretor") ||
    hasFunction(user, "Secretária") ||
    user.isMedia ||
    hasFunction(user, "Mídia")
  );
}

export function canAccessSecretaryPanel(user: UserLike | null | undefined) {
  return !!user && user.role === "LEADER" && (
    user.isAdmin ||
    hasFunction(user, "Diretor") ||
    hasFunction(user, "Secretária")
  );
}

export function canAccessDirectorPanel(user: UserLike | null | undefined) {
  return !!user && user.role === "LEADER" && (
    user.isAdmin ||
    hasFunction(user, "Diretor")
  );
}

export function canAccessCounselorPanel(user: UserLike | null | undefined) {
  return !!user && user.role === "LEADER" && (
    user.isAdmin ||
    hasFunction(user, "Diretor") ||
    hasFunction(user, "Secretária") ||
    hasFunction(user, "Conselheiro")
  );
}

export function canManageAssignments(user: any) {
  return (
    canAccessFullLeaderPanel(user) ||
    canAccessSecretaryPanel(user) ||
    canAccessDirectorPanel(user) ||
    canAccessCounselorPanel(user)
  );
}