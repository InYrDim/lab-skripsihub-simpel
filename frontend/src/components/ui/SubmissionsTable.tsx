import React from 'react';
import { Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { Submission, ValidatorInfo, SubmissionStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface SubmissionsTableProps {
  submissions: Submission[];
  loading: boolean;
  validators?: ValidatorInfo[];
  onPreview: (sub: Submission) => void;
  renderActions?: (sub: Submission) => React.ReactNode;
}

export const getStatusBadge = (status: SubmissionStatus) => {
  const s = status.toUpperCase();
  if (s === 'PENDING_ADMIN_REVIEW') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
        <Clock size={12} /> Menunggu Admin
      </span>
    );
  }
  if (s === 'PENDING_VALIDATOR_REVIEW') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
        <Clock size={12} /> Dalam Validasi
      </span>
    );
  }
  if (s === 'APPROVED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
        <CheckCircle size={12} /> Disetujui
      </span>
    );
  }
  if (s === 'REJECTED' || s === 'REJECTED_BY_ADMIN' || s === 'REJECTED_BY_VALIDATOR') {
    const label = s === 'REJECTED_BY_ADMIN' ? 'Ditolak Admin' : s === 'REJECTED_BY_VALIDATOR' ? 'Ditolak Validator' : 'Ditolak';
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
        <XCircle size={12} /> {label}
      </span>
    );
  }
  return (
    <span className="text-xs font-semibold">
      {s === 'DRAFT' ? 'Draf' : 'Status tidak dikenal'}
    </span>
  );
};

export const SubmissionsTable: React.FC<SubmissionsTableProps> = ({
  submissions,
  loading,
  validators = [],
  onPreview,
  renderActions,
}) => {
  const { user } = useAuth();
  const normalizedRole = user?.role?.toUpperCase() || 'ADMIN';
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
          <tr>
            <th className="px-4 py-2.5 font-medium">ID</th>
            {normalizedRole !== 'STUDENT' && (
              <th className="px-4 py-2.5 font-medium">Student</th>
            )}
            {normalizedRole === 'STUDENT' && (
              <th className="px-4 py-2.5 font-medium">Tanggal</th>
            )}
            <th className="px-4 py-2.5 font-medium">Titles</th>
            {normalizedRole === 'STUDENT' && (
              <th className="px-4 py-2.5 font-medium">Topik</th>
            )}
            {normalizedRole === 'ADMIN' && (
              <th className="px-4 py-2.5 font-medium">Assigned Validator</th>
            )}
            {normalizedRole === 'VALIDATOR' && (
              <>
                <th className="px-4 py-2.5 font-medium">Dosen PA</th>
                <th className="px-4 py-2.5 font-medium">Ditugaskan</th>
              </>
            )}
            <th className="px-4 py-2.5 font-medium">Status</th>
            <th className="px-4 py-2.5 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
          {loading ? (
            <tr>
              <td colSpan={normalizedRole === 'VALIDATOR' ? 7 : 6} className="px-6 py-8 text-center text-zinc-400 text-xs">
                Loading submissions...
              </td>
            </tr>
          ) : submissions.length === 0 ? (
            <tr>
              <td colSpan={normalizedRole === 'VALIDATOR' ? 7 : 6} className="px-6 py-8 text-center text-zinc-400 text-xs">
                No submissions found.
              </td>
            </tr>
          ) : (
            submissions.map((sub) => {
              const validatorName =
                typeof sub.assignedValidator === 'object' && sub.assignedValidator !== null
                  ? sub.assignedValidator.name
                  : validators.find((v) => v.validatorId === sub.assignedValidator)?.name || null;

              return (
                <tr key={sub.submissionId} className="hover:bg-white dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500 align-top" title={sub.submissionId}>
                    {sub.submissionId.slice(0, 5)}...
                  </td>
                  {normalizedRole !== 'STUDENT' && (
                    <td className="px-4 py-3 align-top">
                      <div className="font-medium text-xs text-zinc-900 dark:text-zinc-100">
                        {sub.studentName || 'Student'}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5 space-x-2 flex items-center">
                        <span>{sub.nim || 'N/A'}</span>
                        {sub.studentProdi && (
                          <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400 rounded uppercase font-bold tracking-wider">
                            {sub.studentProdi}
                          </span>
                        )}
                      </div>
                    </td>
                  )}
                  {normalizedRole === 'STUDENT' && (
                    <td className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-zinc-600 dark:text-zinc-400 align-top">
                      {new Date(sub.submittedAt).toLocaleDateString('id-ID')}
                    </td>
                  )}
                  <td className="px-4 py-3 align-top">
                    {sub.titles?.length ? (
                      <ol className="min-w-56 max-w-md list-decimal space-y-2 pl-4 text-xs text-zinc-700 dark:text-zinc-300">
                        {sub.titles.map((title) => (
                          <li key={title.titleId} className="pl-1 leading-relaxed">
                            <span className={`${sub.approvedTitle === title.title ? 'text-emerald-700 dark:text-emerald-400 font-bold' : ''}`}>
                              {title.title}
                            </span>
                            {sub.approvedTitle === title.title && (
                              <span className="ml-2 inline-flex items-center text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded dark:bg-emerald-500/20 dark:text-emerald-400">
                                Disetujui
                              </span>
                            )}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <span className="text-xs italic text-zinc-400">{sub.approvedTitle || 'No titles submitted'}</span>
                    )}
                  </td>
                  {normalizedRole === 'STUDENT' && (
                    <td className="px-4 py-3 align-top">
                      {sub.titles?.length ? (
                        <ul className="flex flex-col gap-2">
                          {sub.titles.map((t, i) => (
                            <li key={i} className="text-[10px] font-bold text-zinc-500 uppercase pt-0.5">
                              {t.topic || '-'}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-zinc-400 text-xs">-</span>
                      )}
                    </td>
                  )}
                  {normalizedRole === 'ADMIN' && (
                    <td className="px-4 py-3 text-xs">
                      {validatorName ? (
                        <span className="font-medium text-orange-600 dark:text-orange-400">{validatorName}</span>
                      ) : (
                        <span className="text-zinc-400 italic">Unassigned</span>
                      )}
                    </td>
                  )}
                  {normalizedRole === 'VALIDATOR' && (
                    <>
                      <td className="px-4 py-3 text-xs">
                        <div className="font-medium text-zinc-800 dark:text-zinc-200">
                          {sub.dosenPA || 'Belum diatur'}
                        </div>
                        {sub.dosenPANip && (
                          <div className="mt-0.5 font-mono text-[11px] text-zinc-400">
                            NIP {sub.dosenPANip}
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs">
                        {sub.assignedAt
                          ? new Date(sub.assignedAt).toLocaleDateString('id-ID')
                          : 'Baru saja'}
                      </td>
                    </>
                  )}
                  <td className="whitespace-nowrap px-4 py-3 align-top">{getStatusBadge(sub.status)}</td>
                  <td className="px-4 py-3 text-right align-top">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onPreview(sub)}
                        title="Preview Pengajuan"
                        className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1.5 rounded text-zinc-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors"
                      >
                        <Eye size={14} /> {normalizedRole === 'STUDENT' ? 'Preview' : ''}
                      </button>
                      {renderActions && renderActions(sub)}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
