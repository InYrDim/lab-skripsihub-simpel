import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { api } from '../services/api';
import type { Submission, ValidatorInfo, User, AdminStats, SubmissionStatus, UserRole, Topic } from '../types';
import { Select } from '../components/ui/select';
import { Dialog } from '../components/ui/dialog';
import {
  Users,
  FileText,
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  X,
  Filter,
  Tag,
  Plus,
  BookOpen
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

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [prodiFilter, setProdiFilter] = useState<string>('ALL');
  const [topicFilter, setTopicFilter] = useState<string>('ALL');
  const [allTitlesTopicFilter, setAllTitlesTopicFilter] = useState<string>('ALL');
  const [allTitlesProdiFilter, setAllTitlesProdiFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubmissions, setTotalSubmissions] = useState(0);

  // Assignment Modal
  const [assigningSubmission, setAssigningSubmission] = useState<Submission | null>(null);
  const [selectedValidatorId, setSelectedValidatorId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  // Add User Modal
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState<{
    name: string;
    email: string;
    role: UserRole;
    department: string;
    userId?: string;
    prodi?: 'PTIK' | 'TEKOM';
    angkatan?: string;
  }>({
    name: '',
    email: '',
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

  // Add Topic Modal
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [addingTopic, setAddingTopic] = useState(false);

  const fetchInitialData = async () => {
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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) {
      setAddUserError('Name and email are required.');
      return;
    }
    setAddingUser(true);
    setAddUserError(null);

    try {
      const res = await api.createUser(newUser);
      if (res.success) {
        setShowAddUserModal(false);
        setNewUser({ name: '', email: '', role: 'STUDENT', department: '', userId: '', prodi: 'PTIK', angkatan: '' });
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

  const handleToggleTopic = async (topicId: string) => {
    try {
      const res = await api.toggleTopicStatus(topicId);
      if (res.success) {
        setTopics(topics.map(t => t.id === topicId ? { ...t, isActive: !t.isActive } : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    setPage(1); // Reset to page 1 on filter change
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter === 'ALL') return true;
    return u.role.toUpperCase() === roleFilter.toUpperCase();
  });

  const getStatusBadge = (status: SubmissionStatus) => {
    const s = status.toUpperCase();
    if (s === 'PENDING_ADMIN_REVIEW') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
          <Clock size={12} /> Menunggu Admin
        </span>
      );
    }
    if (s === 'PENDING_VALIDATOR_REVIEW') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
          <Clock size={12} /> Dalam Validasi
        </span>
      );
    }
    if (s === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
          <CheckCircle size={12} /> Disetujui
        </span>
      );
    }
    if (s === 'REJECTED' || s === 'REJECTED_BY_ADMIN' || s === 'REJECTED_BY_VALIDATOR') {
      const label = s === 'REJECTED_BY_ADMIN' ? 'Ditolak Admin' : s === 'REJECTED_BY_VALIDATOR' ? 'Ditolak Validator' : 'Ditolak';
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
          <XCircle size={12} /> {label}
        </span>
      );
    }
    return (
      <span className="text-xs font-semibold">
        {s === 'DRAFT' ? 'Draf' : 'Status tidak dikenal'}
      </span>
    );
  };

  return (
    <DashboardLayout>
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-4 py-2 rounded text-xs font-semibold transition-all ${
                activeTab === 'submissions'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              Submissions Queue
            </button>


            <button
              onClick={() => setActiveTab('all_titles')}
              className={`px-4 py-2 rounded text-xs font-semibold transition-all ${
                activeTab === 'all_titles'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              All Titles
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
        </div>

        {/* TAB 1: SUBMISSIONS QUEUE */}
        {activeTab === 'submissions' && (
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
              <div
                className="flex gap-1 overflow-x-auto"
                role="tablist"
                aria-label="Filter proposal berdasarkan status"
              >
                {[
                  { value: 'ALL', label: 'Semua' },
                  { value: 'PENDING_ADMIN_REVIEW', label: 'Menunggu Admin' },
                  { value: 'PENDING_VALIDATOR_REVIEW', label: 'Dalam Validasi' },
                  { value: 'APPROVED', label: 'Disetujui' },
                  { value: 'REJECTED_BY_VALIDATOR', label: 'Ditolak Validator' },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    role="tab"
                    aria-selected={statusFilter === tab.value}
                    onClick={() => handleFilterChange(setStatusFilter, tab.value)}
                    className={`shrink-0 border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors ${
                      statusFilter === tab.value
                        ? 'border-orange-600 text-orange-600 dark:text-orange-400'
                        : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-900 dark:hover:border-zinc-700 dark:hover:text-zinc-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">ID</th>
                    <th className="px-4 py-2.5 font-medium">Student</th>
                    <th className="px-4 py-2.5 font-medium">Titles</th>
                    <th className="px-4 py-2.5 font-medium">Assigned Validator</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                    <th className="px-4 py-2.5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-zinc-400 text-xs">
                        Loading submissions queue...
                      </td>
                    </tr>
                  ) : submissions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-zinc-400 text-xs">
                        No submissions match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    submissions.map((sub) => {
                      const validatorName =
                        typeof sub.assignedValidator === 'object' && sub.assignedValidator !== null
                          ? sub.assignedValidator.name
                          : validators.find(v => v.validatorId === sub.assignedValidator)?.name || null;

                      return (
                        <tr key={sub.submissionId} className="hover:bg-white dark:hover:bg-zinc-900/50 transition-colors">
                          <td
                            className="px-4 py-3 font-mono text-xs text-zinc-500"
                            title={sub.submissionId}
                          >
                            {sub.submissionId.slice(0, 5)}...
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-xs text-zinc-900 dark:text-zinc-100">{sub.studentName || 'Student'}</div>
                            <div className="text-[11px] text-zinc-400 mt-0.5 space-x-2 flex items-center">
                              <span>{sub.nim || 'N/A'}</span>
                              {sub.studentProdi && (
                                <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400 rounded uppercase font-bold tracking-wider">{sub.studentProdi}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {sub.titles?.length ? (
                              <ol className="min-w-56 max-w-md list-decimal space-y-1 pl-4 text-xs text-zinc-700 dark:text-zinc-300">
                                {sub.titles.map((title) => (
                                  <li key={title.titleId} className="pl-1 leading-relaxed">
                                    {title.title}
                                  </li>
                                ))}
                              </ol>
                            ) : (
                              <span className="text-xs italic text-zinc-400">No titles submitted</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            {validatorName ? (
                              <span className="font-medium text-orange-600 dark:text-orange-400">{validatorName}</span>
                            ) : (
                              <span className="text-zinc-400 italic">Unassigned</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">{getStatusBadge(sub.status)}</td>
                          <td className="px-4 py-3 text-right">
                            {sub.status.toUpperCase() === 'PENDING_ADMIN_REVIEW' ? (
                              <button
                                onClick={() => {
                                  setAssigningSubmission(sub);
                                  setSelectedValidatorId(validators[0]?.validatorId || '');
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs shadow-sm transition-colors"
                              >
                                <UserCheck size={14} /> Tugaskan Validator
                              </button>
                            ) : sub.status.toUpperCase() === 'PENDING_VALIDATOR_REVIEW' ? (
                              <button
                                onClick={() => {
                                  setAssigningSubmission(sub);
                                  setSelectedValidatorId('');
                                }}
                                className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                              >
                                Ganti Validator
                              </button>
                            ) : (
                              <span className="text-xs text-zinc-300 dark:text-zinc-700">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Server-Side Pagination Controls */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3 text-xs dark:border-zinc-800">
                <span className="text-zinc-500">
                  Showing page <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page}</span> of <span className="font-semibold text-zinc-900 dark:text-zinc-100">{totalPages}</span> ({totalSubmissions} total items)
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ALL TITLES */}
        {activeTab === 'all_titles' && (
          <div className="bg-white dark:bg-zinc-950 rounded shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-semibold text-base text-zinc-900 dark:text-white flex items-center gap-2">
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
                  {allTitles.filter(t =>
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
                          {getStatusBadge(t.submissionStatus)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ASSIGN VALIDATOR MODAL */}
      {assigningSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 rounded max-w-md w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <UserCheck size={20} className="text-orange-600" />
                Tugaskan Pengajuan kepada Validator
              </h2>
              <button
                onClick={() => setAssigningSubmission(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X size={20} />
              </button>
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
                <button
                  type="button"
                  onClick={() => setAssigningSubmission(null)}
                  className="px-4 py-2 rounded text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="px-4 py-2 rounded text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                >
                  {assigning ? 'Menugaskan...' : 'Konfirmasi Penugasan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 rounded max-w-md w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <UserPlus size={20} className="text-orange-600" />
                Create New User Account
              </h2>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X size={20} />
              </button>
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
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingUser}
                  className="px-4 py-2 rounded text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                >
                  {addingUser ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {showEditUserModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 rounded max-w-md w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <UserCheck size={20} className="text-orange-600" />
                Edit User Account
              </h2>
              <button
                onClick={() => setShowEditUserModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X size={20} />
              </button>
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
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="px-4 py-2 rounded text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingUser}
                  className="px-4 py-2 rounded text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                >
                  {updatingUser ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TOPIC MODAL */}
      {showAddTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 rounded max-w-md w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Tag size={20} className="text-orange-600" />
                Add New Topic
              </h2>
              <button
                onClick={() => setShowAddTopicModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X size={20} />
              </button>
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
                <button
                  type="button"
                  onClick={() => setShowAddTopicModal(false)}
                  className="px-4 py-2 rounded text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingTopic || !newTopicName.trim()}
                  className="px-4 py-2 rounded text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                >
                  {addingTopic ? 'Adding...' : 'Add Topic'}
                </button>
              </div>
            </form>
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
    </DashboardLayout>
  );
};
