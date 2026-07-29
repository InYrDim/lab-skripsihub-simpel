import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { api } from '../services/api';
import type { User, UserRole, Topic } from '../types';
import { Select } from '../components/ui/select';
import { Dialog } from '../components/ui/dialog';
import { AuthenticatedImage } from '../components/ui/AuthenticatedImage';
import { TableSkeletonRows } from '../components/ui/TableSkeletonRows';
import { 
  Users, 
  UserPlus, 
  CheckCircle, 
  XCircle, 
  UserCheck,
  X,
  Tag,
  Plus,
  Pencil,
  Trash2,
  Eye
} from 'lucide-react';

export const AdminManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'topics' | 'settings'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  // Filters
  const [userStatusFilter, setUserStatusFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [prodiFilter, setProdiFilter] = useState<string>('ALL');


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

  // User Detail Modal
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState<User | null>(null);

  // Delete User Dialog
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  // Add Topic Modal
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [addingTopic, setAddingTopic] = useState(false);

  // Edit Topic Modal
  const [showEditTopicModal, setShowEditTopicModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editTopicName, setEditTopicName] = useState('');
  const [updatingTopic, setUpdatingTopic] = useState(false);

  // Delete Topic Dialog
  const [topicToDelete, setTopicToDelete] = useState<Topic | null>(null);
  const [deletingTopic, setDeletingTopic] = useState(false);

  // Settings
  const [defaultDepartment, setDefaultDepartment] = useState('Teknik Informatika dan Komputer');
  const [editingDepartment, setEditingDepartment] = useState('');
  const [savingDepartment, setSavingDepartment] = useState(false);

  const fetchInitialData = async () => {
    setUsersLoading(true);
    try {
      const [usrRes, topRes] = await Promise.all([
        api.getUsers(),
        api.getTopics(),
      ]);
      if (usrRes.success) setUsers(usrRes.data || []);
      if (topRes.success) setTopics(topRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  };



  useEffect(() => {
    fetchInitialData();
  }, []);



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

  const handleUpdateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopic || !editTopicName.trim()) return;
    setUpdatingTopic(true);
    try {
      const res = await api.updateTopic(editingTopic.id, { name: editTopicName });
      if (res.success) {
        setShowEditTopicModal(false);
        setEditingTopic(null);
        setEditTopicName('');
        await fetchInitialData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingTopic(false);
    }
  };

  const confirmDeleteTopic = async () => {
    if (!topicToDelete) return;
    setDeletingTopic(true);
    try {
      const res = await api.deleteTopic(topicToDelete.id);
      if (res.success) {
        setTopicToDelete(null);
        await fetchInitialData();
      } else {
        alert(res.message || 'Topic deletion failed.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during deletion.');
    } finally {
      setDeletingTopic(false);
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



  const filteredUsers = users.filter((u) => {
    const matchesRole =
      roleFilter === 'ALL' ||
      u.role.toUpperCase() === roleFilter.toUpperCase();
    const matchesProdi =
      prodiFilter === 'ALL' || u.prodi === prodiFilter;
    const matchesStatus =
      userStatusFilter === 'ALL' || u.status === userStatusFilter;

    return matchesRole && matchesProdi && matchesStatus;
  });
  const showStudentIdentityColumn = ['ALL', 'STUDENT'].includes(roleFilter);



  return (
    <>
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
        <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Portal Manajemen Data
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Kelola akun pengguna, topik, dan pengaturan sistem.
            </p>
          </div>

          <TabsList className="gap-2 border-none">
            <TabsTrigger value="users" className="px-4 py-2 text-xs">
              User Management
            </TabsTrigger>
            <TabsTrigger value="topics" className="px-4 py-2 text-xs">
              Topic Management
            </TabsTrigger>
            <TabsTrigger value="settings" className="px-4 py-2 text-xs">
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 2: USER MANAGEMENT */}
        <TabsContent value="users" className="mt-0">
          <div className="bg-white dark:bg-zinc-950 rounded shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden space-y-4">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-semibold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <Users size={18} className="text-orange-600" />
                User Accounts Directory
              </h3>

              <div className="flex items-center gap-2">
                <Select
                  value={userStatusFilter}
                  onChange={(value) => setUserStatusFilter(value as string)}
                  options={[
                    { value: 'ALL', label: 'Semua Status' },
                    { value: 'AKTIF', label: 'Aktif' },
                    { value: 'MENUNGGU_APPROVE', label: 'Menunggu Approve' },
                    { value: 'NONAKTIF', label: 'Nonaktif' },
                    { value: 'DITOLAK', label: 'Ditolak' }
                  ]}
                  className="w-40"
                />
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
                <Button
                  onClick={() => setShowAddUserModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-orange-600 text-white font-semibold text-xs shadow-sm hover:bg-orange-700 transition-colors"
                >
                  <UserPlus size={14} /> Add User
                </Button>
              </div>
            </div>

            <div className="px-5 border-b border-zinc-200 dark:border-zinc-800">
              <Tabs value={roleFilter} onValueChange={setRoleFilter}>
                <TabsList className="flex gap-1 overflow-x-auto border-none">
                  {[
                    { value: 'ALL', label: 'Semua' },
                    { value: 'STUDENT', label: 'Mahasiswa' },
                    { value: 'ADMIN', label: 'Admin' },
                    { value: 'VALIDATOR', label: 'Validator' },
                  ].map((tab) => {
                    const usersInProdiAndStatus = users.filter(
                      (user) => (prodiFilter === 'ALL' || user.prodi === prodiFilter) &&
                                (userStatusFilter === 'ALL' || user.status === userStatusFilter)
                    );
                    const count = tab.value === 'ALL'
                      ? usersInProdiAndStatus.length
                      : usersInProdiAndStatus.filter(
                          (user) => user.role.toUpperCase() === tab.value,
                        ).length;

                    return (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="flex shrink-0 items-center gap-2 px-4 py-3 text-xs"
                      >
                        {tab.label}
                        <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                          roleFilter === tab.value
                            ? 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300'
                            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}>
                          {count}
                        </span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
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
                  {usersLoading ? (
                    <TableSkeletonRows columns={showStudentIdentityColumn ? 4 : 3} />
                  ) : filteredUsers.length === 0 ? (
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
                        {u.status === 'AKTIF' ? (
                          <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded">Aktif</span>
                        ) : u.status === 'MENUNGGU_APPROVE' ? (
                          <span className="text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded">Menunggu</span>
                        ) : u.status === 'DITOLAK' ? (
                          <span className="text-rose-600 font-semibold bg-rose-50 px-2 py-1 rounded">Ditolak</span>
                        ) : (
                          <span className="text-rose-600 font-semibold bg-rose-50 px-2 py-1 rounded">Nonaktif</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {u.status === 'MENUNGGU_APPROVE' && (
                          <>
                            <Button
                              onClick={() => handleRejectUser(u)}
                              className="mr-2 inline-flex items-center gap-1.5 rounded border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700"
                            >
                              <XCircle size={13} />
                              Tolak
                            </Button>
                            <Button
                              onClick={() => handleApproveUser(u)}
                              className="mr-2 inline-flex items-center gap-1.5 rounded border border-emerald-200 px-2.5 py-1.5 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                            >
                              <CheckCircle size={13} />
                              Approve
                            </Button>
                          </>
                        )}
                        <Button
                          onClick={() => {
                            setSelectedUserDetail(u);
                            setShowUserDetailModal(true);
                          }}
                          className="mr-2 inline-flex items-center gap-1.5 rounded border border-blue-200 px-2.5 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:border-blue-500/30 dark:hover:bg-blue-500/10"
                        >
                          <Eye size={13} aria-hidden="true" />
                          Detail
                        </Button>
                        <Button
                          onClick={() => {
                            setEditingUser(u);
                            setShowEditUserModal(true);
                          }}
                          className="mr-2 inline-flex items-center gap-1.5 rounded border border-orange-200 px-2.5 py-1.5 text-xs font-semibold text-orange-600 transition-colors hover:bg-orange-50 hover:text-orange-700 dark:border-orange-500/30 dark:hover:bg-orange-500/10"
                        >
                          <Pencil size={13} aria-hidden="true" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => setUserToDelete(u)}
                          className="inline-flex items-center gap-1.5 rounded border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700 dark:border-rose-500/30 dark:hover:bg-rose-500/10"
                        >
                          <Trash2 size={13} aria-hidden="true" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: TOPICS MANAGEMENT */}
        <TabsContent value="topics" className="mt-0">
          <div className="bg-white dark:bg-zinc-950 rounded shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden space-y-4">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-semibold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <Tag size={18} className="text-orange-600" />
                Direktori Topik
              </h3>
              <Button
                onClick={() => setShowAddTopicModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-orange-600 text-white font-semibold text-xs shadow-sm hover:bg-orange-700 transition-colors"
              >
                <Plus size={14} /> Add Topic
              </Button>
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
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button
                        onClick={() => handleToggleTopic(topic.id)}
                        className={`text-xs px-2 py-1 rounded border font-medium ${topic.isActive ? 'border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-900/30' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-900/30'}`}
                      >
                        {topic.isActive ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingTopic(topic);
                          setEditTopicName(topic.name);
                          setShowEditTopicModal(true);
                        }}
                        className="text-xs px-2 py-1 rounded border border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-900 dark:text-orange-400 dark:hover:bg-orange-900/30 font-medium"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => setTopicToDelete(topic)}
                        className="text-xs px-2 py-1 rounded border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 font-medium"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

      </div>

        <TabsContent value="settings" className="mt-0">
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
                  <Button
                    onClick={handleSaveDefaultDepartment}
                    disabled={savingDepartment || editingDepartment.trim() === defaultDepartment}
                    className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white text-xs font-semibold rounded transition-all"
                  >
                    {savingDepartment ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                  {editingDepartment.trim() !== defaultDepartment && (
                    <Button
                      onClick={() => setEditingDepartment(defaultDepartment)}
                      className="px-4 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-semibold rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                    >
                      Batal
                    </Button>
                  )}
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Default Saat Ini</span>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white mt-1">{defaultDepartment}</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
    </Tabs>

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

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">User Status</label>
                <Select
                  value={editingUser.status || 'AKTIF'}
                  onChange={(val) => setEditingUser({ ...editingUser, status: val as any })}
                  options={[
                    { value: 'AKTIF', label: 'Aktif' },
                    { value: 'MENUNGGU_APPROVE', label: 'Menunggu Approve' },
                    { value: 'NONAKTIF', label: 'Nonaktif' },
                    { value: 'DITOLAK', label: 'Ditolak' }
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
      {/* EDIT TOPIC MODAL */}
      {showEditTopicModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 animate-in fade-in">
          <div className="relative bg-white dark:bg-zinc-950 rounded max-w-sm w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Tag size={20} className="text-orange-600" />
                Edit Topik
              </h2>
              <Button
                onClick={() => setShowEditTopicModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X size={20} />
              </Button>
            </div>
            <form onSubmit={handleUpdateTopic} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">Nama Topik</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Machine Learning"
                  value={editTopicName}
                  onChange={(e) => setEditTopicName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => setShowEditTopicModal(false)}
                  className="px-4 py-2 rounded text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={updatingTopic || !editTopicName.trim()}
                  className="px-4 py-2 rounded text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                >
                  {updatingTopic ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE TOPIC DIALOG */}
      <Dialog
        isOpen={!!topicToDelete}
        onClose={() => setTopicToDelete(null)}
        title="Hapus Topik"
        description={`Apakah Anda yakin ingin menghapus topik "${topicToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        isDestructive={true}
        confirmLabel={deletingTopic ? 'Menghapus...' : 'Hapus Topik'}
        cancelLabel="Batal"
        onConfirm={confirmDeleteTopic}
      />

      {/* USER DETAIL MODAL */}
      {showUserDetailModal && selectedUserDetail && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 animate-in fade-in">
          <div className="relative bg-white dark:bg-zinc-950 rounded max-w-md w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <UserCheck size={20} className="text-blue-600" />
                Detail User
              </h2>
              <Button
                type="button"
                onClick={() => setShowUserDetailModal(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X size={20} />
              </Button>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-center mb-6">
                {selectedUserDetail.photoUrl ? (
                  <AuthenticatedImage src={selectedUserDetail.photoUrl} alt={selectedUserDetail.name} className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-zinc-900 shadow-md" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 border-4 border-white dark:border-zinc-900 shadow-md">
                    <UserCheck size={36} />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-zinc-500 font-medium">Nama:</span>
                <span className="col-span-2 font-semibold text-zinc-900 dark:text-zinc-100">{selectedUserDetail.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-zinc-500 font-medium">Email:</span>
                <span className="col-span-2 text-zinc-900 dark:text-zinc-100">{selectedUserDetail.email}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-zinc-500 font-medium">Role:</span>
                <span className="col-span-2 text-zinc-900 dark:text-zinc-100">{selectedUserDetail.role}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-zinc-500 font-medium">Status Akun:</span>
                <span className="col-span-2 text-zinc-900 dark:text-zinc-100">{selectedUserDetail.status || '-'}</span>
              </div>
              
              {/* Extra Info For Student */}
              {(selectedUserDetail.role.toUpperCase() === 'STUDENT' || selectedUserDetail.role.toUpperCase() === 'MAHASISWA') && (
                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                  <h3 className="font-bold text-zinc-800 dark:text-zinc-200 mb-2">Data Mahasiswa</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-zinc-500 font-medium">Pengajuan:</span>
                    <span className="col-span-2 text-zinc-900 dark:text-zinc-100">
                      {selectedUserDetail.submissionStatus === 'Belum Mengajukan' ? (
                        <span className="text-zinc-500 italic">Belum Mengajukan</span>
                      ) : (
                        <span className="font-semibold text-orange-600">{selectedUserDetail.submissionStatus}</span>
                      )}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-zinc-500 font-medium">NIM:</span>
                    <span className="col-span-2 font-mono text-zinc-900 dark:text-zinc-100">{selectedUserDetail.userId || '-'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-zinc-500 font-medium">Program Studi:</span>
                    <span className="col-span-2 text-zinc-900 dark:text-zinc-100">{selectedUserDetail.prodi || '-'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-zinc-500 font-medium">Dosen PA:</span>
                    <span className="col-span-2 text-zinc-900 dark:text-zinc-100">{selectedUserDetail.dosenPA || '-'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-zinc-500 font-medium">NIP Dosen PA:</span>
                    <span className="col-span-2 font-mono text-zinc-900 dark:text-zinc-100">{selectedUserDetail.dosenPANip || '-'}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="pt-4 flex justify-end">
              <Button
                onClick={() => setShowUserDetailModal(false)}
                className="px-4 py-2 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 rounded transition-colors font-medium text-sm"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

