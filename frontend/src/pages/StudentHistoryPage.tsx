import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { api } from '../services/api';
import type { Submission, SubmissionStatus } from '../types';
import { Clock, CheckCircle, XCircle, Download, Eye, History } from 'lucide-react';

export const StudentHistoryPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState<Submission | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.getStudentSubmissions();
      if (res.success) {
        setSubmissions(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load student history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusBadge = (status: SubmissionStatus) => {
    const s = status.toUpperCase();
    if (s === 'PENDING_ADMIN_REVIEW') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
          <Clock size={14} /> Pending Admin Review
        </span>
      );
    }
    if (s === 'PENDING_VALIDATOR_REVIEW') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
          <Clock size={14} /> Pending Validator Review
        </span>
      );
    }
    if (s === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
          <CheckCircle size={14} /> Approved
        </span>
      );
    }
    if (s === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
          <XCircle size={14} /> Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
        {status}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              <History className="text-orange-600" /> Riwayat Pengajuan
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Semua daftar pengajuan judul skripsi yang pernah Anda buat.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 rounded shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-zinc-500 text-sm">
              Memuat riwayat pengajuan...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-medium">Submission ID</th>
                    <th className="px-6 py-4 font-medium">Tanggal</th>
                    <th className="px-6 py-4 font-medium">Daftar Judul (Batch)</th>
                    <th className="px-6 py-4 font-medium">Topik</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-zinc-400 text-sm">
                        Belum ada riwayat pengajuan skripsi.
                      </td>
                    </tr>
                  ) : (
                    submissions.map((sub) => (
                      <tr key={sub.submissionId} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors border-b border-zinc-100 dark:border-zinc-800/50 last:border-0">
                        <td className="px-6 py-4 font-mono text-xs text-zinc-500 align-top">{sub.submissionId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-zinc-600 dark:text-zinc-400 align-top">
                          {new Date(sub.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-medium text-sm text-zinc-900 dark:text-zinc-100 max-w-sm align-top">
                          {sub.titles && sub.titles.length > 0 ? (
                            <ul className="flex flex-col gap-4">
                              {sub.titles.map((t, i) => (
                                <li key={i} className="flex gap-2 text-xs leading-relaxed min-h-[2.5rem]">
                                  <span className="text-zinc-400 shrink-0">{i + 1}.</span>
                                  <div className="flex flex-col">
                                    <span className={`${sub.approvedTitle === t.title ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-zinc-700 dark:text-zinc-300'} line-clamp-2`}>
                                      {t.title}
                                    </span>
                                    {sub.approvedTitle === t.title && (
                                      <span className="mt-1 inline-flex items-center text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded dark:bg-emerald-500/20 dark:text-emerald-400 w-max">
                                        Disetujui
                                      </span>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="truncate">{sub.approvedTitle || 'Untitled Proposal'}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 align-top">
                          {sub.titles && sub.titles.length > 0 ? (
                            <ul className="flex flex-col gap-4">
                              {sub.titles.map((t, i) => (
                                <li key={i} className="text-[10px] font-bold text-zinc-500 uppercase min-h-[2.5rem] pt-0.5">
                                  {t.topic || '—'}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-zinc-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-top">{getStatusBadge(sub.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-3 align-top">
                          {sub.status.toUpperCase() === 'APPROVED' && (
                            <button
                              onClick={() => api.downloadLetter(sub.submissionId)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors"
                            >
                              <Download size={14} /> Surat
                            </button>
                          )}
                          {sub.status.toUpperCase() === 'REJECTED' && (
                            <button
                              onClick={() => setShowFeedbackModal(sub)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 transition-colors"
                            >
                              <Eye size={14} /> Feedback
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* VIEW REJECTION FEEDBACK MODAL */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 rounded max-w-lg w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <XCircle size={20} />
                Validator Rejection Feedback
              </h2>
              <button
                onClick={() => setShowFeedbackModal(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs text-zinc-500">
                Submission ID: <span className="font-mono text-zinc-700 dark:text-zinc-300">{showFeedbackModal.submissionId}</span>
              </div>

              <div className="p-4 bg-rose-50/50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded space-y-2">
                <h4 className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
                  Feedback from {showFeedbackModal.rejectedByName || 'Validator'}
                </h4>
                <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans whitespace-pre-wrap">
                  {showFeedbackModal.rejectionReason || 'No detailed reason provided.'}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setShowFeedbackModal(null)}
                className="px-4 py-2 rounded text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
