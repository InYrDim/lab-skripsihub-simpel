import { Test, TestingModule } from '@nestjs/testing';
import { PdfService } from './pdf.service';
import * as fs from 'fs';
import * as path from 'path';

describe('PdfService', () => {
  let service: PdfService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfService],
    }).compile();

    service = module.get<PdfService>(PdfService);
  });

  afterEach(() => {
    // Cleanup generated test pdf files if any
    const testFilePath = path.join(
      process.cwd(),
      'uploads',
      'letters',
      'approval_letter_sub-test-123.pdf',
    );
    if (fs.existsSync(testFilePath)) {
      try {
        fs.unlinkSync(testFilePath);
      } catch {}
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateApprovalLetterPdf', () => {
    it('should generate PDF when called with individual parameters', async () => {
      const result = await service.generateApprovalLetterPdf(
        'Budi Santoso',
        '12345678',
        'Implementasi AI pada Sistem Akademik',
        'Dr. Ir. Hendra',
        new Date('2026-05-10'),
        'sub-test-123',
      );

      expect(result).toBeDefined();
      expect(result.pdfUrl).toBe(
        '/uploads/letters/approval_letter_sub-test-123.pdf',
      );
      expect(result.pdfS3Key).toBe('letters/approval_letter_sub-test-123.pdf');
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(fs.existsSync(result.filePath)).toBe(true);
    });

    it('should generate PDF when called with an input object', async () => {
      const result = await service.generateApprovalLetterPdf({
        studentName: 'Siti Rahma',
        universityId: '87654321',
        approvedTitle: 'Keamanan Jaringan Berbasis Blockchain',
        validatorName: 'Dr. Prof. Budi',
        approvalDate: '2026-06-01',
        submissionId: 'sub-test-123',
      });

      expect(result).toBeDefined();
      expect(result.pdfUrl).toContain('approval_letter_sub-test-123.pdf');
      expect(result.buffer.length).toBeGreaterThan(0);
      expect(fs.existsSync(result.filePath)).toBe(true);
    });
  });
});
