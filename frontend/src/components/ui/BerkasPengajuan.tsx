import React from 'react';
import { api } from '../../services/api';

interface BerkasPengajuanProps {
  documentUrl?: string | null;
  documentName?: string | null;
  rawUrl?: boolean;
}

export function BerkasPengajuan({ documentUrl, documentName, rawUrl }: BerkasPengajuanProps) {
  if (!documentUrl) {
    return (
      <section className="rounded border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Berkas Pengajuan
            </h3>
            <p className="mt-0.5 text-[11px] text-zinc-500">
              {documentName || 'Dokumen proposal PDF'}
            </p>
          </div>
        </div>
        <div className="rounded bg-zinc-50 px-3 py-6 text-center text-xs text-zinc-500 dark:bg-zinc-900">
          Berkas PDF belum tersedia untuk pengajuan ini.
        </div>
      </section>
    );
  }

  const finalUrl = rawUrl ? documentUrl : api.getAssetUrl(documentUrl);

  return (
    <section className="rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            Berkas Pengajuan
          </h3>
          <p className="mt-0.5 text-[11px] text-zinc-500">
            {documentName || 'Dokumen proposal PDF'}
          </p>
        </div>
        <a
          href={finalUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold text-orange-600 hover:text-orange-700"
        >
          Buka di Tab Baru
        </a>
      </div>
      <iframe
        src={finalUrl}
        title="Pratinjau berkas pengajuan skripsi"
        className="h-80 w-full rounded border border-zinc-200 bg-white dark:border-zinc-700"
      />
    </section>
  );
}
