import React from 'react';
import type { ProposedTitle } from '../../types';
import { ProposedTitleItem } from './ProposedTitleItem';

interface ProposedTitlesListProps {
  titles: ProposedTitle[];
  sectionTitle?: string;
  className?: string;
}

export function ProposedTitlesList({ titles, sectionTitle = 'Judul yang Diajukan', className = '' }: ProposedTitlesListProps) {
  return (
    <section className={className}>
      <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{sectionTitle}</h3>
      <ol className="mt-2 space-y-2">
        {titles.map((title, index) => (
          <ProposedTitleItem key={title.titleId} title={title} index={index} />
        ))}
      </ol>
    </section>
  );
}
