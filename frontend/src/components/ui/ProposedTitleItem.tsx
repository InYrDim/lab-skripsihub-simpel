import React from 'react';
import type { ProposedTitle } from '../../types';

interface ProposedTitleItemProps {
  title: ProposedTitle;
  index: number;
}

export function ProposedTitleItem({ title, index }: ProposedTitleItemProps) {
  return (
    <li className="rounded border border-zinc-200 p-3 dark:border-zinc-800">
      <div className="flex gap-2 text-xs">
        <span className="font-bold text-orange-600">{index + 1}.</span>
        <div>
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">{title.title}</p>
          {title.topic && (
            <p className="mt-0.5 text-[11px] font-medium text-orange-600 dark:text-orange-400">
              {title.topic}
            </p>
          )}
          {title.description && (
            <p className="mt-1 leading-relaxed text-zinc-500">{title.description}</p>
          )}
          {title.similarityCheck && (
            <div className="mt-2 space-y-2 rounded border border-zinc-100 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-zinc-900/50">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Pengecekan Kemiripan: {title.similarityCheck.percentage.toFixed(1)}% mirip
              </p>
              {title.similarityCheck.matches.length > 0 && (
                <ul className="space-y-1">
                  {title.similarityCheck.matches.map((match, i) => (
                    <li key={i} className="flex gap-2 text-[11px]">
                      <span className="text-zinc-400">•</span>
                      <span className="text-zinc-600 dark:text-zinc-400">{match.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
