"use client";

import { useState } from "react";

export function AssignmentsClient({
  pathfinders,
  classes,
  specialties
}: any) {
  const [selectedUser, setSelectedUser] = useState("");
  const [mode, setMode] = useState<"class" | "specialty">("class");
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<any>(null);

  async function markRequirement(requirementId: string) {
    await fetch("/api/assignments/class", {
      method: "POST",
      body: JSON.stringify({
        pathfinderId: selectedUser,
        requirementId
      })
    });
  }

  async function completeSpecialty() {
    await fetch("/api/assignments/specialty", {
      method: "POST",
      body: JSON.stringify({
        pathfinderId: selectedUser,
        specialtyId: selectedSpecialty.id
      })
    });
  }

  return (
    <div className="space-y-4">

      {/* SELECIONAR USUÁRIO */}
      <div className="card p-4">
        <h2 className="section-title">Selecionar Desbravador</h2>

        <select
          className="input mt-3"
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">Selecione</option>
          {pathfinders.map((p: any) => (
            <option key={p.id} value={p.id}>
              {p.user.name}
            </option>
          ))}
        </select>
      </div>

      {/* ESCOLHER TIPO */}
      <div className="flex gap-2">
        <button
          className={`btn ${mode === "class" ? "bg-primary text-white" : ""}`}
          onClick={() => setMode("class")}
        >
          Classes
        </button>

        <button
          className={`btn ${mode === "specialty" ? "bg-primary text-white" : ""}`}
          onClick={() => setMode("specialty")}
        >
          Especialidades
        </button>
      </div>

      {/* CLASSES */}
      {mode === "class" && (
        <div className="card p-4">
          <h2 className="font-bold">Classes</h2>

          <select
            className="input mt-3"
            onChange={(e) =>
              setSelectedClass(
                classes.find((c: any) => c.id === e.target.value)
              )
            }
          >
            <option>Selecione classe</option>
            {classes.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {selectedClass && (
            <div className="mt-4 space-y-2">
              {selectedClass.requirements.map((req: any) => (
                <div
                  key={req.id}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  <span>{req.title}</span>

                  <button
                    onClick={() => markRequirement(req.id)}
                    className="text-xs bg-primary text-white px-2 py-1 rounded"
                  >
                    Marcar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ESPECIALIDADES */}
      {mode === "specialty" && (
        <div className="card p-4">
          <h2 className="font-bold">Especialidades</h2>

          <select
            className="input mt-3"
            onChange={(e) =>
              setSelectedSpecialty(
                specialties.find((s: any) => s.id === e.target.value)
              )
            }
          >
            <option>Selecione</option>
            {specialties.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {selectedSpecialty && (
            <button
              onClick={completeSpecialty}
              className="mt-4 bg-primary text-white px-4 py-2 rounded"
            >
              Concluir Especialidade
            </button>
          )}
        </div>
      )}
    </div>
  );
}