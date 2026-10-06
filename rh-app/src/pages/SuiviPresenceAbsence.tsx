import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { pdf } from '@react-pdf/renderer';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import RapportPresenceAbsencePDF from '../components/pdf/RapportPresenceAbsencePDF';
import Button from '../components/Button';
import Table from '../components/ui/Table';
import type { Column } from '../components/ui/Table';
import Toast from '../components/Toast';
import { TableSkeleton } from '../components/ui/Skeleton';
import { presencesService } from '../services/presences.service';
import type { Presence } from '../services/presences.service';
import { absencesService } from '../services/absences.service';
import type { Absence } from '../services/absences.service';
import { directionService } from '../services/direction.service';
import type { Direction } from '../services/direction.service';
import { agentService } from '../services/agents.service';
import {
  FaSearch,
  FaSync,
  FaClock,
  FaUserCheck,
  FaUserTimes,
  FaHourglassHalf,
  FaCalendarCheck,
  FaUsers,
  FaChartLine,
  FaFilePdf,
  FaFileExcel,
} from 'react-icons/fa';

type PresenceRow = Presence & { directionId: number; directionNom: string };
type AbsenceRow = Absence & { directionId: number; directionNom: string };

const toISO = (d: Date) => d.toISOString().split('T')[0];

const SuiviPresenceAbsence: React.FC = () => {
  const today = new Date();
  const [debut, setDebut] = useState<string>(toISO(new Date(today.getFullYear(), today.getMonth(), 1)));
  const [fin, setFin] = useState<string>(toISO(today));
  const [directionId, setDirectionId] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'presences' | 'absences'>('presences');
  const [presences, setPresences] = useState<Presence[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [agentDirection, setAgentDirection] = useState<Record<number, { id: number; nom: string }>>({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, a, dirs, agents] = await Promise.all([
        presencesService.getAll(),
        absencesService.getAllWithoutPagination(),
        directionService.getAll(),
        agentService.getAllAgents(),
      ]);
      setPresences(p || []);
      setAbsences(a || []);
      setDirections(dirs || []);
      const map: Record<number, { id: number; nom: string }> = {};
      (agents || []).forEach(ag => {
        map[ag.id] = { id: ag.direction?.id ?? 0, nom: ag.direction?.nom ?? '—' };
      });
      setAgentDirection(map);
    } catch (error) {
      console.error(error);
      showToast('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyPreset = (preset: 'jour' | 'semaine' | 'mois' | 'trimestre' | 'annee') => {
    const now = new Date();
    if (preset === 'jour') {
      setDebut(toISO(now)); setFin(toISO(now));
    } else if (preset === 'semaine') {
      const d = new Date(now); d.setDate(now.getDate() - 6);
      setDebut(toISO(d)); setFin(toISO(now));
    } else if (preset === 'mois') {
      setDebut(toISO(new Date(now.getFullYear(), now.getMonth(), 1))); setFin(toISO(now));
    } else if (preset === 'trimestre') {
      const q = Math.floor(now.getMonth() / 3) * 3;
      setDebut(toISO(new Date(now.getFullYear(), q, 1))); setFin(toISO(now));
    } else {
      setDebut(toISO(new Date(now.getFullYear(), 0, 1))); setFin(toISO(now));
    }
  };

  const matchSearch = (nom?: string, prenom?: string) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return `${nom || ''} ${prenom || ''}`.toLowerCase().includes(s);
  };

  const dirOf = (idAgent: number) => agentDirection[idAgent] || { id: 0, nom: '—' };
  const matchDirection = (idAgent: number) => directionId === 'all' || dirOf(idAgent).id === Number(directionId);

  const presencesView = useMemo<PresenceRow[]>(
    () => presences
      .filter(p => p.datePresence >= debut && p.datePresence <= fin && matchSearch(p.agentNom, p.agentPrenom) && matchDirection(p.idAgent))
      .map(p => ({ ...p, directionId: dirOf(p.idAgent).id, directionNom: dirOf(p.idAgent).nom })),
    [presences, debut, fin, search, directionId, agentDirection]
  );

  const absencesView = useMemo<AbsenceRow[]>(
    () => absences
      .filter(a => a.dateDebut <= fin && a.dateFin >= debut && matchSearch(a.agentNom, a.agentPrenom) && matchDirection(a.idAgent))
      .map(a => ({ ...a, directionId: dirOf(a.idAgent).id, directionNom: dirOf(a.idAgent).nom })),
    [absences, debut, fin, search, directionId, agentDirection]
  );

  const stats = useMemo(() => {
    const presents = presencesView.filter(p => p.statut === 'PRESENT' || p.statut === 'VALIDE').length;
    const retards = presencesView.filter(p => p.statut === 'RETARD').length;
    const absentsJour = presencesView.filter(p => p.statut === 'ABSENT').length;
    const totalSuivi = presents + retards + absentsJour;
    const taux = totalSuivi > 0 ? Math.round((presents / totalSuivi) * 100) : 0;
    const agents = new Set<number>([...presencesView.map(p => p.idAgent), ...absencesView.map(a => a.idAgent)]).size;
    return { presents, retards, absentsJour, taux, agents, absences: absencesView.length, presences: presencesView.length };
  }, [presencesView, absencesView]);

  const directionLabel = directionId === 'all'
    ? 'Toutes les directions'
    : (directions.find(d => d.id === Number(directionId))?.nom || '—');

  // ---------- Export Excel ----------
  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    const pSheet = XLSX.utils.json_to_sheet(presencesView.map(p => ({
      Agent: `${p.agentNom || ''} ${p.agentPrenom || ''}`.trim(),
      Direction: p.directionNom,
      Date: p.datePresence,
      'Heure arrivée': p.heureArrivee ? String(p.heureArrivee).slice(0, 5) : '',
      'Heure départ': p.heureDepart ? String(p.heureDepart).slice(0, 5) : '',
      Statut: p.statut,
      Observation: p.observation || '',
    })));
    XLSX.utils.book_append_sheet(wb, pSheet, 'Presences');

    const aSheet = XLSX.utils.json_to_sheet(absencesView.map(a => ({
      Agent: `${a.agentNom || ''} ${a.agentPrenom || ''}`.trim(),
      Direction: a.directionNom,
      Du: a.dateDebut,
      Au: a.dateFin,
      Motif: a.motif || '',
      Justification: a.justification || '',
      Statut: a.statut ? 'Actif' : 'Inactif',
    })));
    XLSX.utils.book_append_sheet(wb, aSheet, 'Absences');

    XLSX.writeFile(wb, `Suivi_Presences_Absences_${debut}_${fin}.xlsx`);
    showToast('Export Excel généré', 'success');
  };

  // ---------- Impression / PDF (react-pdf + logo DGRAD) ----------
  const printPdf = async () => {
    try {
      const blob = await pdf(
        <RapportPresenceAbsencePDF
          debut={debut}
          fin={fin}
          directionLabel={directionLabel}
          stats={{
            presents: stats.presents,
            retards: stats.retards,
            absentsJour: stats.absentsJour,
            absences: stats.absences,
            agents: stats.agents,
            taux: stats.taux,
          }}
          presences={presencesView}
          absences={absencesView}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (!win) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `Rapport_Presences_Absences_${debut}_${fin}.pdf`;
        link.click();
      }
    } catch (e) {
      console.error(e);
      showToast('Erreur lors de la génération du PDF', 'error');
    }
  };

  const fmtHeure = (h?: string | null) => (h ? String(h).slice(0, 5) : '-');

  const statutPresenceBadge = (statut: string) => {
    const colors: Record<string, string> = {
      PRESENT: 'bg-emerald-100 text-emerald-700',
      VALIDE: 'bg-emerald-100 text-emerald-700',
      RETARD: 'bg-amber-100 text-amber-700',
      HORS_ZONE: 'bg-orange-100 text-orange-700',
      ABSENT: 'bg-rose-100 text-rose-700',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[statut] || 'bg-gray-100 text-gray-700'}`}>{statut}</span>;
  };

  const presenceColumns: Column<PresenceRow>[] = [
    { key: 'id', header: '#', render: (_, _row, index) => (index !== undefined ? index + 1 : '') },
    {
      key: 'agentNom',
      header: 'Agent',
      sortable: true,
      render: (_, row) => <span className="font-medium text-gray-900 dark:text-slate-100">{row.agentNom} {row.agentPrenom}</span>,
    },
    { key: 'directionNom', header: 'Direction', sortable: true, render: (_, row) => <span className="text-gray-600 dark:text-slate-300">{row.directionNom}</span> },
    { key: 'datePresence', header: 'Date', sortable: true },
    { key: 'heureArrivee', header: 'Arrivée', sortable: true, render: (h) => fmtHeure(h as string) },
    { key: 'heureDepart', header: 'Départ', sortable: true, render: (h) => fmtHeure(h as string) },
    { key: 'statut', header: 'Statut', sortable: true, render: (s) => statutPresenceBadge(s as string) },
    { key: 'observation', header: 'Observation', render: (o) => <span className="text-gray-500">{o || '-'}</span> },
  ];

  const absenceColumns: Column<AbsenceRow>[] = [
    { key: 'id', header: '#', render: (_, _row, index) => (index !== undefined ? index + 1 : '') },
    {
      key: 'agentNom',
      header: 'Agent',
      sortable: true,
      render: (_, row) => <span className="font-medium text-gray-900 dark:text-slate-100">{row.agentNom} {row.agentPrenom}</span>,
    },
    { key: 'directionNom', header: 'Direction', sortable: true, render: (_, row) => <span className="text-gray-600 dark:text-slate-300">{row.directionNom}</span> },
    { key: 'dateDebut', header: 'Du', sortable: true },
    { key: 'dateFin', header: 'Au', sortable: true },
    { key: 'motif', header: 'Motif', render: (m) => <span className="text-gray-500">{m || '-'}</span> },
    {
      key: 'statut',
      header: 'Statut',
      sortable: true,
      render: (s) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${s ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {s ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
  ];

  const cards = [
    { label: 'Présences', value: stats.presents, sub: 'Agents présents', icon: FaUserCheck, color: 'text-emerald-600', bg: 'from-emerald-500/10 to-teal-500/5' },
    { label: 'Retards', value: stats.retards, sub: 'Arrivées tardives', icon: FaHourglassHalf, color: 'text-amber-600', bg: 'from-amber-500/10 to-orange-500/5' },
    { label: 'Absences (jours)', value: stats.absentsJour, sub: 'Absences pointées', icon: FaUserTimes, color: 'text-rose-600', bg: 'from-rose-500/10 to-red-500/5' },
    { label: 'Absences (dossiers)', value: stats.absences, sub: 'Sur la période', icon: FaCalendarCheck, color: 'text-red-600', bg: 'from-red-500/10 to-pink-500/5' },
    { label: 'Agents concernés', value: stats.agents, sub: 'Distincts', icon: FaUsers, color: 'text-indigo-600', bg: 'from-indigo-500/10 to-blue-500/5' },
    { label: 'Taux de présence', value: `${stats.taux}%`, sub: 'Présents / suivi', icon: FaChartLine, color: 'text-blue-600', bg: 'from-blue-500/10 to-cyan-500/5' },
  ];

  return (
    <div className="p-6">
      {/* Titre (visible à l'impression aussi) */}
      <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Suivi des présences & absences</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Du <strong>{debut}</strong> au <strong>{fin}</strong> — {directionLabel} — {stats.presences} présence(s), {stats.absences} absence(s)
          </p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" onClick={loadData} icon={<FaSync />}>Actualiser</Button>
          <Button variant="outline" onClick={exportExcel} icon={<FaFileExcel />} className="text-emerald-700 border-emerald-300 hover:bg-emerald-50">Excel</Button>
          <Button variant="primary" onClick={printPdf} icon={<FaFilePdf />}>Imprimer / PDF</Button>
        </div>
      </div>

      {/* Filtres */}
      <Card className="mb-6 print:hidden">
        <CardBody>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-slate-300">Du</label>
              <input type="date" value={debut} onChange={(e) => setDebut(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-800 dark:text-slate-100" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-slate-300">Au</label>
              <input type="date" value={fin} onChange={(e) => setFin(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-800 dark:text-slate-100" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-slate-300">Direction</label>
              <select value={directionId} onChange={(e) => setDirectionId(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-800 dark:text-slate-100 max-w-[240px]">
                <option value="all">Toutes les directions</option>
                {directions.map(d => <option key={d.id} value={d.id}>{d.sigle} - {d.nom}</option>)}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2 ml-auto">
              {([['jour', "Aujourd'hui"], ['semaine', '7 jours'], ['mois', 'Ce mois'], ['trimestre', 'Trimestre'], ['annee', 'Année']] as const).map(([k, label]) => (
                <button key={k} onClick={() => applyPreset(k)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
                  {label}
                </button>
              ))}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input type="text" placeholder="Rechercher un agent..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-800 dark:text-slate-100 w-56" />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className={`bg-gradient-to-br ${c.bg} bg-white dark:bg-slate-900 border border-gray-200/60 dark:border-slate-800 rounded-2xl p-4 shadow-sm`}>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">{c.label}</p>
                <Icon className={`h-5 w-5 ${c.color}`} />
              </div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-slate-100 mt-2">{c.value}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{c.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Onglets (écran uniquement) */}
      <div className="flex gap-2 mb-4 print:hidden">
        <button onClick={() => setTab('presences')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === 'presences' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
          <FaClock className="inline mr-2" /> Présences ({presencesView.length})
        </button>
        <button onClick={() => setTab('absences')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === 'absences' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
          <FaUserTimes className="inline mr-2" /> Absences ({absencesView.length})
        </button>
      </div>

      {/* Présences */}
      <Card className={`${tab === 'presences' ? '' : 'hidden print:block'} print:border-0 print:shadow-none`}>
        <CardHeader><h2 className="text-lg font-semibold">Liste des présences ({presencesView.length})</h2></CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="p-4"><TableSkeleton rows={6} /></div>
          ) : (
            <Table columns={presenceColumns} data={presencesView} bordered className="w-full print:overflow-visible" />
          )}
        </CardBody>
      </Card>

      {/* Absences */}
      <Card className={`mt-6 ${tab === 'absences' ? '' : 'hidden print:block'} print:mt-6 print:border-0 print:shadow-none`}>
        <CardHeader><h2 className="text-lg font-semibold">Liste des absences ({absencesView.length})</h2></CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="p-4"><TableSkeleton rows={6} /></div>
          ) : (
            <Table columns={absenceColumns} data={absencesView} bordered className="w-full print:overflow-visible" />
          )}
        </CardBody>
      </Card>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} duration={4000} />}
    </div>
  );
};

export default SuiviPresenceAbsence;
