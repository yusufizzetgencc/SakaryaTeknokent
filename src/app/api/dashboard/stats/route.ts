import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const userEmail = session.user.email;

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Kullanıcı bulunamadı" },
      { status: 404 }
    );
  }

  const totalLeaveRequests = await prisma.leaveRequest.count({
    where: { userId: user.id },
  });

  // Modelinizde yoksa bu alanları ileride güncelleyebilirsiniz
  const totalPurchaseRequests = 0;
  const activeProjectsCount = 0;

  return NextResponse.json({
    totalLeaveRequests,
    totalPurchaseRequests,
    activeProjectsCount,
  });
}
