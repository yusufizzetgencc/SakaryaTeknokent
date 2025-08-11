import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectNumber = searchParams.get("projectNumber");

  if (!projectNumber) {
    return new NextResponse(
      JSON.stringify({ error: "Proje numarası gerekli." }),
      { status: 400 }
    );
  }

  try {
    const project = await prisma.projectContract.findUnique({
      where: { projectNumber },
      include: {
        invoices: {
          orderBy: {
            invoiceDate: "asc",
          },
        },
      },
    });

    if (!project) {
      return new NextResponse(
        JSON.stringify({ error: "Bu proje numarası ile kayıt bulunamadı." }),
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    // DÜZELTME: Hata yakalama bloğu düzgün şekilde implemente edildi.
    console.error("[SEARCH_CONTRACT_ERROR]", error);
    return new NextResponse(
      JSON.stringify({ error: "Proje aranırken bir sunucu hatası oluştu." }),
      { status: 500 }
    );
  }
}
