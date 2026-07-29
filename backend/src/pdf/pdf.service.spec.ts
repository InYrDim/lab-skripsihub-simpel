import { Test, TestingModule } from '@nestjs/testing';
import { PdfService } from './pdf.service';

type PdfServiceInternals = {
  renderHtmlTemplate(data: {
    studentName: string;
    universityId: string;
    approvedTitle: string;
    validatorName: string;
    formattedDate: string;
    submissionId: string;
  }): string;
  resolveWithin(baseDir: string, fileName: string): string;
};

describe('PdfService', () => {
  let service: PdfService;
  let internals: PdfServiceInternals;

  beforeEach(async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_KEY;
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfService],
    }).compile();
    service = module.get(PdfService);
    internals = service as unknown as PdfServiceInternals;
  });

  it('escapes every interpolated HTML value', () => {
    const html = internals.renderHtmlTemplate({
      studentName: '<img src="http://internal.test"> & Student',
      universityId: "ID'123",
      approvedTitle: '<script>alert(1)</script>',
      validatorName: '<b>Validator</b>',
      formattedDate: '<date>',
      submissionId: 'sub-test-123',
    });

    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).not.toContain('<img src="http://internal.test">');
    expect(html).not.toContain('<b>Validator</b>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain(
      '&lt;img src=&quot;http://internal.test&quot;&gt; &amp; Student',
    );
    expect(html).toContain('ID&#39;123');
    expect(html).toContain('&lt;date&gt;');
  });

  it('rejects unsafe submission IDs before constructing a file path', async () => {
    await expect(
      service.generateApprovalLetterPdf({
        studentName: 'Student',
        universityId: '12345678',
        approvedTitle: 'A sufficiently long approved title',
        validatorName: 'Validator',
        approvalDate: '2026-06-01',
        submissionId: '../../outside',
      }),
    ).rejects.toThrow('Invalid submission ID');
  });

  it('rejects resolved paths outside the allowed directory', () => {
    expect(() =>
      internals.resolveWithin('/safe/letters', '../outside.pdf'),
    ).toThrow('Resolved path is outside the allowed directory');
  });
});
