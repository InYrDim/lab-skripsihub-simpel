import { Test, TestingModule } from '@nestjs/testing';
import { StudentSubmissionsController } from './student-submissions.controller';
import { SubmissionsService } from './submissions.service';
import { Response } from 'express';

describe('StudentSubmissionsController', () => {
  let controller: StudentSubmissionsController;
  let service: SubmissionsService;

  const mockUser = { id: 'student-1', role: 'STUDENT' };

  const mockSubmissionsService = {
    createSubmission: jest.fn(),
    getStudentSubmissions: jest.fn(),
    getStudentCurrentSubmission: jest.fn(),
    getStudentSubmissionById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentSubmissionsController],
      providers: [
        { provide: SubmissionsService, useValue: mockSubmissionsService },
      ],
    }).compile();

    controller = module.get<StudentSubmissionsController>(
      StudentSubmissionsController,
    );
    service = module.get<SubmissionsService>(SubmissionsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create submission', async () => {
      const dto = {
        titles: [{ title: 'Machine Learning in Healthcare Applications' }],
      };
      const expectedResult = {
        submissionId: 'sub-1',
        status: 'pending_admin_review',
      };
      mockSubmissionsService.createSubmission.mockResolvedValue(expectedResult);

      const response = await controller.create(mockUser, dto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(expectedResult);
      expect(service.createSubmission).toHaveBeenCalledWith('student-1', dto);
    });
  });

  describe('getMySubmissions', () => {
    it('should return submission history', async () => {
      const expectedResult = {
        data: [{ submissionId: 'sub-1' }],
        pagination: { total: 1 },
      };
      mockSubmissionsService.getStudentSubmissions.mockResolvedValue(
        expectedResult,
      );

      const response = await controller.getMySubmissions(mockUser, {});

      expect(response.success).toBe(true);
      expect(response.data).toEqual(expectedResult.data);
      expect(response.pagination).toEqual(expectedResult.pagination);
    });
  });

  describe('getCurrentSubmission', () => {
    it('should return active submission when found', async () => {
      const mockRes = { status: jest.fn() } as unknown as Response;
      const current = { submissionId: 'sub-1', status: 'pending_admin_review' };
      mockSubmissionsService.getStudentCurrentSubmission.mockResolvedValue(
        current,
      );

      const response = await controller.getCurrentSubmission(mockUser, mockRes);

      expect(response).toEqual({
        success: true,
        data: current,
        message: 'Current submission retrieved successfully',
      });
    });

    it('should set 204 status when active submission not found', async () => {
      const mockRes = { status: jest.fn() } as unknown as Response;
      mockSubmissionsService.getStudentCurrentSubmission.mockResolvedValue(
        null,
      );

      const response = await controller.getCurrentSubmission(mockUser, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(response).toBeUndefined();
    });
  });

  describe('getSubmissionDetail', () => {
    it('should return submission detail', async () => {
      const detail = { submissionId: 'sub-1', studentId: 'student-1' };
      mockSubmissionsService.getStudentSubmissionById.mockResolvedValue(detail);

      const response = await controller.getSubmissionDetail(mockUser, 'sub-1');

      expect(response.success).toBe(true);
      expect(response.data).toEqual(detail);
    });
  });
});
