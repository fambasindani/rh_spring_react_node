import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { pdf } from '@react-pdf/renderer';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import Button from '../components/Button';
import Table from '../components/ui/Table';
import type { Column } from '../components/ui/Table';
import Pagination from '../components/ui/Pagination';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Toast from '../components/Toast';
import { TableSkeleton } from '../components/ui/Skeleton';
import { useAuth } from '../hooks/useAuth';
import { cartesService } from '../services/cartes.service';
import type { Carte, CarteStatut, CartePayload } from '../services/cartes.service';
import { agentService } from '../services/agents.service';
import type { Agent } from '../types/agent';
import { directionService } from '../services/direction.service';
import type { Direction } from '../services/direction.service';
import RapportCartesPDF from '../components/pdf/RapportCartesPDF';
import {
  FaPlus, FaSearch, FaSync, FaIdCard, FaUserCheck, FaHourglassHalf, FaUserTimes,
  FaCheck, FaBoxOpen, FaTrash, FaFileExcel, FaFilePdf,
} from 'react-icons/fa';

const STATUTS: { key: CarteStatut; label: string; color: string }[] = [
  { key: 'DEMANDE', label: 'Demandeurs', color: 'bg-amber-100 text-amber-700' },
  { key: 'RECUE', label: 'Accusés à valider', color: 'bg-blue-100 text-blue-700' },
  { key: 'VALIDEE', label: 'Détenteurs', color: 'bg-emerald-100 text-emerald-700' },
  { key: 'PERDUE', label: 'Cartes perdues', color: 'bg-rose-100 text-rose-700' },
];

const badge = (statut: CarteStatut) => {
  const s = STATUTS.find(x => x.key === statut);
  return <span className={`px-2 py-1 text-xs font-medium rounded-full ${s?.color || 'bg-gray-100 text-gray-700'}`}>{statut}</span>;
};

const Cartes: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ADMIN') ?? false;
  const canManage = isAdmin || (user?.droits || []).includes('MANAGE_CARTES') || (user?.droits || []).includes('ALL_CARTES');

  const [statut, setStatut] = useState<CarteStatut>('DEMANDE');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [directionId, setDirectionId] = useState<string>('all');
  const [directions, setDirections] = useState<Direction[]>([]);
  const [cartes, setCartes] = useState<Carte[]>([]);
  const [total, setTotal] = useState(0);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Modales
  const [showNew, setShowNew] = useState(false);
  const [receptionCarte, setReceptionCarte] = useState<Carte | null>(null);
  const [perteCarte, setPerteCarte] = useState<Carte | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'valider' | 'delete'; carte: Carte } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const timer = setTimeout(() => { setDebounced(search); setPage(0); }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [res, st] = await Promise.all([
        cartesService.getAll({ statut, keyword: debounced, directionId: directionId === 'all' ? undefined : directionId, page, size: pageSize }),
        cartesService.stats(),
      ]);
      setCartes(res.content || []);
      setTotal(res.totalElements || 0);
      setStats(st || {});
    } catch (e) {
      console.error(e);
      showToast('Erreur lors du chargement des cartes', 'error');
    } finally {
      setLoading(false);
    }
  }, [statut, debounced, page, pageSize, directionId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => { setPage(0); }, [statut, directionId]);

  useEffect(() => {
    agentService.getAllAgents().then(setAgents).catch(() => {});
    directionService.getAll().then(setDirections).catch(() => {});
  }, []);

  const loadAll = async (): Promise<Carte[]> => {
    const res = await cartesService.getAll({
      statut, keyword: debounced, directionId: directionId === 'all' ? undefined : directionId, page: 0, size: 5000,
    });
    return res.content || [];
  };

  const exportExcel = async () => {
    try {
      const list = await loadAll();
      const data = list.map(c => ({
        Agent: `${c.agentNom || ''} ${c.agentPostnom || ''} ${c.agentPrenom || ''}`.trim(),
        Matricule: c.agentMatricule || '',
        Direction: c.directionNom || '',
        'N° carte': c.numeroCarte || '',
        'Date demande': c.dateDemande || '',
        'Date réception': c.dateReception || '',
        'Date validation': c.dateValidation || '',
        Statut: c.statut,
        Observation: c.observation || '',
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Cartes');
      XLSX.writeFile(wb, `cartes_${statut}_${new Date().toISOString().slice(0, 10)}.xlsx`);
      showToast('Export Excel généré', 'success');
    } catch (e) {
      console.error(e);
      showToast("Erreur lors de l'export Excel", 'error');
    }
  };

  const printPdf = async () => {
    try {
      const list = await loadAll();
      const label = STATUTS.find(s => s.key === statut)?.label || statut;
      const blob = await pdf(<RapportCartesPDF statutLabel={label} cartes={list} stats={stats} />).toBlob();
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (!win) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `Rapport_Cartes_${statut}.pdf`;
        link.click();
      }
    } catch (e) {
      console.error(e);
      showToast('Erreur lors de la génération du PDF', 'error');
    }
  };

  const columns: Column<Carte>[] = [
    { key: 'id', header: '#', render: (_, _r, i) => (i !== undefined ? i + 1 : '') },
    {
      key: 'agentNom', header: 'Agent', sortable: true,
      render: (_, r) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-slate-100">{r.agentNom} {r.agentPostnom} {r.agentPrenom}</div>
          <div className="text-xs text-gray-400 font-mono">{r.agentMatricule || '-'}</div>
        </div>
      ),
    },
    { key: 'directionNom', header: 'Direction', sortable: true, render: (d) => d || '-' },
    { key: 'numeroCarte', header: 'N° carte', render: (n) => <span className="font-mono text-sm">{n || '-'}</span> },
    { key: 'dateDemande', header: 'Demande', sortable: true, render: (d) => d || '-' },
    { key: 'dateReception', header: 'Réception', sortable: true, render: (d) => d || '-' },
    { key: 'dateValidation', header: 'Validation', sortable: true, render: (d) => d || '-' },
    { key: 'statut', header: 'Statut', sortable: true, render: (s) => badge(s as CarteStatut) },
    {
      key: 'actions', header: 'Actions',
      render: (_, r) => (
        <div className="flex items-center gap-1">
          {r.statut === 'DEMANDE' && canManage && (
            <button onClick={() => setReceptionCarte(r)} title="Réceptionner (accusé)" className="p-2 rounded-lg hover:bg-blue-50 text-blue-600">
              <FaBoxOpen />
            </button>
          )}
          {r.statut === 'RECUE' && canManage && (
            <button onClick={() => setConfirmAction({ type: 'valider', carte: r })} title="Valider l'accusé de réception" className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600">
              <FaCheck />
            </button>
          )}
          {(r.statut === 'VALIDEE' || r.statut === 'DEMANDE') && canManage && (
            <button onClick={() => setPerteCarte(r)} title="Signaler une perte" className="p-2 rounded-lg hover:bg-amber-50 text-amber-600">
              <FaUserTimes />
            </button>
          )}
          {isAdmin && (
            <button onClick={() => setConfirmAction({ type: 'delete', carte: r })} title="Supprimer" className="p-2 rounded-lg hover:bg-red-50 text-red-600">
              <FaTrash />
            </button>
          )}
        </div>
      ),
    },
  ];

  const runConfirm = async () => {
    if (!confirmAction) return;
    const { type, carte } = confirmAction;
    try {
      if (type === 'valider') {
        await cartesService.valider(carte.id);
        showToast("Accusé de réception validé", 'success');
      } else {
        await cartesService.delete(carte.id);
        showToast('Carte supprimée', 'success');
      }
      load();
    } catch (e: any) {
      showToast(e?.response?.data?.message || 'Erreur lors de l\'opération', 'error');
    } finally {
      setConfirmAction(null);
    }
  };

  const cards = [
    { label: 'Demandeurs', value: stats.demandes ?? 0, icon: FaHourglassHalf, color: 'text-amber-600', bg: 'from-amber-500/10 to-orange-500/5' },
    { label: 'Accusés à valider', value: stats.recues ?? 0, icon: FaBoxOpen, color: 'text-blue-600', bg: 'from-blue-500/10 to-cyan-500/5' },
    { label: 'Détenteurs', value: stats.validees ?? 0, icon: FaUserCheck, color: 'text-emerald-600', bg: 'from-emerald-500/10 to-teal-500/5' },
    { label: 'Cartes perdues', value: stats.perdues ?? 0, icon: FaUserTimes, color: 'text-rose-600', bg: 'from-rose-500/10 to-red-500/5' },
  ];

  return (
    <div className="p-6">
      <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
            <FaIdCard className="text-blue-600" /> Gestion des cartes
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Demandes, réception des accusés, validation RH et pertes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={load} icon={<FaSync />}>Actualiser</Button>
          <Button variant="outline" onClick={exportExcel} icon={<FaFileExcel />} className="text-emerald-700 border-emerald-300 hover:bg-emerald-50">Excel</Button>
          <Button variant="primary" onClick={printPdf} icon={<FaFilePdf />}>Imprimer / PDF</Button>
          {canManage && <Button variant="primary" onClick={() => setShowNew(true)} icon={<FaPlus />}>Nouvelle demande</Button>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className={`bg-gradient-to-br ${c.bg} bg-white dark:bg-slate-900 border border-gray-200/60 dark:border-slate-800 rounded-2xl p-4 shadow-sm`}>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">{c.label}</p>
                <Icon className={`h-5 w-5 ${c.color}`} />
              </div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-slate-100 mt-2">{c.value}</p>
            </div>
          );
        })}
      </div>

      {/* Onglets + recherche */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {STATUTS.map(s => (
          <button key={s.key} onClick={() => setStatut(s.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${statut === s.key ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
            {s.label}
          </button>
        ))}
        <div className="flex items-center gap-2 ml-auto">
          <select value={directionId} onChange={(e) => setDirectionId(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-800 dark:text-slate-100 max-w-[240px]">
            <option value="all">Toutes les directions</option>
            {directions.map(d => <option key={d.id} value={d.id}>{d.sigle} - {d.nom}</option>)}
          </select>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input type="text" placeholder="Rechercher un agent..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-800 dark:text-slate-100 w-56" />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader><h2 className="text-lg font-semibold">{STATUTS.find(s => s.key === statut)?.label} ({total})</h2></CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="p-4"><TableSkeleton rows={6} /></div>
          ) : (
            <>
              <Table columns={columns} data={cartes} bordered className="w-full" />
              <div className="px-4">
                <Pagination page={page} pageSize={pageSize} totalItems={total}
                  onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(0); }} />
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* Modal nouvelle demande */}
      <NewCarteModal isOpen={showNew} onClose={() => setShowNew(false)} agents={agents}
        onSaved={() => { setShowNew(false); setStatut('DEMANDE'); setPage(0); load(); showToast('Demande enregistrée', 'success'); }}
        onError={(m) => showToast(m, 'error')} />

      {/* Modal réception (accusé) */}
      <ReceptionModal carte={receptionCarte} onClose={() => setReceptionCarte(null)}
        onSaved={() => { setReceptionCarte(null); load(); showToast('Réception enregistrée (en attente de validation)', 'success'); }}
        onError={(m) => showToast(m, 'error')} />

      {/* Modal perte */}
      <PerteModal carte={perteCarte} onClose={() => setPerteCarte(null)}
        onSaved={() => { setPerteCarte(null); load(); showToast('Perte signalée', 'success'); }}
        onError={(m) => showToast(m, 'error')} />

      {/* Confirmation (validation / suppression) */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-2">
              {confirmAction.type === 'valider' ? "Valider l'accusé de réception ?" : 'Confirmer la suppression'}
            </h3>
            <p className="text-gray-600 dark:text-slate-300 mb-6">
              {confirmAction.type === 'valider' ? (
                <>Confirmez que <strong>{confirmAction.carte.agentNom} {confirmAction.carte.agentPrenom}</strong> a bien déposé son accusé de réception. L'agent sera alors considéré comme <strong>détenteur</strong> de la carte.</>
              ) : (
                <>Supprimer la carte de <strong>{confirmAction.carte.agentNom} {confirmAction.carte.agentPrenom}</strong> ? Cette action est irréversible.</>
              )}
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmAction(null)}>Annuler</Button>
              <Button variant={confirmAction.type === 'valider' ? 'primary' : 'danger'} onClick={runConfirm}>
                {confirmAction.type === 'valider' ? 'Valider' : 'Supprimer'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} duration={4000} />}
    </div>
  );
};

/* ------------------------- Modales ------------------------- */

const NewCarteModal: React.FC<{ isOpen: boolean; onClose: () => void; agents: Agent[]; onSaved: () => void; onError: (m: string) => void }> = ({ isOpen, onClose, agents, onSaved, onError }) => {
  const [idAgent, setIdAgent] = useState('');
  const [observation, setObservation] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (isOpen) { setIdAgent(''); setObservation(''); } }, [isOpen]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idAgent) { onError('Sélectionnez un agent'); return; }
    setSaving(true);
    try {
      await cartesService.create({ idAgent: Number(idAgent), observation });
      onSaved();
    } catch (err: any) {
      onError(err?.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally { setSaving(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnBackdrop={false} title="Nouvelle demande de carte">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Agent demandeur</label>
          <select value={idAgent} onChange={(e) => setIdAgent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 text-sm">
            <option value="">-- Sélectionner un agent --</option>
            {agents.map(a => <option key={a.id} value={a.id}>{a.nom} {a.postnom} {a.prenom} ({a.matricule})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Observation</label>
          <textarea value={observation} onChange={(e) => setObservation(e.target.value)} rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Annuler</Button>
          <Button type="submit" variant="primary" isLoading={saving}>Enregistrer</Button>
        </div>
      </form>
    </Modal>
  );
};

const ReceptionModal: React.FC<{ carte: Carte | null; onClose: () => void; onSaved: () => void; onError: (m: string) => void }> = ({ carte, onClose, onSaved, onError }) => {
  const [numeroCarte, setNumeroCarte] = useState('');
  const [referenceAccuse, setReferenceAccuse] = useState('');
  const [observation, setObservation] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (carte) { setNumeroCarte(carte.numeroCarte || ''); setReferenceAccuse(''); setObservation(''); } }, [carte]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carte) return;
    setSaving(true);
    try {
      await cartesService.reception(carte.id, { numeroCarte, referenceAccuse, observation });
      onSaved();
    } catch (err: any) {
      onError(err?.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally { setSaving(false); }
  };

  return (
    <Modal isOpen={!!carte} onClose={onClose} closeOnBackdrop={false} title="Réception de la carte (accusé)">
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-slate-300">
          Agent : <strong>{carte?.agentNom} {carte?.agentPrenom}</strong>
        </p>
        <Input label="Numéro de carte" value={numeroCarte} onChange={(e) => setNumeroCarte(e.target.value)} placeholder="N° fourni par l'entreprise" />
        <Input label="Référence de l'accusé de réception" value={referenceAccuse} onChange={(e) => setReferenceAccuse(e.target.value)} placeholder="Ex: ACC-2026-001" />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Observation</label>
          <textarea value={observation} onChange={(e) => setObservation(e.target.value)} rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-400">La carte passera en « accusé à valider » : les RH devront valider.</p>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Annuler</Button>
          <Button type="submit" variant="primary" isLoading={saving}>Enregistrer la réception</Button>
        </div>
      </form>
    </Modal>
  );
};

const PerteModal: React.FC<{ carte: Carte | null; onClose: () => void; onSaved: () => void; onError: (m: string) => void }> = ({ carte, onClose, onSaved, onError }) => {
  const today = new Date().toISOString().split('T')[0];
  const [datePerte, setDatePerte] = useState(today);
  const [motifPerte, setMotifPerte] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (carte) { setDatePerte(today); setMotifPerte(''); } }, [carte]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carte) return;
    if (!motifPerte.trim()) { onError('Indiquez le motif de la perte'); return; }
    setSaving(true);
    try {
      await cartesService.perte(carte.id, { datePerte, motifPerte });
      onSaved();
    } catch (err: any) {
      onError(err?.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally { setSaving(false); }
  };

  return (
    <Modal isOpen={!!carte} onClose={onClose} closeOnBackdrop={false} title="Signaler une perte de carte">
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-slate-300">
          Agent : <strong>{carte?.agentNom} {carte?.agentPrenom}</strong>
        </p>
        <Input label="Date de perte" type="date" value={datePerte} onChange={(e) => setDatePerte(e.target.value)} />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Motif / circonstances</label>
          <textarea value={motifPerte} onChange={(e) => setMotifPerte(e.target.value)} rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Annuler</Button>
          <Button type="submit" variant="danger" isLoading={saving}>Signaler la perte</Button>
        </div>
      </form>
    </Modal>
  );
};

export default Cartes;
