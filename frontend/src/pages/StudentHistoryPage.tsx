import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Submission, SubmissionStatus } from '../types';
import { ModalDetailProposal } from '../components/ui/ModalDetailProposal';
import { SubmissionsTable, getStatusBadge } from '../components/ui/SubmissionsTable';
import { Clock, CheckCircle, XCircle, Download, Eye, History, X } from 'lucide-react';
import { StudentIdentityCard } from '../components/ui/StudentIdentityCard';

export const StudentHistoryPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState<Submission | null>(null);
  const [previewingSubmission, setPreviewingSubmission] = useState<Submission | null>(null);

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


  return (
    <>
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

          <SubmissionsTable
            submissions={submissions}
            loading={loading}
            onPreview={setPreviewingSubmission}
            renderActions={(sub) => (
              <>
                {sub.status.toUpperCase() === 'APPROVED' && (
                  <button
                    onClick={() => api.downloadLetter(sub.submissionId)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1.5 rounded text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                  >
                    <Download size={14} /> Surat
                  </button>
                )}
                {sub.status.toUpperCase() === 'REJECTED' && (
                  <button
                    onClick={() => setShowFeedbackModal(sub)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1.5 rounded text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                  >
                    <Eye size={14} /> Feedback
                  </button>
                )}
              </>
            )}
          />
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

      {/* PREVIEW SUBMISSION MODAL */}
      {previewingSubmission && (
        <ModalDetailProposal
          submission={previewingSubmission}
          onClose={() => setPreviewingSubmission(null)}
          statusBadge={getStatusBadge(previewingSubmission.status)}
        />
      )}
    </>
  );
};
