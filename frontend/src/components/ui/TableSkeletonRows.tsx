import React from 'react';

interface TableSkeletonRowsProps {
  columns: number;
  rows?: number;
}

const widths = ['w-20', 'w-36', 'w-28', 'w-24', 'w-16'];

export const TableSkeletonRows: React.FC<TableSkeletonRowsProps> = ({
  columns,
  rows = 5,
}) => (
  <>
    {Array.from({ length: rows }, (_, rowIndex) => (
      <tr key={rowIndex} aria-hidden="true">
        {Array.from({ length: columns }, (_, columnIndex) => (
          <td key={columnIndex} className="px-4 py-4">
            <div
              className={`h-3 max-w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800 ${
                widths[(rowIndex + columnIndex) % widths.length]
              } ${columnIndex === columns - 1 ? 'ml-auto' : ''}`}
            />
            {columnIndex === 1 && (
              <div className="mt-2 h-2.5 w-24 max-w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-900" />
            )}
          </td>
        ))}
      </tr>
    ))}
  </>
);
