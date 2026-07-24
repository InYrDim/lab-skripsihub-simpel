import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { api } from '../services/api';
import type { Submission, SubmissionStatus, Topic } from '../types';
import { Select } from '../components/ui/select';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  FilePlus,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Plus,
  X,
  FileText,
  Info,
  UploadCloud,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

const MAX_PROPOSAL_FILE_SIZE = 5 * 1024 * 1024;

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);
  const [lastSubmission, setLastSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState<Submission | null>(null);
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);

  // Submission Form state (exactly 3 titles)
  const [titles, setTitles] = useState<Array<{ title: string; topic: string; description: string }>>([
    { title: '', topic: '', description: '' },
    { title: '', topic: '', description: '' },
    { title: '', topic: '', description: '' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  
  // Multi-step state
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [proposalFile, setProposalFile] = useState<File | null>(null);
  const proposalPreviewUrl = useMemo(
    () => (proposalFile ? URL.createObjectURL(proposalFile) : null),
    [proposalFile],
  );

  useEffect(() => {
    return () => {
      if (proposalPreviewUrl) URL.revokeObjectURL(proposalPreviewUrl);
    };
  }, [proposalPreviewUrl]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [currentRes, historyRes, topicsRes] = await Promise.all([
        api.getCurrentSubmission(),
        api.getStudentSubmissions(),
        api.getTopics()
      ]);
      
      if (currentRes.success) {
        setCurrentSubmission(currentRes.data);
      }
      if (historyRes.success) {
        setLastSubmission(historyRes.data?.[0] || null);
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

  const resetForm = () => {
    setStep(1);
    setTitles([
      { title: '', topic: '', description: '' },
      { title: '', topic: '', description: '' },
      { title: '', topic: '', description: '' },
    ]);
    setProposalFile(null);
  };

  const handleTitleChange = (index: number, field: 'title' | 'topic' | 'description', value: string) => {
    const updated = [...titles];
    updated[index][field] = value;
    setTitles(updated);
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation exactly 3 titles, topics, and descriptions
    for (let i = 0; i < titles.length; i++) {
      if (titles[i].title.trim().length < 10) {
        showToast(`Usulan Judul #${i + 1} harus minimal 10 karakter.`, 'error');
        return;
      }
      if (!titles[i].topic.trim()) {
        showToast(`Topik Skripsi pada Usulan Judul #${i + 1} wajib dipilih.`, 'error');
        return;
      }
      if (titles[i].description.trim().length < 10) {
        showToast(`Deskripsi pada Usulan Judul #${i + 1} wajib diisi (minimal 10 karakter).`, 'error');
        return;
      }
    }

    // Check title uniqueness
    const titleStrings = titles.map(t => t.title.trim().toLowerCase());
    const uniqueStrings = new Set(titleStrings);
    if (uniqueStrings.size !== titleStrings.length) {
      showToast('Setiap usulan judul harus berbeda.', 'error');
      return;
    }

    setStep(2);
  };

  const handleFileStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalFile) {
      showToast('Mohon unggah dokumen proposal PDF Anda.', 'error');
      return;
    }
    if (proposalFile.type !== 'application/pdf') {
      showToast('Berkas pengajuan harus berformat PDF.', 'error');
      return;
    }

    setStep(3);
  };

  const handleSaveDraft = () => {
    localStorage.setItem(
      'thesis_submission_draft',
      JSON.stringify({ titles, savedAt: new Date().toISOString() }),
    );
    setShowCreateModal(false);
    setStep(1);
    setProposalFile(null);
    showToast(
      'Draf disimpan. Berkas PDF perlu dipilih ulang saat melanjutkan.',
      'success',
    );
  };

  const openSubmissionModal = () => {
    const savedDraft = localStorage.getItem('thesis_submission_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft) as { titles?: typeof titles };
        if (parsed.titles?.length === 3) setTitles(parsed.titles);
      } catch {
        localStorage.removeItem('thesis_submission_draft');
      }
    }
    setStep(1);
    setProposalFile(null);
    setShowCreateModal(true);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalFile) {
      showToast('Mohon unggah dokumen proposal PDF Anda.', 'error');
      setStep(2);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createSubmission({ titles }, proposalFile);

      if (res.success) {
        setShowCreateModal(false);
        resetForm();
        localStorage.removeItem('thesis_submission_draft');
        await fetchData();
        showToast('Berhasil mengajukan judul skripsi baru.', 'success');
      } else {
        showToast(res.message || 'Gagal mengajukan judul skripsi.', 'error');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, 'error');
      } else {
        showToast('Terjadi kesalahan yang tidak terduga.', 'error');
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
          <Clock size={14} /> Menunggu Tinjauan Admin
        </span>
      );
    }
    if (s === 'PENDING_VALIDATOR_REVIEW') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
          <Clock size={14} /> Menunggu Tinjauan Validator
        </span>
      );
    }
    if (s === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
          <CheckCircle size={14} /> Disetujui
        </span>
      );
    }
    if (s === 'REJECTED' || s === 'REJECTED_BY_ADMIN' || s === 'REJECTED_BY_VALIDATOR') {
      const label = s === 'REJECTED_BY_ADMIN' ? 'Ditolak oleh Admin' : s === 'REJECTED_BY_VALIDATOR' ? 'Ditolak oleh Validator' : 'Ditolak';
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
          <XCircle size={14} /> {label}
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
              Dasbor Mahasiswa
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Ajukan dan kelola usulan judul skripsi Anda.
            </p>
          </div>

          <button
            onClick={openSubmissionModal}
            disabled={loading || hasActiveSubmission || !user?.dosenPA || !user?.dosenPANip}
            title={loading ? 'Memuat status...' : hasActiveSubmission ? 'Pengajuan aktif sedang ditinjau' : (!user?.dosenPA || !user?.dosenPANip) ? 'Mohon atur Dosen PA Anda terlebih dahulu' : 'Ajukan Judul Skripsi Baru'}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded font-semibold text-sm transition-all ${
              (loading || hasActiveSubmission || !user?.dosenPA || !user?.dosenPANip)
                ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-700 text-white shadow-md'
            }`}
          >
            <FilePlus size={18} />
            Buat Pengajuan Baru
          </button>
        </div>

        {/* Missing Dosen PA Warning */}
        {(!user?.dosenPA || !user?.dosenPANip) && (
          <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border-l-4 border-rose-500 rounded-r text-rose-800 dark:text-rose-300 flex items-start gap-3 shadow-sm">
            <AlertTriangle size={22} className="shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">Data Dosen Penasehat Akademik Belum Lengkap</h3>
              <p className="text-xs mt-1 text-rose-700 dark:text-rose-400/90 leading-relaxed">
                Anda tidak dapat membuat pengajuan skripsi baru sebelum melengkapi data Nama dan NIP Dosen Penasehat Akademik (PA).
                Silakan buka menu <strong>Profil</strong> di sidebar kiri untuk mengatur Dosen PA Anda.
              </p>
            </div>
          </div>
        )}

        {/* UI Blocking Prominent Warning Banner if active submission exists */}
        {hasActiveSubmission && (
          <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border-l-4 border-amber-500 rounded-r text-amber-800 dark:text-amber-300 flex items-start gap-3 shadow-sm">
            <AlertTriangle size={22} className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">Pengajuan Aktif Sedang Ditinjau</h3>
              <p className="text-xs mt-1 text-amber-700 dark:text-amber-400/90 leading-relaxed">
                Anda saat ini memiliki pengajuan skripsi yang sedang diproses ({currentSubmission?.status?.replaceAll('_', ' ') || 'SEDANG DITINJAU'}).
                Anda tidak dapat membuat pengajuan baru hingga keputusan akhir (Disetujui atau Ditolak) diberikan oleh validator akademik.
              </p>
            </div>
          </div>
        )}

        {/* Latest Submission Summary */}
        <section className="overflow-hidden rounded border border-zinc-300 bg-linear-to-br from-white via-zinc-50 to-zinc-100 shadow-sm dark:border-zinc-700 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-900">
          <div className="flex flex-col justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                <FileText size={16} />
              </span>
              <div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Pengajuan Terakhir</h2>
                <p className="text-[11px] text-zinc-500">Ringkasan pengajuan terbaru Anda</p>
              </div>
            </div>
            {lastSubmission && getStatusBadge(lastSubmission.status)}
          </div>

          {loading ? (
            <div className="px-4 py-5 text-xs text-zinc-500">Memuat pengajuan terakhir...</div>
          ) : lastSubmission ? (
            <div className="grid gap-4 px-4 py-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
              <dl className="space-y-3 text-xs">
                <div>
                  <dt className="text-zinc-500">ID Pengajuan</dt>
                  <dd className="mt-0.5 font-mono font-semibold text-zinc-900 dark:text-zinc-100" title={lastSubmission.submissionId}>
                    {lastSubmission.submissionId.slice(0, 8)}...
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Tanggal Pengajuan</dt>
                  <dd className="mt-0.5 font-semibold text-zinc-900 dark:text-zinc-100">
                    {lastSubmission.submittedAt
                      ? new Date(lastSubmission.submittedAt).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '-'}
                  </dd>
                </div>
              </dl>
              <div>
                <h3 className="text-xs font-semibold text-zinc-500">Judul yang Diajukan</h3>
                <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-xs text-zinc-700 dark:text-zinc-300">
                  {lastSubmission.titles.map((title, index) => (
                    <li key={title.titleId || index} className="pl-1 leading-relaxed">
                      {title.title}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ) : (
            <div className="px-4 py-5 text-xs text-zinc-500">
              Belum ada pengajuan skripsi. Pengajuan terbaru akan tampil di sini.
            </div>
          )}
        </section>

        {/* Active Submission Card */}
        {loading ? (
          <div className="p-5 text-center text-zinc-500 bg-white dark:bg-zinc-950 rounded border border-zinc-200 dark:border-zinc-800">
            Memuat status pengajuan...
          </div>
        ) : currentSubmission ? (
          <div className="bg-white dark:bg-zinc-950 rounded p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <span className="text-xs font-mono text-zinc-400">ID: {currentSubmission.submissionId}</span>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white mt-0.5">
                  Usulan Skripsi Saat Ini
                </h2>
              </div>
              <div>{getStatusBadge(currentSubmission.status)}</div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Judul yang Diajukan ({currentSubmission.titles.length})
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
                          JUDUL DISETUJUI
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
                  Disetujui oleh <span className="font-medium text-zinc-700 dark:text-zinc-300">{currentSubmission.approvedByName || 'Validator'}</span>
                </div>
                <button
                  onClick={() => api.downloadLetter(currentSubmission.submissionId)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  <Download size={16} /> Unduh Surat Persetujuan (PDF)
                </button>
              </div>
            )}

            {currentSubmission.status.toUpperCase().includes('REJECTED') && (
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                    Proposal Ditolak oleh {currentSubmission.rejectedByName || 'Admin/Validator'}
                  </div>
                  <button
                    onClick={openSubmissionModal}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shadow-sm"
                  >
                    <FilePlus size={14} /> Buat Pengajuan Baru
                  </button>
                </div>

                {currentSubmission.rejectionReason ? (
                  <div className="p-4 bg-rose-50/50 dark:bg-rose-500/10 rounded border border-rose-100 dark:border-rose-500/20">
                    <h4 className="text-xs font-bold text-rose-800 dark:text-rose-300 mb-1.5 flex items-center gap-1.5">
                      <AlertTriangle size={14} /> Catatan Penolakan:
                    </h4>
                    <p className="text-sm text-rose-700 dark:text-rose-400/90 whitespace-pre-wrap leading-relaxed">
                      {currentSubmission.rejectionReason}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-rose-50/50 dark:bg-rose-500/10 rounded border border-rose-100 dark:border-rose-500/20 text-sm text-rose-700 dark:text-rose-400">
                    <p>Tidak ada catatan penolakan yang dilampirkan.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-950 rounded p-6 border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
            <FileText size={40} className="mx-auto text-zinc-400" />
            <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
              Tidak Ada Usulan Skripsi Aktif
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
              Anda tidak memiliki usulan skripsi yang sedang ditinjau. Klik di bawah untuk mengajukan hingga 3 usulan judul skripsi.
            </p>
            <button
              onClick={openSubmissionModal}
              disabled={!user?.dosenPA || !user?.dosenPANip}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold transition-colors ${
                (!user?.dosenPA || !user?.dosenPANip)
                  ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              <Plus size={16} /> Ajukan Proposal
            </button>
          </div>
        )}
      </div>

      {/* CREATE SUBMISSION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in">
          <div className="flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <FilePlus className="text-orange-600" size={20} />
                  Ajukan Usulan Judul Skripsi
                </h2>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Lengkapi setiap tahap untuk mengirim pengajuan.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-5 overflow-hidden sm:grid-cols-[11rem_minmax(0,1fr)] sm:grid-rows-1">
              <aside className="shrink-0 overflow-hidden border-b border-zinc-200 pb-4 dark:border-zinc-800 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-5">
                <ol className="relative space-y-0" aria-label="Tahapan pengajuan judul skripsi">
                  <li className="relative flex gap-3 pb-8">
                    <span
                      className={`absolute left-3.75 top-8 h-[calc(100%-2rem)] w-px ${
                        step > 1
                          ? 'bg-orange-500'
                          : 'bg-zinc-200 dark:bg-zinc-700'
                      }`}
                      aria-hidden="true"
                    />
                    <span
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                        step === 1
                          ? 'border-orange-600 bg-orange-600 text-white shadow-sm shadow-orange-200 dark:shadow-orange-950'
                          : 'border-orange-500 bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400'
                      }`}
                    >
                      {step > 1 ? <CheckCircle size={16} /> : '1'}
                    </span>
                    <div className="pt-0.5">
                      <p className={`text-xs font-semibold ${step === 1 ? 'text-orange-600 dark:text-orange-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                        Data Akademik
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                        Isi tiga usulan judul dan topik.
                      </p>
                    </div>
                  </li>
                  <li className="relative flex gap-3 pb-8">
                    <span
                      className={`absolute left-3.75 top-8 h-[calc(100%-2rem)] w-px ${
                        step === 3
                          ? 'bg-orange-500'
                          : 'bg-zinc-200 dark:bg-zinc-700'
                      }`}
                      aria-hidden="true"
                    />
                    <span
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                        step === 2
                          ? 'border-orange-600 bg-orange-600 text-white shadow-sm shadow-orange-200 dark:shadow-orange-950'
                          : step === 3
                            ? 'border-orange-500 bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400'
                            : 'border-zinc-200 bg-white text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900'
                      }`}
                    >
                      {step === 3 ? <CheckCircle size={16} /> : '2'}
                    </span>
                    <div className="pt-0.5">
                      <p className={`text-xs font-semibold ${step === 2 ? 'text-orange-600 dark:text-orange-400' : step === 3 ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}>
                        Unggah Berkas
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                        Unduh template dan unggah proposal.
                      </p>
                    </div>
                  </li>
                  <li className="relative flex gap-3">
                    <span
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                        step === 3
                          ? 'border-orange-600 bg-orange-600 text-white shadow-sm shadow-orange-200 dark:shadow-orange-950'
                          : 'border-zinc-200 bg-white text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900'
                      }`}
                    >
                      3
                    </span>
                    <div className="pt-0.5">
                      <p className={`text-xs font-semibold ${step === 3 ? 'text-orange-600 dark:text-orange-400' : 'text-zinc-500'}`}>
                        Verifikasi Data
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                        Periksa seluruh data sebelum dikirim.
                      </p>
                    </div>
                  </li>
                </ol>
              </aside>

              <form
                onSubmit={step === 1 ? handleNextStep : step === 2 ? handleFileStep : handleFinalSubmit}
                className="flex min-h-0 min-w-0 flex-col overflow-hidden"
              >
                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
              {step === 1 && (
                <>
                  <div className="p-3 bg-orange-50/50 dark:bg-orange-500/10 rounded text-xs text-orange-700 dark:text-orange-300 flex items-start gap-2">
                    <Info size={16} className="shrink-0 mt-0.5" />
                    <span>
                      Anda harus mengusulkan tepat 3 judul skripsi.
                    </span>
                  </div>

                  {titles.map((t, idx) => (
                    <div key={idx} className="p-4 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3 relative">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                          Usulan Judul #{idx + 1}
                        </label>
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
                        <Select
                          value={t.topic || ''}
                          onChange={(val) => handleTitleChange(idx, 'topic', val)}
                          placeholder="Pilih Topik Skripsi..."
                          options={availableTopics.filter(topic => topic.isActive).map(topic => ({
                            value: topic.name,
                            label: topic.name
                          }))}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <textarea
                          rows={2}
                          required
                          placeholder="Deskripsi singkat atau metodologi (Wajib, min. 10 karakter)..."
                          value={t.description}
                          onChange={(e) => handleTitleChange(idx, 'description', e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white focus:border-zinc-900 dark:focus:border-white"
                        />
                      </div>
                    </div>
                  ))}

                </>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50/50 dark:bg-blue-500/10 rounded text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                    <Info size={16} className="shrink-0 mt-0.5" />
                    <span>
                      Langkah 2: Silakan unggah berkas pengajuan skripsi Anda. Anda dapat mengunduh template terlebih dahulu.
                    </span>
                  </div>

                  <div className="flex justify-center">
                    <a
                      href="/template_pengajuan_judul.docx"
                      download
                      className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <Download size={16} /> Unduh Template Pengajuan
                    </a>
                  </div>

                  <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      id="proposal-upload"
                      accept="application/pdf,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.type !== 'application/pdf') {
                          showToast('Berkas pengajuan harus berformat PDF.', 'error');
                          e.target.value = '';
                          return;
                        }
                        if (file.size > MAX_PROPOSAL_FILE_SIZE) {
                          showToast('Ukuran berkas PDF maksimal 5MB.', 'error');
                          e.target.value = '';
                          return;
                        }
                        setProposalFile(file);
                      }}
                    />
                    <label
                      htmlFor="proposal-upload"
                      className="cursor-pointer flex flex-col items-center justify-center gap-2"
                    >
                      <UploadCloud size={32} className={proposalFile ? "text-emerald-500" : "text-zinc-400"} />
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {proposalFile ? proposalFile.name : 'Klik untuk mengunggah berkas'}
                      </span>
                      <span className="text-xs text-zinc-500">PDF (Maks 5MB)</span>
                    </label>

                    {proposalFile && (
                      <div className="mx-auto mt-5 max-w-sm text-left">
                        <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-zinc-500">
                          <span>
                            {(proposalFile.size / 1024 / 1024).toFixed(2)} MB dari 5 MB
                          </span>
                          <span>
                            {Math.min(
                              100,
                              Math.round(
                                (proposalFile.size / MAX_PROPOSAL_FILE_SIZE) * 100,
                              ),
                            )}%
                          </span>
                        </div>
                        <div
                          className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700"
                          role="progressbar"
                          aria-label="Persentase ukuran berkas pengajuan"
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={Math.min(
                            100,
                            Math.round(
                              (proposalFile.size / MAX_PROPOSAL_FILE_SIZE) * 100,
                            ),
                          )}
                        >
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              proposalFile.size / MAX_PROPOSAL_FILE_SIZE >= 0.8
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                (proposalFile.size / MAX_PROPOSAL_FILE_SIZE) * 100,
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="rounded border border-orange-200 bg-orange-50/60 p-3 text-xs text-orange-800 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300">
                    Pastikan seluruh data berikut sudah benar sebelum mengirim pengajuan.
                  </div>

                  <section className="grid gap-3 rounded border border-zinc-200 p-4 text-xs dark:border-zinc-800 sm:grid-cols-2">
                    <div><span className="text-zinc-500">NIM</span><p className="mt-0.5 font-semibold text-zinc-900 dark:text-zinc-100">{user?.userId || '-'}</p></div>
                    <div><span className="text-zinc-500">Nama</span><p className="mt-0.5 font-semibold text-zinc-900 dark:text-zinc-100">{user?.name || '-'}</p></div>
                    <div><span className="text-zinc-500">Jurusan</span><p className="mt-0.5 font-semibold text-zinc-900 dark:text-zinc-100">{user?.department || '-'}</p></div>
                    <div><span className="text-zinc-500">Program Studi</span><p className="mt-0.5 font-semibold text-zinc-900 dark:text-zinc-100">{user?.prodi || '-'}</p></div>
                    <div className="sm:col-span-2"><span className="text-zinc-500">Dosen PA</span><p className="mt-0.5 font-semibold text-zinc-900 dark:text-zinc-100">{user?.dosenPA || '-'}{user?.dosenPANip ? ` — NIP ${user.dosenPANip}` : ''}</p></div>
                  </section>

                  <section className="rounded border border-zinc-200 p-4 dark:border-zinc-800">
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Daftar Judul yang Diajukan</h3>
                    <ol className="mt-3 list-decimal space-y-3 pl-5">
                      {titles.map((title, index) => (
                        <li key={index} className="pl-1 text-xs text-zinc-700 dark:text-zinc-300">
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100">{title.title}</p>
                          <p className="mt-0.5 text-[11px] font-medium text-orange-600 dark:text-orange-400">{title.topic}</p>
                          <p className="mt-1 leading-relaxed text-zinc-500">{title.description}</p>
                        </li>
                      ))}
                    </ol>
                  </section>

                  <section className="rounded border border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Pratinjau Berkas Pengajuan</h3>
                        <p className="mt-0.5 text-[11px] text-zinc-500">{proposalFile?.name} · {proposalFile ? `${(proposalFile.size / 1024 / 1024).toFixed(2)} MB` : '-'}</p>
                      </div>
                      <button type="button" onClick={() => setStep(2)} className="text-xs font-semibold text-orange-600 hover:text-orange-700">Ganti Berkas</button>
                    </div>
                    {proposalPreviewUrl && (
                      <iframe
                        src={proposalPreviewUrl}
                        title="Pratinjau berkas pengajuan skripsi"
                        className="h-80 w-full rounded border border-zinc-200 bg-white dark:border-zinc-700"
                      />
                    )}
                  </section>
                </div>
              )}

                </div>

              <div className="mt-3 flex shrink-0 flex-col gap-2 border-t border-zinc-200 bg-white pt-3 dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  Simpan sebagai Draf
                </button>
                <div className="flex justify-end gap-2">
                  {step === 1 ? (
                    <>
                      <button type="button" onClick={() => setShowCreateModal(false)} className="rounded px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">Batal</button>
                      <button type="submit" className="inline-flex items-center gap-1.5 rounded bg-orange-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-orange-700">Selanjutnya <ArrowRight size={14} /></button>
                    </>
                  ) : step === 2 ? (
                    <>
                      <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-1.5 rounded px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"><ArrowLeft size={14} /> Kembali</button>
                      <button type="submit" className="inline-flex items-center gap-1.5 rounded bg-orange-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-orange-700">Verifikasi Data <ArrowRight size={14} /></button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => setStep(2)} className="inline-flex items-center gap-1.5 rounded px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"><ArrowLeft size={14} /> Kembali</button>
                      <button type="submit" disabled={submitting} className="inline-flex items-center gap-1.5 rounded bg-orange-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-orange-700 disabled:opacity-50">{submitting ? 'Mengirim...' : 'Ajukan Proposal'}</button>
                    </>
                  )}
                </div>
              </div>
              </form>
            </div>
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
                Umpan Balik Penolakan Validator
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
                ID Pengajuan: <span className="font-mono text-zinc-700 dark:text-zinc-300">{showFeedbackModal.submissionId}</span>
              </div>

              <div className="p-4 bg-rose-50/50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded space-y-2">
                <h4 className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
                  Umpan Balik dari {showFeedbackModal.rejectedByName || 'Validator'}
                </h4>
                <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans whitespace-pre-wrap">
                  {showFeedbackModal.rejectionReason || 'Tidak ada alasan rinci yang diberikan.'}
                </p>
              </div>

              <p className="text-xs text-zinc-500">
                Anda sekarang dapat menyiapkan dan mengajukan usulan judul skripsi baru sesuai dengan umpan balik validator.
              </p>
            </div>

            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setShowFeedbackModal(null)}
                className="px-4 py-2 rounded text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 transition-opacity"
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
