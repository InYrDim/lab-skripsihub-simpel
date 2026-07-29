import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { api } from '../services/api';

import type { Submission, ValidatorInfo, User, AdminStats, UserRole, Topic } from '../types';
import { Select } from '../components/ui/select';
import { Dialog } from '../components/ui/dialog';
import { ModalDetailProposal } from '../components/ui/ModalDetailProposal';
import { BerkasPengajuan } from '../components/ui/BerkasPengajuan';
import { ProposedTitlesList } from '../components/ui/ProposedTitlesList';
import { StudentIdentityCard } from '../components/ui/StudentIdentityCard';
import { SubmissionsTable, getStatusBadge } from '../components/ui/SubmissionsTable';
import { TableSkeletonRows } from '../components/ui/TableSkeletonRows';
import {
  Users,
  FileText,
  UserPlus,
  CheckCircle,
  XCircle,
  UserCheck,
  X,
  Filter,
  Tag,
  BookOpen,
  Trash2
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'submissions' | 'users' | 'topics' | 'all_titles'>('submissions');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [validators, setValidators] = useState<ValidatorInfo[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [allTitles, setAllTitles] = useState<any[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialDataLoading, setInitialDataLoading] = useState(true);


  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [prodiFilter, setProdiFilter] = useState<string>('ALL');
  const [topicFilter, setTopicFilter] = useState<string>('ALL');
  const [allTitlesTopicFilter, setAllTitlesTopicFilter] = useState<string>('ALL');
  const [allTitlesProdiFilter, setAllTitlesProdiFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubmissions, setTotalSubmissions] = useState(0);

  // Admin review and assignment modals
  const [reviewingSubmission, setReviewingSubmission] = useState<Submission | null>(null);
  const [adminRejectionReason, setAdminRejectionReason] = useState('');
  const [previewingSubmission, setPreviewingSubmission] = useState<Submission | null>(null);
  const [rejectingByAdmin, setRejectingByAdmin] = useState(false);
  const [adminReviewError, setAdminReviewError] = useState<string | null>(null);
  const [assigningSubmission, setAssigningSubmission] = useState<Submission | null>(null);
  const [selectedValidatorId, setSelectedValidatorId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  // Add User Modal
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState<{
    name: string;
    email: string;
    password: string;
    role: UserRole;
    department: string;
    userId?: string;
    prodi?: 'PTIK' | 'TEKOM';
    angkatan?: string;
  }>({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    department: '',
    userId: '',
    prodi: 'PTIK',
    angkatan: '',
  });
  const [addUserError, setAddUserError] = useState<string | null>(null);
  const [addingUser, setAddingUser] = useState(false);

  // Edit User Modal
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserError, setEditUserError] = useState<string | null>(null);
  const [updatingUser, setUpdatingUser] = useState(false);

  // Delete User Dialog
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  // Delete Submission Dialog
  const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(null);
  const [deletingSubmission, setDeletingSubmission] = useState(false);

  // Add Topic Modal
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [addingTopic, setAddingTopic] = useState(false);

  // Pending Users Modal
  const [showPendingUsersModal, setShowPendingUsersModal] = useState(false);

  const fetchInitialData = async () => {
    setInitialDataLoading(true);
    try {
      const [valRes, usrRes, statsRes, topRes, allTitlesRes] = await Promise.all([
        api.getValidators(),
        api.getUsers(),
        api.getAdminStats(),
        api.getTopics(),
        api.getAllTitles(),
      ]);
      if (valRes.success) setValidators(valRes.data || []);
      if (usrRes.success) setUsers(usrRes.data || []);
      if (statsRes.success) setStats(statsRes.data);
      if (topRes.success) setTopics(topRes.data || []);
      if (allTitlesRes.success) setAllTitles(allTitlesRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setInitialDataLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const subRes = await api.getAdminSubmissions({
        page, limit, status: statusFilter, prodi: prodiFilter, topic: topicFilter
      });
      if (subRes.success) {
        setSubmissions(subRes.data || []);
        if (subRes.pagination) {
          setTotalPages(subRes.pagination.totalPages);
          setTotalSubmissions(subRes.pagination.total);
        }
      }
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'submissions') fetchSubmissions();
  }, [page, limit, statusFilter, prodiFilter, topicFilter, activeTab]);

  const handleRejectByAdmin = async () => {
    if (!reviewingSubmission) return;
    if (adminRejectionReason.trim().length < 10) {
      setAdminReviewError('Alasan penolakan minimal 10 karakter.');
      return;
    }

    setRejectingByAdmin(true);
    setAdminReviewError(null);
    try {
      await api.rejectSubmissionByAdmin(
        reviewingSubmission.submissionId,
        adminRejectionReason.trim(),
      );
      setReviewingSubmission(null);
      setAdminRejectionReason('');
      await Promise.all([fetchSubmissions(), fetchInitialData()]);
    } catch (error) {
      setAdminReviewError(
        error instanceof Error ? error.message : 'Gagal menolak batch pengajuan.',
      );
    } finally {
      setRejectingByAdmin(false);
    }
  };

  const handleAssignValidator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningSubmission || !selectedValidatorId) {
      setAssignError('Silakan pilih validator dari daftar.');
      return;
    }
    setAssigning(true);
    setAssignError(null);

    try {
      const res = await api.assignValidator(assigningSubmission.submissionId, selectedValidatorId);
      if (res.success) {
        setAssigningSubmission(null);
        setSelectedValidatorId('');
        await fetchSubmissions();
      } else {
        setAssignError(res.message || 'Validator assignment failed.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) setAssignError(err.message);
      else setAssignError('An error occurred during assignment.');
    } finally {
      setAssigning(false);
    }
  };

  const confirmDeleteSubmission = async () => {
    if (!submissionToDelete) return;
    setDeletingSubmission(true);
    try {
      const res = await api.deleteAdminSubmission(submissionToDelete);
      if (res.success) {
        await fetchSubmissions();
        await fetchInitialData(); // update stats
        setSubmissionToDelete(null);
      } else {
        alert(res.message || 'Gagal menghapus pengajuan');
      }
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus pengajuan');
    } finally {
      setDeletingSubmission(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || newUser.password.length < 8) {
      setAddUserError('Name, email, and a password of at least 8 characters are required.');
      return;
    }
    setAddingUser(true);
    setAddUserError(null);

    try {
      const res = await api.createUser(newUser);
      if (res.success) {
        setShowAddUserModal(false);
        setNewUser({ name: '', email: '', password: '', role: 'STUDENT', department: '', userId: '', prodi: 'PTIK', angkatan: '' });
        await fetchInitialData();
      } else {
        setAddUserError(res.message || 'User creation failed.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) setAddUserError(err.message);
      else setAddUserError('Failed to create user.');
    } finally {
      setAddingUser(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editingUser.name || !editingUser.email) {
      setEditUserError('Name and email are required.');
      return;
    }
    setUpdatingUser(true);
    setEditUserError(null);

    try {
      const res = await api.updateUser(editingUser.id, editingUser);
      if (res.success) {
        setShowEditUserModal(false);
        setEditingUser(null);
        await fetchInitialData();
      } else {
        setEditUserError(res.message || 'User update failed.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) setEditUserError(err.message);
      else setEditUserError('Failed to update user.');
    } finally {
      setUpdatingUser(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setDeletingUser(true);
    try {
      const res = await api.deleteUser(userToDelete.id);
      if (res.success) {
        setUserToDelete(null);
        await fetchInitialData();
      } else {
        alert(res.message || 'User deletion failed.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during deletion.');
    } finally {
      setDeletingUser(false);
    }
  };

  const handleApproveUser = async (user: User) => {
    try {
      const res = await api.updateUser(user.id, { status: 'AKTIF' });
      if (res.success) {
        await fetchInitialData();
      } else {
        alert(res.message || 'User approval failed.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during approval.');
    }
  };

  const handleRejectUser = async (user: User) => {
    try {
      const res = await api.updateUser(user.id, { status: 'DITOLAK' });
      if (res.success) {
        await fetchInitialData();
      } else {
        alert(res.message || 'User rejection failed.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during rejection.');
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    setAddingTopic(true);
    try {
      const res = await api.createTopic({ name: newTopicName });
      if (res.success) {
        setShowAddTopicModal(false);
        setNewTopicName('');
        await fetchInitialData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingTopic(false);
    }
  };



  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    setPage(1); // Reset to page 1 on filter change
  };



  const getStatusBadgeLocal = getStatusBadge;

  const pendingUsersCount = users.filter(u => u.status === 'MENUNGGU_APPROVE').length;

  return (
    <>
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
        <div className="space-y-4">
        {/* Top Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Admin Management Portal
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Review thesis proposals, assign validators, and manage user accounts.
            </p>
          </div>

          <TabsList className="gap-2 border-none">
            <TabsTrigger value="submissions" className="px-4 py-2 text-xs">
              Submissions Queue
            </TabsTrigger>
            <TabsTrigger value="all_titles" className="px-4 py-2 text-xs">
              All Titles
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="space-y-0.5 rounded border border-zinc-300 bg-linear-to-br from-white via-zinc-50 to-zinc-200/80 p-3 shadow-sm shadow-zinc-200/60 dark:border-zinc-600 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800 dark:shadow-black/20">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Total Batch Proposals</span>
            <p className="text-2xl font-bold text-zinc-950 dark:text-white">{stats?.totalSubmissions ?? 0}</p>
          </div>
          <div className="space-y-0.5 rounded border border-amber-300 bg-linear-to-br from-white via-amber-50 to-amber-100/90 p-3 shadow-sm shadow-amber-200/60 dark:border-amber-700 dark:from-zinc-900 dark:via-amber-950/50 dark:to-amber-900/40 dark:shadow-black/20">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">Pending Admin</span>
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
              {stats?.pendingAdminReview ?? 0}
            </p>
          </div>
          <div className="space-y-0.5 rounded border border-sky-300 bg-linear-to-br from-white via-sky-50 to-sky-100/90 p-3 shadow-sm shadow-sky-200/60 dark:border-sky-700 dark:from-zinc-900 dark:via-sky-950/50 dark:to-sky-900/40 dark:shadow-black/20">
            <span className="text-xs font-semibold text-sky-800 dark:text-sky-300">With Validator</span>
            <p className="text-2xl font-bold text-sky-700 dark:text-sky-300">
              {stats?.pendingValidatorReview ?? 0}
            </p>
          </div>
          <div className="space-y-0.5 rounded border border-emerald-300 bg-linear-to-br from-white via-emerald-50 to-emerald-100/90 p-3 shadow-sm shadow-emerald-200/60 dark:border-emerald-700 dark:from-zinc-900 dark:via-emerald-950/50 dark:to-emerald-900/40 dark:shadow-black/20">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Approved</span>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {stats?.approved ?? 0}
            </p>
          </div>
          <div className="space-y-0.5 rounded border border-rose-300 bg-linear-to-br from-white via-rose-50 to-rose-100/90 p-3 shadow-sm shadow-rose-200/60 dark:border-rose-700 dark:from-zinc-900 dark:via-rose-950/50 dark:to-rose-900/40 dark:shadow-black/20 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">Pending Users</span>
              <p className="text-2xl font-bold text-rose-700 dark:text-rose-300">
                {pendingUsersCount}
              </p>
            </div>
            <Button
              onClick={() => setShowPendingUsersModal(true)}
              className="mt-2 w-full px-2 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded shadow-sm transition-colors"
            >
              Lihat Detail
            </Button>
          </div>
        </div>

        {/* TAB 1: SUBMISSIONS QUEUE */}
        <TabsContent value="submissions" className="mt-0">
          <div className="overflow-hidden rounded border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex flex-col justify-between gap-3 border-b border-zinc-200 p-4 dark:border-zinc-800 sm:flex-row sm:items-center">
              <h3 className="font-semibold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <FileText size={18} className="text-orange-600" />
                All Student Proposals
              </h3>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <Filter size={16} className="text-zinc-400" />
                <Select
                  value={prodiFilter}
                  onChange={(val) => handleFilterChange(setProdiFilter, val)}
                  options={[
                    { value: 'ALL', label: 'Semua Prodi' },
                    { value: 'PTIK', label: 'PTIK' },
                    { value: 'TEKOM', label: 'TEKOM' }
                  ]}
                  className="w-full sm:w-40"
                />
                <input
                  type="text"
                  value={topicFilter === 'ALL' ? '' : topicFilter}
                  onChange={(e) => handleFilterChange(setTopicFilter, e.target.value || 'ALL')}
                  placeholder="Filter Topik..."
                  className="px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100 outline-none w-32 sm:w-40"
                />
              </div>
            </div>

            <div className="border-b border-zinc-200 px-4 dark:border-zinc-800">
              <Tabs value={statusFilter} onValueChange={(val) => handleFilterChange(setStatusFilter, val)}>
                <TabsList className="flex gap-1 overflow-x-auto border-none">
                  {[
                    { value: 'ALL', label: 'Semua' },
                    { value: 'PENDING_ADMIN_REVIEW', label: 'Menunggu Admin' },
                    { value: 'PENDING_VALIDATOR_REVIEW', label: 'Dalam Validasi' },
                    { value: 'APPROVED', label: 'Disetujui' },
                    { value: 'REJECTED_BY_ADMIN', label: 'Ditolak Admin' },
                    { value: 'REJECTED_BY_VALIDATOR', label: 'Ditolak Validator' },
                  ].map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value} className="px-3 py-2.5 text-xs">
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <SubmissionsTable
              submissions={submissions}
              loading={loading}
              validators={validators}
              onPreview={setPreviewingSubmission}
              renderActions={(sub) => (
                <>
                  {sub.status.toUpperCase() === 'PENDING_ADMIN_REVIEW' ? (
                    <Button
                      onClick={() => {
                        setReviewingSubmission(sub);
                        setAdminRejectionReason('');
                        setAdminReviewError(null);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs shadow-sm transition-colors"
                    >
                      <FileText size={14} /> Tinjau Batch
                    </Button>
                  ) : sub.status.toUpperCase() === 'PENDING_VALIDATOR_REVIEW' ? (
                    <Button
                      onClick={() => {
                        setAssigningSubmission(sub);
                        setSelectedValidatorId('');
                      }}
                      className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    >
                      Ganti Validator
                    </Button>
                  ) : (
                    <span className="text-xs text-zinc-300 dark:text-zinc-700">-</span>
                  )}
                  <Button
                    onClick={() => setSubmissionToDelete(sub.submissionId)}
                    title="Hapus Pengajuan"
                    className="inline-flex items-center justify-center p-1.5 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors ml-2"
                  >
                    <Trash2 size={14} />
                  </Button>
                </>
              )}
            />

            {/* Server-Side Pagination Controls */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3 text-xs dark:border-zinc-800">
                <span className="text-zinc-500">
                  Showing page <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page}</span> of <span className="font-semibold text-zinc-900 dark:text-zinc-100">{totalPages}</span> ({totalSubmissions} total items)
                </span>
                <div className="flex gap-1">
                  <Button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 4: ALL TITLES */}
        <TabsContent value="all_titles" className="mt-0">
          <div className="bg-white dark:bg-zinc-950 rounded shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-semibold text-base text-zinc-900 dark:white flex items-center gap-2">
                <BookOpen size={18} className="text-orange-600" />
                All Submitted Titles
              </h3>
              <div className="flex gap-2">
                <Select
                  value={allTitlesProdiFilter}
                  onChange={(val) => setAllTitlesProdiFilter(val as string)}
                  options={[
                    { value: 'ALL', label: 'Semua Prodi' },
                    { value: 'PTIK', label: 'PTIK' },
                    { value: 'TEKOM', label: 'TEKOM' }
                  ]}
                  className="w-40"
                />
                <Select
                  value={allTitlesTopicFilter}
                  onChange={(val) => setAllTitlesTopicFilter(val as string)}
                  options={[
                    { value: 'ALL', label: 'Semua Topik' },
                    ...topics.map(t => ({ value: t.name, label: t.name }))
                  ]}
                  className="w-48"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-3.5 font-medium">Student</th>
                    <th className="px-6 py-3.5 font-medium">Topic</th>
                    <th className="px-6 py-3.5 font-medium">Title</th>
                    <th className="px-6 py-3.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {initialDataLoading ? (
                    <TableSkeletonRows columns={4} />
                  ) : allTitles.filter(t =>
                    (allTitlesTopicFilter === 'ALL' || t.topic === allTitlesTopicFilter) &&
                    (allTitlesProdiFilter === 'ALL' || t.studentProdi === allTitlesProdiFilter)
                  ).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-zinc-400 text-xs">
                        No titles available.
                      </td>
                    </tr>
                  ) : (
                    allTitles
                      .filter(t =>
                        (allTitlesTopicFilter === 'ALL' || t.topic === allTitlesTopicFilter) &&
                        (allTitlesProdiFilter === 'ALL' || t.studentProdi === allTitlesProdiFilter)
                      )
                      .map((t, i) => (
                      <tr key={i} className="hover:bg-white dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-xs text-zinc-900 dark:text-zinc-100">{t.studentName || 'Student'}</div>
                          <div className="text-[11px] text-zinc-400 mt-0.5 space-x-2 flex items-center">
                            <span>{t.studentNIM || 'N/A'}</span>
                            {t.studentProdi && (
                              <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400 rounded uppercase font-bold tracking-wider">{t.studentProdi}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-orange-600 dark:text-orange-400">
                          {t.topic || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {t.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadgeLocal(t.submissionStatus)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </div>
    </Tabs>

      {/* ADMIN BATCH REVIEW MODAL */}
      {reviewingSubmission && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex shrink-0 items-start justify-between border-b border-zinc-200 p-5 dark:border-zinc-800">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-white">
                  <FileText size={20} className="text-orange-600" />
                  Tinjau Batch Pengajuan
                </h2>
                <p className="mt-1 font-mono text-[11px] text-zinc-400">
                  ID {reviewingSubmission.submissionId}
                </p>
              </div>
              <Button
                type="button"
                onClick={() => setReviewingSubmission(null)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                aria-label="Tutup modal"
              >
                <X size={20} />
              </Button>
            </div>

            <div className="space-y-4 overflow-y-auto p-5">
              <StudentIdentityCard submission={reviewingSubmission} />

              <ProposedTitlesList
                titles={reviewingSubmission.titles}
                sectionTitle="Judul dalam Batch"
              />

              <BerkasPengajuan
                documentUrl={reviewingSubmission.documentUrl}
                documentName={reviewingSubmission.documentName}
              />

              <section className="rounded border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-500/20 dark:bg-rose-500/5">
                <label htmlFor="admin-rejection-reason" className="text-xs font-bold text-rose-700 dark:text-rose-300">
                  Alasan Penolakan Seluruh Batch
                </label>
                <textarea
                  id="admin-rejection-reason"
                  rows={3}
                  value={adminRejectionReason}
                  onChange={(event) => setAdminRejectionReason(event.target.value)}
                  placeholder="Jelaskan alasan penolakan minimal 10 karakter..."
                  className="mt-2 w-full rounded border border-rose-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none focus:border-rose-500 dark:border-rose-500/30 dark:bg-zinc-950 dark:text-zinc-100"
                />
                <div className="mt-1 flex justify-between text-[11px] text-zinc-500">
                  <span>Seluruh judul dalam batch akan ditolak.</span>
                  <span>{adminRejectionReason.trim().length}/10 karakter minimum</span>
                </div>
              </section>

              {adminReviewError && (
                <div className="rounded bg-rose-50 p-3 text-xs text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                  {adminReviewError}
                </div>
              )}
            </div>

            <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-zinc-200 p-4 dark:border-zinc-800 sm:flex-row sm:justify-end">
              <Button
                type="button"
                disabled={rejectingByAdmin}
                onClick={handleRejectByAdmin}
                className="rounded border border-rose-300 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:border-rose-500/40 dark:hover:bg-rose-500/10"
              >
                {rejectingByAdmin ? 'Menolak...' : 'Tolak Seluruh Batch'}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setAssigningSubmission(reviewingSubmission);
                  setSelectedValidatorId('');
                  setReviewingSubmission(null);
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded bg-orange-600 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-700"
              >
                <UserCheck size={14} /> Teruskan ke Validator
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW SUBMISSION MODAL */}
      {previewingSubmission && (
        <ModalDetailProposal
          submission={previewingSubmission}
          onClose={() => setPreviewingSubmission(null)}
          statusBadge={getStatusBadgeLocal(previewingSubmission.status)}
        />
      )}

      {/* ASSIGN VALIDATOR MODAL */}
      {assigningSubmission && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 animate-in fade-in">
          <div className="relative bg-white dark:bg-zinc-950 rounded max-w-md w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <UserCheck size={20} className="text-orange-600" />
                Tugaskan Pengajuan kepada Validator
              </h2>
              <Button
                onClick={() => setAssigningSubmission(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X size={20} />
              </Button>
            </div>

            {assignError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 text-xs rounded">
                {assignError}
              </div>
            )}

            <form onSubmit={handleAssignValidator} className="space-y-4">
              <div className="p-3 bg-white dark:bg-zinc-950 rounded space-y-1 text-xs">
                <div className="text-zinc-400">ID Pengajuan: <span className="font-mono text-zinc-700 dark:text-zinc-300">{assigningSubmission.submissionId}</span></div>
                <div className="text-zinc-900 dark:text-zinc-100 font-medium">Mahasiswa: {assigningSubmission.studentName}</div>
                <div className="text-zinc-500">Jumlah Judul yang Diajukan: {assigningSubmission.titles?.length || 1}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                  Pilih Validator Aktif
                </label>
                <Select
                  value={selectedValidatorId}
                  onChange={(val) => setSelectedValidatorId(val)}
                  placeholder="Pilih validator..."
                  options={validators.map((val) => ({
                    value: val.validatorId,
                    label: `${val.name} (${val.department || 'Tanpa departemen'}) - ${val.assignedSubmissions || 0} pengajuan aktif`
                  }))}
                  className="w-full"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => setAssigningSubmission(null)}
                  className="px-4 py-2 rounded text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={assigning}
                  className="px-4 py-2 rounded text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                >
                  {assigning ? 'Menugaskan...' : 'Konfirmasi Penugasan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 animate-in fade-in">
          <div className="relative bg-white dark:bg-zinc-950 rounded max-w-md w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <UserPlus size={20} className="text-orange-600" />
                Create New User Account
              </h2>
              <Button
                onClick={() => setShowAddUserModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X size={20} />
              </Button>
            </div>

            {addUserError && (
              <div className="p-3 bg-rose-50 text-rose-600 text-xs rounded">
                {addUserError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Dr. John Smith"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="mt-1 w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="john.smith@university.edu"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="mt-1 w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">Initial Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="mt-1 w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">User Role</label>
                <Select
                  value={newUser.role}
                  onChange={(val) => setNewUser({ ...newUser, role: val as UserRole })}
                  options={[
                    { value: 'STUDENT', label: 'Student' },
                    { value: 'VALIDATOR', label: 'Validator' },
                    { value: 'ADMIN', label: 'Admin' }
                  ]}
                  className="mt-1 w-full"
                />
              </div>

              {newUser.role === 'STUDENT' ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">NIM / Student ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 210209500010"
                      value={newUser.userId || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setNewUser(prev => {
                          const newAngkatan = val.length >= 2 ? `20${val.slice(0, 2)}` : prev.angkatan;
                          return { ...prev, userId: val, angkatan: newAngkatan };
                        });
                      }}
                      className="mt-1 w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">Program Studi (Prodi)</label>
                    <Select
                      value={newUser.prodi || 'PTIK'}
                      onChange={(val) => setNewUser({ ...newUser, prodi: val as 'PTIK' | 'TEKOM' })}
                      options={[
                        { value: 'PTIK', label: 'PTIK' },
                        { value: 'TEKOM', label: 'TEKOM' }
                      ]}
                      className="mt-1 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">Angkatan</label>
                    <input
                      type="text"
                      placeholder="2023"
                      value={newUser.angkatan || ''}
                      onChange={(e) => setNewUser({ ...newUser, angkatan: e.target.value })}
                      className="mt-1 w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">Department</label>
                  <input
                    type="text"
                    placeholder="Computer Science"
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    className="mt-1 w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addingUser}
                  className="px-4 py-2 rounded text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                >
                  {addingUser ? 'Creating...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {showEditUserModal && editingUser && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 animate-in fade-in">
          <div className="relative bg-white dark:bg-zinc-950 rounded max-w-md w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <UserCheck size={20} className="text-orange-600" />
                Edit User Account
              </h2>
              <Button
                onClick={() => setShowEditUserModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X size={20} />
              </Button>
            </div>

            {editUserError && (
              <div className="p-3 bg-rose-50 text-rose-600 text-xs rounded">
                {editUserError}
              </div>
            )}

            <form onSubmit={handleUpdateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Dr. John Smith"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="mt-1 w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="john.smith@university.edu"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="mt-1 w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">User Role</label>
                <Select
                  value={editingUser.role}
                  onChange={(val) => setEditingUser({ ...editingUser, role: val as UserRole })}
                  options={[
                    { value: 'STUDENT', label: 'Student' },
                    { value: 'VALIDATOR', label: 'Validator' },
                    { value: 'ADMIN', label: 'Admin' }
                  ]}
                  className="mt-1 w-full"
                />
              </div>

              {editingUser.role === 'STUDENT' ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">NIM / Student ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 210209500010"
                      value={editingUser.userId || editingUser.id || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setEditingUser(prev => {
                          if (!prev) return prev;
                          const newAngkatan = val.length >= 2 ? `20${val.slice(0, 2)}` : prev.angkatan;
                          return { ...prev, userId: val, angkatan: newAngkatan };
                        });
                      }}
                      className="mt-1 w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">Program Studi (Prodi)</label>
                    <Select
                      value={editingUser.prodi || 'PTIK'}
                      onChange={(val) => setEditingUser({ ...editingUser, prodi: val as 'PTIK' | 'TEKOM' })}
                      options={[
                        { value: 'PTIK', label: 'PTIK' },
                        { value: 'TEKOM', label: 'TEKOM' }
                      ]}
                      className="mt-1 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">Angkatan</label>
                    <input
                      type="text"
                      placeholder="2023"
                      value={editingUser.angkatan || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, angkatan: e.target.value })}
                      className="mt-1 w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">Department</label>
                  <input
                    type="text"
                    placeholder="Computer Science"
                    value={editingUser.department || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                    className="mt-1 w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="px-4 py-2 rounded text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updatingUser}
                  className="px-4 py-2 rounded text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                >
                  {updatingUser ? 'Updating...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TOPIC MODAL */}
      {showAddTopicModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 animate-in fade-in">
          <div className="relative bg-white dark:bg-zinc-950 rounded max-w-md w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Tag size={20} className="text-orange-600" />
                Add New Topic
              </h2>
              <Button
                onClick={() => setShowAddTopicModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X size={20} />
              </Button>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">Topic Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => setShowAddTopicModal(false)}
                  className="px-4 py-2 rounded text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addingTopic || !newTopicName.trim()}
                  className="px-4 py-2 rounded text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                >
                  {addingTopic ? 'Adding...' : 'Add Topic'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PENDING USERS MODAL */}
      {showPendingUsersModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 animate-in fade-in">
          <div className="relative bg-white dark:bg-zinc-950 rounded max-w-3xl w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Users size={20} className="text-rose-600" />
                Mahasiswa Menunggu Persetujuan
              </h2>
              <Button
                onClick={() => setShowPendingUsersModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X size={20} />
              </Button>
            </div>

            <div className="overflow-y-auto flex-1 border border-zinc-200 dark:border-zinc-800 rounded">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 sticky top-0">
                  <tr>
                    <th className="px-6 py-3.5 font-medium">NIM / Prodi</th>
                    <th className="px-6 py-3.5 font-medium">Nama / Email</th>
                    <th className="px-6 py-3.5 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {initialDataLoading ? (
                    <TableSkeletonRows columns={3} rows={4} />
                  ) : users.filter(u => u.status === 'MENUNGGU_APPROVE').length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center text-xs text-zinc-500 dark:text-zinc-400">
                        Tidak ada mahasiswa yang menunggu persetujuan.
                      </td>
                    </tr>
                  ) : (
                    users.filter(u => u.status === 'MENUNGGU_APPROVE').map(u => (
                      <tr key={u.id} className="hover:bg-white dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">{u.userId || '-'}</div>
                          {u.prodi && (
                            <div className="mt-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500">{u.prodi}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{u.name}</div>
                          <div className="text-[11px] text-zinc-500 mt-1">{u.email}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => handleRejectUser(u)}
                              className="inline-flex items-center gap-1.5 rounded border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700"
                            >
                              <XCircle size={13} /> Tolak
                            </Button>
                            <Button
                              onClick={() => handleApproveUser(u)}
                              className="inline-flex items-center gap-1.5 rounded border border-emerald-200 px-2.5 py-1.5 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                            >
                              <CheckCircle size={13} /> Approve
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="shrink-0 flex justify-end pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <Button
                onClick={() => setShowPendingUsersModal(false)}
                className="px-4 py-2 rounded text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE USER CONFIRMATION DIALOG */}
      <Dialog
        isOpen={!!userToDelete}
        onClose={() => !deletingUser && setUserToDelete(null)}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmLabel={deletingUser ? 'Deleting...' : 'Delete User'}
        onConfirm={confirmDeleteUser}
        isDestructive={true}
      >
        {userToDelete && (
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded flex flex-col gap-1 mt-2">
            <span className="font-semibold text-zinc-900 dark:text-white">{userToDelete.name}</span>
            <span className="text-zinc-500 text-xs">{userToDelete.email} • {userToDelete.role}</span>
          </div>
        )}
      </Dialog>

      {/* DELETE SUBMISSION CONFIRMATION DIALOG */}
      <Dialog
        isOpen={!!submissionToDelete}
        onClose={() => !deletingSubmission && setSubmissionToDelete(null)}
        title="Hapus Pengajuan"
        description="Apakah Anda yakin ingin menghapus pengajuan ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel={deletingSubmission ? 'Menghapus...' : 'Hapus'}
        onConfirm={confirmDeleteSubmission}
        isDestructive={true}
      />
    </>
  );
};
