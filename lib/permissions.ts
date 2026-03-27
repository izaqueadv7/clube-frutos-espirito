type AppUser = {
  role?: string;
  isAdmin?: boolean;
  primaryFunction?: string | null;
  secondaryFunction?: string | null;
  canManageUsers?: boolean;
  canManageContent?: boolean;
};

function normalize(value?: string | null) {
  return (value || "").trim().toLowerCase();
}

function hasFunction(user: AppUser | null | undefined, value: string) {
  if (!user) return false;

  const primary = normalize(user.primaryFunction);
  const secondary = normalize(user.secondaryFunction);
  const target = normalize(value);

  return primary === target || secondary === target;
}

export function canAccessFullLeaderPanel(user: AppUser | null | undefined) {
  if (!user) return false;

  return (
    user.isAdmin === true ||
    user.role === "LEADER" &&
      (
        hasFunction(user, "administrador") ||
        hasFunction(user, "diretor") ||
        hasFunction(user, "diretora")
      )
  );
}

export function canAccessSecretaryPanel(user: AppUser | null | undefined) {
  if (!user) return false;

  return (
    canAccessFullLeaderPanel(user) ||
    user.canManageUsers === true ||
    user.role === "LEADER" &&
      (
        hasFunction(user, "secretaria") ||
        hasFunction(user, "secretária")
      )
  );
}

export function canAccessMediaPanel(user: AppUser | null | undefined) {
  if (!user) return false;

  return (
    canAccessFullLeaderPanel(user) ||
    user.canManageContent === true ||
    user.role === "LEADER" &&
      (
        hasFunction(user, "midia") ||
        hasFunction(user, "mídia")
      )
  );
}

export function canAccessDirectorPanel(user: AppUser | null | undefined) {
  if (!user) return false;

  return (
    canAccessFullLeaderPanel(user) ||
    user.role === "LEADER" &&
      (
        hasFunction(user, "diretor") ||
        hasFunction(user, "diretora")
      )
  );
}

export function canAccessCounselorPanel(user: AppUser | null | undefined) {
  if (!user) return false;

  return (
    canAccessFullLeaderPanel(user) ||
    user.role === "LEADER" &&
      (
        hasFunction(user, "conselheiro") ||
        hasFunction(user, "conselheira")
      )
  );
}

export function canManageAssignments(user: AppUser | null | undefined) {
  if (!user) return false;

  return (
    canAccessFullLeaderPanel(user) ||
    canAccessSecretaryPanel(user) ||
    canAccessDirectorPanel(user) ||
    canAccessCounselorPanel(user)
  );
}