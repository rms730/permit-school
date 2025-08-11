import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

interface GuardianConsentData {
  studentInitials: string;
  guardianName: string;
  courseTitle: string;
  jurisdiction: string;
  relation: string;
  signedAt: Date;
  ipAddress: string;
  userAgent: string;
  verifyUrl: string;
  jurisdictionDisclaimers?: string[];
}

export async function renderGuardianConsentPDF(data: GuardianConsentData): Promise<Uint8Array> {
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
  page.drawText('GUARDIAN CONSENT RECEIPT', {
    x: width / 2 - 140,
    y: height - 100,
    size: 20,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Draw main content
  const centerX = width / 2;
  let currentY = height - 180;

  // Student information (masked)
  page.drawText('Student:', {
    x: 72,
    y: currentY,
    size: 14,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText(data.studentInitials, {
    x: 150,
    y: currentY,
    size: 14,
    font: font,
    color: rgb(0.1, 0.1, 0.1),
  });

  currentY -= 30;

  // Course information
  page.drawText('Course:', {
    x: 72,
    y: currentY,
    size: 14,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText(data.courseTitle, {
    x: 150,
    y: currentY,
    size: 14,
    font: font,
    color: rgb(0.1, 0.1, 0.1),
  });

  currentY -= 30;

  // Jurisdiction
  page.drawText('Jurisdiction:', {
    x: 72,
    y: currentY,
    size: 14,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText(data.jurisdiction, {
    x: 150,
    y: currentY,
    size: 14,
    font: font,
    color: rgb(0.1, 0.1, 0.1),
  });

  currentY -= 50;

  // Guardian information
  page.drawText('Guardian Information:', {
    x: 72,
    y: currentY,
    size: 16,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });

  currentY -= 30;

  page.drawText('Name:', {
    x: 72,
    y: currentY,
    size: 14,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText(data.guardianName, {
    x: 150,
    y: currentY,
    size: 14,
    font: font,
    color: rgb(0.1, 0.1, 0.1),
  });

  currentY -= 30;

  page.drawText('Relationship:', {
    x: 72,
    y: currentY,
    size: 14,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText(data.relation, {
    x: 150,
    y: currentY,
    size: 14,
    font: font,
    color: rgb(0.1, 0.1, 0.1),
  });

  currentY -= 50;

  // Consent statement
  page.drawText('Consent Statement:', {
    x: 72,
    y: currentY,
    size: 16,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });

  currentY -= 30;

  const consentText = `I, ${data.guardianName}, am the legal guardian of the student and hereby provide consent for their participation in the ${data.courseTitle} course. I understand the course requirements and agree to the terms and conditions.`;

  // Wrap text to fit page width
  const maxWidth = width - 144; // 72px margins on each side
  const words = consentText.split(' ');
  let line = '';
  let lines: string[] = [];

  for (const word of words) {
    const testLine = line + (line ? ' ' : '') + word;
    const testWidth = font.widthOfTextAtSize(testLine, 12);
    
    if (testWidth > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  }
  if (line) {
    lines.push(line);
  }

  for (const line of lines) {
    page.drawText(line, {
      x: 72,
      y: currentY,
      size: 12,
      font: font,
      color: rgb(0.2, 0.2, 0.2),
    });
    currentY -= 20;
  }

  currentY -= 20;

  // Jurisdiction disclaimers
  if (data.jurisdictionDisclaimers && data.jurisdictionDisclaimers.length > 0) {
    page.drawText('Jurisdiction Disclaimers:', {
      x: 72,
      y: currentY,
      size: 14,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    currentY -= 25;

    for (const disclaimer of data.jurisdictionDisclaimers) {
      const disclaimerWords = disclaimer.split(' ');
      let disclaimerLine = '';
      let disclaimerLines: string[] = [];

      for (const word of disclaimerWords) {
        const testLine = disclaimerLine + (disclaimerLine ? ' ' : '') + word;
        const testWidth = font.widthOfTextAtSize(testLine, 10);
        
        if (testWidth > maxWidth && disclaimerLine) {
          disclaimerLines.push(disclaimerLine);
          disclaimerLine = word;
        } else {
          disclaimerLine = testLine;
        }
      }
      if (disclaimerLine) {
        disclaimerLines.push(disclaimerLine);
      }

      for (const line of disclaimerLines) {
        page.drawText(line, {
          x: 72,
          y: currentY,
          size: 10,
          font: font,
          color: rgb(0.4, 0.4, 0.4),
        });
        currentY -= 16;
      }
      currentY -= 8;
    }
  }

  // Signature information
  currentY -= 20;

  page.drawText('Digital Signature Information:', {
    x: 72,
    y: currentY,
    size: 14,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });

  currentY -= 25;

  const signedDate = data.signedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  page.drawText(`Signed: ${signedDate}`, {
    x: 72,
    y: currentY,
    size: 12,
    font: font,
    color: rgb(0.3, 0.3, 0.3),
  });

  currentY -= 20;

  page.drawText(`IP Address: ${data.ipAddress}`, {
    x: 72,
    y: currentY,
    size: 12,
    font: font,
    color: rgb(0.3, 0.3, 0.3),
  });

  currentY -= 20;

  // Truncate user agent if too long
  const truncatedUA = data.userAgent.length > 60 
    ? data.userAgent.substring(0, 57) + '...'
    : data.userAgent;

  page.drawText(`User Agent: ${truncatedUA}`, {
    x: 72,
    y: currentY,
    size: 12,
    font: font,
    color: rgb(0.3, 0.3, 0.3),
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
  page.drawText('This consent receipt can be verified online at the QR code above', {
    x: centerX - 160,
    y: 80,
    size: 10,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Serialize the PDF
  return await pdfDoc.save();
}
