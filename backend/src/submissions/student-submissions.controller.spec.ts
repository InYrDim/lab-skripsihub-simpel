import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createClient } from '@supabase/supabase-js';
import { StudentSubmissionsController } from './student-submissions.controller';
import { SubmissionsService } from './submissions.service';

jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn() }));

const upload = jest.fn();
const getPublicUrl = jest.fn();
const from = jest.fn(() => ({ upload, getPublicUrl }));

describe('StudentSubmissionsController', () => {
  let controller: StudentSubmissionsController;

  const mockUser = { id: 'student-1', role: 'STUDENT' };
  const mockSubmissionsService = {
    createSubmission: jest.fn(),
    getStudentSubmissions: jest.fn(),
    getStudentCurrentSubmission: jest.fn(),
    getStudentSubmissionById: jest.fn(),
  };
  const validDocument = {
    originalname: 'proposal.pdf',
    mimetype: 'application/pdf',
    size: 12,
    buffer: Buffer.from('%PDF-1.7 test'),
  } as Express.Multer.File;

  beforeEach(async () => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_KEY = 'test-key';
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue({ storage: { from } });
    upload.mockResolvedValue({ error: null });
    getPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://cdn.example/proposal.pdf' },
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentSubmissionsController],
      providers: [
        { provide: SubmissionsService, useValue: mockSubmissionsService },
      ],
    }).compile();
    controller = module.get(StudentSubmissionsController);
  });

  afterEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_KEY;
  });

  it('uploads a valid PDF and creates a submission', async () => {
    const titles = [{ title: 'Machine Learning in Healthcare Applications' }];
    mockSubmissionsService.createSubmission.mockResolvedValue({
      submissionId: 'sub-1',
    });

    const response = await controller.create(
      mockUser,
      { titles: JSON.stringify(titles) },
      validDocument,
    );

    expect(response.success).toBe(true);
    expect(upload).toHaveBeenCalledWith(
      expect.stringMatching(/^[0-9a-f-]+\.pdf$/),
      validDocument.buffer,
      { contentType: 'application/pdf', upsert: true },
    );
    expect(mockSubmissionsService.createSubmission).toHaveBeenCalledWith(
      'student-1',
      {
        titles,
        documentUrl: 'https://cdn.example/proposal.pdf',
        documentName: 'proposal.pdf',
      },
    );
  });

  it('rejects files whose content does not have a PDF signature', async () => {
    await expect(
      controller.create(
        mockUser,
        { titles: JSON.stringify([{ title: 'A valid proposal title' }]) },
        {
          ...validDocument,
          buffer: Buffer.from('<html>not a PDF</html>'),
          size: 22,
        },
      ),
    ).rejects.toThrow('Berkas harus berupa PDF yang valid');
    expect(createClient).not.toHaveBeenCalled();
  });

  it.each([
    ['not an array', JSON.stringify({ title: 'A valid proposal title' })],
    ['empty', '[]'],
    [
      'too many',
      JSON.stringify(Array(4).fill({ title: 'A valid title here' })),
    ],
    ['wrong shape', JSON.stringify([{ title: 123 }])],
    ['too short', JSON.stringify([{ title: 'short' }])],
    ['too long', JSON.stringify([{ title: 'x'.repeat(201) }])],
  ])('rejects invalid parsed titles: %s', async (_case, titles) => {
    await expect(
      controller.create(mockUser, { titles }, validDocument),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(createClient).not.toHaveBeenCalled();
  });

  it('does not expose raw Supabase upload errors', async () => {
    upload.mockResolvedValue({ error: { message: 'secret storage detail' } });

    await expect(
      controller.create(
        mockUser,
        { titles: JSON.stringify([{ title: 'A valid proposal title' }]) },
        validDocument,
      ),
    ).rejects.toThrow('Gagal mengunggah berkas pengajuan');

    try {
      await controller.create(
        mockUser,
        { titles: JSON.stringify([{ title: 'A valid proposal title' }]) },
        validDocument,
      );
    } catch (error) {
      expect((error as Error).message).not.toContain('secret storage detail');
    }
  });
});
