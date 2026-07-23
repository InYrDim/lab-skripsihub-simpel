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

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subRes, valRes, usrRes, statsRes] = await Promise.all([
        api.getAdminSubmissions(),
        api.getValidators(),
        api.getUsers(),
        api.getAdminStats(),
      ]);

      if (subRes.success) setSubmissions(subRes.data || []);
      if (valRes.success) setValidators(valRes.data || []);
      if (usrRes.success) setUsers(usrRes.data || []);
      if (statsRes.success) setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        await fetchData();
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
        await fetchData();
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

  const filteredSubmissions = submissions.filter((sub) => {
    if (statusFilter === 'ALL') return true;
    return sub.status.toUpperCase() === statusFilter.toUpperCase();
  });

  const filteredUsers = users.filter((u) => {
    if (roleFilter === 'ALL') return true;
    return u.role.toUpperCase() === roleFilter.toUpperCase();
  });

  const getStatusBadge = (status: SubmissionStatus) => {
    const s = status.toUpperCase();
    if (s === 'PENDING_ADMIN_REVIEW') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
          <Clock size={12} /> Pending Admin
        </span>
      );
    }
    if (s === 'PENDING_VALIDATOR_REVIEW') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
          <Clock size={12} /> With Validator
        </span>
      );
    }
    if (s === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
          <CheckCircle size={12} /> Approved
        </span>
      );
    }
    if (s === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
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
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'submissions'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              Submissions Queue
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'users'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              User Management
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-xs font-medium text-zinc-500">Total Proposals</span>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stats?.totalSubmissions || submissions.length}</p>
          </div>
          <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Pending Admin</span>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {submissions.filter(s => s.status.toUpperCase() === 'PENDING_ADMIN_REVIEW').length}
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">With Validator</span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {submissions.filter(s => s.status.toUpperCase() === 'PENDING_VALIDATOR_REVIEW').length}
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Approved</span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {submissions.filter(s => s.status.toUpperCase() === 'APPROVED').length}
            </p>
          </div>
        </div>

        {/* TAB 1: SUBMISSIONS QUEUE */}
        {activeTab === 'submissions' && (
          <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden space-y-4">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-semibold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <FileText size={18} className="text-indigo-600" />
                All Student Proposals
              </h3>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-zinc-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING_ADMIN_REVIEW">Pending Admin Review</option>
                  <option value="PENDING_VALIDATOR_REVIEW">Pending Validator Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
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
                  ) : filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-zinc-400 text-xs">
                        No submissions match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((sub) => {
                      const validatorName = 
                        typeof sub.assignedValidator === 'object' && sub.assignedValidator !== null
                          ? sub.assignedValidator.name
                          : validators.find(v => v.validatorId === sub.assignedValidator)?.name || null;

                      return (
                        <tr key={sub.submissionId} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-zinc-500">{sub.submissionId}</td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-xs text-zinc-900 dark:text-zinc-100">{sub.studentName || 'Student'}</div>
                            <div className="text-[11px] text-zinc-400">{sub.studentEmail}</div>
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold">
                            {sub.titles ? `${sub.titles.length} proposed` : `${sub.titleCount || 1} proposed`}
                          </td>
                          <td className="px-6 py-4 text-xs">
                            {validatorName ? (
                              <span className="font-medium text-indigo-600 dark:text-indigo-400">{validatorName}</span>
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
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-colors"
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
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden space-y-4">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-semibold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <Users size={18} className="text-indigo-600" />
                User Accounts Directory
              </h3>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-zinc-400" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 outline-none"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="STUDENT">Students</option>
                    <option value="ADMIN">Admins</option>
                    <option value="VALIDATOR">Validators</option>
                  </select>
                </div>

                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-sm hover:bg-indigo-700 transition-colors"
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
                    <tr key={u.id || u.userId} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-zinc-500">{u.id || u.userId}</td>
                      <td className="px-6 py-4 font-medium text-xs text-zinc-900 dark:text-zinc-100">{u.name}</td>
                      <td className="px-6 py-4 text-xs">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <UserCheck size={20} className="text-indigo-600" />
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
              <div className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 text-xs rounded-xl">
                {assignError}
              </div>
            )}

            <form onSubmit={handleAssignValidator} className="space-y-4">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl space-y-1 text-xs">
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
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <UserPlus size={20} className="text-indigo-600" />
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
              <div className="p-3 bg-rose-50 text-rose-600 text-xs rounded-xl">
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
                  className="mt-1 w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100"
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
                  className="mt-1 w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">User Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                  className="mt-1 w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100"
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
                  className="mt-1 w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingUser}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
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
