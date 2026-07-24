import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { api } from '../services/api';
import type { Submission } from '../types';
import {
  GraduationCap,
  CheckCircle,
  Search,
  User,
  Calendar,
  BookOpen,
  XCircle,
  LogIn,
  LayoutDashboard
} from 'lucide-react';

export const SubmissionListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

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
    if (searchQuery === '') return true;
    const q = searchQuery.toLowerCase();
    return (
      sub.studentName?.toLowerCase().includes(q) ||
      sub.nim?.toLowerCase().includes(q) ||
      sub.titles?.some((t) => t.title?.toLowerCase().includes(q))
    );
  });

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-4">
            <CheckCircle size={12} />
            Skripsi yang Telah Disetujui
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 mb-3">
            Daftar Pengajuan Judul Skripsi
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            Berikut adalah daftar judul skripsi yang telah disetujui oleh dosen validator.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan NIM, nama, atau judul..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white focus:border-zinc-900 dark:focus:border-white dark:text-zinc-200 shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-zinc-500">Memuat data...</p>
            </div>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
                <BookOpen size={28} className="text-zinc-400" />
              </div>
              <p className="text-sm font-medium text-zinc-500">
                Belum ada skripsi yang disetujui
              </p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-4 text-center">
              Menampilkan {filteredSubmissions.length} judul skripsi
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSubmissions.map((sub, idx) => (
                <div
                  key={sub.submissionId}
                  className="group relative bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden flex flex-col h-full"
                  onClick={() => setSelectedSubmission(sub)}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-orange-50 dark:bg-orange-900/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 text-xs font-bold text-zinc-500">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-50 dark:bg-zinc-900 px-2 py-1 rounded-md">
                        {sub.nim || '—'}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 mb-2 leading-snug line-clamp-3">
                      {sub.approvedTitle || sub.titles?.[0]?.title}
                    </h3>
                    
                    <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-orange-100 dark:from-blue-900/50 dark:to-orange-900/50 flex items-center justify-center text-blue-600 dark:text-orange-400">
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
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
          © {new Date().getFullYear()} SkripsiHub — Sistem Manajemen Pengajuan Judul Skripsi
        </div>
      </footer>

      {/* Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Detail Skripsi
              </h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <XCircle size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Student Info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-violet-100 dark:from-orange-900/50 dark:to-violet-900/50 flex items-center justify-center text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
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
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20">
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 leading-relaxed">
                    {selectedSubmission.approvedTitle || selectedSubmission.titles?.[0]?.title}
                  </p>
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
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                        <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/50 text-[10px] font-bold text-orange-600 dark:text-orange-400">
                          P1
                        </span>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300">
                          {selectedSubmission.pembimbing1}
                        </p>
                      </div>
                    )}
                    {selectedSubmission.pembimbing2 && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                        <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/50 text-[10px] font-bold text-orange-600 dark:text-orange-400">
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
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                        <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/50 text-[10px] font-bold text-violet-600 dark:text-violet-400">
                          U1
                        </span>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300">
                          {selectedSubmission.penguji1}
                        </p>
                      </div>
                    )}
                    {selectedSubmission.penguji2 && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                        <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/50 text-[10px] font-bold text-violet-600 dark:text-violet-400">
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
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
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
                className="w-full py-2.5 text-sm font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
};
