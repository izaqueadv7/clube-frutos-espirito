import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessFullLeaderPanel } from "@/lib/permissions";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user || !canAccessFullLeaderPanel(session.user)) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  try {
    const body = await request.json();

    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "").trim();
    const classId = String(body?.classId || "").trim();
    const parentEmail = String(body?.parentEmail || "").trim().toLowerCase();
    const birthDateRaw = String(body?.birthDate || "").trim();
    const parentPhone = String(body?.parentPhone || "").trim();
    const notes = String(body?.notes || "").trim();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Já existe usuário com esse email." },
        { status: 409 }
      );
    }

    let currentClassId: string | null = null;

    if (classId) {
      const existingClass = await prisma.pathfinderClass.findUnique({
        where: { id: classId }
      });

      if (!existingClass) {
        return NextResponse.json(
          { error: "Classe inválida." },
          { status: 400 }
        );
      }

      currentClassId = existingClass.id;
    }

    let birthDate: Date | null = null;
    if (birthDateRaw) {
      const parsed = new Date(birthDateRaw);
      if (!Number.isNaN(parsed.getTime())) {
        birthDate = parsed;
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "PATHFINDER",
        isActive: true,
        status: "APPROVED"
      }
    });

    const pathfinder = await prisma.pathfinder.create({
      data: {
        userId: user.id,
        birthDate,
        currentClassId,
        notes: notes || null
      }
    });

    if (parentEmail) {
      let parentUser = await prisma.user.findUnique({
        where: { email: parentEmail }
      });

      if (!parentUser) {
        const generatedPasswordHash = await bcrypt.hash("Responsavel@123", 10);

        parentUser = await prisma.user.create({
          data: {
            name: `Responsável de ${name}`,
            email: parentEmail,
            passwordHash: generatedPasswordHash,
            role: "PARENT",
            isActive: true,
            status: "APPROVED"
          }
        });
      }

      let parentProfile = await prisma.parent.findUnique({
        where: { userId: parentUser.id }
      });

      if (!parentProfile) {
        parentProfile = await prisma.parent.create({
          data: {
            userId: parentUser.id,
            phone: parentPhone || null
          }
        });
      } else if (parentPhone) {
        parentProfile = await prisma.parent.update({
          where: { id: parentProfile.id },
          data: {
            phone: parentPhone
          }
        });
      }

      await prisma.parentPathfinder.upsert({
        where: {
          parentId_pathfinderId: {
            parentId: parentProfile.id,
            pathfinderId: pathfinder.id
          }
        },
        update: {},
        create: {
          parentId: parentProfile.id,
          pathfinderId: pathfinder.id
        }
      });
    }

    if (currentClassId) {
      const requirements = await prisma.classRequirement.findMany({
        where: { classId: currentClassId }
      });

      for (const requirement of requirements) {
        await prisma.pathfinderProgress.create({
          data: {
            pathfinderId: pathfinder.id,
            requirementId: requirement.id,
            completed: false
          }
        });
      }
    }

    return NextResponse.json({ ok: true, user, pathfinder }, { status: 201 });
  } catch (error) {
    console.error("Erro ao cadastrar desbravador:", error);
    return NextResponse.json(
      { error: "Erro ao cadastrar desbravador." },
      { status: 500 }
    );
  }
}