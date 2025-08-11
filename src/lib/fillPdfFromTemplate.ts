import fs from "fs";
import path from "path";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

type LeaveData = {
  firstName: string;
  lastName: string;
  contactInfo: string;
  unit: string;
  startDate: string;
  endDate: string;
  duration: string;
  leaveType: string;
  explanation?: string;
};

export async function fillPdfFromTemplate(
  leaveData: LeaveData
): Promise<Uint8Array> {
  const templateFilePath = path.join(
    process.cwd(),
    "public",
    "templates",
    "izin-formu.pdf"
  );

  if (!fs.existsSync(templateFilePath)) {
    throw new Error(`Şablon PDF dosyası bulunamadı: ${templateFilePath}`);
  }

  console.log(`Şablon PDF dosyası bulundu: ${templateFilePath}`);
  const templateBytes = fs.readFileSync(templateFilePath);
  const pdfDoc = await PDFDocument.load(templateBytes);

  // Fontkit'i kaydet
  pdfDoc.registerFontkit(fontkit);
  console.log("PDF şablonu yüklendi.");

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  // Custom font supporting Turkish characters
  const customFontPath = path.join(
    process.cwd(),
    "public",
    "fonts",
    "OpenSans-Regular.ttf"
  );

  const fontBytes = fs.readFileSync(customFontPath);
  const font = await pdfDoc.embedFont(fontBytes);
  const fontSize = 11;

  const drawText = (text: string, x: number, y: number) => {
    firstPage.drawText(text || "", {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
  };

  // Form alanlarını doldur - koordinatları PDF'deki gerçek konumlara göre ayarlayın
  drawText(`${leaveData.firstName} ${leaveData.lastName}`, 112, 671); // İsim alanı
  drawText(leaveData.contactInfo, 176, 644); // İletişim bilgisi
  drawText(leaveData.unit, 145, 617); // Birim

  // İzin türü seçimi - PDF'deki checkbox'ların yanına X koyar
  if (leaveData.leaveType === "YILLIK") drawText("X", 122, 563);
  if (leaveData.leaveType === "MAZERET") drawText("X", 140, 549);
  if (leaveData.leaveType === "HASTALIK") drawText("X", 138, 494);
  if (leaveData.leaveType === "UCRETSIZ") drawText("X", 138, 467);
  if (leaveData.leaveType === "IDARI") drawText("X", 152, 453);

  // Başlangıç ve bitiş tarihlerini saatli formatta yazdır
  const formatDateTime = (iso: string) => {
    const date = new Date(iso);
    return `${date.toLocaleDateString("tr-TR")} ${date.toLocaleTimeString(
      "tr-TR",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    )}`;
  };

  drawText(`${formatDateTime(leaveData.startDate)}`, 138, 385); // Örn: 07.08.2025 10:00
  drawText(`${formatDateTime(leaveData.endDate)}`, 138, 358); // Örn: 08.08.2025 12:00

  // Süreyi "X gün Y saat" formatında yazdır
  drawText(`${leaveData.duration}`, 185, 332); // Örn: 1 gün 2 saat

  // Açıklama - daha geniş alan
  drawText(leaveData.explanation || "", 45, 270);

  console.log("PDF içeriği dolduruldu, kaydediliyor...");
  const pdfBytes = await pdfDoc.save();
  console.log("PDF başarıyla oluşturuldu.");
  return pdfBytes;
}
