import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { agentService } from '../services/agents.service';
import type { Agent, AgentDetailsResponse } from '../types/agent';
import Table from '../components/ui/Table';
import type { Column } from '../components/ui/Table';
import Button from '../components/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import { FaEye, FaEdit, FaTrash, FaPlus, FaSearch, FaFileExcel, FaFilter, FaTimes, FaChevronLeft, FaChevronRight, FaFilePdf, FaColumns } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import * as XLSX from 'xlsx';
import { PDFDownloadLink } from '@react-pdf/renderer';
import FicheAgentPDF from '../components/pdf/FicheAgentPDF';
import { BACKEND_BASE_URL } from '../config/constants';
import { AgentsListSkeleton } from '../components/ui/Skeleton';

const ALL_COLUMNS = [
  { key: 'agent', label: 'agents.colAgent' },
  { key: 'fonction', label: 'agents.colFonction' },
  { key: 'direction', label: 'agents.colDirection' },
  { key: 'grade', label: 'agents.colGrade' },
  { key: 'sexe', label: 'agents.colSexe' },
  { key: 'telephone', label: 'agents.colPhone' },
  { key: 'province', label: 'agents.colProvince' },
  { key: 'statut', label: 'agents.colStatus' },
  { key: 'actions', label: 'agents.colActions' },
];

const Agents: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterDirection, setFilterDirection] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterStatut, setFilterStatut] = useState<'all' | 'active' | 'inactive'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(ALL_COLUMNS.map(c => c.key));
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [pdfModal, setPdfModal] = useState<{ agent: AgentDetailsResponse; loading: boolean; photoBase64?: string } | null>(null);

  const userDroits = user?.droits || [];
  const userRoles = user?.roles || [];
  const isAdmin = userRoles.includes('ADMIN');
  const hasDroit = (d: string) => userDroits.includes(d);
  const isAgent = userRoles.includes('AGENT');
  const canCreate = isAdmin || hasDroit('CREATE_AGENT') || hasDroit('ALL_AGENTS');
  const canUpdate = isAdmin || hasDroit('UPDATE_AGENT') || hasDroit('ALL_AGENTS');
  const canDelete = isAdmin || hasDroit('DELETE_AGENT') || hasDroit('ALL_AGENTS');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const criteria: any = { page: currentPage, size: pageSize };
      if (debouncedSearch) criteria.keyword = debouncedSearch;
      if (filterStatut === 'active') criteria.statut = true;
      if (filterStatut === 'inactive') criteria.statut = false;
      const response = await agentService.searchAgents(criteria);
      const mapped = response.content.map((item: any) => ({
        id: item.id, matricule: item.matricule, nom: item.nom, postnom: item.postnom,
        prenom: item.prenom, sexe: item.sexe, dateNaissance: item.dateNaissance,
        email: item.email, telephone: item.telephone, etatCivil: item.etatCivil,
        statut: item.statut, referenceEngagement: item.referenceEngagement,
        dateEngagement: item.dateEngagement, province: item.province,
        territoire: item.territoire, village: item.village, photo: item.photo,
        grade: { id: item.idGrade, sigle: item.gradeSigle, nom: item.gradeNom },
        fonction: { id: item.idFonction, nom: item.fonctionNom },
        direction: { id: item.idDirection, sigle: item.directionSigle, nom: item.directionNom },
      })) as Agent[];
      setAgents(mapped);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error(err);
      setError(t('agents.loadError'));
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, filterStatut]);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const filteredAgents = useMemo(() => agents
    .filter(a => !filterDirection || a.direction?.sigle === filterDirection)
    .filter(a => !filterGrade || a.grade?.sigle === filterGrade)
    .filter(a => isAgent ? a.id === user?.agentId : true)
  , [agents, filterDirection, filterGrade, isAgent, user?.agentId]);

  const directions = useMemo(() => Array.from(new Set(agents.map(a => a.direction?.sigle).filter(Boolean))).sort(), [agents]);
  const grades = useMemo(() => Array.from(new Set(agents.map(a => a.grade?.sigle).filter(Boolean))).sort(), [agents]);
  const activeCount = filteredAgents.filter(a => a.statut).length;
  const hasActiveFilters = filterDirection || filterGrade || filterStatut !== 'all' || debouncedSearch;
  const clearFilters = () => { setFilterDirection(''); setFilterGrade(''); setFilterStatut('all'); setSearch(''); };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await agentService.deleteAgent(deleteConfirm.id);
      setDeleteConfirm(null);
      await fetchAgents();
    } catch (err) { console.error(err); }
    finally { setDeleting(false); }
  };

  const handleExportExcel = () => {
    const exportData = filteredAgents.map(a => ({
      'Matricule': a.matricule, 'Nom': a.nom, 'Postnom': a.postnom || '',
      'Prenom': a.prenom, 'Sexe': a.sexe === 'M' ? t('common.male') : t('common.female'),
      'Email': a.email, 'Telephone': a.telephone || '',
      'Grade': a.grade?.sigle || '', 'Fonction': a.fonction?.nom || '',
      'Direction': a.direction?.sigle || '', 'Province': a.province || '',
      'Statut': a.statut ? t('common.active') : t('common.inactive'), 'Date engagement': a.dateEngagement || '',
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    ws['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 25 }, { wch: 15 }, { wch: 8 }, { wch: 25 }, { wch: 8 }, { wch: 20 }, { wch: 8 }, { wch: 15 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Agents');
    XLSX.writeFile(wb, `agents_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const buildColumns = (): Column<Agent>[] => {
    const cols: Column<Agent>[] = [];
    if (visibleColumns.includes('agent')) {
      cols.push({ key: 'nom', header: t('agents.colAgent'), sortable: true,
        render: (_: any, row: Agent) => {
          const initials = `${row.nom[0]}${row.prenom[0]}`.toUpperCase();
          const photoSrc = row.photo ? `${BACKEND_BASE_URL}${row.photo}` : null;
          return (
            <div className="flex items-center space-x-3">
              {photoSrc ? (
                <img src={photoSrc} alt="" className="h-10 w-10 rounded-full object-cover border border-gray-200" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center font-semibold shadow">{initials}</div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-900">{row.nom}</p>
                <p className="text-xs font-medium text-gray-700">{row.postnom}</p>
                <p className="text-xs text-gray-500">{row.prenom}</p>
                <p className="text-xs text-gray-400">{row.matricule}</p>
              </div>
            </div>
          );
        }
      });
    }
    if (visibleColumns.includes('fonction')) {
      cols.push({ key: 'fonction', header: t('agents.colFonction'), sortable: true,
        render: (_: any, row: Agent) => <span className="text-sm text-gray-700">{row.fonction?.nom || '-'}</span>
      });
    }
    if (visibleColumns.includes('direction')) {
      cols.push({ key: 'direction', header: t('agents.colDirection'), sortable: true,
        render: (_: any, row: Agent) => <span className="px-2 py-0.5 text-xs bg-indigo-50 text-indigo-700 rounded font-medium">{row.direction?.sigle || '-'}</span>
      });
    }
    if (visibleColumns.includes('grade')) {
      cols.push({ key: 'grade', header: t('agents.colGrade'), sortable: true,
        render: (_: any, row: Agent) => <span className="px-2 py-1 text-xs bg-gray-100 rounded-md font-medium">{row.grade?.sigle || '-'}</span>
      });
    }
    if (visibleColumns.includes('sexe')) {
      cols.push({ key: 'sexe', header: t('agents.colSexe'),
        render: (_: any, row: Agent) => <span className="text-sm text-gray-600">{row.sexe === 'M' ? t('common.male') : t('common.female')}</span>
      });
    }
    if (visibleColumns.includes('telephone')) {
      cols.push({ key: 'telephone', header: t('agents.colPhone'),
        render: (_: any, row: Agent) => <span className="text-sm text-gray-600">{row.telephone || '-'}</span>
      });
    }
    if (visibleColumns.includes('province')) {
      cols.push({ key: 'province', header: t('agents.colProvince'),
        render: (_: any, row: Agent) => <span className="text-sm text-gray-600">{row.province || '-'}</span>
      });
    }
    if (visibleColumns.includes('statut')) {
      cols.push({ key: 'statut', header: t('agents.colStatus'),
        render: (_: any, row: Agent) => (
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${row.statut ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {row.statut ? t('common.active') : t('common.inactive')}
          </span>
        )
      });
    }
    if (visibleColumns.includes('actions')) {
      cols.push({ key: 'actions', header: '', render: (_: any, row: Agent) => (
        <div className="flex items-center space-x-1">
          <button onClick={() => navigate(`/agents/${row.id}`)} className="p-2 rounded-lg hover:bg-blue-50 transition" title={t('common.view')}>
            <FaEye className="text-blue-600" />
          </button>
          {canUpdate && (
            <button onClick={() => navigate(`/agents/edit/${row.id}`)} className="p-2 rounded-lg hover:bg-amber-50 transition" title={t('common.edit')}>
              <FaEdit className="text-amber-600" />
            </button>
          )}
          <button onClick={async () => {
            setPdfModal({ agent: {} as AgentDetailsResponse, loading: true });
            try {
              const details = await agentService.getAgentDetails(row.id);
              let photoBase64: string | undefined;
              if (details.photo) {
                try {
                  const url = details.photo.startsWith('http') ? details.photo : `${BACKEND_BASE_URL}${details.photo}`;
                  const resp = await fetch(url);
                  const blob = await resp.blob();
                  photoBase64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                  });
                } catch { /* ignore */ }
              }
              setPdfModal({ agent: details, loading: false, photoBase64 });
            } catch {
              setPdfModal(null);
            }
          }} className="p-2 rounded-lg hover:bg-purple-50 transition" title={t('agents.pdfTitle')}>
            <FaFilePdf className="text-purple-600" />
          </button>
          {canDelete && (
            <button onClick={() => setDeleteConfirm({ id: row.id, name: `${row.nom} ${row.prenom}` })}
              className="p-2 rounded-lg hover:bg-red-50 transition" title={t('common.delete')}>
              <FaTrash className="text-red-600" />
            </button>
          )}
        </div>
      )});
    }
    return cols;
  };

  if (loading) {
    return <AgentsListSkeleton />;
  }

  if (error) {
    return <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('agents.title')}</h1>
          <p className="text-sm text-gray-500">{totalElements} {t('agents.total')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportExcel} icon={<FaFileExcel />} className="text-green-600 border-green-300 hover:bg-green-50">{t('agents.exportExcel')}</Button>
          {canCreate && <Button variant="primary" onClick={() => navigate('/formagent')} icon={<FaPlus />} className="shadow-md">{t('agents.newAgent')}</Button>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('common.total')}</p>
          <p className="text-2xl font-black text-gray-800 mt-1">{totalElements}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <p className="text-xs font-semibold text-green-400 uppercase tracking-wider">{t('common.active')}</p>
          <p className="text-2xl font-black text-green-600 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">{t('common.inactive')}</p>
          <p className="text-2xl font-black text-red-600 mt-1">{filteredAgents.length - activeCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">{t('common.page')}</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{currentPage + 1}<span className="text-sm font-bold text-gray-400">/{totalPages}</span></p>
        </div>
      </div>

      {/* Table Card */}
      <Card className="shadow-md border-0">
        <CardHeader className="flex flex-col gap-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-800">{t('agents.listTitle')}</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input type="text" placeholder={t('common.search')} value={search} onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64" />
              </div>
              <div className="relative">
                <button onClick={() => setShowColumnPicker(!showColumnPicker)}
                  className={`p-2 rounded-lg border transition ${showColumnPicker ? 'bg-blue-50 border-blue-300 text-blue-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`} title={t('common.columns')}>
                  <FaColumns className="h-4 w-4" />
                </button>
                {showColumnPicker && (
                  <div className="absolute right-0 top-full mt-1 bg-white border rounded-xl shadow-lg p-3 z-50 w-48">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">{t('agents.showColumns')}</p>
                    {ALL_COLUMNS.map(col => (
                      <label key={col.key} className="flex items-center space-x-2 py-1 cursor-pointer hover:bg-gray-50 rounded px-1">
                        <input type="checkbox" checked={visibleColumns.includes(col.key)} onChange={() => toggleColumn(col.key)} className="rounded text-blue-600" />
                        <span className="text-sm text-gray-700">{t(col.label)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg border transition ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`} title={t('common.filters')}>
                <FaFilter className="h-4 w-4" />
              </button>
            </div>
          </div>
          {showFilters && (
            <div className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <select value={filterDirection} onChange={(e) => setFilterDirection(e.target.value)} className="px-3 py-1.5 text-sm border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">{t('common.allDirections')}</option>
                {directions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)} className="px-3 py-1.5 text-sm border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">{t('common.allGrades')}</option>
                {grades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value as any)} className="px-3 py-1.5 text-sm border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="all">{t('common.allStatus')}</option>
                <option value="active">{t('common.activeOnly')}</option>
                <option value="inactive">{t('common.inactiveOnly')}</option>
              </select>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition">
                  <FaTimes className="h-3 w-3" /> {t('common.clearFilters')}
                </button>
              )}
            </div>
          )}
        </CardHeader>
        <CardBody>
          <Table columns={buildColumns()} data={filteredAgents} bordered className="w-full" />
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t('common.rowsPerPage')}</span>
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(0); }}
                  className="px-2 py-1 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, totalElements)} {t('common.of')} {totalElements}</span>
                <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}
                  className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"><FaChevronLeft className="h-3 w-3 text-gray-600" /></button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageIdx = i;
                  if (totalPages > 7) {
                    if (currentPage < 3) pageIdx = i;
                    else if (currentPage > totalPages - 4) pageIdx = totalPages - 7 + i;
                    else pageIdx = currentPage - 3 + i;
                  }
                  return (
                    <button key={pageIdx} onClick={() => setCurrentPage(pageIdx)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition ${currentPage === pageIdx ? 'bg-blue-600 text-white shadow' : 'hover:bg-gray-100 text-gray-600'}`}>{pageIdx + 1}</button>
                  );
                })}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1}
                  className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"><FaChevronRight className="h-3 w-3 text-gray-600" /></button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* PDF Modal */}
      {pdfModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setPdfModal(null)}>
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPdfModal(null)} className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition">
              <FaTimes className="text-gray-500" />
            </button>
            <h3 className="text-lg font-bold mb-4 text-gray-800">{t('agents.pdfTitle')}</h3>
            {pdfModal.loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">{t('agents.pdfOf')} <strong>{pdfModal.agent.nom} {pdfModal.agent.prenom}</strong></p>
                <div className="flex justify-center">
                  <PDFDownloadLink
                    document={<FicheAgentPDF agent={pdfModal.agent} photoBase64={pdfModal.photoBase64} />}
                    fileName={`fiche_${pdfModal.agent.nom}_${pdfModal.agent.prenom}.pdf`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium shadow"
                  >
                    {({ loading }) => loading ? t('common.preparing') : t('common.downloadPdf')}
                  </PDFDownloadLink>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-bold mb-2">{t('agents.deleteConfirmTitle')}</h3>
            <p className="text-gray-600 mb-6">{t('agents.deleteConfirmText')} <strong>{deleteConfirm.name}</strong></p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>{t('common.cancel')}</Button>
              <Button variant="danger" onClick={handleDelete} isLoading={deleting}>{t('common.delete')}</Button>
            </div>
          </div>
        </div>
      )}

      {showColumnPicker && <div className="fixed inset-0 z-40" onClick={() => setShowColumnPicker(false)} />}
    </div>
  );
};

export default Agents;
