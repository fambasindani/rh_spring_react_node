import React, { useState } from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

export type Column<T> = {
  key: keyof T | string;
  header: string;
  render?: (value: any, row: T, index?: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
};

interface TableProps<T extends { id: number | string }> {
  columns: Column<T>[];
  data: T[];
  bordered?: boolean;
  className?: string;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
}

function Table<T extends { id: number | string }>({
  columns,
  data,
  bordered = false,
  className = '',
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const renderValue = (value: T[keyof T]) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
    if (typeof value === 'number' || typeof value === 'string') return value;
    return JSON.stringify(value);
  };

  const handleSort = (key: string) => {
    const newDir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDir(newDir);
  };

  const sortedData = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = (a as any)[sortKey];
      const bVal = (b as any)[sortKey];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'string') {
        const cmp = aVal.localeCompare(bVal);
        return sortDir === 'asc' ? cmp : -cmp;
      }
      if (typeof aVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      if (typeof aVal === 'boolean') {
        return sortDir === 'asc' ? (aVal ? 1 : 0) - (bVal ? 1 : 0) : (bVal ? 1 : 0) - (aVal ? 1 : 0);
      }
      return 0;
    });
  }, [data, sortKey, sortDir]);

  const renderSortIcon = (key: string) => {
    if (sortKey !== key) return <FaSort className="h-3 w-3 text-gray-300" />;
    return sortDir === 'asc'
      ? <FaSortUp className="h-3 w-3 text-blue-600" />
      : <FaSortDown className="h-3 w-3 text-blue-600" />;
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table
        className={`min-w-full divide-y divide-gray-200 ${
          bordered ? 'border border-gray-200' : ''
        }`}
      >
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  bordered ? 'border border-gray-200' : ''
                } ${col.sortable ? 'cursor-pointer select-none hover:bg-gray-100' : ''}`}
                onClick={() => col.sortable && handleSort(col.key as string)}
              >
                <div className="flex items-center space-x-1">
                  <span>{col.header}</span>
                  {col.sortable && renderSortIcon(col.key as string)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((row, sortedIndex) => (
            <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
              {columns.map((col, idx) => {
                const value = (row as any)[col.key];
                return (
                  <td
                    key={idx}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                      bordered ? 'border border-gray-200' : ''
                    }`}
                  >
                    {col.render ? col.render(value, row, sortedIndex) : renderValue(value)}
                  </td>
                );
              })}
            </tr>
          ))}
          {sortedData.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-gray-400">
                Aucun résultat trouvé
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
