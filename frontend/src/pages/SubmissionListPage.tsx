import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { api } from '../services/api';
import type { Submission } from '../types';
import { Select } from '../components/ui/select';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
  LineChart, Line
} from 'recharts';
import {
  Search,
  User,
  Calendar,
  BookOpen,
  XCircle,
  PieChart,
  List as ListIcon,
  Filter
} from 'lucide-react';

export const SubmissionListPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'analytics'>('list');

  const [filterProdi, setFilterProdi] = useState('ALL');
  const [filterTopic, setFilterTopic] = useState('ALL');
  const [filterYear, setFilterYear] = useState('ALL');
  const [isFiltering, setIsFiltering] = useState(false);

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setIsFiltering(true);
    setter(value);
    setTimeout(() => setIsFiltering(false), 400);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsFiltering(true);
    setSearchQuery(e.target.value);
    setTimeout(() => setIsFiltering(false), 400);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.getAllSubmissions();
      if (res.success) {
        setSubmissions(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredSubmissions = submissions.filter((sub) => {
    if (searchQuery !== '') {
      const q = searchQuery.toLowerCase();
      const matchSearch = sub.studentName?.toLowerCase().includes(q) ||
        sub.nim?.toLowerCase().includes(q) ||
        sub.titles?.some((t) => t.title?.toLowerCase().includes(q));
      if (!matchSearch) return false;
    }

    if (filterProdi !== 'ALL' && sub.studentProdi !== filterProdi) {
      return false;
    }

    if (filterTopic !== 'ALL') {
      const tObj = sub.titles?.find(t => t.title === (sub.approvedTitle || sub.titles?.[0]?.title));
      if (tObj?.topic !== filterTopic) return false;
    }

    if (filterYear !== 'ALL') {
      if (!sub.submittedAt) return false;
      const d = new Date(sub.submittedAt);
      if (d.getFullYear().toString() !== filterYear) return false;
    }

    return true;
  });

  const uniqueYears = Array.from(new Set(
    submissions.map(sub => sub.submittedAt ? new Date(sub.submittedAt).getFullYear().toString() : '')
  )).filter(Boolean).sort((a, b) => parseInt(b) - parseInt(a));

  const uniqueTopics = Array.from(new Set(
    submissions.map(sub => {
      const tObj = sub.titles?.find(t => t.title === (sub.approvedTitle || sub.titles?.[0]?.title));
      return tObj?.topic;
    }).filter(Boolean) as string[]
  ));

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Prepare Analytics Data (Filtered)
  const topicCounts: Record<string, number> = {};
  filteredSubmissions.forEach(sub => {
    const tObj = sub.titles?.find(t => t.title === (sub.approvedTitle || sub.titles?.[0]?.title));
    const topic = tObj?.topic || 'Lainnya';
    topicCounts[topic] = (topicCounts[topic] || 0) + 1;
  });

  const chartData = Object.entries(topicCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const trendCounts: Record<string, number> = {};
  filteredSubmissions.forEach(sub => {
    // using submittedAt or fallback to some default if null
    if (sub.submittedAt) {
      const d = new Date(sub.submittedAt);
      const m = d.toLocaleString('id-ID', { month: 'short' });
      const monthYear = `${m} ${d.getFullYear()}`;
      trendCounts[monthYear] = (trendCounts[monthYear] || 0) + 1;
    }
  });

  const trendData = Object.entries(trendCounts).map(([month, count]) => {
    return { month, count, _raw: new Date(month).getTime() };
  }).sort((a, b) => a._raw - b._raw);

  const colors = ['#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              <BookOpen className="text-orange-600" /> Arsip Skripsi
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Daftar judul skripsi yang telah disetujui oleh dosen validator.
            </p>
          </div>

          <div className="w-full sm:w-80 relative group">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-orange-500 transition-colors" />
            <input
              type="text"
              placeholder="Cari NIM, nama, atau judul..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded py-2 pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 dark:text-zinc-200 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/30 rounded border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-500 mr-2">
              <Filter size={16} /> <span className="text-sm font-bold uppercase">Filter:</span>
            </div>
            <Select
              value={filterProdi}
              onChange={(val) => handleFilterChange(setFilterProdi, val)}
              options={[
                { value: 'ALL', label: 'Semua Prodi' },
                { value: 'PTIK', label: 'Pendidikan Teknik Informatika dan Komputer (PTIK)' },
                { value: 'TEKOM', label: 'Teknik Komputer (TEKOM)' }
              ]}
              className="w-full sm:w-64"
            />
            <Select
              value={filterTopic}
              onChange={(val) => handleFilterChange(setFilterTopic, val)}
              options={[
                { value: 'ALL', label: 'Semua Topik' },
                ...uniqueTopics.map(t => ({ value: t, label: t }))
              ]}
              className="w-full sm:w-48"
            />
            <Select
              value={filterYear}
              onChange={(val) => handleFilterChange(setFilterYear, val)}
              options={[
                { value: 'ALL', label: 'Semua Waktu' },
                ...uniqueYears.map(y => ({ value: y, label: `Tahun ${y}` }))
              ]}
              className="w-full sm:w-40"
            />
          </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'list'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <ListIcon size={16} /> Daftar Judul
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'analytics'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <PieChart size={16} /> Analitik
          </button>
        </div>

        {/* Content */}
        {loading || isFiltering ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-zinc-500">Memuat data...</p>
            </div>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded">
                <BookOpen size={28} className="text-zinc-400" />
              </div>
              <p className="text-sm font-medium text-zinc-500">
                Belum ada skripsi yang disetujui
              </p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'list' ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    {filteredSubmissions.length} Judul Telah Disetujui
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSubmissions.map((sub, idx) => (
                <div
                  key={sub.submissionId}
                  className="group relative bg-white dark:bg-zinc-950 rounded border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden flex flex-col h-full"
                  onClick={() => setSelectedSubmission(sub)}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-orange-50 dark:bg-orange-900/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-900 text-xs font-bold text-zinc-500">
                          {idx + 1}
                        </span>
                        {sub.studentProdi && (
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded dark:bg-blue-900/30 dark:text-blue-400">
                            {sub.studentProdi}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-50 dark:bg-zinc-900 px-2 py-1 rounded">
                        {sub.nim || '—'}
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 mb-2 leading-snug line-clamp-3">
                      {sub.approvedTitle || sub.titles?.[0]?.title}
                    </h3>

                    {(() => {
                      const tObj = sub.titles?.find(t => t.title === (sub.approvedTitle || sub.titles?.[0]?.title));
                      if (tObj?.topic) {
                        return (
                          <div className="mb-4 mt-1">
                            <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                              Topik: {tObj.topic}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-100 to-orange-100 dark:from-blue-900/50 dark:to-orange-900/50 flex items-center justify-center text-blue-600 dark:text-orange-400">
                        <User size={14} />
                      </div>
                      <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide truncate">
                        {sub.studentName}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </>
            ) : (
              <div className="space-y-6">
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
                    <PieChart className="text-orange-600" size={20} /> Distribusi Topik Skripsi
                  </h3>

                  {chartData.length > 0 ? (
                  <div className="h-80 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" opacity={0.2} />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: '#71717a' }}
                          tickLine={false}
                          axisLine={false}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 11, fill: '#71717a' }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          cursor={{ fill: '#f4f4f5', opacity: 0.1 }}
                          contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {chartData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-zinc-500 text-sm">
                    <PieChart size={32} className="text-zinc-300 dark:text-zinc-800 mb-3" />
                    Belum ada data analitik topik
                  </div>
                )}
                </div>

                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
                    <BookOpen className="text-orange-600" size={20} /> Tren Skripsi Disetujui
                  </h3>

                  {trendData.length > 0 ? (
                    <div className="h-80 w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" opacity={0.2} />
                          <XAxis
                            dataKey="month"
                            tick={{ fontSize: 11, fill: '#71717a' }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            allowDecimals={false}
                            tick={{ fontSize: 11, fill: '#71717a' }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                            cursor={{ stroke: '#f4f4f5', strokeWidth: 2 }}
                            contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Line type="monotone" dataKey="count" stroke="#ea580c" strokeWidth={3} dot={{ r: 4, fill: '#ea580c', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-zinc-500 text-sm">
                      <BookOpen size={32} className="text-zinc-300 dark:text-zinc-800 mb-3" />
                      Belum ada data tren
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>



      {/* Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white dark:bg-zinc-950 rounded border border-zinc-200 dark:border-zinc-800 shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Detail Skripsi
              </h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1.5 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <XCircle size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Student Info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded bg-gradient-to-br from-orange-100 to-violet-100 dark:from-orange-900/50 dark:to-violet-900/50 flex items-center justify-center text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-base font-bold text-zinc-900 dark:text-zinc-100 uppercase">
                    {selectedSubmission.studentName}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                    NIM: {selectedSubmission.nim || '—'}
                  </p>
                </div>
              </div>

              {/* Approved Title */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Judul Skripsi
                </h4>
                <div className="p-4 rounded bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20">
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 leading-relaxed">
                    {selectedSubmission.approvedTitle || selectedSubmission.titles?.[0]?.title}
                  </p>
                  {(() => {
                    const tObj = selectedSubmission.titles?.find(t => t.title === (selectedSubmission.approvedTitle || selectedSubmission.titles?.[0]?.title));
                    if (tObj?.topic) {
                      return (
                        <div className="mt-3">
                          <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                            Topik: {tObj.topic}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>

              {/* Pembimbing */}
              {(selectedSubmission.pembimbing1 || selectedSubmission.pembimbing2) && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                    Dosen Pembimbing
                  </h4>
                  <div className="space-y-2">
                    {selectedSubmission.pembimbing1 && (
                      <div className="flex items-center gap-3 p-3 rounded bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                        <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded bg-orange-100 dark:bg-orange-900/50 text-[10px] font-bold text-orange-600 dark:text-orange-400">
                          P1
                        </span>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300">
                          {selectedSubmission.pembimbing1}
                        </p>
                      </div>
                    )}
                    {selectedSubmission.pembimbing2 && (
                      <div className="flex items-center gap-3 p-3 rounded bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                        <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded bg-orange-100 dark:bg-orange-900/50 text-[10px] font-bold text-orange-600 dark:text-orange-400">
                          P2
                        </span>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300">
                          {selectedSubmission.pembimbing2}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Penguji */}
              {(selectedSubmission.penguji1 || selectedSubmission.penguji2) && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                    Dosen Penguji
                  </h4>
                  <div className="space-y-2">
                    {selectedSubmission.penguji1 && (
                      <div className="flex items-center gap-3 p-3 rounded bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                        <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded bg-violet-100 dark:bg-violet-900/50 text-[10px] font-bold text-violet-600 dark:text-violet-400">
                          U1
                        </span>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300">
                          {selectedSubmission.penguji1}
                        </p>
                      </div>
                    )}
                    {selectedSubmission.penguji2 && (
                      <div className="flex items-center gap-3 p-3 rounded bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                        <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded bg-violet-100 dark:bg-violet-900/50 text-[10px] font-bold text-violet-600 dark:text-violet-400">
                          U2
                        </span>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300">
                          {selectedSubmission.penguji2}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tanggal Penetapan */}
              {selectedSubmission.tanggalPenetapan && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                    Tanggal Penetapan
                  </h4>
                  <div className="flex items-center gap-2 p-3 rounded bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                    <Calendar size={14} className="text-zinc-400" />
                    <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      {formatDate(selectedSubmission.tanggalPenetapan)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="w-full py-2.5 text-sm font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
