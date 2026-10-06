import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface PaginationProps {
  page: number;                 // 0-based
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className = '',
}) => {
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const current = Math.min(page, totalPages - 1);
  const from = totalItems === 0 ? 0 : current * pageSize + 1;
  const to = Math.min((current + 1) * pageSize, totalItems);

  const go = (p: number) => {
    if (p >= 0 && p < totalPages) onPageChange(p);
  };

  // Pages à afficher, avec ellipse "…" quand il y en a beaucoup
  const buildPages = (): (number | '...')[] => {
    const total = totalPages;
    const cur = current + 1;
    const delta = 1;
    const nums = new Set<number>();
    nums.add(1);
    nums.add(total);
    for (let i = cur - delta; i <= cur + delta; i++) {
      if (i >= 1 && i <= total) nums.add(i);
    }
    const sorted = Array.from(nums).sort((a, b) => a - b);
    const out: (number | '...')[] = [];
    let prev = 0;
    for (const n of sorted) {
      if (prev && n - prev > 1) out.push('...');
      out.push(n);
      prev = n;
    }
    return out;
  };
  const pageItems = buildPages();

  if (totalItems === 0) return null;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 ${className}`}>
      <div className="flex items-center gap-2">
        {onPageSizeChange && (
          <>
            <span className="text-sm text-gray-500 dark:text-slate-400">{t('common.rowsPerPage')}</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2 py-1 text-sm border rounded-lg bg-white dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {pageSizeOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 dark:text-slate-400">{from}-{to} {t('common.of')} {totalItems}</span>
        <button
          onClick={() => go(current - 1)}
          disabled={current === 0}
          className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          aria-label="Précédent"
        >
          <FaChevronLeft className="h-3 w-3 text-gray-600 dark:text-slate-300" />
        </button>

        {pageItems.map((it, idx) =>
          it === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 dark:text-slate-500 select-none">…</span>
          ) : (
            <button
              key={it}
              onClick={() => go(it - 1)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                current + 1 === it
                  ? 'bg-blue-600 text-white shadow'
                  : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300'
              }`}
            >
              {it}
            </button>
          )
        )}

        <button
          onClick={() => go(current + 1)}
          disabled={current >= totalPages - 1}
          className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          aria-label="Suivant"
        >
          <FaChevronRight className="h-3 w-3 text-gray-600 dark:text-slate-300" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
