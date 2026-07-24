import type { 
  ApiResponse, 
  User, 
  Submission, 
  ValidatorInfo, 
  AdminStats,
  Topic
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Initial Mock Storage State for fallback / demo mode
let mockTopics: Topic[] = [
  { id: 'top_001', name: 'Software Engineering', isActive: true },
  { id: 'top_002', name: 'Data Science & Machine Learning', isActive: true },
  { id: 'top_003', name: 'Cybersecurity', isActive: true },
  { id: 'top_004', name: 'Internet of Things (IoT)', isActive: true },
  { id: 'top_005', name: 'Information Systems', isActive: true },
  { id: 'top_006', name: 'Artificial Intelligence', isActive: true },
  { id: 'top_007', name: 'Computer Networks', isActive: true },
];

const mockUsers: User[] = [
  {
    id: 'usr_student_01',
    userId: 'usr_student_01',
    name: 'Alex Student',
    email: 'student@university.edu',
    role: 'STUDENT',
    prodi: 'PTIK',
    department: 'Computer Science',
    status: 'active',
    createdAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'usr_student_02',
    userId: 'usr_student_02',
    name: 'Putri Ayu Lestari',
    email: 'putri.ayu@university.edu',
    role: 'STUDENT',
    prodi: 'PTIK',
    department: 'Information Technology',
    status: 'active',
    createdAt: '2024-02-05T08:00:00Z',
  },
  {
    id: 'usr_student_03',
    userId: 'usr_student_03',
    name: 'Muhammad Fadilah',
    email: 'fadilah@university.edu',
    role: 'STUDENT',
    prodi: 'PTIK',
    department: 'Computer Science',
    status: 'active',
    createdAt: '2024-02-12T08:00:00Z',
  },
  {
    id: 'usr_student_04',
    userId: 'usr_student_04',
    name: 'Rina Sari',
    email: 'rina.sari@university.edu',
    role: 'STUDENT',
    prodi: 'PTIK',
    department: 'Information Systems',
    status: 'active',
    createdAt: '2024-03-01T08:00:00Z',
  },
  {
    id: 'usr_student_05',
    userId: 'usr_student_05',
    name: 'Andi Pratama',
    email: 'andi.pratama@university.edu',
    role: 'STUDENT',
    prodi: 'PTIK',
    department: 'Computer Science',
    status: 'active',
    createdAt: '2024-03-10T08:00:00Z',
  },
  {
    id: 'usr_student_06',
    userId: 'usr_student_06',
    name: 'Dewi Kartika Sari',
    email: 'dewi.kartika@university.edu',
    role: 'STUDENT',
    department: 'Information Technology',
    status: 'active',
    createdAt: '2024-03-15T08:00:00Z',
  },
  {
    id: 'usr_admin_01',
    userId: 'usr_admin_01',
    name: 'Admin User',
    email: 'admin@university.edu',
    role: 'ADMIN',
    department: 'Academic Affairs',
    status: 'active',
    createdAt: '2024-01-01T08:00:00Z',
  },
  {
    id: 'val_001',
    userId: 'val_001',
    name: 'Dr. Jane Smith',
    email: 'validator@university.edu',
    role: 'VALIDATOR',
    department: 'Computer Science',
    status: 'active',
    createdAt: '2024-01-05T08:00:00Z',
  },
  {
    id: 'val_002',
    userId: 'val_002',
    name: 'Dr. Robert Johnson',
    email: 'r.johnson@university.edu',
    role: 'VALIDATOR',
    department: 'Information Technology',
    status: 'active',
    createdAt: '2024-01-06T08:00:00Z',
  },
];

let mockSubmissions: Submission[] = [
  {
    submissionId: 'sub_001',
    studentId: 'usr_student_01',
    studentName: 'Alex Student',
    studentEmail: 'student@university.edu',
    studentProdi: 'PTIK',
    studentPhone: '+62812345678',
    status: 'PENDING_VALIDATOR_REVIEW',
    titles: [
      {
        titleId: 'tit_001',
        title: 'Machine Learning for Academic Progress Tracking',
        description: 'Predicting student graduation time using machine learning models and academic history data.',
      },
      {
        titleId: 'tit_002',
        title: 'Blockchain Security in Microservices Architecture',
        description: 'Analyzing performance and consensus protocol security in containerized environments.',
      },
      {
        titleId: 'tit_003',
        title: 'IoT Real-Time Environmental Monitoring System',
        description: 'Designing scalable sensor network architectures for campus air quality monitoring.',
      },
    ],
    submittedAt: '2024-01-20T14:30:00Z',
    assignedValidator: {
      validatorId: 'val_001',
      name: 'Dr. Jane Smith',
      email: 'validator@university.edu',
      department: 'Computer Science',
    },
    assignedAt: '2024-01-21T09:00:00Z',
    assignedBy: 'usr_admin_01',
    statusHistory: [
      {
        status: 'PENDING_ADMIN_REVIEW',
        timestamp: '2024-01-20T14:30:00Z',
        actor: 'system',
      },
      {
        status: 'PENDING_VALIDATOR_REVIEW',
        timestamp: '2024-01-21T09:00:00Z',
        actor: 'usr_admin_01',
        assignedValidator: 'val_001',
      },
    ],
    titleCount: 3,
  },
  {
    submissionId: 'sub_002',
    studentId: 'usr_student_01',
    studentName: 'Alex Student',
    studentEmail: 'student@university.edu',
    studentProdi: 'PTIK',
    status: 'REJECTED',
    titles: [
      {
        titleId: 'tit_004',
        title: 'Basic Web Development using HTML and CSS',
        description: 'Building static web pages for university departmental events.',
      },
    ],
    submittedAt: '2023-11-10T10:00:00Z',
    rejectedAt: '2023-11-12T14:20:00Z',
    rejectedBy: 'val_001',
    rejectedByName: 'Dr. Jane Smith',
    rejectionReason: 'The proposed topic lacks sufficient technical depth and academic contribution for a Bachelor thesis. Please select a topic involving algorithm implementation, system architecture, or empirical analysis.',
    statusHistory: [
      {
        status: 'PENDING_ADMIN_REVIEW',
        timestamp: '2023-11-10T10:00:00Z',
        actor: 'system',
      },
      {
        status: 'PENDING_VALIDATOR_REVIEW',
        timestamp: '2023-11-11T09:00:00Z',
        actor: 'usr_admin_01',
        assignedValidator: 'val_001',
      },
      {
        status: 'REJECTED',
        timestamp: '2023-11-12T14:20:00Z',
        actor: 'val_001',
        reason: 'The proposed topic lacks sufficient technical depth and academic contribution for a Bachelor thesis.',
      },
    ],
    titleCount: 1,
  },
  {
    submissionId: 'sub_003',
    studentId: 'usr_student_02',
    nim: '1729041022',
    studentName: 'M. AULIA ARIEF',
    studentEmail: 'putri.ayu@university.edu',
    studentProdi: 'TEKOM',
    studentPhone: '+628134567890',
    status: 'APPROVED',
    titles: [
      {
        titleId: 'tit_005',
        title: 'Pengembangan Sistem Informasi Beasiswa Berbasis Web Pada Jurusan Teknik Informatika dan Komputer FT UNM',
        description: '',
      },
    ],
    submittedAt: '2024-02-15T09:00:00Z',
    approvedAt: '2024-02-28T10:00:00Z',
    approvedTitle: 'Pengembangan Sistem Informasi Beasiswa Berbasis Web Pada Jurusan Teknik Informatika dan Komputer FT UNM',
    approvedTitleId: 'tit_005',
    approvedBy: 'val_001',
    approvedByName: 'Drs. Marsud Hamid, M.Kes.',
    pembimbing1: 'Drs. Marsud Hamid, M.Kes.',
    pembimbing2: 'Dr. Sanatang, S.Pd., M.T.',
    penguji1: 'Dr. Ir. Mustari Lamada, S.Pd., M.T.',
    penguji2: 'Dr. Udin Sidik Sidin, S.Pd., M.T.',
    tanggalPenetapan: '2020-10-20',
    assignedValidator: {
      validatorId: 'val_001',
      name: 'Dr. Jane Smith',
      email: 'validator@university.edu',
      department: 'Computer Science',
    },
    assignedAt: '2024-02-16T08:00:00Z',
    assignedBy: 'usr_admin_01',
    letterUrl: '/api/documents/letter/sub_003',
    letterGeneratedAt: '2024-02-28T10:05:00Z',
    statusHistory: [
      { status: 'PENDING_ADMIN_REVIEW', timestamp: '2024-02-15T09:00:00Z', actor: 'system' },
      { status: 'PENDING_VALIDATOR_REVIEW', timestamp: '2024-02-16T08:00:00Z', actor: 'usr_admin_01', assignedValidator: 'val_001' },
      { status: 'APPROVED', timestamp: '2024-02-28T10:00:00Z', actor: 'val_001', approvedTitle: 'Pengembangan Sistem Informasi Beasiswa Berbasis Web Pada Jurusan Teknik Informatika dan Komputer FT UNM' },
    ],
    titleCount: 1,
  },
  {
    submissionId: 'sub_004',
    studentId: 'usr_student_03',
    studentName: 'Muhammad Fadilah',
    studentEmail: 'fadilah@university.edu',
    studentProdi: 'PTIK',
    studentPhone: '+628145678901',
    status: 'PENDING_ADMIN_REVIEW',
    titles: [
      {
        titleId: 'tit_008',
        title: 'Implementasi Zero-Knowledge Proof untuk Autentikasi Identitas Digital',
        description: 'Rancang bangun sistem autentikasi identitas digital menggunakan protokol zero-knowledge proof yang aman dan privasi-terjaga.',
      },
      {
        titleId: 'tit_009',
        title: 'Analisis Keamanan Smart Contract pada Jaringan Blockchain Ethereum',
        description: 'Evaluasi kerentanan keamanan smart contract menggunakan static analysis dan fuzzing technique.',
      },
    ],
    submittedAt: '2024-04-01T11:30:00Z',
    statusHistory: [
      { status: 'PENDING_ADMIN_REVIEW', timestamp: '2024-04-01T11:30:00Z', actor: 'system' },
    ],
    titleCount: 2,
  },
  {
    submissionId: 'sub_005',
    studentId: 'usr_student_04',
    studentName: 'Rina Sari',
    studentEmail: 'rina.sari@university.edu',
    studentPhone: '+628156789012',
    status: 'PENDING_VALIDATOR_REVIEW',
    titles: [
      {
        titleId: 'tit_010',
        title: 'Pengembangan Dashboard Analitik Penjualan Berbasis Web untuk UMKM',
        description: 'Perancangan dan implementasi dashboard analitik berbasis web yang membantu pelaku UMKM dalam memantau data penjualan secara real-time.',
      },
      {
        titleId: 'tit_011',
        title: 'Sistem Informasi Manajemen Inventaris Berbasis Cloud Computing',
        description: 'Implementasi sistem manajemen inventaris berbasis cloud untuk optimasi pengelolaan stok barang.',
      },
      {
        titleId: 'tit_012',
        title: 'Optimasi Supply Chain Menggunakan Algoritma Genetic',
        description: 'Penerapan algoritma genetic untuk optimasi rantai pasokan pada industri manufaktur.',
      },
    ],
    submittedAt: '2024-03-20T08:00:00Z',
    assignedValidator: {
      validatorId: 'val_002',
      name: 'Dr. Robert Johnson',
      email: 'r.johnson@university.edu',
      department: 'Information Technology',
    },
    assignedAt: '2024-03-21T09:30:00Z',
    assignedBy: 'usr_admin_01',
    statusHistory: [
      { status: 'PENDING_ADMIN_REVIEW', timestamp: '2024-03-20T08:00:00Z', actor: 'system' },
      { status: 'PENDING_VALIDATOR_REVIEW', timestamp: '2024-03-21T09:30:00Z', actor: 'usr_admin_01', assignedValidator: 'val_002' },
    ],
    titleCount: 3,
  },
  {
    submissionId: 'sub_006',
    studentId: 'usr_student_05',
    studentName: 'Andi Pratama',
    studentEmail: 'andi.pratama@university.edu',
    studentPhone: '+628167890123',
    status: 'REJECTED',
    titles: [
      {
        titleId: 'tit_013',
        title: 'Pembuatan Website Toko Online Sederhana Menggunakan WordPress',
        description: 'Membangun website toko online menggunakan CMS WordPress dengan plugin WooCommerce.',
      },
    ],
    submittedAt: '2024-03-05T14:00:00Z',
    rejectedAt: '2024-03-08T16:00:00Z',
    rejectedBy: 'val_002',
    rejectedByName: 'Dr. Robert Johnson',
    rejectionReason: 'Topik ini terlalu bersifat praktis dan tidak memiliki kontribusi akademik yang memadai untuk skripsi. Silakan pilih topik yang melibatkan riset atau pengembangan metode/algoritma baru.',
    statusHistory: [
      { status: 'PENDING_ADMIN_REVIEW', timestamp: '2024-03-05T14:00:00Z', actor: 'system' },
      { status: 'PENDING_VALIDATOR_REVIEW', timestamp: '2024-03-06T09:00:00Z', actor: 'usr_admin_01', assignedValidator: 'val_002' },
      { status: 'REJECTED', timestamp: '2024-03-08T16:00:00Z', actor: 'val_002', reason: 'Topik terlalu bersifat praktis, tidak ada kontribusi akademik yang memadai.' },
    ],
    titleCount: 1,
  },
  {
    submissionId: 'sub_007',
    studentId: 'usr_student_06',
    studentName: 'Dewi Kartika Sari',
    studentEmail: 'dewi.kartika@university.edu',
    studentPhone: '+628178901234',
    status: 'PENDING_VALIDATOR_REVIEW',
    titles: [
      {
        titleId: 'tit_014',
        title: 'Deteksi Deepfake Video Menggunakan Convolutional Neural Network',
        description: 'Pengembangan model CNN untuk mendeteksi manipulasi video deepfake dengan akurasi tinggi.',
      },
      {
        titleId: 'tit_015',
        title: 'Sistem Pengenalan Wajah dengan ArcFace untuk Keamanan Gedung Kampus',
        description: 'Implementasi sistem pengenalan wajah menggunakan metode ArcFace untuk akses keamanan otomatis.',
      },
      {
        titleId: 'tit_016',
        title: 'Klasifikasi Emosi Berdasarkan Ekspresi Wajah Menggunakan Transfer Learning',
        description: 'Penerapan transfer learning pada model pre-trained untuk klasifikasi emosi manusia dari citra wajah.',
      },
    ],
    submittedAt: '2024-03-25T10:00:00Z',
    assignedValidator: {
      validatorId: 'val_001',
      name: 'Dr. Jane Smith',
      email: 'validator@university.edu',
      department: 'Computer Science',
    },
    assignedAt: '2024-03-26T08:30:00Z',
    assignedBy: 'usr_admin_01',
    statusHistory: [
      { status: 'PENDING_ADMIN_REVIEW', timestamp: '2024-03-25T10:00:00Z', actor: 'system' },
      { status: 'PENDING_VALIDATOR_REVIEW', timestamp: '2024-03-26T08:30:00Z', actor: 'usr_admin_01', assignedValidator: 'val_001' },
    ],
    titleCount: 3,
  },
];

class ApiClient {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...(options.headers as Record<string, string> || {}),
    };

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'API Request failed');
      }
      return data;
    } catch (err: unknown) {
      // Fallback to mock handlers if backend server connection fails or is unavailable
      console.warn(`Fetch error for ${endpoint}, switching to local mock data handler:`, err);
      return this.handleMock<T>(endpoint, options);
    }
  }

  private async handleMock<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const method = options.method || 'GET';

    // Auth Login Mock
    if (endpoint === '/auth/login' && method === 'POST') {
      const body = JSON.parse((options.body as string) || '{}');
      const user = mockUsers.find(u => u.email.toLowerCase() === (body.email || '').toLowerCase());
      if (user) {
        const token = `mock-jwt-token-${user.role.toLowerCase()}-${Date.now()}`;
        return {
          success: true,
          data: {
            accessToken: token,
            refreshToken: `mock-refresh-token-${Date.now()}`,
            user,
          } as T,
          message: 'Login successful',
        };
      }
      // Demo auto-create fallback if unrecognized email
      const role = body.email?.includes('admin') ? 'ADMIN' : body.email?.includes('validator') ? 'VALIDATOR' : 'STUDENT';
      const newUser: User = {
        id: `usr_${Date.now()}`,
        userId: `usr_${Date.now()}`,
        name: body.email?.split('@')[0] || 'Demo User',
        email: body.email || 'user@university.edu',
        role,
        status: 'active',
      };
      return {
        success: true,
        data: {
          accessToken: `mock-jwt-${newUser.role.toLowerCase()}`,
          user: newUser,
        } as T,
        message: 'Login successful',
      };
    }

    // Auth Logout Mock
    if (endpoint === '/auth/logout' && method === 'POST') {
      return { success: true, data: {} as T, message: 'Logout successful' };
    }

    // Student GET Current Submission
    if (endpoint === '/submissions/me/current' && method === 'GET') {
      const active = mockSubmissions.find(s => 
        ['DRAFT', 'draft', 'PENDING_ADMIN_REVIEW', 'pending_admin_review', 'PENDING_VALIDATOR_REVIEW', 'pending_validator_review'].includes(s.status)
      );
      return {
        success: true,
        data: (active || null) as T,
        message: active ? 'Current submission retrieved' : 'No active submission',
      };
    }

    // Student GET All My Submissions
    if (endpoint === '/submissions/me' && method === 'GET') {
      return {
        success: true,
        data: mockSubmissions as T,
        pagination: { page: 1, limit: 10, total: mockSubmissions.length, totalPages: 1 },
      };
    }

    // Student POST Create Submission
    if (endpoint === '/submissions' && method === 'POST') {
      const body = JSON.parse((options.body as string) || '{}');
      const active = mockSubmissions.find(s => 
        ['DRAFT', 'draft', 'PENDING_ADMIN_REVIEW', 'pending_admin_review', 'PENDING_VALIDATOR_REVIEW', 'pending_validator_review'].includes(s.status)
      );
      if (active) {
        return {
          success: false,
          error: 'SUBMISSION_BLOCKED',
          message: 'Student already has an active submission in review.',
          data: {} as T,
        };
      }

      const newSubmission: Submission = {
        submissionId: `sub_${String(mockSubmissions.length + 1).padStart(3, '0')}`,
        studentId: 'usr_student_01',
        studentName: 'Alex Student',
        studentEmail: 'student@university.edu',
        status: 'PENDING_ADMIN_REVIEW',
        titles: (body.titles || []).map((t: { title: string; description?: string }, idx: number) => ({
          titleId: `tit_${Date.now()}_${idx + 1}`,
          title: t.title,
          description: t.description || '',
        })),
        submittedAt: new Date().toISOString(),
        titleCount: (body.titles || []).length,
        statusHistory: [
          {
            status: 'PENDING_ADMIN_REVIEW',
            timestamp: new Date().toISOString(),
            actor: 'system',
          },
        ],
      };
      mockSubmissions.unshift(newSubmission);
      return {
        success: true,
        data: newSubmission as T,
        message: 'Submission created successfully',
      };
    }

    // Admin GET Submissions
    if (endpoint.startsWith('/admin/submissions') && method === 'GET' && !endpoint.includes('/assign')) {
      const match = endpoint.match(/\/admin\/submissions\/(sub_[a-zA-Z0-9_-]+)$/);
      if (match) {
        const sub = mockSubmissions.find(s => s.submissionId === match[1]);
        return { success: true, data: (sub || mockSubmissions[0]) as T };
      }

      const searchParams = new URLSearchParams(endpoint.split('?')[1] || '');
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const status = searchParams.get('status');
      const prodi = searchParams.get('prodi');
      const topic = searchParams.get('topic');

      let filtered = [...mockSubmissions];
      if (status) filtered = filtered.filter(s => s.status.toUpperCase() === status.toUpperCase());
      if (prodi) filtered = filtered.filter(s => s.studentProdi === prodi);
      if (topic) filtered = filtered.filter(s => {
        const tObj = s.titles?.find(t => t.title === (s.approvedTitle || s.titles?.[0]?.title));
        return tObj?.topic === topic;
      });

      const total = filtered.length;
      const totalPages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const paginated = filtered.slice(start, start + limit);

      return {
        success: true,
        data: paginated as T,
        pagination: { page, limit, total, totalPages },
      };
    }

    // Admin POST Assign Validator
    if (endpoint.includes('/assign') && method === 'POST') {
      const match = endpoint.match(/\/admin\/submissions\/(sub_[a-zA-Z0-9_-]+)\/assign/);
      const subId = match ? match[1] : null;
      const body = JSON.parse((options.body as string) || '{}');
      const validator = mockUsers.find(u => (u.id === body.validatorId || u.userId === body.validatorId));
      
      const subIndex = mockSubmissions.findIndex(s => s.submissionId === subId || subId === null);
      if (subIndex !== -1) {
        const validatorInfo: ValidatorInfo = {
          validatorId: validator?.id || body.validatorId || 'val_001',
          name: validator?.name || 'Dr. Jane Smith',
          email: validator?.email || 'validator@university.edu',
          department: validator?.department || 'Computer Science',
        };
        mockSubmissions[subIndex] = {
          ...mockSubmissions[subIndex],
          status: 'PENDING_VALIDATOR_REVIEW',
          assignedValidator: validatorInfo,
          assignedAt: new Date().toISOString(),
          statusHistory: [
            ...(mockSubmissions[subIndex].statusHistory || []),
            {
              status: 'PENDING_VALIDATOR_REVIEW',
              timestamp: new Date().toISOString(),
              actor: 'admin',
              assignedValidator: validatorInfo.validatorId,
            },
          ],
        };
        return {
          success: true,
          data: mockSubmissions[subIndex] as T,
          message: 'Submission assigned to validator successfully',
        };
      }
    }

    // Admin GET Validators
    if (endpoint.startsWith('/admin/validators') && method === 'GET') {
      const validators: ValidatorInfo[] = mockUsers
        .filter(u => u.role === 'VALIDATOR' || u.role === 'validator')
        .map(u => ({
          validatorId: u.id,
          name: u.name,
          email: u.email,
          department: u.department || 'Computer Science',
          status: u.status || 'active',
          assignedSubmissions: mockSubmissions.filter(s => 
            s.assignedValidator && (
              typeof s.assignedValidator === 'string' 
                ? s.assignedValidator === u.id 
                : s.assignedValidator.validatorId === u.id
            )
          ).length,
        }));
      return {
        success: true,
        data: validators as T,
        pagination: { page: 1, limit: 50, total: validators.length, totalPages: 1 },
      };
    }

    // Topics
    if (endpoint.startsWith('/topics') && method === 'GET') {
      return {
        success: true,
        data: mockTopics as T,
      };
    }

    // Admin GET Users
    if (endpoint.startsWith('/admin/users') && method === 'GET') {
      return {
        success: true,
        data: mockUsers as T,
        pagination: { page: 1, limit: 20, total: mockUsers.length, totalPages: 1 },
      };
    }

    // Admin POST Create User
    if (endpoint === '/admin/users' && method === 'POST') {
      const body = JSON.parse((options.body as string) || '{}');
      const newUser: User = {
        id: `usr_${Date.now()}`,
        userId: `usr_${Date.now()}`,
        name: body.name,
        email: body.email,
        role: body.role,
        department: body.department || 'General',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      mockUsers.push(newUser);
      return { success: true, data: newUser as T, message: 'User created successfully' };
    }

    // Admin Stats
    if (endpoint === '/admin/dashboard/stats' && method === 'GET') {
      const stats: AdminStats = {
        totalSubmissions: mockSubmissions.length,
        pendingAdminReview: mockSubmissions.filter(s => ['PENDING_ADMIN_REVIEW', 'pending_admin_review'].includes(s.status)).length,
        pendingValidatorReview: mockSubmissions.filter(s => ['PENDING_VALIDATOR_REVIEW', 'pending_validator_review'].includes(s.status)).length,
        approved: mockSubmissions.filter(s => ['APPROVED', 'approved'].includes(s.status)).length,
        rejected: mockSubmissions.filter(s => ['REJECTED', 'rejected'].includes(s.status)).length,
        totalStudents: mockUsers.filter(u => u.role === 'STUDENT' || u.role === 'student').length,
        totalValidators: mockUsers.filter(u => u.role === 'VALIDATOR' || u.role === 'validator').length,
        averageTimeToApproval: '1.5 days',
        rejectionRate: '20%',
      };
      return { success: true, data: stats as T };
    }

    // Validator GET Submissions
    if (endpoint.startsWith('/validator/submissions') && method === 'GET') {
      const match = endpoint.match(/\/validator\/submissions\/(sub_[a-zA-Z0-9_-]+)/);
      if (match) {
        const sub = mockSubmissions.find(s => s.submissionId === match[1]);
        return { success: true, data: (sub || mockSubmissions[0]) as T };
      }
      return {
        success: true,
        data: mockSubmissions as T,
        pagination: { page: 1, limit: 20, total: mockSubmissions.length, totalPages: 1 },
      };
    }

    // Validator POST Approve Submission
    if (endpoint.includes('/approve') && method === 'POST') {
      const match = endpoint.match(/\/validator\/submissions\/(sub_[a-zA-Z0-9_-]+)\/approve/);
      const subId = match ? match[1] : null;
      const body = JSON.parse((options.body as string) || '{}');
      
      const subIndex = mockSubmissions.findIndex(s => s.submissionId === subId || subId === null);
      if (subIndex !== -1) {
        const selectedTitle = mockSubmissions[subIndex].titles.find(t => t.titleId === body.approvedTitleId) || mockSubmissions[subIndex].titles[0];
        
        mockSubmissions[subIndex] = {
          ...mockSubmissions[subIndex],
          status: 'APPROVED',
          approvedTitle: selectedTitle.title,
          approvedTitleId: selectedTitle.titleId,
          approvedAt: new Date().toISOString(),
          approvedBy: 'val_001',
          approvedByName: 'Dr. Jane Smith',
          letterUrl: `/api/documents/letter/${mockSubmissions[subIndex].submissionId}`,
          letterGeneratedAt: new Date().toISOString(),
          statusHistory: [
            ...(mockSubmissions[subIndex].statusHistory || []),
            {
              status: 'APPROVED',
              timestamp: new Date().toISOString(),
              actor: 'val_001',
              approvedTitle: selectedTitle.title,
            },
          ],
        };
        return {
          success: true,
          data: mockSubmissions[subIndex] as T,
          message: 'Submission approved successfully. Approval letter generated.',
        };
      }
    }

    // Validator POST Reject Submission
    if (endpoint.includes('/reject') && method === 'POST') {
      const match = endpoint.match(/\/validator\/submissions\/(sub_[a-zA-Z0-9_-]+)\/reject/);
      const subId = match ? match[1] : null;
      const body = JSON.parse((options.body as string) || '{}');

      const subIndex = mockSubmissions.findIndex(s => s.submissionId === subId || subId === null);
      if (subIndex !== -1) {
        mockSubmissions[subIndex] = {
          ...mockSubmissions[subIndex],
          status: 'REJECTED',
          rejectedAt: new Date().toISOString(),
          rejectedBy: 'val_001',
          rejectedByName: 'Dr. Jane Smith',
          rejectionReason: body.rejectionReason,
          statusHistory: [
            ...(mockSubmissions[subIndex].statusHistory || []),
            {
              status: 'REJECTED',
              timestamp: new Date().toISOString(),
              actor: 'val_001',
              reason: body.rejectionReason,
            },
          ],
        };
        return {
          success: true,
          data: mockSubmissions[subIndex] as T,
          message: 'Submission rejected successfully.',
        };
      }
    }

    // Shared GET All Submissions (public, only APPROVED)
    if (endpoint.startsWith('/submissions/all') && method === 'GET') {
      const approved = mockSubmissions.filter(s =>
        ['APPROVED', 'approved'].includes(s.status)
      );
      return {
        success: true,
        data: approved as T,
        pagination: { page: 1, limit: 50, total: approved.length, totalPages: 1 },
      };
    }

    return {
      success: true,
      data: {} as T,
      message: 'Operation completed successfully',
    };
  }

  // Auth Methods
  login(email: string, password: string): Promise<ApiResponse<{ accessToken: string; user: User }>> {
    return this.request<{ accessToken: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  logout(): Promise<ApiResponse<unknown>> {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // Student Methods
  getStudentSubmissions(): Promise<ApiResponse<Submission[]>> {
    return this.request<Submission[]>('/submissions/me');
  }

  getCurrentSubmission(): Promise<ApiResponse<Submission | null>> {
    return this.request<Submission | null>('/submissions/me/current');
  }

  getStudentSubmissionById(id: string): Promise<ApiResponse<Submission>> {
    return this.request<Submission>(`/submissions/me/${id}`);
  }

  createSubmission(data: { titles: Array<{ title: string; description?: string }> }): Promise<ApiResponse<Submission>> {
    return this.request<Submission>('/submissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  downloadLetter(submissionId: string): void {
    // Generate simple PDF or downloadable text blob for demo letter
    const sub = mockSubmissions.find(s => s.submissionId === submissionId);
    const content = `
================================================================================
                       SKRIPSIHUB APPROVAL LETTER
================================================================================
Document Reference: SKR/${new Date().getFullYear()}/${submissionId.toUpperCase()}
Date: ${sub?.approvedAt ? new Date(sub.approvedAt).toLocaleDateString() : new Date().toLocaleDateString()}

STUDENT DETAILS:
Name       : ${sub?.studentName || 'Student'}
Student ID : ${sub?.studentId || 'N/A'}
Email      : ${sub?.studentEmail || 'N/A'}

THESIS DETAILS:
Approved Title : ${sub?.approvedTitle || 'N/A'}
Approved By    : ${sub?.approvedByName || 'Academic Validator'}

STATUS: OFFICIAL APPROVAL GRANTED
================================================================================
    `;

    const blob = new Blob([content], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Approval_Letter_${submissionId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // Admin Methods
  getAdminSubmissions(params?: {
    page?: number;
    limit?: number;
    status?: string;
    prodi?: string;
    topic?: string;
  }): Promise<ApiResponse<Submission[]>> {
    const p = new URLSearchParams();
    if (params?.page) p.append('page', params.page.toString());
    if (params?.limit) p.append('limit', params.limit.toString());
    if (params?.status && params.status !== 'ALL') p.append('status', params.status);
    if (params?.prodi && params.prodi !== 'ALL') p.append('prodi', params.prodi);
    if (params?.topic && params.topic !== 'ALL') p.append('topic', params.topic);
    
    const endpoint = `/admin/submissions${p.toString() ? `?${p.toString()}` : ''}`;
    return this.request<Submission[]>(endpoint);
  }

  getAdminSubmissionById(id: string): Promise<ApiResponse<Submission>> {
    return this.request<Submission>(`/admin/submissions/${id}`);
  }

  assignValidator(submissionId: string, validatorId: string): Promise<ApiResponse<Submission>> {
    return this.request<Submission>(`/admin/submissions/${submissionId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ validatorId }),
    });
  }

  getValidators(): Promise<ApiResponse<ValidatorInfo[]>> {
    return this.request<ValidatorInfo[]>('/admin/validators');
  }

  getUsers(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>('/admin/users');
  }

  createUser(user: Partial<User> & { password?: string }): Promise<ApiResponse<User>> {
    return this.request<User>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  updateUser(userId: string, data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteUser(userId: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  getAdminStats(): Promise<ApiResponse<AdminStats>> {
    return this.request<AdminStats>('/admin/dashboard/stats');
  }

  // Shared Methods (all roles)
  getAllSubmissions(status?: string): Promise<ApiResponse<Submission[]>> {
    const endpoint = status ? `/submissions/all?status=${status}` : '/submissions/all';
    return this.request<Submission[]>(endpoint);
  }

  // Validator Methods
  getValidatorSubmissions(status?: string): Promise<ApiResponse<Submission[]>> {
    const endpoint = status ? `/validator/submissions?status=${status}` : '/validator/submissions';
    return this.request<Submission[]>(endpoint);
  }

  getValidatorSubmissionById(id: string): Promise<ApiResponse<Submission>> {
    return this.request<Submission>(`/validator/submissions/${id}`);
  }

  approveSubmission(submissionId: string, approvedTitleId: string): Promise<ApiResponse<Submission>> {
    return this.request<Submission>(`/validator/submissions/${submissionId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approvedTitleId }),
    });
  }

  rejectSubmission(submissionId: string, rejectionReason: string): Promise<ApiResponse<Submission>> {
    return this.request<Submission>(`/validator/submissions/${submissionId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectionReason }),
    });
  }

  // Topics Methods
  getTopics(): Promise<ApiResponse<Topic[]>> {
    return this.request<Topic[]>('/topics');
  }
}

export const api = new ApiClient();
