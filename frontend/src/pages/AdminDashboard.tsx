import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { api } from '../services/api';
import type { Submission, ValidatorInfo, User, AdminStats, SubmissionStatus, UserRole } from '../types';
import { 
  Users, 
  FileText, 
  UserPlus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  UserCheck,
  X,
  Filter
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'submissions' | 'users'>('submissions');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [validators, setValidators] = useState<ValidatorInfo[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [prodiFilter, setProdiFilter] = useState<string>('ALL');
  const [topicFilter, setTopicFilter] = useState<string>('ALL');
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
  }>({
    name: '',
    email: '',
    role: 'STUDENT',
    department: '',
  });
  const [addUserError, setAddUserError] = useState<string | null>(null);
  const [addingUser, setAddingUser] = useState(false);

  const fetchInitialData = async () => {
    try {
      const [valRes, usrRes, statsRes] = await Promise.all([
        api.getValidators(),
        api.getUsers(),
        api.getAdminStats(),
      ]);
      if (valRes.success) setValidators(valRes.data || []);
      if (usrRes.success) setUsers(usrRes.data || []);
      if (statsRes.success) setStats(statsRes.data);
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
        setNewUser({ name: '', email: '', role: 'STUDENT', department: '' });
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
    if (s === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
          <XCircle size={12} /> Rejected
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
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded text-xs font-semibold transition-all ${
                activeTab === 'users'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              User Management
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-950 p-4 rounded border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-xs font-medium text-zinc-500">Total Proposals</span>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stats?.totalSubmissions || submissions.length}</p>
          </div>
          <div className="bg-white dark:bg-zinc-950 p-4 rounded border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Pending Admin</span>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {submissions.filter(s => s.status.toUpperCase() === 'PENDING_ADMIN_REVIEW').length}
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-950 p-4 rounded border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">With Validator</span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {submissions.filter(s => s.status.toUpperCase() === 'PENDING_VALIDATOR_REVIEW').length}
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-950 p-4 rounded border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Approved</span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {submissions.filter(s => s.status.toUpperCase() === 'APPROVED').length}
            </p>
          </div>
        </div>

        {/* TAB 1: SUBMISSIONS QUEUE */}
        {activeTab === 'submissions' && (
          <div className="bg-white dark:bg-zinc-950 rounded shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden space-y-4">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-semibold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <FileText size={18} className="text-orange-600" />
                All Student Proposals
              </h3>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <Filter size={16} className="text-zinc-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
                  className="px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100 outline-none"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="PENDING_ADMIN_REVIEW">Pending Admin</option>
                  <option value="PENDING_VALIDATOR_REVIEW">With Validator</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                <select
                  value={prodiFilter}
                  onChange={(e) => handleFilterChange(setProdiFilter, e.target.value)}
                  className="px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100 outline-none"
                >
                  <option value="ALL">Semua Prodi</option>
                  <option value="PTIK">PTIK</option>
                  <option value="TEKOM">TEKOM</option>
                </select>
                <input
                  type="text"
                  value={topicFilter === 'ALL' ? '' : topicFilter}
                  onChange={(e) => handleFilterChange(setTopicFilter, e.target.value || 'ALL')}
                  placeholder="Filter Topik..."
                  className="px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100 outline-none w-32 sm:w-40"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-3.5 font-medium">Submission ID</th>
                    <th className="px-6 py-3.5 font-medium">Student</th>
                    <th className="px-6 py-3.5 font-medium">Titles Count</th>
                    <th className="px-6 py-3.5 font-medium">Assigned Validator</th>
                    <th className="px-6 py-3.5 font-medium">Status</th>
                    <th className="px-6 py-3.5 font-medium text-right">Actions</th>
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
                          <td className="px-6 py-4 font-mono text-xs text-zinc-500">{sub.submissionId}</td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-xs text-zinc-900 dark:text-zinc-100">{sub.studentName || 'Student'}</div>
                            <div className="text-[11px] text-zinc-400 mt-0.5 space-x-2 flex items-center">
                              <span>{sub.nim || 'N/A'}</span>
                              {sub.studentProdi && (
                                <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400 rounded uppercase font-bold tracking-wider">{sub.studentProdi}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold">
                            {sub.titles ? `${sub.titles.length} proposed` : `${sub.titleCount || 1} proposed`}
                          </td>
                          <td className="px-6 py-4 text-xs">
                            {validatorName ? (
                              <span className="font-medium text-orange-600 dark:text-orange-400">{validatorName}</span>
                            ) : (
                              <span className="text-zinc-400 italic">Unassigned</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(sub.status)}</td>
                          <td className="px-6 py-4 text-right">
                            {sub.status.toUpperCase() === 'PENDING_ADMIN_REVIEW' ? (
                              <button
                                onClick={() => {
                                  setAssigningSubmission(sub);
                                  setSelectedValidatorId(validators[0]?.validatorId || '');
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs shadow-sm transition-colors"
                              >
                                <UserCheck size={14} /> Assign Validator
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setAssigningSubmission(sub);
                                  const currentValId = typeof sub.assignedValidator === 'object' ? sub.assignedValidator?.validatorId : sub.assignedValidator;
                                  setSelectedValidatorId(currentValId || validators[0]?.validatorId || '');
                                }}
                                className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                              >
                                Re-assign
                              </button>
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
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
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

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-zinc-950 rounded shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden space-y-4">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-semibold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <Users size={18} className="text-orange-600" />
                User Accounts Directory
              </h3>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-zinc-400" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100 outline-none"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="STUDENT">Students</option>
                    <option value="ADMIN">Admins</option>
                    <option value="VALIDATOR">Validators</option>
                  </select>
                </div>

                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-orange-600 text-white font-semibold text-xs shadow-sm hover:bg-orange-700 transition-colors"
                >
                  <UserPlus size={14} /> Add User
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-3.5 font-medium">User ID</th>
                    <th className="px-6 py-3.5 font-medium">Name</th>
                    <th className="px-6 py-3.5 font-medium">Email</th>
                    <th className="px-6 py-3.5 font-medium">Role</th>
                    <th className="px-6 py-3.5 font-medium">Department</th>
                    <th className="px-6 py-3.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {filteredUsers.map((u) => (
                    <tr key={u.id || u.userId} className="hover:bg-white dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-zinc-500">{u.id || u.userId}</td>
                      <td className="px-6 py-4 font-medium text-xs text-zinc-900 dark:text-zinc-100">{u.name}</td>
                      <td className="px-6 py-4 text-xs">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">{u.department || 'N/A'}</td>
                      <td className="px-6 py-4 text-xs">
                        <span className="text-emerald-600 font-semibold">Active</span>
                      </td>
                    </tr>
                  ))}
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
                Assign Submission to Validator
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
                <div className="text-zinc-400">Submission ID: <span className="font-mono text-zinc-700 dark:text-zinc-300">{assigningSubmission.submissionId}</span></div>
                <div className="text-zinc-900 dark:text-zinc-100 font-medium">Student: {assigningSubmission.studentName}</div>
                <div className="text-zinc-500">Proposed Titles: {assigningSubmission.titles?.length || 1}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                  Select Active Validator
                </label>
                <select
                  required
                  value={selectedValidatorId}
                  onChange={(e) => setSelectedValidatorId(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option value="" disabled>Select validator...</option>
                  {validators.map((val) => (
                    <option key={val.validatorId} value={val.validatorId}>
                      {val.name} ({val.department || 'CS'}) — {val.assignedSubmissions || 0} assigned
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssigningSubmission(null)}
                  className="px-4 py-2 rounded text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="px-4 py-2 rounded text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                >
                  {assigning ? 'Assigning...' : 'Confirm Assignment'}
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
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                  className="mt-1 w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100"
                >
                  <option value="STUDENT">Student</option>
                  <option value="VALIDATOR">Validator</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

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
    </DashboardLayout>
  );
};
