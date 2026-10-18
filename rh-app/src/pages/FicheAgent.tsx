import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { agentService } from '../services/agents.service';
import { etudeService, type Etude } from '../services/etude.service';
import type { AgentDetailsResponse } from '../types/agent';
import { BACKEND_BASE_URL } from '../config/constants';
import { format } from 'date-fns';
import logo from '../assets/logo.png';
import Button from '../components/Button';
import { AgentDetailSkeleton } from '../components/ui/Skeleton';
import {
  FaArrowLeft, FaUser, FaBriefcase, FaMapMarkerAlt, FaUsers,
  FaGraduationCap, FaExchangeAlt, FaHistory, FaPhone, FaEnvelope, FaRing,
  FaTransgender, FaCalendarAlt, FaIdCard,
} from 'react-icons/fa';

const fmt = (d?: string | null) => {
  if (!d) return '—';
  const date = new Date(d);
  return isNaN(date.getTime()) ? '—' : format(date, 'dd/MM/yyyy');
};

const Field = ({ icon, label, value }: { icon?: React.ReactNode; label: string; value?: React.ReactNode }) => (
  <div className="flex items-start gap-3">
    {icon && <span className="mt-0.5 text-blue-500 dark:text-blue-400 shrink-0">{icon}</span>}
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide font-semibold text-gray-400 dark:text-slate-500">{label}</p>
      <p className="text-sm font-medium text-gray-900 dark:text-slate-100 break-words">{value ?? '—'}</p>
    </div>
  </div>
);

const Section = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <section className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
    <div className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 border-b border-gray-200 dark:border-slate-800">
      <span className="text-blue-600 dark:text-blue-400">{icon}</span>
      <h3 className="text-sm font-bold uppercase tracking-wide text-gray-800 dark:text-slate-100">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </section>
);

const Empty = ({ text }: { text: string }) => (
  <p className="text-sm text-gray-400 dark:text-slate-500 italic">{text}</p>
);

const FicheAgent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<AgentDetailsResponse | null>(null);
  const [etudes, setEtudes] = useState<Etude[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const fetched = await agentService.getAgentDetails(parseInt(id));
        setAgent(fetched);
        const data = await etudeService.getByAgentId(parseInt(id));
        setEtudes(data);
      } catch (e) {
        console.error('Erreur chargement fiche', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <AgentDetailSkeleton />;
  if (!agent) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg p-8 max-w-md mx-auto">
          <p className="text-red-600 dark:text-red-400 text-lg font-semibold mb-4">Agent non trouvé</p>
          <Button variant="primary" onClick={() => navigate('/agents')}>Retour à la liste</Button>
        </div>
      </div>
    );
  }

  const photoUrl = agent.photo
    ? (agent.photo.startsWith('http') ? agent.photo : `${BACKEND_BASE_URL}${agent.photo}`)
    : null;
  const fullName = `${agent.nom} ${agent.postnom} ${agent.prenom}`;

  return (
    <div className="p-4 sm:p-6 bg-slate-100 dark:bg-slate-950 min-h-screen print:bg-white print:p-0">
      {/* Barre d'actions */}
      <div className="max-w-4xl mx-auto flex items-center mb-5 print:hidden">
        <Button variant="ghost" onClick={() => navigate(`/agents/${agent.id}`)} className="text-gray-700 dark:text-slate-200">
          <FaArrowLeft className="mr-2" /> Retour
        </Button>
      </div>

      {/* Fiche */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-950 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-slate-800 print:shadow-none print:border-0 print:rounded-none">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-6 sm:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white !bg-white flex items-center justify-center shrink-0 ring-4 ring-white/30 overflow-hidden">
              <img src={logo} alt="DGRAD" className="h-14 w-14 object-contain rounded-full" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-widest text-blue-100">République Démocratique du Congo</p>
              <p className="text-sm font-semibold leading-tight">Direction Générale des Recettes Administratives, Judiciaires, Domaniales et de Participations</p>
              <h1 className="text-xl sm:text-2xl font-black tracking-wide mt-1">FICHE INDIVIDUELLE DE L'AGENT</h1>
            </div>
          </div>
        </div>

        {/* Profil */}
        <div className="px-6 sm:px-8 py-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start border-b border-gray-100 dark:border-slate-800">
          <div className="shrink-0">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={fullName}
                className="w-40 h-48 object-cover rounded-xl border-4 border-white dark:border-slate-800 shadow-lg ring-1 ring-gray-200 dark:ring-slate-700"
              />
            ) : (
              <div className="w-40 h-48 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-300 dark:text-slate-600 border-4 border-white dark:border-slate-800 shadow-lg">
                <FaUser className="w-16 h-16" />
              </div>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-black text-gray-900 dark:text-slate-100">{fullName}</h2>
            <p className="text-blue-700 dark:text-blue-400 font-semibold mt-1">
              {agent.gradeSigle ? `${agent.gradeSigle} - ${agent.gradeNom}` : '—'}
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
              {agent.fonctionNom}
              {agent.directionSigle ? ` • ${agent.directionSigle} - ${agent.directionNom}` : ''}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                <FaIdCard /> Matricule : {agent.matricule}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${agent.statut ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'}`}>
                {agent.statut ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-4 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Section icon={<FaUser />} title="Identité">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field icon={<FaIdCard />} label="Matricule" value={agent.matricule} />
                <Field icon={<FaTransgender />} label="Sexe" value={agent.sexe === 'M' ? 'Masculin' : 'Féminin'} />
                <Field icon={<FaCalendarAlt />} label="Date de naissance" value={fmt(agent.dateNaissance)} />
                <Field icon={<FaRing />} label="État civil" value={agent.etatCivil} />
                <Field icon={<FaEnvelope />} label="Email" value={agent.email} />
                <Field icon={<FaPhone />} label="Téléphone" value={agent.telephone} />
              </div>
            </Section>

            <Section icon={<FaBriefcase />} title="Carrière">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Grade" value={agent.gradeSigle ? `${agent.gradeSigle} - ${agent.gradeNom}` : '—'} />
                <Field label="Fonction" value={agent.fonctionNom} />
                <Field label="Direction" value={agent.directionSigle ? `${agent.directionSigle} - ${agent.directionNom}` : '—'} />
                <Field icon={<FaCalendarAlt />} label="Date d'engagement" value={fmt(agent.dateEngagement)} />
                <Field label="Référence engagement" value={agent.referenceEngagement} />
              </div>
            </Section>
          </div>

          <Section icon={<FaMapMarkerAlt />} title="Origine">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Province" value={agent.province} />
              <Field label="Territoire" value={agent.territoire} />
              <Field label="Village" value={agent.village} />
            </div>
          </Section>

          {agent.affiliations?.length > 0 && (
            <Section icon={<FaUsers />} title={`Affiliations (${agent.affiliations.length})`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {agent.affiliations.map((d) => (
                  <div key={d.id} className="rounded-lg border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-gray-900 dark:text-slate-100">{d.nom} {d.postnom} {d.prenom}</p>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">{d.relation}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      Né(e) le {fmt(d.dateNaissance)} à {d.lieuNaissance || '—'} • {d.statut ? 'Actif' : 'Inactif'}
                    </p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {etudes.length > 0 && (
            <Section icon={<FaGraduationCap />} title={`Études (${etudes.length})`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {etudes.map((e) => (
                  <div key={e.id} className="rounded-lg border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 p-3">
                    <p className="font-semibold text-gray-900 dark:text-slate-100">{e.etablissement}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{e.nombre_annee} an(s) • {e.lieu || '—'}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {agent.affectations?.length > 0 && (
            <Section icon={<FaExchangeAlt />} title={`Affectations (${agent.affectations.length})`}>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase text-gray-400 dark:text-slate-500 border-b border-gray-200 dark:border-slate-800">
                      <th className="py-2 pr-4 font-semibold">Direction</th>
                      <th className="py-2 pr-4 font-semibold">Début</th>
                      <th className="py-2 font-semibold">Fin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {agent.affectations.map((a) => (
                      <tr key={a.id} className="text-gray-700 dark:text-slate-300">
                        <td className="py-2 pr-4">{a.directionSigle} - {a.directionNom}</td>
                        <td className="py-2 pr-4">{fmt(a.dateDebut)}</td>
                        <td className="py-2">{a.dateFin ? fmt(a.dateFin) : <span className="text-emerald-600 dark:text-emerald-400 font-semibold">En cours</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {agent.promotions?.length > 0 && (
            <Section icon={<FaHistory />} title={`Promotions (${agent.promotions.length})`}>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase text-gray-400 dark:text-slate-500 border-b border-gray-200 dark:border-slate-800">
                      <th className="py-2 pr-4 font-semibold">Grade</th>
                      <th className="py-2 pr-4 font-semibold">Début</th>
                      <th className="py-2 pr-4 font-semibold">Fin</th>
                      <th className="py-2 font-semibold">Référence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {agent.promotions.map((p) => (
                      <tr key={p.id} className="text-gray-700 dark:text-slate-300">
                        <td className="py-2 pr-4">{p.gradeSigle} - {p.gradeNom}</td>
                        <td className="py-2 pr-4">{fmt(p.dateDebut)}</td>
                        <td className="py-2 pr-4">{p.dateFin ? fmt(p.dateFin) : <span className="text-blue-600 dark:text-blue-400 font-semibold">Actuel</span>}</td>
                        <td className="py-2">{p.reference || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {(!agent.affiliations?.length && !etudes.length && !agent.affectations?.length && !agent.promotions?.length) && (
            <Empty text="Aucune information complémentaire disponible." />
          )}
        </div>

        {/* Pied de page */}
        <div className="px-6 sm:px-8 py-5 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center text-xs text-gray-400 dark:text-slate-500">
          <span>Fiche générée le {format(new Date(), 'dd/MM/yyyy')}</span>
          <span className="font-semibold">GS-RH • DGRAD</span>
        </div>
      </div>
    </div>
  );
};

export default FicheAgent;
