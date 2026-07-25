import { useAuth } from '../../context/AuthContext';
import type { Submission } from '../../types';

interface StudentIdentityCardProps {
  submission: Submission;
  /** Render prop for the status badge */
  statusBadge?: React.ReactNode;
}

export function StudentIdentityCard({ submission, statusBadge }: StudentIdentityCardProps) {
  const { user } = useAuth();
  const isStudent = user?.role === 'STUDENT' || user?.role === 'student';

  const studentName = submission.studentName || (isStudent ? user?.name : '-');
  const nim = submission.nim || (isStudent ? user?.userId || user?.id : '-');
  const studentProdi = submission.studentProdi || (isStudent ? user?.prodi : '-');
  const studentEmail = submission.studentEmail || (isStudent ? user?.email : undefined);
  const dosenPA = submission.dosenPA || (isStudent ? user?.dosenPA : '-');
  const dosenPANip = submission.dosenPANip || (isStudent ? user?.dosenPANip : undefined);

  return (
    <section className="relative overflow-hidden border border-zinc-300 bg-gradient-to-br from-white via-zinc-50/50 to-zinc-100 p-5 text-xs shadow-sm dark:border-zinc-700 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950">
      {/* Subtle Pattern Image Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%20000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* Accent Glow Line (Top Border Highlight) */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent dark:via-indigo-400/40" />

      {/* Main Grid Content */}
      <div className="relative z-10 grid gap-5 sm:grid-cols-2">
        {/* Kolom Kiri: Data Mahasiswa & Dosen PA */}
        <div className="space-y-3.5">
          <div>
            <span className="font-medium text-zinc-500 dark:text-zinc-400">Mahasiswa</span>
            <p className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {studentName}
            </p>
          </div>

          <div>
            <span className="font-medium text-zinc-500 dark:text-zinc-400">NIM / Prodi</span>
            <p className="mt-0.5 font-semibold text-zinc-900 dark:text-zinc-100">
              {nim} <span className="text-zinc-400 dark:text-zinc-500">/</span> {studentProdi}
            </p>
          </div>

          {studentEmail && (
            <div>
              <span className="font-medium text-zinc-500 dark:text-zinc-400">Email</span>
              <p className="mt-0.5 font-semibold text-zinc-900 dark:text-zinc-100">
                {studentEmail}
              </p>
            </div>
          )}

          <div className="pt-1">
            <span className="font-medium text-zinc-500 dark:text-zinc-400">Dosen PA</span>
            <p className="mt-0.5 font-semibold text-zinc-900 dark:text-zinc-100">
              {dosenPA}
              {dosenPANip && (
                <span className="block font-normal text-zinc-500 dark:text-zinc-400">
                  NIP {dosenPANip}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Kolom Kanan: Status & Tanggal */}
        <div className="space-y-3.5 sm:border-l sm:border-zinc-200/80 sm:pl-5 sm:dark:border-zinc-800">
          {statusBadge && (
            <div>
              <span className="font-medium text-zinc-500 dark:text-zinc-400">Status</span>
              <div className="mt-1">{statusBadge}</div>
            </div>
          )}

          {submission.submittedAt && (
            <div>
              <span className="font-medium text-zinc-500 dark:text-zinc-400">Tanggal Submit</span>
              <p className="mt-0.5 font-semibold text-zinc-900 dark:text-zinc-100">
                {new Date(submission.submittedAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
