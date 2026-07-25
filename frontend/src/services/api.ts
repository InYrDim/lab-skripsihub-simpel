import type {
  ApiResponse,
  User,
  Submission,
  ValidatorInfo,
  AdminStats,
  Topic
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

type ApiUser = Omit<User, 'name' | 'userId' | 'status'> & {
  fullName: string;
  universityId: string;
  dosenPA?: string;
  dosenPANip?: string;
  isActive: boolean;
};

const toUser = (user: ApiUser): User => ({
  ...user,
  name: user.fullName,
  userId: user.universityId,
  status: user.isActive ? 'active' : 'inactive',
});

class ApiClient {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const isFormData = options.body instanceof FormData;
    const headers = {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...this.getAuthHeader(),
      ...(options.headers as Record<string, string> || {}),
    };

    let response: Response;
    try {
      response = await fetch(url, { ...options, headers });
    } catch (err: unknown) {
      console.error(`Fetch error for ${endpoint}:`, err);
      throw err;
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'API Request failed');
    }
    return data;
  }

  // Auth Methods
  async login(email: string, password: string): Promise<ApiResponse<{ accessToken: string; user: User }>> {
    const response = await this.request<{
      accessToken: string;
      user: ApiUser;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    return {
      ...response,
      data: {
        ...response.data,
        user: toUser(response.data.user),
      },
    };
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

  createSubmission(
    data: { titles: Array<{ title: string; topic?: string; description?: string }> },
    document: File,
  ): Promise<ApiResponse<Submission>> {
    const formData = new FormData();
    formData.append('titles', JSON.stringify(data.titles));
    formData.append('document', document);

    return this.request<Submission>('/submissions', {
      method: 'POST',
      body: formData,
    });
  }

  getAssetUrl(path: string): string {
    return new URL(path, API_BASE_URL).toString();
  }

  async downloadLetter(submissionId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/documents/letter/${submissionId}`,
      { headers: this.getAuthHeader() },
    );

    if (!response.ok) {
      throw new Error('Failed to download approval letter');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `approval_letter_${submissionId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
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

  rejectSubmissionByAdmin(
    submissionId: string,
    rejectionReason: string,
  ): Promise<ApiResponse<Submission>> {
    return this.request<Submission>(`/admin/submissions/${submissionId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectionReason }),
    });
  }

  getValidators(): Promise<ApiResponse<ValidatorInfo[]>> {
    return this.request<ValidatorInfo[]>('/admin/validators');
  }

  async getUsers(): Promise<ApiResponse<User[]>> {
    const response = await this.request<ApiUser[]>('/users');
    return { ...response, data: response.data.map(toUser) };
  }

  createUser(user: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify({
        email: user.email,
        fullName: user.name,
        role: user.role,
        universityId: user.userId,
        department: user.department,
        prodi: user.prodi,
        dosenPA: user.dosenPA,
        dosenPANip: user.dosenPANip,
      }),
    });
  }

  updateUser(id: string, user: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        email: user.email,
        fullName: user.name,
        role: user.role,
        universityId: user.userId,
        department: user.department,
        prodi: user.prodi,
        dosenPA: user.dosenPA,
        dosenPANip: user.dosenPANip,
      }),
    });
  }

  deleteUser(userId: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${userId}`, {
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

  getAllTitles(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/admin/all-titles');
  }

  createTopic(topic: Partial<Topic>): Promise<ApiResponse<Topic>> {
    return this.request<Topic>('/topics', {
      method: 'POST',
      body: JSON.stringify(topic),
    });
  }

  toggleTopicStatus(id: string): Promise<ApiResponse<Topic>> {
    return this.request<Topic>(`/topics/${id}/toggle`, {
      method: 'POST',
    });
  }

  updateTopic(id: string, topic: Partial<Topic>): Promise<ApiResponse<Topic>> {
    return this.request<Topic>(`/topics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(topic),
    });
  }

  deleteTopic(id: string): Promise<ApiResponse<Topic>> {
    return this.request<Topic>(`/topics/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin Settings
  getDefaultDepartment(): Promise<ApiResponse<{ defaultDepartment: string }>> {
    return this.request<{ defaultDepartment: string }>('/admin/settings/default-department');
  }

  setDefaultDepartment(department: string): Promise<ApiResponse<{ defaultDepartment: string }>> {
    return this.request<{ defaultDepartment: string }>('/admin/settings/default-department', {
      method: 'PATCH',
      body: JSON.stringify({ department }),
    });
  }
}

export const api = new ApiClient();
