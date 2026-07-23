"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var PdfService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let PdfService = PdfService_1 = class PdfService {
    logger = new common_1.Logger(PdfService_1.name);
    async generateApprovalLetterPdf(studentNameOrInput, universityId, approvedTitle, validatorName, approvalDate, submissionId) {
        let input;
        if (typeof studentNameOrInput === 'object') {
            input = studentNameOrInput;
        }
        else {
            input = {
                studentName: studentNameOrInput,
                universityId: universityId || '',
                approvedTitle: approvedTitle || '',
                validatorName: validatorName || '',
                approvalDate: approvalDate || new Date(),
                submissionId: submissionId || '',
            };
        }
        const formattedDate = new Date(input.approvalDate).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        const htmlContent = this.renderHtmlTemplate({
            studentName: input.studentName,
            universityId: input.universityId,
            approvedTitle: input.approvedTitle,
            validatorName: input.validatorName,
            formattedDate,
            submissionId: input.submissionId,
        });
        const uploadsDir = path.join(process.cwd(), 'uploads', 'letters');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const fileName = `approval_letter_${input.submissionId}.pdf`;
        const filePath = path.join(uploadsDir, fileName);
        let pdfBuffer;
        try {
            const puppeteer = require('puppeteer');
            const browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
            const page = await browser.newPage();
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
            pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
            });
            await browser.close();
            this.logger.log(`Successfully generated PDF with Puppeteer for submission ${input.submissionId}`);
        }
        catch (error) {
            this.logger.warn(`Puppeteer launch/render encountered limit (${error.message}). Falling back to mock PDF generator.`);
            pdfBuffer = this.generateFallbackPdfBuffer(input, formattedDate);
        }
        fs.writeFileSync(filePath, pdfBuffer);
        const pdfUrl = `/uploads/letters/${fileName}`;
        const pdfS3Key = `letters/${fileName}`;
        return {
            pdfUrl,
            pdfS3Key,
            filePath,
            buffer: pdfBuffer,
        };
    }
    renderHtmlTemplate(data) {
        return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Surat Keputusan Persetujuan Judul Skripsi</title>
  <style>
    body { font-family: 'Times New Roman', Times, serif; margin: 40px; color: #111; line-height: 1.6; }
    .header { text-align: center; border-bottom: 3px double #000; padding-bottom: 15px; margin-bottom: 25px; }
    .header h1 { margin: 0; font-size: 20px; font-weight: bold; text-transform: uppercase; }
    .header h2 { margin: 5px 0 0 0; font-size: 14px; font-weight: normal; }
    .doc-ref { font-size: 11px; font-family: sans-serif; color: #555; margin-top: 5px; }
    .title-box { text-align: center; margin: 25px 0; }
    .title-box h3 { text-decoration: underline; font-size: 16px; margin: 0 0 5px 0; text-transform: uppercase; }
    .title-box p { margin: 0; font-size: 13px; }
    .content { margin: 20px 0; font-size: 14px; text-align: justify; }
    .info-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    .info-table td { padding: 6px 4px; vertical-align: top; font-size: 14px; }
    .info-table td.label { width: 32%; font-weight: bold; }
    .signature-section { margin-top: 40px; width: 100%; display: table; }
    .signature-right { display: table-cell; text-align: right; width: 50%; }
    .signature-box { display: inline-block; text-align: center; width: 220px; }
    .signature-space { height: 75px; }
    .footer { margin-top: 60px; font-size: 10px; font-family: sans-serif; color: #777; border-top: 1px solid #ccc; padding-top: 8px; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>SKRIPSIHUB ACADEMIC SYSTEM</h1>
    <h2>DEWAN SERTIFIKASI & VALIDASI JUDUL SKRIPSI</h2>
    <div class="doc-ref">Document Reference ID: SKR/${data.submissionId}</div>
  </div>

  <div class="title-box">
    <h3>SURAT KEPUTUSAN PERSETUJUAN JUDUL SKRIPSI</h3>
    <p>Nomor: SKR/${data.submissionId}/${new Date().getFullYear()}</p>
  </div>

  <div class="content">
    <p>Berdasarkan hasil evaluasi dan verifikasi yang dilakukan oleh Tim Dosen Validator SkripsiHub, dengan ini menerangkan bahwa mahasiswa:</p>
    
    <table class="info-table">
      <tr>
        <td class="label">Nama Mahasiswa</td>
        <td>: ${data.studentName}</td>
      </tr>
      <tr>
        <td class="label">NIM / University ID</td>
        <td>: ${data.universityId}</td>
      </tr>
      <tr>
        <td class="label">Judul Skripsi Disetujui</td>
        <td>: <strong>${data.approvedTitle}</strong></td>
      </tr>
      <tr>
        <td class="label">Tanggal Persetujuan</td>
        <td>: ${data.formattedDate}</td>
      </tr>
    </table>

    <p>Telah dinyatakan <strong>DISETUJUI (APPROVED)</strong> dan berhak untuk melanjutkan ke tahap penyusunan proposal dan naskah skripsi selanjutnya sesuai petunjuk Dosen Pembimbing.</p>
  </div>

  <div class="signature-section">
    <div class="signature-right">
      <div class="signature-box">
        <p>Validator / Dosen Penguji,</p>
        <div class="signature-space"></div>
        <p><strong>(${data.validatorName})</strong></p>
        <p>Tim Validator Skripsi</p>
      </div>
    </div>
  </div>

  <div class="footer">
    Surat ini diterbitkan secara elektronik oleh Sistem SkripsiHub dan sah tanpa tanda tangan basah.<br/>
    Generated at: ${new Date().toISOString()} | Ref ID: SKR/${data.submissionId}
  </div>
</body>
</html>`;
    }
    generateFallbackPdfBuffer(input, formattedDate) {
        const escapePdfString = (str) => str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
        const streamContent = [
            'BT',
            '/F1 16 Tf 50 720 Td (Surat Keputusan Persetujuan Judul Skripsi) Tj',
            '/F1 10 Tf 0 -25 Td (Ref ID: SKR/' +
                escapePdfString(input.submissionId) +
                ') Tj',
            '0 -20 Td (Nama Mahasiswa: ' +
                escapePdfString(input.studentName) +
                ') Tj',
            '0 -15 Td (NIM/ID: ' + escapePdfString(input.universityId) + ') Tj',
            '0 -15 Td (Judul Disetujui: ' +
                escapePdfString(input.approvedTitle) +
                ') Tj',
            '0 -15 Td (Validator: ' + escapePdfString(input.validatorName) + ') Tj',
            '0 -15 Td (Tanggal: ' + escapePdfString(formattedDate) + ') Tj',
            'ET',
        ].join('\n');
        const streamLength = Buffer.byteLength(streamContent);
        const pdfString = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length ${streamLength} >>
stream
${streamContent}
endstream
endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000350 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
450
%%EOF`;
        return Buffer.from(pdfString, 'utf-8');
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = PdfService_1 = __decorate([
    (0, common_1.Injectable)()
], PdfService);
//# sourceMappingURL=pdf.service.js.map