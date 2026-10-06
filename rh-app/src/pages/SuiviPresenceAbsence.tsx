import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next';
import { pdf } from '@react-pdf/renderer';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import Button from '../components/Button';
import Table from '../components/ui/Table';
import type { Column } from '../components/ui/Table';
import Pagination from '../components/ui/Pagination';
import Toast from '../components/Toast';
import { TableSkeleton } from '../components/ui/Skeleton';
import pointagesService from '../services/pointages.service';
import type { PresenceDuJour, AbsenceDuJour } from '../services/pointages.service';
import { directionService } from '../services/direction.service';
import type { Direction } from '../services/direction.service';
import RapportPresenceAbsencePDF from '../components/pdf/RapportPresenceAbsencePDF';
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

type PresenceRow = PresenceDuJour & { directionId: number; directionNom: string };
type AbsenceRow = AbsenceDuJour & { directionId: number; directionNom: string };

const toISO = (d: Date) => d.toISOString().split('T')[0];

const SuiviPresenceAbsence: React.FC = () => {
  const { t } = useTranslation();
  const today = new Date();
  const [debut, setDebut] = useState<string>(toISO(new Date(today.getFullYear(), today.getMonth(), 1)));
  const [fin, setFin] = useState<string>(toISO(today));
  const [directionId, setDirectionId] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'presences' | 'absences'>('presences');
  const [presences, setPresences] = useState<PresenceDuJour[]>([]);
  const [absences, setAbsences] = useState<AbsenceDuJour[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagePresences, setPagePresences] = useState(0);
  const [pageAbsences, setPageAbsences] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, a, dirs] = await Promise.all([
        pointagesService.getPresencesPeriode(debut, fin),
        pointagesService.getAbsencesPeriode(debut, fin),
        directionService.getAll(),
      ]);
      setPresences(p || []);
      setAbsences(a || []);
      setDirections(dirs || []);
    } catch (error) {
      console.error(error);
      showToast(t('suivi.loadError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debut, fin]);

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

  const matchDirection = (dirId?: number) => directionId === 'all' || dirId === Number(directionId);

  const presencesView = useMemo<PresenceRow[]>(
    () => presences
      .filter(p => matchSearch(p.agentNom, p.agentPrenom) && matchDirection(p.directionId))
      .map(p => ({ ...p, directionId: p.directionId ?? 0, directionNom: p.direction ?? '—' })),
    [presences, search, directionId]
  );

  const absencesView = useMemo<AbsenceRow[]>(
    () => absences
      .filter(a => matchSearch(a.agentNom, a.agentPrenom) && matchDirection(a.directionId))
      .map(a => ({ ...a, directionId: a.directionId ?? 0, directionNom: a.direction ?? '—' })),
    [absences, search, directionId]
  );

  const stats = useMemo(() => {
    const presents = presencesView.filter(p => p.statut === 'PRESENT' || p.statut === 'VALIDE').length;
    const retards = presencesView.filter(p => p.statut === 'RETARD').length;
    const absencesCount = absencesView.length;
    const totalSuivi = presents + retards + absencesCount;
    const taux = totalSuivi > 0 ? Math.round((presents / totalSuivi) * 100) : 0;
    const agents = new Set<number>([...presencesView.map(p => p.agentId), ...absencesView.map(a => a.agentId)]).size;
    return { presents, retards, absences: absencesCount, taux, agents, presences: presencesView.length };
  }, [presencesView, absencesView]);

  const directionLabel = directionId === 'all'
    ? t('common.allDirections')
    : (directions.find(d => d.id === Number(directionId))?.nom || '—');

  // Réinitialise la pagination quand les filtres changent
  useEffect(() => {
    setPagePresences(0);
    setPageAbsences(0);
  }, [debut, fin, search, directionId]);

  const pagedPresences = useMemo(
    () => presencesView.slice(pagePresences * pageSize, (pagePresences + 1) * pageSize),
    [presencesView, pagePresences, pageSize]
  );
  const pagedAbsences = useMemo(
    () => absencesView.slice(pageAbsences * pageSize, (pageAbsences + 1) * pageSize),
    [absencesView, pageAbsences, pageSize]
  );

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
      Zone: p.zone || '',
    })));
    XLSX.utils.book_append_sheet(wb, pSheet, 'Presences');

    const aSheet = XLSX.utils.json_to_sheet(absencesView.map(a => ({
      Agent: `${a.agentNom || ''} ${a.agentPrenom || ''}`.trim(),
      Direction: a.directionNom,
      Date: a.dateAbsence,
      Statut: a.statut,
    })));
    XLSX.utils.book_append_sheet(wb, aSheet, 'Absences');

    XLSX.writeFile(wb, `Suivi_Presences_Absences_${debut}_${fin}.xlsx`);
    showToast(t('suivi.excelDone'), 'success');
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
            absentsJour: stats.absences,
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
      showToast(t('suivi.pdfError'), 'error');
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
      header: t('suivi.agent'),
      sortable: true,
      render: (_, row) => <span className="font-medium text-gray-900 dark:text-slate-100">{row.agentNom} {row.agentPrenom}</span>,
    },
    { key: 'directionNom', header: t('common.direction'), sortable: true, render: (_, row) => <span className="text-gray-600 dark:text-slate-300">{row.directionNom}</span> },
    { key: 'datePresence', header: t('suivi.date'), sortable: true },
    { key: 'heureArrivee', header: t('suivi.arrival'), sortable: true, render: (h) => fmtHeure(h as string) },
    { key: 'heureDepart', header: t('suivi.departure'), sortable: true, render: (h) => fmtHeure(h as string) },
    { key: 'statut', header: t('common.status'), sortable: true, render: (s) => statutPresenceBadge(s as string) },
    { key: 'zone', header: 'Zone', render: (z) => <span className="text-gray-500">{z || '-'}</span> },
  ];

  const absenceColumns: Column<AbsenceRow>[] = [
    { key: 'id', header: '#', render: (_, _row, index) => (index !== undefined ? index + 1 : '') },
    {
      key: 'agentNom',
      header: t('suivi.agent'),
      sortable: true,
      render: (_, row) => <span className="font-medium text-gray-900 dark:text-slate-100">{row.agentNom} {row.agentPrenom}</span>,
    },
    { key: 'directionNom', header: t('common.direction'), sortable: true, render: (_, row) => <span className="text-gray-600 dark:text-slate-300">{row.directionNom}</span> },
    { key: 'dateAbsence', header: t('suivi.date'), sortable: true },
    {
      key: 'matricule',
      header: t('agents.colMatricule'),
      render: (_, row) => <span className="font-mono text-xs text-gray-500">{row.agentMatricule || '-'}</span>,
    },
    { key: 'statut', header: t('common.status'), sortable: true, render: (s) => statutPresenceBadge(s as string) },
  ];

  const cards = [
    { label: t('suivi.presences'), value: stats.presents, sub: t('suivi.subPresents'), icon: FaUserCheck, color: 'text-emerald-600', bg: 'from-emerald-500/10 to-teal-500/5' },
    { label: t('suivi.retards'), value: stats.retards, sub: t('suivi.subRetards'), icon: FaHourglassHalf, color: 'text-amber-600', bg: 'from-amber-500/10 to-orange-500/5' },
    { label: t('suivi.absencesDays'), value: stats.absences, sub: t('suivi.subAbsencesDays'), icon: FaUserTimes, color: 'text-rose-600', bg: 'from-rose-500/10 to-red-500/5' },
    { label: t('suivi.absencesFiles'), value: stats.presences, sub: t('suivi.subAbsencesFiles'), icon: FaCalendarCheck, color: 'text-red-600', bg: 'from-red-500/10 to-pink-500/5' },
    { label: t('suivi.agents'), value: stats.agents, sub: t('suivi.subAgents'), icon: FaUsers, color: 'text-indigo-600', bg: 'from-indigo-500/10 to-blue-500/5' },
    { label: t('suivi.rate'), value: `${stats.taux}%`, sub: t('suivi.subRate'), icon: FaChartLine, color: 'text-blue-600', bg: 'from-blue-500/10 to-cyan-500/5' },
  ];

  return (
    <div className="p-6">
      {/* Titre */}
      <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">{t('suivi.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {t('common.from')} <strong>{debut}</strong> — {t('common.to')} <strong>{fin}</strong> — {directionLabel} — {stats.presences} {t('suivi.presences')}, {stats.absences} {t('suivi.absences')}
          </p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" onClick={loadData} icon={<FaSync />}>{t('common.refresh')}</Button>
          <Button variant="outline" onClick={exportExcel} icon={<FaFileExcel />} className="text-emerald-700 border-emerald-300 hover:bg-emerald-50">{t('common.excel')}</Button>
          <Button variant="primary" onClick={printPdf} icon={<FaFilePdf />}>{t('common.print')}</Button>
        </div>
      </div>

      {/* Filtres */}
      <Card className="mb-6 print:hidden">
        <CardBody>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-slate-300">{t('common.from')}</label>
              <input type="date" value={debut} onChange={(e) => setDebut(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-800 dark:text-slate-100" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-slate-300">{t('common.to')}</label>
              <input type="date" value={fin} onChange={(e) => setFin(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-800 dark:text-slate-100" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-slate-300">{t('common.direction')}</label>
              <select value={directionId} onChange={(e) => setDirectionId(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-800 dark:text-slate-100 max-w-[240px]">
                <option value="all">{t('common.allDirections')}</option>
                {directions.map(d => <option key={d.id} value={d.id}>{d.sigle} - {d.nom}</option>)}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2 ml-auto">
              {([['jour', t('suivi.today')], ['semaine', t('suivi.days7')], ['mois', t('suivi.thisMonth')], ['trimestre', t('suivi.quarter')], ['annee', t('suivi.year')]] as const).map(([k, label]) => (
                <button key={k} onClick={() => applyPreset(k)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
                  {label}
                </button>
              ))}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input type="text" placeholder={t('common.searchAgent')} value={search} onChange={(e) => setSearch(e.target.value)}
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

      {/* Onglets */}
      <div className="flex gap-2 mb-4 print:hidden">
        <button onClick={() => setTab('presences')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === 'presences' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
          <FaClock className="inline mr-2" /> {t('suivi.presences')} ({presencesView.length})
        </button>
        <button onClick={() => setTab('absences')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === 'absences' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
          <FaUserTimes className="inline mr-2" /> {t('suivi.absences')} ({absencesView.length})
        </button>
      </div>

      {/* Présences */}
      <Card className={`${tab === 'presences' ? '' : 'hidden print:block'} print:border-0 print:shadow-none`}>
        <CardHeader><h2 className="text-lg font-semibold">{t('suivi.listPresences')} ({presencesView.length})</h2></CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="p-4"><TableSkeleton rows={6} /></div>
          ) : (
            <>
              <Table columns={presenceColumns} data={pagedPresences} bordered className="w-full print:overflow-visible" />
              <div className="px-4 print:hidden">
                <Pagination
                  page={pagePresences}
                  pageSize={pageSize}
                  totalItems={presencesView.length}
                  onPageChange={setPagePresences}
                  onPageSizeChange={(s) => { setPageSize(s); setPagePresences(0); setPageAbsences(0); }}
                />
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* Absences */}
      <Card className={`mt-6 ${tab === 'absences' ? '' : 'hidden print:block'} print:mt-6 print:border-0 print:shadow-none`}>
        <CardHeader><h2 className="text-lg font-semibold">{t('suivi.listAbsences')} ({absencesView.length})</h2></CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="p-4"><TableSkeleton rows={6} /></div>
          ) : (
            <>
              <Table columns={absenceColumns} data={pagedAbsences} bordered className="w-full print:overflow-visible" />
              <div className="px-4 print:hidden">
                <Pagination
                  page={pageAbsences}
                  pageSize={pageSize}
                  totalItems={absencesView.length}
                  onPageChange={setPageAbsences}
                  onPageSizeChange={(s) => { setPageSize(s); setPagePresences(0); setPageAbsences(0); }}
                />
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} duration={4000} />}
    </div>
  );
};

export default SuiviPresenceAbsence;
