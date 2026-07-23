import { Test, TestingModule } from '@nestjs/testing';
import { AdminSubmissionsController } from './admin-submissions.controller';
import { SubmissionsService } from './submissions.service';

describe('AdminSubmissionsController', () => {
  let controller: AdminSubmissionsController;
  let service: SubmissionsService;

  const mockSubmissionsService = {
    getAdminSubmissions: jest.fn(),
    getAdminSubmissionById: jest.fn(),
    assignValidator: jest.fn(),
    getAdminValidators: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminSubmissionsController],
      providers: [
        { provide: SubmissionsService, useValue: mockSubmissionsService },
      ],
    }).compile();

    controller = module.get<AdminSubmissionsController>(
      AdminSubmissionsController,
    );
    service = module.get<SubmissionsService>(SubmissionsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllSubmissions', () => {
    it('should return master queue of submissions', async () => {
      const expected = {
        data: [{ submissionId: 'sub-1' }],
        pagination: { total: 1 },
      };
      mockSubmissionsService.getAdminSubmissions.mockResolvedValue(expected);

      const res = await controller.getAllSubmissions({});

      expect(res.success).toBe(true);
      expect(res.data).toEqual(expected.data);
    });
  });

  describe('getSubmissionDetail', () => {
    it('should return submission detail for admin', async () => {
      const detail = { submissionId: 'sub-1' };
      mockSubmissionsService.getAdminSubmissionById.mockResolvedValue(detail);

      const res = await controller.getSubmissionDetail('sub-1');

      expect(res.success).toBe(true);
      expect(res.data).toEqual(detail);
    });
  });

  describe('assignValidator', () => {
    it('should assign validator to submission', async () => {
      const assigned = {
        submissionId: 'sub-1',
        status: 'pending_validator_review',
      };
      mockSubmissionsService.assignValidator.mockResolvedValue(assigned);

      const res = await controller.assignValidator('sub-1', {
        validatorId: 'val-1',
      });

      expect(res.success).toBe(true);
      expect(res.data).toEqual(assigned);
      expect(service.assignValidator).toHaveBeenCalledWith('sub-1', 'val-1');
    });
  });

  describe('getValidators', () => {
    it('should return available validators', async () => {
      const expected = {
        data: [{ validatorId: 'val-1' }],
        pagination: { total: 1 },
      };
      mockSubmissionsService.getAdminValidators.mockResolvedValue(expected);

      const res = await controller.getValidators({});

      expect(res.success).toBe(true);
      expect(res.data).toEqual(expected.data);
    });
  });
});
