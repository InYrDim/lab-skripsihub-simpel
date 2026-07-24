import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { api } from '../services/api';
import type { Submission, SubmissionStatus, Topic } from '../types';
import {
  FilePlus,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Eye,
  Plus,
  Trash2,
  X,
  FileText,
  Info
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState<Submission | null>(null);
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);

  // Submission Form state (1 to 3 titles)
  const [titles, setTitles] = useState<Array<{ title: string; topic: string; description: string }>>([
    { title: '', topic: '', description: '' },
  ]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [currentRes, topicsRes] = await Promise.all([
        api.getCurrentSubmission(),
        api.getTopics()
      ]);
      
      if (currentRes.success) {
        setCurrentSubmission(currentRes.data);
      }
      if (topicsRes.success) {
        setAvailableTopics(topicsRes.data);
      }
    } catch (err) {
      console.error('Failed to load student dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isStatusActive = (status?: SubmissionStatus): boolean => {
    if (!status) return false;
    const s = status.toUpperCase();
    return ['DRAFT', 'PENDING_ADMIN_REVIEW', 'PENDING_VALIDATOR_REVIEW'].includes(s);
  };

  const hasActiveSubmission = isStatusActive(currentSubmission?.status);

  const handleAddTitle = () => {
    if (titles.length < 3) {
      setTitles([...titles, { title: '', topic: '', description: '' }]);
    }
  };

  const handleRemoveTitle = (index: number) => {
    if (titles.length > 1) {
      setTitles(titles.filter((_, i) => i !== index));
    }
  };

  const handleTitleChange = (index: number, field: 'title' | 'topic' | 'description', value: string) => {
    const updated = [...titles];
    updated[index][field] = value;
    setTitles(updated);
  };

  const handleCreateSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    const filledTitles = titles.filter(t => t.title.trim().length > 0);
    if (filledTitles.length === 0) {
      setFormError('Please enter at least 1 thesis title.');
      return;
    }

    for (let i = 0; i < filledTitles.length; i++) {
      if (filledTitles[i].title.trim().length < 10) {
        setFormError(`Title ${i + 1} must be at least 10 characters long.`);
        return;
      }
    }

    // Check title uniqueness
    const titleStrings = filledTitles.map(t => t.title.trim().toLowerCase());
    const uniqueStrings = new Set(titleStrings);
    if (uniqueStrings.size !== titleStrings.length) {
      setFormError('All proposed titles within a submission must be distinct.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createSubmission({ titles: filledTitles });
      if (res.success) {
        setShowCreateModal(false);
        setTitles([{ title: '', topic: '', description: '' }]);
        await fetchData();
      } else {
        setFormError(res.message || 'Failed to submit thesis titles.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('An unexpected error occurred.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: SubmissionStatus) => {
    const s = status.toUpperCase();
    if (s === 'PENDING_ADMIN_REVIEW') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
          <Clock size={14} /> Pending Admin Review
        </span>
      );
    }
    if (s === 'PENDING_VALIDATOR_REVIEW') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
          <Clock size={14} /> Pending Validator Review
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
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
        {status}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Student Dashboard
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Submit and manage your bachelor thesis title proposals.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            disabled={hasActiveSubmission}
            title={hasActiveSubmission ? 'Active submission under review' : 'Submit New Thesis Title'}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded font-semibold text-sm transition-all ${
              hasActiveSubmission
                ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-700 text-white shadow-md'
            }`}
          >
            <FilePlus size={18} />
            Create New Submission
          </button>
        </div>

        {/* UI Blocking Prominent Warning Banner if active submission exists */}
        {hasActiveSubmission && (
          <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border-l-4 border-amber-500 rounded-r text-amber-800 dark:text-amber-300 flex items-start gap-3 shadow-sm">
            <AlertTriangle size={22} className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">Active Submission Under Review</h3>
              <p className="text-xs mt-1 text-amber-700 dark:text-amber-400/90 leading-relaxed">
                You currently have an active thesis submission in progress ({currentSubmission?.status?.replaceAll('_', ' ') || 'UNDER REVIEW'}).
                You are blocked from creating a new submission until a final decision (Approved or Rejected) is reached by the academic validator.
              </p>
            </div>
          </div>
        )}

        {/* Active Submission Card */}
        {loading ? (
          <div className="p-5 text-center text-zinc-500 bg-white dark:bg-zinc-950 rounded border border-zinc-200 dark:border-zinc-800">
            Loading submission status...
          </div>
        ) : currentSubmission ? (
          <div className="bg-white dark:bg-zinc-950 rounded p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <span className="text-xs font-mono text-zinc-400">ID: {currentSubmission.submissionId}</span>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white mt-0.5">
                  Current Thesis Proposal
                </h2>
              </div>
              <div>{getStatusBadge(currentSubmission.status)}</div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Proposed Titles ({currentSubmission.titles.length})
              </h3>
              <div className="grid gap-3">
                {currentSubmission.titles.map((t, idx) => (
                  <div
                    key={t.titleId || idx}
                    className={`p-4 rounded border transition-all ${
                      t.title === currentSubmission.approvedTitle
                        ? 'bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30'
                        : 'bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                        {idx + 1}. {t.title}
                      </h4>
                      {t.title === currentSubmission.approvedTitle && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-600 text-white">
                          APPROVED TITLE
                        </span>
                      )}
                    </div>
                    {t.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        {t.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Status specific actions */}
            {currentSubmission.status.toUpperCase() === 'APPROVED' && (
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="text-xs text-zinc-500">
                  Approved by <span className="font-medium text-zinc-700 dark:text-zinc-300">{currentSubmission.approvedByName || 'Validator'}</span>
                </div>
                <button
                  onClick={() => api.downloadLetter(currentSubmission.submissionId)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  <Download size={16} /> Download Approval Letter (PDF)
                </button>
              </div>
            )}

            {currentSubmission.status.toUpperCase() === 'REJECTED' && (
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                  Proposal Rejected by Validator
                </div>
                <button
                  onClick={() => setShowFeedbackModal(currentSubmission)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-semibold transition-colors"
                >
                  <Eye size={16} /> View Rejection Feedback
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-950 rounded p-6 border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
            <FileText size={40} className="mx-auto text-zinc-400" />
            <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
              No Active Thesis Proposal
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
              You do not have any thesis proposal currently under review. Click below to submit up to 3 proposed thesis titles.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-orange-600 text-white text-xs font-semibold hover:bg-orange-700 transition-colors"
            >
              <Plus size={16} /> Submit Proposal
            </button>
          </div>
        )}
      </div>

      {/* CREATE SUBMISSION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 rounded max-w-xl w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <FilePlus className="text-orange-600" size={20} />
                Submit Thesis Titles Proposal
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmission} className="space-y-4">
              <div className="p-3 bg-orange-50/50 dark:bg-orange-500/10 rounded text-xs text-orange-700 dark:text-orange-300 flex items-start gap-2">
                <Info size={16} className="shrink-0 mt-0.5" />
                <span>
                  You may propose 1 to 3 distinct thesis titles. Provide clear titles (min 10 characters) and optional short descriptions for academic review.
                </span>
              </div>

              {titles.map((t, idx) => (
                <div key={idx} className="p-4 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Proposed Title #{idx + 1}
                    </label>
                    {titles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTitle(idx)}
                        className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      required
                      placeholder={`e.g., Machine Learning for Academic Progress Tracking`}
                      value={t.title}
                      onChange={(e) => handleTitleChange(idx, 'title', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white focus:border-zinc-900 dark:focus:border-white"
                    />
                  </div>

                  <div>
                    <select
                      required
                      value={t.topic}
                      onChange={(e) => handleTitleChange(idx, 'topic', e.target.value)}
                      className={`w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white focus:border-zinc-900 dark:focus:border-white ${
                        t.topic === '' ? 'text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'
                      }`}
                    >
                      <option value="" disabled>Pilih Topik Skripsi...</option>
                      {availableTopics.filter(topic => topic.isActive).map(topic => (
                        <option key={topic.id} value={topic.name}>
                          {topic.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <textarea
                      rows={2}
                      placeholder="Optional brief description or methodology outline..."
                      value={t.description}
                      onChange={(e) => handleTitleChange(idx, 'description', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white focus:border-zinc-900 dark:focus:border-white"
                    />
                  </div>
                </div>
              ))}

              {titles.length < 3 && (
                <button
                  type="button"
                  onClick={handleAddTitle}
                  className="w-full py-2.5 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:border-orange-500 hover:text-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Add Another Title ({titles.length}/3)
                </button>
              )}

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                <X size={20} />
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

              <p className="text-xs text-zinc-500">
                You are now eligible to prepare and submit a new set of thesis title proposals addressing the validator feedback.
              </p>
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
