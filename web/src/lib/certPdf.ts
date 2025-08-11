import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

interface CertificateData {
  studentName: string;
  courseTitle: string;
  jurisdiction: string;
  number: string;
  issuedAt: Date;
  issuerName: string;
  issuerLicense: string;
  verifyUrl: string;
}

export async function renderCertificatePDF(data: CertificateData): Promise<Uint8Array> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // US Letter size
  const { width, height } = page.getSize();

  // Get the standard font
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Generate QR code
  const qrCodeDataUrl = await QRCode.toDataURL(data.verifyUrl, {
    width: 128,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });

  // Convert data URL to Uint8Array
  const qrCodeBase64 = qrCodeDataUrl.split(',')[1];
  const qrCodeBytes = Uint8Array.from(atob(qrCodeBase64), c => c.charCodeAt(0));
  const qrCodeImage = await pdfDoc.embedPng(qrCodeBytes);

  // Draw border
  page.drawRectangle({
    x: 36,
    y: 36,
    width: width - 72,
    height: height - 72,
    borderWidth: 2,
    borderColor: rgb(0.2, 0.2, 0.2),
  });

  // Draw title
  page.drawText('CERTIFICATE OF COMPLETION', {
    x: width / 2 - 150,
    y: height - 120,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Draw certificate number
  page.drawText(`Certificate Number: ${data.number}`, {
    x: width / 2 - 100,
    y: height - 160,
    size: 12,
    font: font,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Draw main content
  const centerX = width / 2;
  const startY = height - 250;

  page.drawText('This is to certify that', {
    x: centerX - 80,
    y: startY,
    size: 14,
    font: font,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Student name
  page.drawText(data.studentName, {
    x: centerX - 120,
    y: startY - 50,
    size: 18,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  page.drawText('has successfully completed the', {
    x: centerX - 100,
    y: startY - 80,
    size: 14,
    font: font,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Course title
  page.drawText(data.courseTitle, {
    x: centerX - 140,
    y: startY - 110,
    size: 16,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  page.drawText(`in ${data.jurisdiction}`, {
    x: centerX - 60,
    y: startY - 140,
    size: 14,
    font: font,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Issue date
  const issueDate = data.issuedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  page.drawText(`Issued on ${issueDate}`, {
    x: centerX - 80,
    y: startY - 180,
    size: 14,
    font: font,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Issuer information
  page.drawText(`Issued by: ${data.issuerName}`, {
    x: 72,
    y: 200,
    size: 12,
    font: font,
    color: rgb(0.4, 0.4, 0.4),
  });

  page.drawText(`License: ${data.issuerLicense}`, {
    x: 72,
    y: 180,
    size: 12,
    font: font,
    color: rgb(0.4, 0.4, 0.4),
  });

  // QR code for verification
  const qrSize = 80;
  page.drawImage(qrCodeImage, {
    x: width - 120,
    y: 120,
    width: qrSize,
    height: qrSize,
  });

  page.drawText('Scan to verify', {
    x: width - 130,
    y: 100,
    size: 10,
    font: font,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Footer
  page.drawText('This certificate can be verified online at the QR code above', {
    x: centerX - 150,
    y: 80,
    size: 10,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Serialize the PDF
  return await pdfDoc.save();
}
