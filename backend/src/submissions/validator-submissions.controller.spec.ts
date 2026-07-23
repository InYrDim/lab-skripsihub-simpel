import { Test, TestingModule } from '@nestjs/testing';
import { ValidatorSubmissionsController } from './validator-submissions.controller';
import { SubmissionsService } from './submissions.service';

describe('ValidatorSubmissionsController', () => {
  let controller: ValidatorSubmissionsController;
  let service: SubmissionsService;

  const mockUser = { id: 'validator-1', role: 'VALIDATOR' };

  const mockSubmissionsService = {
    getValidatorSubmissions: jest.fn(),
    getValidatorSubmissionById: jest.fn(),
    approveSubmission: jest.fn(),
    rejectSubmission: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ValidatorSubmissionsController],
      providers: [
        { provide: SubmissionsService, useValue: mockSubmissionsService },
      ],
    }).compile();

    controller = module.get<ValidatorSubmissionsController>(
      ValidatorSubmissionsController,
    );
    service = module.get<SubmissionsService>(SubmissionsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAssignedSubmissions', () => {
    it('should return submissions assigned to validator', async () => {
      const expected = {
        data: [{ submissionId: 'sub-1' }],
        pagination: { total: 1 },
      };
      mockSubmissionsService.getValidatorSubmissions.mockResolvedValue(
        expected,
      );

      const res = await controller.getAssignedSubmissions(mockUser, {});

      expect(res.success).toBe(true);
      expect(res.data).toEqual(expected.data);
      expect(service.getValidatorSubmissions).toHaveBeenCalledWith(
        'validator-1',
        {},
      );
    });
  });

  describe('getSubmissionDetail', () => {
    it('should return detailed assigned submission', async () => {
      const detail = { submissionId: 'sub-1' };
      mockSubmissionsService.getValidatorSubmissionById.mockResolvedValue(
        detail,
      );

      const res = await controller.getSubmissionDetail(mockUser, 'sub-1');

      expect(res.success).toBe(true);
      expect(res.data).toEqual(detail);
      expect(service.getValidatorSubmissionById).toHaveBeenCalledWith(
        'validator-1',
        'sub-1',
      );
    });
  });

  describe('approveSubmission', () => {
    it('should approve submission', async () => {
      const approved = { submissionId: 'sub-1', status: 'approved' };
      mockSubmissionsService.approveSubmission.mockResolvedValue(approved);

      const res = await controller.approveSubmission(mockUser, 'sub-1', {
        approvedTitleId: 'title-1',
      });

      expect(res.success).toBe(true);
      expect(res.data).toEqual(approved);
      expect(service.approveSubmission).toHaveBeenCalledWith(
        'validator-1',
        'sub-1',
        'title-1',
      );
    });
  });

  describe('rejectSubmission', () => {
    it('should reject submission', async () => {
      const rejected = { submissionId: 'sub-1', status: 'rejected' };
      mockSubmissionsService.rejectSubmission.mockResolvedValue(rejected);

      const res = await controller.rejectSubmission(mockUser, 'sub-1', {
        rejectionReason: 'The proposed title lacks clear methodology.',
      });

      expect(res.success).toBe(true);
      expect(res.data).toEqual(rejected);
      expect(service.rejectSubmission).toHaveBeenCalledWith(
        'validator-1',
        'sub-1',
        'The proposed title lacks clear methodology.',
      );
    });
  });
});
