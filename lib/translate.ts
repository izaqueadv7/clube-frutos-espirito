export function translateRole(role?: string) {
  switch (role) {
    case "PATHFINDER":
      return "Desbravador";
    case "LEADER":
      return "Líder";
    case "PARENT":
      return "Responsável";
    default:
      return role ?? "";
  }
}

export function translateStatus(status?: string) {
  switch (status) {
    case "PENDING":
      return "Pendente";
    case "APPROVED":
      return "Aprovado";
    case "REJECTED":
      return "Rejeitado";
    default:
      return status ?? "";
  }
}

export function translateSpecialtyStatus(status?: string) {
  switch (status) {
    case "PENDING":
      return "Pendente";
    case "IN_PROGRESS":
      return "Em andamento";
    case "COMPLETED":
      return "Concluída";
    default:
      return status ?? "";
  }
}

export function translateAnnouncementAudience(audience?: string) {
  switch (audience) {
    case "ALL":
      return "Todos";
    case "PATHFINDER":
      return "Desbravadores";
    case "PARENT":
      return "Responsáveis";
    default:
      return audience ?? "";
  }
}

export function translateAttendanceStatus(status?: string) {
  switch (status) {
    case "PRESENT":
      return "Presente";
    case "ABSENT":
      return "Ausente";
    case "LATE":
      return "Atrasado";
    case "EXCUSED":
      return "Justificado";
    default:
      return status ?? "";
  }
}

export function translateClassName(name?: string) {
  switch (name) {
    case "Friend":
      return "Amigo";
    case "Companion":
      return "Companheiro";
    case "Explorer":
      return "Pesquisador";
    case "Ranger":
      return "Pioneiro";
    case "Voyager":
      return "Excursionista";
    case "Guide":
      return "Guia";
    default:
      return name ?? "";
  }
}