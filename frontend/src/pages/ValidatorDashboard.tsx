import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { api } from '../services/api';
import type { Submission, SubmissionStatus } from '../types';
import { 
  FileCheck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  X,
  AlertCircle
} from 'lucide-react';

export const ValidatorDashboard: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  // Review Modal Form State
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [selectedTitleId, setSelectedTitleId] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.getValidatorSubmissions();
      if (res.success) {
        setSubmissions(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch validator submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openReviewModal = (sub: Submission) => {
    setSelectedSubmission(sub);
    setActionType('APPROVE');
    setSelectedTitleId(sub.titles[0]?.titleId || '');
    setRejectionReason('');
    setReviewError(null);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    setReviewError(null);

    if (actionType === 'APPROVE') {
      if (!selectedTitleId) {
        setReviewError('Please select exactly one proposed title to approve.');
        return;
      }

      setSubmitting(true);
      try {
        const res = await api.approveSubmission(selectedSubmission.submissionId, selectedTitleId);
        if (res.success) {
          setSelectedSubmission(null);
          await fetchData();
        } else {
          setReviewError(res.message || 'Approval failed.');
        }
      } catch (err: unknown) {
        if (err instanceof Error) setReviewError(err.message);
        else setReviewError('Failed to approve submission.');
      } finally {
        setSubmitting(false);
      }
    } else {
      // REJECT path validation
      if (!rejectionReason || rejectionReason.trim().length < 10) {
        setReviewError('Mandatory rejection feedback must be at least 10 characters long.');
        return;
      }

      setSubmitting(true);
      try {
        const res = await api.rejectSubmission(selectedSubmission.submissionId, rejectionReason.trim());
        if (res.success) {
          setSelectedSubmission(null);
          await fetchData();
        } else {
          setReviewError(res.message || 'Rejection failed.');
        }
      } catch (err: unknown) {
        if (err instanceof Error) setReviewError(err.message);
        else setReviewError('Failed to reject submission.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const getStatusBadge = (status: SubmissionStatus) => {
    const s = status.toUpperCase();
    if (s === 'PENDING_VALIDATOR_REVIEW') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
          <Clock size={14} /> Pending Review
        </span>
      );
    }
    if (s === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
          <CheckCircle size={14} /> Approved
        </span>
      );
    }
    if (s === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
          <XCircle size={14} /> Rejected
        </span>
      );
    }
    return <span className="text-xs font-semibold">{status}</span>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <FileCheck className="text-emerald-600" size={28} />
            Validator Review Queue
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Review assigned thesis title proposals, approve single title, or reject with feedback.
          </p>
        </div>

        {/* Assigned Submissions Table */}
        <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-5 border-b border-zinc-200 dark:border-zinc-800">
            <h3 className="font-semibold text-base text-zinc-900 dark:text-white">
              Assigned Submissions ({submissions.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-3.5 font-medium">Submission ID</th>
                  <th className="px-6 py-3.5 font-medium">Student Name</th>
                  <th className="px-6 py-3.5 font-medium">Titles Count</th>
                  <th className="px-6 py-3.5 font-medium">Assigned Date</th>
                  <th className="px-6 py-3.5 font-medium">Status</th>
                  <th className="px-6 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-400 text-xs">
                      Loading assigned review queue...
                    </td>
                  </tr>
                ) : submissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-400 text-xs">
                      No submissions currently assigned for review.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <tr key={sub.submissionId} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-zinc-500">{sub.submissionId}</td>
                      <td className="px-6 py-4 font-medium text-xs text-zinc-900 dark:text-zinc-100">
                        {sub.studentName || 'Student'}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold">
                        {sub.titles ? `${sub.titles.length} proposed` : `${sub.titleCount || 1} proposed`}
                      </td>
                      <td className="px-6 py-4 text-xs whitespace-nowrap">
                        {sub.assignedAt ? new Date(sub.assignedAt).toLocaleDateString() : 'Recent'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(sub.status)}</td>
                      <td className="px-6 py-4 text-right">
                        {sub.status.toUpperCase() === 'PENDING_VALIDATOR_REVIEW' ? (
                          <button
                            onClick={() => openReviewModal(sub)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-colors"
                          >
                            <FileText size={14} /> Review Submission
                          </button>
                        ) : (
                          <button
                            onClick={() => openReviewModal(sub)}
                            className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline font-medium"
                          >
                            View Decision
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* REVIEW SUBMISSION MODAL */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <FileCheck size={20} className="text-emerald-600" />
                  Review Thesis Proposal
                </h2>
                <p className="text-xs text-zinc-400 font-mono">ID: {selectedSubmission.submissionId}</p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Student Info */}
            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-xs flex justify-between items-center">
              <div>
                <span className="text-zinc-400">Student:</span>{' '}
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{selectedSubmission.studentName}</span>{' '}
                ({selectedSubmission.studentEmail})
              </div>
              <div>{getStatusBadge(selectedSubmission.status)}</div>
            </div>

            {reviewError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{reviewError}</span>
              </div>
            )}

            {/* If decision already made */}
            {selectedSubmission.status.toUpperCase() !== 'PENDING_VALIDATOR_REVIEW' ? (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Decision Details</h3>
                {selectedSubmission.status.toUpperCase() === 'APPROVED' ? (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Approved Title:</span>
                    <p className="text-zinc-900 dark:text-zinc-100 font-semibold">{selectedSubmission.approvedTitle}</p>
                  </div>
                ) : (
                  <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-rose-700 dark:text-rose-400">Rejection Reason:</span>
                    <p className="text-zinc-900 dark:text-zinc-100 font-sans">{selectedSubmission.rejectionReason}</p>
                  </div>
                )}
                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 text-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* Review Form */
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {/* Decision Toggle */}
                <div className="flex items-center gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActionType('APPROVE')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      actionType === 'APPROVE'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    ✓ Approve Submission
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType('REJECT')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      actionType === 'REJECT'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    ✕ Reject Submission
                  </button>
                </div>

                {/* APPROVE MODE: Radio button selection for EXACTLY ONE title */}
                {actionType === 'APPROVE' && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Select EXACTLY ONE title to approve (Required)
                    </label>
                    <div className="space-y-2">
                      {selectedSubmission.titles.map((t, idx) => (
                        <label
                          key={t.titleId || idx}
                          className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                            selectedTitleId === t.titleId
                              ? 'bg-emerald-50/70 dark:bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20'
                              : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                          }`}
                        >
                          <input
                            type="radio"
                            name="approvedTitleId"
                            value={t.titleId}
                            checked={selectedTitleId === t.titleId}
                            onChange={() => setSelectedTitleId(t.titleId)}
                            className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div className="text-xs">
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                              Title #{idx + 1}: {t.title}
                            </span>
                            {t.description && (
                              <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                                {t.description}
                              </p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* REJECT MODE: Mandatory textarea for rejection feedback */}
                {actionType === 'REJECT' && (
                  <div className="space-y-3">
                    {/* Display proposed titles list for reference */}
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl space-y-2 text-xs">
                      <span className="font-bold text-zinc-400 uppercase tracking-wider">Submitted Titles:</span>
                      {selectedSubmission.titles.map((t, i) => (
                        <div key={i} className="text-zinc-700 dark:text-zinc-300">
                          {i + 1}. {t.title}
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1">
                        Mandatory Rejection Reason / Feedback (Min 10 characters)
                      </label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Provide detailed, actionable feedback explaining why the submission was rejected and how the student should refine their thesis proposal..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-rose-300 dark:border-rose-500/30 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                      />
                      <div className="text-[11px] text-zinc-400 text-right mt-1">
                        {rejectionReason.length} characters (min 10 required)
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal Footer Actions */}
                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSubmission(null)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition-colors disabled:opacity-50 ${
                      actionType === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    {submitting
                      ? 'Processing...'
                      : actionType === 'APPROVE'
                      ? 'Confirm Approval & Generate Letter'
                      : 'Confirm Rejection'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
