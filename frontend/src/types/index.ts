export type UserRole = 'STUDENT' | 'ADMIN' | 'VALIDATOR' | 'student' | 'admin' | 'validator';

export interface User {
  id: string;
  userId?: string;
  name: string;
  email: string;
  role: UserRole;
  prodi?: 'PTIK' | 'TEKOM';
  angkatan?: string;
  department?: string;
  status?: string;
  dosenPA?: string;
  dosenPANip?: string;
  photoUrl?: string;
  noHP?: string;
  alamat?: string;
  createdAt?: string;
  lastLogin?: string;
}

export interface Topic {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface ProposedTitle {
  titleId: string;
  title: string;
  topic?: string;
  description?: string;
  isApproved?: boolean;
}

export type SubmissionStatus = 
  | 'DRAFT'
  | 'draft'
  | 'PENDING_ADMIN_REVIEW'
  | 'pending_admin_review'
  | 'PENDING_VALIDATOR_REVIEW'
  | 'pending_validator_review'
  | 'APPROVED'
  | 'approved'
  | 'REJECTED'
  | 'rejected'
  | 'REJECTED_BY_ADMIN'
  | 'rejected_by_admin'
  | 'REJECTED_BY_VALIDATOR'
  | 'rejected_by_validator';

export interface StatusHistoryItem {
  status: SubmissionStatus;
  timestamp: string;
  actor?: string;
  assignedValidator?: string;
  reason?: string;
  approvedTitle?: string;
}

export interface ValidatorInfo {
  validatorId: string;
  name: string;
  email?: string;
  department?: string;
  status?: string;
  assignedSubmissions?: number;
}

export interface Submission {
  submissionId: string;
  studentId: string;
  nim?: string;
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;
  studentProdi?: 'PTIK' | 'TEKOM';
  dosenPA?: string | null;
  dosenPANip?: string | null;
  status: SubmissionStatus;
  titles: ProposedTitle[];
  submittedAt: string;
  assignedValidator?: ValidatorInfo | string | null;
  assignedAt?: string | null;
  assignedBy?: string | null;
  approvedAt?: string | null;
  approvedTitle?: string | null;
  approvedTitleId?: string | null;
  approvedBy?: string | null;
  approvedByName?: string | null;
  pembimbing1?: string | null;
  pembimbing2?: string | null;
  penguji1?: string | null;
  penguji2?: string | null;
  tanggalPenetapan?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  rejectedBy?: string | null;
  rejectedByName?: string | null;
  letterUrl?: string | null;
  letterGeneratedAt?: string | null;
  documentUrl?: string | null;
  documentName?: string | null;
  statusHistory?: StatusHistoryItem[];
  titleCount?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  details?: Record<string, unknown>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminStats {
  totalSubmissions: number;
  pendingAdminReview: number;
  pendingValidatorReview: number;
  approved: number;
  rejected: number;
  totalStudents: number;
  totalValidators: number;
  averageTimeToApproval: string;
  rejectionRate: string;
}
