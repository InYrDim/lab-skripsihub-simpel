import React from 'react';
import { Eye, X } from 'lucide-react';
import type { Submission } from '../../types';
import { StudentIdentityCard } from './StudentIdentityCard';
import { BerkasPengajuan } from './BerkasPengajuan';
import { ProposedTitlesList } from './ProposedTitlesList';

interface ModalDetailProposalProps {
  submission: Submission;
  onClose: () => void;
  statusBadge: React.ReactNode;
}

export function ModalDetailProposal({ submission, onClose, statusBadge }: ModalDetailProposalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex shrink-0 items-start justify-between border-b border-zinc-200 p-5 dark:border-zinc-800">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-white">
              <Eye size={20} className="text-orange-600" />
              Detail Pengajuan Proposal
            </h2>
            <p className="mt-1 font-mono text-[11px] text-zinc-400">
              ID {submission.submissionId}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            aria-label="Tutup preview"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto p-5">
          <StudentIdentityCard submission={submission} statusBadge={statusBadge} />

          <ProposedTitlesList titles={submission.titles} />

          <BerkasPengajuan documentUrl={submission.documentUrl} documentName={submission.documentName} />

          {submission.rejectionReason && (
            <section className="rounded border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-500/20 dark:bg-rose-500/5">
              <h3 className="text-xs font-bold text-rose-700 dark:text-rose-300">Alasan Penolakan</h3>
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 leading-relaxed">{submission.rejectionReason}</p>
              {submission.rejectedByName && (
                <p className="mt-2 text-[11px] text-rose-500">— {submission.rejectedByName}</p>
              )}
            </section>
          )}

          {submission.approvedTitle && (
            <section className="rounded border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/5">
              <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Judul yang Disetujui</h3>
              <p className="mt-1 text-xs font-semibold text-emerald-800 dark:text-emerald-200">{submission.approvedTitle}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
