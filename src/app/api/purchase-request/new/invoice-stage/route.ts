import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const requests = await prisma.purchaseRequest.findMany({
      where: { stage: 5 },
      include: {
        user: true,
        kategori: true,
        invoices: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error("Invoice stage fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Siparişler alınamadı" },
      { status: 500 }
    );
  }
}
