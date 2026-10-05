import React from 'react';

interface SkeletonProps {
  rows?: number;
  className?: string;
}

const Shimmer: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse ${className}`} />
);

export const TableSkeleton: React.FC<SkeletonProps> = ({ rows = 5, className = '' }) => (
  <div className={`animate-pulse space-y-3 ${className}`}>
    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
    <div className="space-y-2">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-12 bg-gray-100 rounded-lg" />
      ))}
    </div>
  </div>
);

export const CardSkeleton: React.FC<SkeletonProps> = ({ rows = 3, className = '' }) => (
  <div className={`animate-pulse space-y-4 ${className}`}>
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="flex items-center gap-4">
        <div className="h-10 w-10 bg-gray-200 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export const PageSkeleton: React.FC = () => (
  <div className="p-6 space-y-6 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded w-64" />
        <div className="h-4 bg-gray-100 rounded w-40" />
      </div>
      <div className="h-10 bg-gray-200 rounded w-40" />
    </div>
    <div className="flex justify-end">
      <div className="h-10 bg-gray-200 rounded w-64" />
    </div>
    <div className="bg-white rounded-xl shadow-md border-0 p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-6 bg-gray-200 rounded w-48" />
        <div className="h-10 bg-gray-200 rounded w-64" />
      </div>
      <div className="space-y-3">
        <div className="h-10 bg-gray-100 rounded-lg" />
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-14 bg-gray-50 rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="p-6 space-y-6 animate-pulse">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg h-9 w-9" />
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-16" />
              <div className="h-5 bg-gray-200 rounded w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, j) => (
              <div key={j} className="flex items-center gap-3">
                <div className="h-8 w-8 bg-gray-100 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-2 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const AgentsListSkeleton: React.FC = () => (
  <div className="p-6 space-y-6 animate-pulse">
    {/* Header */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded w-56" />
        <div className="h-4 bg-gray-100 rounded w-32" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-10 bg-gray-200 rounded-lg w-36" />
        <div className="h-10 bg-gray-200 rounded-lg w-32" />
      </div>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-16" />
            <div className="h-7 bg-gray-200 rounded w-12" />
          </div>
        </div>
      ))}
    </div>

    {/* Table Card */}
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      {/* Card Header with search & filters */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="h-6 bg-gray-200 rounded w-40" />
          <div className="flex items-center gap-2">
            <div className="h-10 bg-gray-100 rounded-lg w-64" />
            <div className="h-10 bg-gray-100 rounded-lg w-10" />
            <div className="h-10 bg-gray-100 rounded-lg w-10" />
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="px-6 py-3 bg-gray-50/40">
        <div className="flex items-center gap-8">
          {['Agent', 'Fonction', 'Direction', 'Grade', 'Sexe', 'Statut', 'Actions'].map((col, i) => (
            <div key={i} className="h-3 bg-gray-200 rounded" style={{ width: i === 0 ? '180px' : i === 6 ? '80px' : '100px' }} />
          ))}
        </div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-gray-50">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="px-6 py-4 flex items-center gap-8">
            {/* Agent cell */}
            <div className="flex items-center gap-3" style={{ width: '180px' }}>
              <div className="h-10 w-10 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="space-y-1.5">
                <div className="h-3 bg-gray-200 rounded w-24" />
                <div className="h-2.5 bg-gray-100 rounded w-16" />
              </div>
            </div>
            {/* Other cells */}
            <div className="h-3 bg-gray-100 rounded" style={{ width: '100px' }} />
            <div className="h-5 bg-gray-100 rounded-md w-16" />
            <div className="h-5 bg-gray-100 rounded-md w-12" />
            <div className="h-3 bg-gray-100 rounded w-16" />
            <div className="h-5 bg-gray-100 rounded-full w-14" />
            <div className="flex gap-1" style={{ width: '80px' }}>
              <div className="h-8 w-8 bg-gray-100 rounded-lg" />
              <div className="h-8 w-8 bg-gray-100 rounded-lg" />
              <div className="h-8 w-8 bg-gray-100 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <div className="h-4 bg-gray-100 rounded w-32" />
        <div className="flex items-center gap-1">
          <div className="h-8 w-8 bg-gray-100 rounded-lg" />
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className={`h-8 w-8 rounded-lg ${i === 0 ? 'bg-gray-300' : 'bg-gray-100'}`} />
          ))}
          <div className="h-8 w-8 bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);

export const AgentDetailSkeleton: React.FC = () => (
  <div className="p-6 space-y-6 animate-pulse">
    {/* Back button + Header */}
    <div className="flex items-center gap-4">
      <div className="h-10 w-10 bg-gray-200 rounded-lg" />
      <div className="space-y-2">
        <div className="h-7 bg-gray-200 rounded w-64" />
        <div className="h-4 bg-gray-100 rounded w-40" />
      </div>
      <div className="ml-auto flex gap-2">
        <div className="h-10 bg-gray-200 rounded-lg w-24" />
        <div className="h-10 bg-gray-200 rounded-lg w-24" />
      </div>
    </div>

    {/* Profile Card */}
    <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5">
        <div className="flex items-center gap-5">
          <div className="h-20 w-20 bg-gray-200 rounded-2xl" />
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-48" />
            <div className="h-4 bg-gray-100 rounded w-32" />
            <div className="flex gap-2 mt-2">
              <div className="h-5 bg-gray-200 rounded-full w-16" />
              <div className="h-5 bg-gray-200 rounded-full w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Tabs */}
    <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
      <div className="flex border-b border-gray-100 px-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded-t-lg mx-1" style={{ width: `${80 + Math.random() * 40}px` }} />
        ))}
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="h-5 bg-gray-200 rounded w-32" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-3 bg-gray-100 rounded w-20" />
                  <div className="h-4 bg-gray-200 rounded w-32" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="h-5 bg-gray-200 rounded w-28" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-3 bg-gray-100 rounded w-24" />
                  <div className="h-4 bg-gray-200 rounded w-28" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar (1 col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="h-5 bg-gray-200 rounded w-16 mb-4" />
            <div className="flex justify-center">
              <div className="h-48 w-48 bg-gray-200 rounded-lg" />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-20" />
            <div className="space-y-2">
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const FormAgentSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8 animate-pulse">
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="h-10 w-20 bg-gray-200 rounded-lg" />
        <div className="h-8 bg-gray-200 rounded w-48" />
      </div>

      <div className="space-y-8">
        {/* Section: Informations personnelles */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <div className="h-5 bg-gray-200 rounded w-48" />
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded w-24" />
                  <div className="h-10 bg-gray-100 rounded-lg w-full" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Affectation */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
            <div className="h-5 bg-gray-200 rounded w-36" />
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded w-28" />
                  <div className="h-10 bg-gray-100 rounded-lg w-full" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Origine */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-gray-200">
            <div className="h-5 bg-gray-200 rounded w-28" />
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded w-24" />
                  <div className="h-10 bg-gray-100 rounded-lg w-full" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Photo */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 px-6 py-4 border-b border-gray-200">
            <div className="h-5 bg-gray-200 rounded w-16" />
          </div>
          <div className="p-6 flex justify-center">
            <div className="h-48 w-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-200" />
          </div>
        </section>

        {/* Submit buttons */}
        <div className="flex justify-end gap-3">
          <div className="h-10 bg-gray-200 rounded-lg w-24" />
          <div className="h-10 bg-gray-300 rounded-lg w-32" />
        </div>
      </div>
    </div>
  </div>
);

export default TableSkeleton;
