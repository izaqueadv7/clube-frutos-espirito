import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireLeader } from "@/lib/api-auth";

export async function GET() {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;

  const role = authResult.session.user.role;
  const userId = authResult.session.user.id;

  if (role === "LEADER") {
    const list = await prisma.pathfinder.findMany({
      include: {
        user: { select: { name: true, email: true } },
        currentClass: true,
        specialties: true,
        progress: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ items: list });
  }

  if (role === "PARENT") {
    const parent = await prisma.parent.findUnique({
      where: { userId },
      include: {
        children: {
          include: {
            pathfinder: {
              include: {
                user: { select: { name: true, email: true } },
                currentClass: true,
                specialties: { include: { specialty: true } },
                progress: { include: { requirement: true } }
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      items: parent?.children.map((relation: any) => relation.pathfinder) ?? []
    });
  }

  const pathfinder = await prisma.pathfinder.findUnique({
    where: { userId },
    include: {
      user: { select: { name: true, email: true } },
      currentClass: true,
      specialties: { include: { specialty: true } },
      progress: { include: { requirement: true } }
    }
  });

  return NextResponse.json({ items: pathfinder ? [pathfinder] : [] });
}

export async function POST(request: Request) {
  const authResult = await requireLeader();
  if ("error" in authResult) return authResult.error;

  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "Pathfinder@123");
  const className = body.className ? String(body.className) : null;
  const parentEmail = body.parentEmail ? String(body.parentEmail).toLowerCase().trim() : null;

  if (!name || !email || password.length < 8) {
    return NextResponse.json({ error: "Nome, email e senha valida sao obrigatorios" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email ja em uso" }, { status: 409 });
  }

  const chosenClass = className ? await prisma.pathfinderClass.findUnique({ where: { name: className } }) : null;
  const passwordHash = await bcrypt.hash(password, 10);

  const created = await prisma.$transaction(async (tx: any) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "PATHFINDER"
      }
    });

    const pathfinder = await tx.pathfinder.create({
      data: {
        userId: user.id,
        currentClassId: chosenClass?.id
      }
    });

    if (parentEmail) {
      const parentUser = await tx.user.findFirst({
        where: { email: parentEmail, role: "PARENT" },
        include: { parentProfile: true }
      });

      if (parentUser?.parentProfile) {
        await tx.parentPathfinder.create({
          data: {
            parentId: parentUser.parentProfile.id,
            pathfinderId: pathfinder.id
          }
        });
      }
    }

    return { user, pathfinder };
  });

  return NextResponse.json({
    message: "Pathfinder cadastrado",
    item: {
      id: created.pathfinder.id,
      name: created.user.name,
      email: created.user.email
    }
  });
}
