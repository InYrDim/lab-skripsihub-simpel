import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Browser } from 'puppeteer';

export interface GenerateApprovalLetterInput {
  studentName: string;
  universityId: string;
  approvedTitle: string;
  validatorName: string;
  approvalDate: Date | string;
  submissionId: string;
}

export interface PdfGenerationResult {
  pdfUrl: string;
  pdfS3Key: string;
  filePath: string;
  buffer: Buffer;
}

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private supabase: SupabaseClient | null = null;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_KEY || '';

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.logger.log('Supabase client initialized');
    } else {
      this.logger.warn(
        'SUPABASE_URL or SUPABASE_KEY not found in env. Supabase upload will be skipped.',
      );
    }
  }

  /**
   * Accepts either positional parameters or an options object.
   * Renders official Thesis Title Approval Letter PDF.
   */
  async generateApprovalLetterPdf(
    studentNameOrInput: string | GenerateApprovalLetterInput,
    universityId?: string,
    approvedTitle?: string,
    validatorName?: string,
    approvalDate?: Date | string,
    submissionId?: string,
  ): Promise<PdfGenerationResult> {
    let input: GenerateApprovalLetterInput;

    if (typeof studentNameOrInput === 'object') {
      input = studentNameOrInput;
    } else {
      input = {
        studentName: studentNameOrInput,
        universityId: universityId || '',
        approvedTitle: approvedTitle || '',
        validatorName: validatorName || '',
        approvalDate: approvalDate || new Date(),
        submissionId: submissionId || '',
      };
    }

    const formattedDate = new Date(input.approvalDate).toLocaleDateString(
      'id-ID',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      },
    );

    const htmlContent = this.renderHtmlTemplate({
      studentName: input.studentName,
      universityId: input.universityId,
      approvedTitle: input.approvedTitle,
      validatorName: input.validatorName,
      formattedDate,
      submissionId: input.submissionId,
    });

    this.assertSafeSubmissionId(input.submissionId);

    const uploadsDir = path.resolve(process.cwd(), 'uploads', 'letters');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `approval_letter_${input.submissionId}.pdf`;
    const filePath = this.resolveWithin(uploadsDir, fileName);

    let pdfBuffer: Buffer;

    let browser: Browser | undefined;
    try {
      const puppeteer = await import('puppeteer');
      browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.setJavaScriptEnabled(false);
      await page.setRequestInterception(true);
      page.on('request', (request: { abort: () => void }) => request.abort());
      await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
      pdfBuffer = Buffer.from(
        await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: {
            top: '20mm',
            right: '20mm',
            bottom: '20mm',
            left: '20mm',
          },
        }),
      );
      this.logger.log(
        `Successfully generated PDF with Puppeteer for submission ${input.submissionId}`,
      );
    } catch {
      this.logger.warn(
        `Puppeteer launch/render failed. Falling back to basic PDF generator.`,
      );
      pdfBuffer = this.generateFallbackPdfBuffer(input, formattedDate);
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch {
          this.logger.warn('Failed to close Puppeteer browser cleanly');
        }
      }
    }

    fs.writeFileSync(filePath, pdfBuffer);

    let pdfUrl = `/uploads/letters/${fileName}`;
    const pdfS3Key = `letters/${fileName}`;
    const bucketName = process.env.SUPABASE_BUCKET || 'letters';

    if (this.supabase) {
      try {
        const { error } = await this.supabase.storage
          .from(bucketName)
          .upload(pdfS3Key, pdfBuffer, {
            contentType: 'application/pdf',
            upsert: true,
          });

        if (error) throw error;

        const { data: publicUrlData } = this.supabase.storage
          .from(bucketName)
          .getPublicUrl(pdfS3Key);

        pdfUrl = publicUrlData.publicUrl;
        this.logger.log(`Successfully uploaded PDF to Supabase: ${pdfUrl}`);
      } catch (uploadError) {
        this.logger.error(
          `Failed to upload to Supabase: ${(uploadError as Error).message}`,
        );
      }
    }

    return {
      pdfUrl,
      pdfS3Key,
      filePath,
      buffer: pdfBuffer,
    };
  }

  private assertSafeSubmissionId(submissionId: string): void {
    if (!/^[A-Za-z0-9_-]{1,128}$/.test(submissionId)) {
      throw new Error('Invalid submission ID');
    }
  }

  private resolveWithin(baseDir: string, fileName: string): string {
    const resolvedBase = path.resolve(baseDir);
    const resolvedPath = path.resolve(resolvedBase, fileName);
    if (!resolvedPath.startsWith(`${resolvedBase}${path.sep}`)) {
      throw new Error('Resolved path is outside the allowed directory');
    }
    return resolvedPath;
  }

  private escapeHtml(value: unknown): string {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private renderHtmlTemplate(data: {
    studentName: string;
    universityId: string;
    approvedTitle: string;
    validatorName: string;
    formattedDate: string;
    submissionId: string;
  }): string {
    const escaped = {
      studentName: this.escapeHtml(data.studentName),
      universityId: this.escapeHtml(data.universityId),
      approvedTitle: this.escapeHtml(data.approvedTitle),
      validatorName: this.escapeHtml(data.validatorName),
      formattedDate: this.escapeHtml(data.formattedDate),
      submissionId: this.escapeHtml(data.submissionId),
      generatedAt: this.escapeHtml(new Date().toISOString()),
      year: this.escapeHtml(new Date().getFullYear()),
    };

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
    <div class="doc-ref">Document Reference ID: SKR/${escaped.submissionId}</div>
  </div>

  <div class="title-box">
    <h3>SURAT KEPUTUSAN PERSETUJUAN JUDUL SKRIPSI</h3>
    <p>Nomor: SKR/${escaped.submissionId}/${escaped.year}</p>
  </div>

  <div class="content">
    <p>Berdasarkan hasil evaluasi dan verifikasi yang dilakukan oleh Tim Dosen Validator SkripsiHub, dengan ini menerangkan bahwa mahasiswa:</p>
    
    <table class="info-table">
      <tr>
        <td class="label">Nama Mahasiswa</td>
        <td>: ${escaped.studentName}</td>
      </tr>
      <tr>
        <td class="label">NIM / University ID</td>
        <td>: ${escaped.universityId}</td>
      </tr>
      <tr>
        <td class="label">Judul Skripsi Disetujui</td>
        <td>: <strong>${escaped.approvedTitle}</strong></td>
      </tr>
      <tr>
        <td class="label">Tanggal Persetujuan</td>
        <td>: ${escaped.formattedDate}</td>
      </tr>
    </table>

    <p>Telah dinyatakan <strong>DISETUJUI (APPROVED)</strong> dan berhak untuk melanjutkan ke tahap penyusunan proposal dan naskah skripsi selanjutnya sesuai petunjuk Dosen Pembimbing.</p>
  </div>

  <div class="signature-section">
    <div class="signature-right">
      <div class="signature-box">
        <p>Validator / Dosen Penguji,</p>
        <div class="signature-space"></div>
        <p><strong>(${escaped.validatorName})</strong></p>
        <p>Tim Validator Skripsi</p>
      </div>
    </div>
  </div>

  <div class="footer">
    Surat ini diterbitkan secara elektronik oleh Sistem SkripsiHub dan sah tanpa tanda tangan basah.<br/>
    Generated at: ${escaped.generatedAt} | Ref ID: SKR/${escaped.submissionId}
  </div>
</body>
</html>`;
  }

  private generateFallbackPdfBuffer(
    input: GenerateApprovalLetterInput,
    formattedDate: string,
  ): Buffer {
    const escapePdfString = (str: string) =>
      str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

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
}
