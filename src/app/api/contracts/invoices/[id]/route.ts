import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// Bu fonksiyonu kendi dosya yükleme servisinize göre uyarlamanız gerekir.
async function uploadInvoiceFile(file: File): Promise<string> {
  console.log(`(Placeholder) Fatura dosyası yükleniyor: ${file.name}`);
  return `https://fake-storage.com/invoices/${Date.now()}-${file.name}`;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> } // Next.js 15 için güncellenmiş parametre yapısı
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return new NextResponse(JSON.stringify({ error: "Yetkiniz yok." }), {
      status: 403,
    });
  }

  try {
    // Params'ı await ile resolve ediyoruz
    const { id } = await context.params;

    const formData = await request.formData();
    const invoiceFile = formData.get("invoiceFile") as File | null;
    const paymentDate = formData.get("paymentDate") as string;

    if (!invoiceFile) {
      return new NextResponse(
        JSON.stringify({ error: "Fatura dosyası gerekli." }),
        { status: 400 }
      );
    }

    const fileUrl = await uploadInvoiceFile(invoiceFile);

    await prisma.projectInvoice.update({
      where: { id },
      data: {
        status: "PAID",
        fileUrl: fileUrl,
        paymentDate: new Date(paymentDate),
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Fatura güncelleme hatası:", error);
    return new NextResponse(
      JSON.stringify({ error: "Fatura güncellenirken bir hata oluştu." }),
      { status: 500 }
    );
  }
}
