import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { pdf } from '@react-pdf/renderer';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import Button from '../components/Button';
import Table from '../components/ui/Table';
import type { Column } from '../components/ui/Table';
import Pagination from '../components/ui/Pagination';
import { TableSkeleton } from '../components/ui/Skeleton';
import { agentService } from '../services/agents.service';
import type { Agent } from '../types/agent';
import { directionService } from '../services/direction.service';
import type { Direction } from '../services/direction.service';
import { gradeService } from '../services/grades.service';
import type { GradeResponse } from '../services/grades.service';
import SearchableSelect from '../components/SearchableSelect';
import { useAuth } from '../hooks/useAuth';
import RapportAgentsListePDF from '../components/pdf/RapportAgentsListePDF';
import { FaArrowLeft, FaSearch, FaSync, FaFileExcel, FaFilePdf } from 'react-icons/fa';

const AgentsListe: React.FC = () => {
  const [params, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = user?.roles?.includes('ADMIN') ?? false;
  const hasDroit = (d: string) => (user?.droits || []).includes(d);
  const canView = isAdmin || hasDroit('VIEW_AGENT_LISTS') || hasDroit('VIEW_AGENTS');

  const sexe = params.get('sexe') || undefined;
  const fonctionId = params.get('fonctionId') ? Number(params.get('fonctionId')) : undefined;
  const retraite = params.get('retraite') === 'true';

  const [directionId, setDirectionId] = useState<string>(params.get('directionId') || 'all');
  const [gradeId, setGradeId] = useState<number | null>(params.get('gradeId') ? Number(params.get('gradeId')) : null);
  const [gradeOptions, setGradeOptions] = useState<{ value: number; label: string }[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  useEffect(() => { directionService.getAll().then(setDirections).catch(() => {}); }, []);

  const loadGradeOptions = useCallback(async (input: string) => {
    try {
      const res = await gradeService.search(input || '', 0, 20);
      const opts = (res.content || []).map((g: GradeResponse) => ({ value: g.id, label: `${g.nom} (${g.sigle})` }));
      setGradeOptions(prev => {
        const merged = [...prev];
        opts.forEach(o => { if (!merged.some(m => m.value === o.value)) merged.push(o); });
        return merged;
      });
      return opts;
    } catch {
      return [];
    }
  }, []);

  const gradeParam = gradeId ?? undefined;

  const selectedGrade = gradeOptions.find(g => g.value === gradeId);
  const selectedDirection = directions.find(d => String(d.id) === directionId);
  const title = selectedGrade
    ? `Agents — ${selectedGrade.label}`
    : selectedDirection
      ? `Agents — ${selectedDirection.sigle} - ${selectedDirection.nom}`
      : params.get('title') || 'Liste des agents';

  const updateParams = useCallback((updates: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === null) next.delete(k);
      else next.set(k, v);
    });
    setSearchParams(next, { replace: true });
  }, [params, setSearchParams]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await agentService.searchAgents({
        keyword: search || undefined,
        sexe,
        gradeId: gradeParam,
        fonctionId,
        retraite: retraite ? true : undefined,
        directionId: directionId === 'all' ? undefined : Number(directionId),
        page,
        size: pageSize,
      });
      setAgents(res.content || []);
      setTotal(res.totalElements || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, sexe, gradeParam, fonctionId, retraite, directionId, page, pageSize]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(0); }, [search, directionId, gradeId]);

  const fetchAll = async (): Promise<Agent[]> => {
    const res = await agentService.searchAgents({
      keyword: search || undefined,
      sexe,
      gradeId: gradeParam,
      fonctionId,
      retraite: retraite ? true : undefined,
      directionId: directionId === 'all' ? undefined : Number(directionId),
      page: 0,
      size: 5000,
    });
    return res.content || [];
  };

  const exportExcel = async () => {
    try {
      const list = await fetchAll();
      const data = list.map(a => ({
        Matricule: a.matricule || '',
        Nom: a.nom || '',
        Postnom: a.postnom || '',
        Prenom: a.prenom || '',
        Sexe: a.sexe === 'M' ? 'Masculin' : a.sexe === 'F' ? 'Féminin' : '',
        Grade: a.grade?.sigle || '',
        Fonction: a.fonction?.nom || '',
        Direction: a.direction?.nom || '',
        Statut: a.statut ? 'Actif' : 'Inactif',
        'Date engagement': a.dateEngagement || '',
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Agents');
      XLSX.writeFile(wb, `agents_liste_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (e) {
      console.error(e);
    }
  };

  const printPdf = async () => {
    try {
      const list = await fetchAll();
      const blob = await pdf(<RapportAgentsListePDF title={title} agents={list} />).toBlob();
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (!win) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `liste_agents.pdf`;
        link.click();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const columns: Column<Agent>[] = [
    { key: 'id', header: '#', render: (_, _r, i) => (i !== undefined ? i + 1 : '') },
    { key: 'matricule', header: 'Matricule', sortable: true, render: (m) => <span className="font-mono text-sm">{m || '-'}</span> },
    {
      key: 'nom', header: 'Agent', sortable: true,
      render: (_, r) => <span className="font-medium text-gray-900 dark:text-slate-100">{r.nom} {r.postnom} {r.prenom}</span>,
    },
    { key: 'grade', header: 'Grade', sortable: true, render: (_, r) => r.grade?.sigle || '-' },
    { key: 'fonction', header: 'Fonction', sortable: true, render: (_, r) => r.fonction?.nom || '-' },
    { key: 'direction', header: 'Direction', sortable: true, render: (_, r) => r.direction?.nom || '-' },
    { key: 'sexe', header: 'Sexe', render: (s) => (s === 'M' ? 'Masculin' : s === 'F' ? 'Féminin' : '-') },
    {
      key: 'statut', header: 'Statut', sortable: true,
      render: (s) => <span className={`px-2 py-1 text-xs rounded-full ${s ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{s ? 'Actif' : 'Inactif'}</span>,
    },
    { key: 'dateEngagement', header: 'Engagement', sortable: true, render: (d) => d || '-' },
  ];

  if (!canView) {
    return (
      <div className="p-6">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl max-w-xl">
          Accès refusé : vous n'avez pas la permission de consulter cette liste.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
        <div className="flex items-start gap-2">
          <Button variant="ghost" onClick={() => navigate('/')} className="p-2 -ml-1" title="Retour"><FaArrowLeft /></Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 leading-tight">{title}</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{total} agent(s)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select value={directionId} onChange={(e) => { const val = e.target.value; setDirectionId(val); updateParams({ directionId: val === 'all' ? null : val }); }}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-800 dark:text-slate-100 max-w-[240px]">
            <option value="all">Toutes les directions</option>
            {directions.map(d => <option key={d.id} value={d.id}>{d.sigle} - {d.nom}</option>)}
          </select>
          <div className="w-60">
            <SearchableSelect
              options={gradeOptions}
              loadOptions={loadGradeOptions}
              value={gradeId}
              onChange={(v) => { setGradeId(v); updateParams({ gradeId: v ? String(v) : null, title: null }); }}
              placeholder="Tous les grades"
              containerClassName=""
            />
          </div>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input type="text" placeholder="Rechercher un agent..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-800 dark:text-slate-100 w-56" />
          </div>
          <Button variant="outline" onClick={load} icon={<FaSync />}>Actualiser</Button>
          <Button variant="outline" onClick={exportExcel} icon={<FaFileExcel />} className="text-emerald-700 border-emerald-300 hover:bg-emerald-50">Excel</Button>
          <Button variant="primary" onClick={printPdf} icon={<FaFilePdf />}>Imprimer / PDF</Button>
        </div>
      </div>

      <Card>
        <CardHeader><h2 className="text-lg font-semibold">{title} ({total})</h2></CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="p-4"><TableSkeleton rows={6} /></div>
          ) : (
            <>
              <Table columns={columns} data={agents} bordered className="w-full" />
              <div className="px-4">
                <Pagination page={page} pageSize={pageSize} totalItems={total}
                  onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(0); }} />
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default AgentsListe;
