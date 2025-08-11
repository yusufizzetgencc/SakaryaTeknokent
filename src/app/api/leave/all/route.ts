import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type LeaveRequestWithUser = Prisma.LeaveRequestGetPayload<{
  include: {
    user: {
      select: {
        firstName: true;
        lastName: true;
        email: true;
        username: true;
      };
    };
  };
}>;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const searchNameRaw = searchParams.get("name") ?? "";
    const searchTypeRaw = searchParams.get("type") ?? "";
    const searchStatusRaw = searchParams.get("status") ?? "";
    const sortByRaw = searchParams.get("sortBy") ?? "createdAt";
    const sortOrderRaw = searchParams.get("sortOrder") ?? "desc";

    const searchName = searchNameRaw.trim().toLowerCase();
    const searchType = searchTypeRaw.trim().toLowerCase();
    const searchStatus = searchStatusRaw.trim().toLowerCase();

    const allowedSortFields = [
      "createdAt",
      "startDate",
      "endDate",
      "user.firstName",
    ] as const;

    // sortBy için type guard (union türü)
    const sortBy = (
      allowedSortFields.includes(
        sortByRaw as (typeof allowedSortFields)[number]
      )
        ? sortByRaw
        : "createdAt"
    ) as (typeof allowedSortFields)[number];

    const sortOrder = sortOrderRaw === "asc" ? "asc" : "desc";

    // orderBy için doğru tip
    const orderBy: Prisma.Enumerable<Prisma.LeaveRequestOrderByWithRelationInput> =
      sortBy === "user.firstName"
        ? { user: { firstName: sortOrder } }
        : { [sortBy]: sortOrder };

    // where koşulu başlangıçta boş obje
    const where: Prisma.LeaveRequestWhereInput = {};

    if (searchName.length > 0) {
      // Önce kullanıcıları filtrele
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { firstName: { contains: searchName } },
            { lastName: { contains: searchName } },
          ],
        },
        select: { id: true },
      });
      const userIds = users.map((u) => u.id);

      // Kullanıcı ID'leri yoksa eşleşmeyecek sahte ID ver
      where.userId =
        userIds.length > 0 ? { in: userIds } : { equals: "non-existent-id" };
    }

    if (searchType.length > 0) {
      where.leaveType = { contains: searchType };
    }

    if (searchStatus.length > 0) {
      if (searchStatus === "approved") {
        where.approved = true;
      } else if (searchStatus === "rejected") {
        where.rejected = true;
      } else if (searchStatus === "pending") {
        where.approved = false;
        where.rejected = false;
      }
    }

    const leaveRequests: LeaveRequestWithUser[] =
      await prisma.leaveRequest.findMany({
        where,
        orderBy,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              username: true,
            },
          },
        },
      });

    return NextResponse.json(leaveRequests);
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Bilinmeyen sunucu hatası";
    console.error("[API][GET] /api/leave/all", errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
