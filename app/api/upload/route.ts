import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return NextResponse.json(
        { error: "CLOUDINARY_CLOUD_NAME não configurado." },
        { status: 500 }
      );
    }

    if (!process.env.CLOUDINARY_API_KEY) {
      return NextResponse.json(
        { error: "CLOUDINARY_API_KEY não configurado." },
        { status: 500 }
      );
    }

    if (!process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: "CLOUDINARY_API_SECRET não configurado." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Arquivo não enviado corretamente." },
        { status: 400 }
      );
    }

    if (!file.type?.startsWith("image/")) {
      return NextResponse.json(
        { error: "Envie apenas arquivos de imagem." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const upload = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "clube-frutos-do-espirito",
          resource_type: "image"
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }

          if (!result) {
            return reject(new Error("Cloudinary não retornou resultado."));
          }

          resolve(result);
        }
      );

      stream.end(buffer);
    });

    return NextResponse.json({
      ok: true,
      url: upload.secure_url,
      publicId: upload.public_id
    });
  } catch (error: any) {
    console.error("Erro no upload:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          error?.error?.message ||
          "Erro ao enviar imagem."
      },
      { status: 500 }
    );
  }
}