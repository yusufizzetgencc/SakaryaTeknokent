import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client"; // Prisma'nın türlerini içe aktarın

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  // Rol kontrolü "admin" olarak güncellendi, şemanızda admin rolü varsa bu şekilde kalabilir.
  if (!session || session.user.role !== "admin") {
    return new NextResponse(JSON.stringify({ error: "Yetkiniz yok." }), {
      status: 403,
    });
  }

  const contractId = params.id;

  try {
    // İlişkili tüm verileri güvenli bir şekilde silmek için transaction kullan
    await prisma.$transaction(async (tx) => {
      // 1. Önce bu sözleşmeye bağlı tüm faturaları sil
      await tx.projectInvoice.deleteMany({
        where: { projectContractId: contractId },
      });
      // 2. Sonra ana sözleşmeyi sil
      await tx.projectContract.delete({
        where: { id: contractId },
      });
    });

    return new NextResponse(null, { status: 204 }); // Başarılı, içerik yok
  } catch (error) {
    // 'error: any' kaldırıldı
    console.error(`Proje (ID: ${contractId}) silinirken hata:`, error);

    // Hatanın bilinen bir Prisma hatası olup olmadığını kontrol et
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Kayıt bulunamazsa Prisma 'P2025' hatası verir
      if (error.code === "P2025") {
        return new NextResponse(
          JSON.stringify({ error: "Silinecek proje bulunamadı." }),
          { status: 404 }
        );
      }
    }

    // Diğer tüm hatalar için genel bir hata mesajı döndür
    return new NextResponse(
      JSON.stringify({ error: "Proje silinirken bir hata oluştu." }),
      { status: 500 }
    );
  }
}
