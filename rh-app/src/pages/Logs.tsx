import React, { useState, useEffect, useMemo } from 'react';
import { logsService } from '../services/logs.service';
import type { LogResponse } from '../types/log';
import Table from '../components/ui/Table';
import type { Column } from '../components/ui/Table';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/Button';
import Modal from '../components/ui/Modal';
import { FaEye, FaSearch, FaFilter, FaTimes, FaFileExcel, FaChevronLeft, FaChevronRight, FaShieldAlt, FaCheckCircle, FaTimesCircle, FaList, FaArrowRight } from 'react-icons/fa';
import Toast from '../components/Toast';
import * as XLSX from 'xlsx';
import { TableSkeleton } from '../components/ui/Skeleton';

const ACTION_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  LOGIN: { label: 'Connexion', color: 'text-green-700', bg: 'bg-green-100' },
  LOGIN_FAILED: { label: 'Echec connexion', color: 'text-red-700', bg: 'bg-red-100' },
  LOGOUT: { label: 'Deconnexion', color: 'text-gray-700', bg: 'bg-gray-100' },
  CREATE: { label: 'Creation', color: 'text-blue-700', bg: 'bg-blue-100' },
  UPDATE: { label: 'Modification', color: 'text-amber-700', bg: 'bg-amber-100' },
  DELETE: { label: 'Suppression', color: 'text-red-700', bg: 'bg-red-100' },
  VIEW: { label: 'Consultation', color: 'text-indigo-700', bg: 'bg-indigo-100' },
};

const getActionConfig = (action: string) => {
  return ACTION_CONFIG[action] || { label: action, color: 'text-gray-700', bg: 'bg-gray-100' };
};

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<LogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [selectedLog, setSelectedLog] = useState<LogResponse | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [goToPageInput, setGoToPageInput] = useState('');

  const allActions = Array.from(new Set(logs.map(l => l.action))).sort();

  const loginCount = logs.filter(l => l.action === 'LOGIN').length;
  const failedCount = logs.filter(l => l.action === 'LOGIN_FAILED').length;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchKeyword);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  const fetchLogs = async (pageNum = page, keyword = debouncedSearch) => {
    setLoading(true);
    try {
      const response = await logsService.getLogs({
        page: pageNum,
        size: pageSize,
        keyword: keyword || undefined,
      });
      let data = (response.content || []).map((log) => ({
        ...log,
      }));
      if (filterAction) {
        data = data.filter(l => l.action === filterAction);
      }
      setLogs(data);
      setTotalElements(response.totalElements || 0);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error(error);
      setToast({ message: 'Erreur lors du chargement des logs', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(0);
  }, [debouncedSearch, pageSize]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
      fetchLogs(newPage);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };

  const handleExportExcel = () => {
    const exportData = logs.map((log, idx) => ({
      '#': page * pageSize + idx + 1,
      'Utilisateur': log.username,
      'Action': getActionConfig(log.action).label,
      'Description': log.description || '',
      'Adresse IP': log.ipAddress || '',
      'Date': formatDate(log.createdAt),
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    ws['!cols'] = [{ wch: 6 }, { wch: 20 }, { wch: 18 }, { wch: 50 }, { wch: 18 }, { wch: 22 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Logs');
    XLSX.writeFile(wb, `logs_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    setToast({ message: 'Export Excel termine', type: 'success' });
  };

  const columns: Column<LogResponse>[] = [
    { key: 'rowNum', header: '#',
      render: (_: any, __: any, index?: number) => (
        <span className="text-gray-500">{(page * pageSize) + (index ?? 0) + 1}</span>
      )
    },
    { key: 'username', header: 'Utilisateur', sortable: true },
    { key: 'action', header: 'Action', sortable: true,
      render: (action: string) => {
        const cfg = getActionConfig(action);
        return <span className={`px-2 py-1 text-xs rounded-full font-medium ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>;
      }
    },
    { key: 'description', header: 'Description',
      render: (desc: string) => <span className="text-gray-500 max-w-xs truncate block" title={desc}>{desc || '-'}</span>
    },
    { key: 'ipAddress', header: 'IP', sortable: true },
    { key: 'createdAt', header: 'Date', sortable: true,
      render: (date: string) => <span className="text-gray-500 text-xs">{formatDate(date)}</span>
    },
    { key: 'id', header: '', width: '60px',
      render: (_: any, row: LogResponse) => (
        <button onClick={() => { setSelectedLog(row); setDetailsModalOpen(true); }}
          className="p-2 rounded-lg hover:bg-blue-50 transition" title="Voir les details">
          <FaEye className="text-blue-600 h-4 w-4" />
        </button>
      )
    },
  ];

  if (loading && logs.length === 0) {
    return <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Journal des logs</h1>
          <p className="text-sm text-gray-500">Chargement...</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-200 rounded-lg" />
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded w-16 mb-2" />
                <div className="h-6 bg-gray-200 rounded w-10" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <TableSkeleton rows={8} />
    </div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Journal des logs</h1>
          <p className="text-sm text-gray-500">{totalElements} entree(s) au total</p>
        </div>
        <Button variant="outline" onClick={handleExportExcel} icon={<FaFileExcel />}
          className="text-green-600 border-green-300 hover:bg-green-50">
          Exporter Excel
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><FaList className="text-blue-500" /></div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Total</p>
              <p className="text-xl font-black text-gray-800">{totalElements}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg"><FaCheckCircle className="text-green-500" /></div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Connexions</p>
              <p className="text-xl font-black text-green-600">{loginCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg"><FaTimesCircle className="text-red-500" /></div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Echecs</p>
              <p className="text-xl font-black text-red-600">{failedCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg"><FaShieldAlt className="text-purple-500" /></div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Pages</p>
              <p className="text-xl font-black text-purple-600">{page + 1}<span className="text-sm font-bold text-gray-400">/{totalPages}</span></p>
            </div>
          </div>
        </div>
      </div>

      <Card className="shadow-md border-0">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-semibold">Historique des evenements</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input type="text" placeholder="Rechercher..." value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64" />
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg border transition ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`} title="Filtres">
              <FaFilter className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>
        <CardBody>
          {showFilters && (
            <div className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 mb-4">
              <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}
                className="px-3 py-1.5 text-sm border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Toutes les actions</option>
                {allActions.map(a => <option key={a} value={a}>{getActionConfig(a).label}</option>)}
              </select>
              {filterAction && (
                <button onClick={() => setFilterAction('')}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition">
                  <FaTimes className="h-3 w-3" /> Effacer
                </button>
              )}
            </div>
          )}

          <Table columns={columns} data={logs} bordered className="w-full" />

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-gray-100 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Lignes par page :</span>
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                  className="px-2 py-1 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-500 ml-2">
                  {page * pageSize + 1}-{Math.min((page + 1) * pageSize, totalElements)} sur {totalElements.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handlePageChange(0)} disabled={page === 0}
                  className="px-2 py-1 text-xs rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                  {'<<'}
                </button>
                <button onClick={() => handlePageChange(page - 1)} disabled={page === 0}
                  className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                  <FaChevronLeft className="h-3 w-3 text-gray-600" />
                </button>
                {totalPages <= 7 ? (
                  Array.from({ length: totalPages }, (_, i) => (
                    <button key={i} onClick={() => handlePageChange(i)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition ${page === i ? 'bg-blue-600 text-white shadow' : 'hover:bg-gray-100 text-gray-600'}`}>
                      {i + 1}
                    </button>
                  ))
                ) : (
                  <>
                    {page > 2 && <span className="px-1 text-gray-400">...</span>}
                    {Array.from({ length: 5 }, (_, i) => {
                      let pageIdx: number;
                      if (page < 3) pageIdx = i;
                      else if (page > totalPages - 4) pageIdx = totalPages - 5 + i;
                      else pageIdx = page - 2 + i;
                      return (
                        <button key={pageIdx} onClick={() => handlePageChange(pageIdx)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition ${page === pageIdx ? 'bg-blue-600 text-white shadow' : 'hover:bg-gray-100 text-gray-600'}`}>
                          {pageIdx + 1}
                        </button>
                      );
                    })}
                    {page < totalPages - 3 && <span className="px-1 text-gray-400">...</span>}
                  </>
                )}
                <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages - 1}
                  className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                  <FaChevronRight className="h-3 w-3 text-gray-600" />
                </button>
                <button onClick={() => handlePageChange(totalPages - 1)} disabled={page >= totalPages - 1}
                  className="px-2 py-1 text-xs rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                  {'>>'}
                </button>
                <div className="flex items-center gap-1 ml-2">
                  <input type="number" min={1} max={totalPages} value={goToPageInput}
                    onChange={(e) => setGoToPageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const p = parseInt(goToPageInput, 10);
                        if (p >= 1 && p <= totalPages) { handlePageChange(p - 1); setGoToPageInput(''); }
                      }
                    }}
                    placeholder="Page"
                    className="w-16 px-2 py-1 text-sm border rounded-lg text-center focus:ring-2 focus:ring-blue-500 outline-none" />
                  <button onClick={() => {
                    const p = parseInt(goToPageInput, 10);
                    if (p >= 1 && p <= totalPages) { handlePageChange(p - 1); setGoToPageInput(''); }
                  }} className="p-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                    <FaArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={detailsModalOpen} onClose={() => { setDetailsModalOpen(false); setSelectedLog(null); }}
        title="Details du log" size="lg">
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">ID</p>
                <p className="text-sm text-gray-900">{selectedLog.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Utilisateur</p>
                <p className="text-sm text-gray-900 font-medium">{selectedLog.username}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Action</p>
                {(() => {
                  const cfg = getActionConfig(selectedLog.action);
                  return <span className={`px-2 py-1 text-xs rounded-full font-medium ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>;
                })()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Adresse IP</p>
                <p className="text-sm text-gray-900 font-mono">{selectedLog.ipAddress}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-200">{selectedLog.description}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500">User Agent</p>
                <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200 break-all font-mono">{selectedLog.userAgent}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500">Date/Heure</p>
                <p className="text-sm text-gray-900">{formatDate(selectedLog.createdAt)}</p>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => { setDetailsModalOpen(false); setSelectedLog(null); }}>Fermer</Button>
            </div>
          </div>
        )}
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} duration={4000} />}
    </div>
  );
};

export default Logs;
