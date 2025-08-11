import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı." },
        { status: 404 }
      );
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        leaveType: true,
        startDate: true,
        endDate: true,
        duration: true,
        approved: true,
        rejected: true,
        rejectionReason: true,
      },
    });

    return NextResponse.json(leaveRequests);
  } catch (error) {
    console.error("İzin talepleri alınırken hata:", error);
    return NextResponse.json({ error: "Hata oluştu." }, { status: 500 });
  }
}
