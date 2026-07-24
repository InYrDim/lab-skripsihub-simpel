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
  Tag,
  Plus,
  BookOpen,
  Pencil,
  Trash2
} from 'lucide-react';

export const AdminManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'topics' | 'settings'>('users');
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

  // Settings
  const [defaultDepartment, setDefaultDepartment] = useState('Teknik Informatika dan Komputer');
  const [editingDepartment, setEditingDepartment] = useState('');
  const [savingDepartment, setSavingDepartment] = useState(false);

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
    if (false) fetchSubmissions();
  }, [page, limit, statusFilter, prodiFilter, topicFilter, activeTab]);

  const handleAssignValidator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningSubmission || !selectedValidatorId) {
      setAssignError('Please select a validator from the list.');
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

  const handleSaveDefaultDepartment = async () => {
    if (!editingDepartment.trim()) return;
    setSavingDepartment(true);
    try {
      const res = await api.setDefaultDepartment(editingDepartment.trim());
      if (res.success) {
        setDefaultDepartment(editingDepartment.trim());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingDepartment(false);
    }
  };

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    setPage(1); // Reset to page 1 on filter change
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole =
      roleFilter === 'ALL' ||
      u.role.toUpperCase() === roleFilter.toUpperCase();
    const matchesProdi =
      prodiFilter === 'ALL' || u.prodi === prodiFilter;

    return matchesRole && matchesProdi;
  });
  const showStudentIdentityColumn = ['ALL', 'STUDENT'].includes(roleFilter);

  const getStatusBadge = (status: SubmissionStatus) => {
    const s = status.toUpperCase();
    if (s === 'PENDING_ADMIN_REVIEW') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
          <Clock size={12} /> Pending Admin
        </span>
      );
    }
    if (s === 'PENDING_VALIDATOR_REVIEW') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
          <Clock size={12} /> With Validator
        </span>
      );
    }
    if (s === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
          <CheckCircle size={12} /> Approved
        </span>
      );
    }
    if (s === 'REJECTED' || s === 'REJECTED_BY_ADMIN' || s === 'REJECTED_BY_VALIDATOR') {
      const label = s === 'REJECTED_BY_ADMIN' ? 'Rejected by Admin' : s === 'REJECTED_BY_VALIDATOR' ? 'Rejected by Validator' : 'Rejected';
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
          <XCircle size={12} /> {label}
        </span>
      );
    }
    return <span className="text-xs font-semibold">{status}</span>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Data Management Portal
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Manage user accounts, topics, and system settings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded text-xs font-semibold transition-all ${
                activeTab === 'users'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab('topics')}
              className={`px-4 py-2 rounded text-xs font-semibold transition-all ${
                activeTab === 'topics'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              Topic Management
            </button>
            
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded text-xs font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              Settings
            </button>
          </div>
        </div>

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-zinc-950 rounded shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden space-y-4">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-semibold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <Users size={18} className="text-orange-600" />
                User Accounts Directory
              </h3>

              <div className="flex items-center gap-2">
                <Select
                  value={prodiFilter}
                  onChange={(value) => setProdiFilter(value)}
                  options={[
                    { value: 'ALL', label: 'Semua Prodi' },
                    { value: 'PTIK', label: 'PTIK' },
                    { value: 'TEKOM', label: 'TEKOM' },
                  ]}
                  className="w-36"
                />
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-orange-600 text-white font-semibold text-xs shadow-sm hover:bg-orange-700 transition-colors"
                >
                  <UserPlus size={14} /> Add User
                </button>
              </div>
            </div>

            <div className="px-5 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label="Filter users by role">
                {[
                  { value: 'ALL', label: 'Semua' },
                  { value: 'STUDENT', label: 'Mahasiswa' },
                  { value: 'ADMIN', label: 'Admin' },
                  { value: 'VALIDATOR', label: 'Validator' },
                ].map((tab) => {
                  const usersInProdi = users.filter(
                    (user) => prodiFilter === 'ALL' || user.prodi === prodiFilter,
                  );
                  const count = tab.value === 'ALL'
                    ? usersInProdi.length
                    : usersInProdi.filter(
                        (user) => user.role.toUpperCase() === tab.value,
                      ).length;

                  return (
                    <button
                      key={tab.value}
                      type="button"
                      role="tab"
                      aria-selected={roleFilter === tab.value}
                      onClick={() => setRoleFilter(tab.value)}
                      className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
                        roleFilter === tab.value
                          ? 'border-orange-600 text-orange-600 dark:text-orange-400'
                          : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-900 dark:hover:border-zinc-700 dark:hover:text-zinc-100'
                      }`}
                    >
                      {tab.label}
                      <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                        roleFilter === tab.value
                          ? 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300'
                          : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    {showStudentIdentityColumn && (
                      <th className="px-6 py-3.5 font-medium">NIM / Prodi</th>
                    )}
                    <th className="px-6 py-3.5 font-medium">User Details</th>
                    <th className="px-6 py-3.5 font-medium">Status</th>
                    <th className="px-6 py-3.5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={showStudentIdentityColumn ? 4 : 3} className="px-6 py-10 text-center text-xs text-zinc-500 dark:text-zinc-400">
                        Tidak ada user pada role ini.
                      </td>
                    </tr>
                  ) : filteredUsers.map((u) => (
                    <tr key={u.id || u.userId} className="hover:bg-white dark:hover:bg-zinc-900/50 transition-colors">
                      {showStudentIdentityColumn && (
                        <td className="px-6 py-4">
                          {u.role.toUpperCase() === 'STUDENT' ? (
                            <>
                              <div className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                                {u.userId || '-'}
                              </div>
                              {u.prodi && (
                                <div className="mt-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                                  {u.prodi}
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-zinc-400">Tidak berlaku</span>
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{u.name}</div>
                        <div className="text-[11px] text-zinc-500 mt-1 flex flex-col gap-y-0.5">
                          <span>{u.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span className="text-emerald-600 font-semibold">Active</span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setEditingUser(u);
                            setShowEditUserModal(true);
                          }}
                          className="mr-2 inline-flex items-center gap-1.5 rounded border border-orange-200 px-2.5 py-1.5 text-xs font-semibold text-orange-600 transition-colors hover:bg-orange-50 hover:text-orange-700 dark:border-orange-500/30 dark:hover:bg-orange-500/10"
                        >
                          <Pencil size={13} aria-hidden="true" />
                          Edit
                        </button>
                        <button
                          onClick={() => setUserToDelete(u)}
                          className="inline-flex items-center gap-1.5 rounded border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700 dark:border-rose-500/30 dark:hover:bg-rose-500/10"
                        >
                          <Trash2 size={13} aria-hidden="true" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: TOPICS MANAGEMENT */}
        {activeTab === 'topics' && (
          <div className="bg-white dark:bg-zinc-950 rounded shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden space-y-4">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-semibold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <Tag size={18} className="text-orange-600" />
                Topics Directory
              </h3>
              <button
                onClick={() => setShowAddTopicModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-orange-600 text-white font-semibold text-xs shadow-sm hover:bg-orange-700 transition-colors"
              >
                <Plus size={14} /> Add Topic
              </button>
            </div>
            <div className="overflow-x-auto p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {topics.map(topic => (
                  <div key={topic.id} className="p-4 rounded border border-zinc-200 dark:border-zinc-800 flex items-start justify-between bg-zinc-50 dark:bg-zinc-900/50">
                    <div>
                      <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{topic.name}</h4>
                      {topic.description && (
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{topic.description}</p>
                      )}
                      <div className="mt-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${topic.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                          {topic.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleTopic(topic.id)}
                      className={`text-xs px-2 py-1 rounded border font-medium ${topic.isActive ? 'border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-900/30' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-900/30'}`}
                    >
                      {topic.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* TAB 4: ALL TITLES */}
        {false && (
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

        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-zinc-950 rounded shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-semibold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <Tag size={18} className="text-orange-600" />
                Pengaturan Sistem
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Kelola pengaturan default untuk sistem.
              </p>
            </div>
            <div className="p-5 space-y-6">
              <div className="max-w-md space-y-3">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Default Jurusan
                </label>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Jurusan yang akan otomatis diisi untuk pengguna baru (terutama mahasiswa).
                </p>
                <input
                  type="text"
                  value={editingDepartment}
                  onChange={(e) => setEditingDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                  placeholder="Teknik Informatika dan Komputer"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveDefaultDepartment}
                    disabled={savingDepartment || editingDepartment.trim() === defaultDepartment}
                    className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white text-xs font-semibold rounded transition-all"
                  >
                    {savingDepartment ? 'Menyimpan...' : 'Simpan'}
                  </button>
                  {editingDepartment.trim() !== defaultDepartment && (
                    <button
                      onClick={() => setEditingDepartment(defaultDepartment)}
                      className="px-4 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-semibold rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                    >
                      Batal
                    </button>
                  )}
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Default Saat Ini</span>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white mt-1">{defaultDepartment}</p>
                </div>
              </div>
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
