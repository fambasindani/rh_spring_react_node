import React, { useState, useEffect } from 'react';
import { statisticsService } from '../services/statistics.service';
import type { DashboardStatistics } from '../types/dashboard';
import { agentService } from '../services/agents.service';
import type { Agent } from '../types/agent';
import api from '../types/api';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import {
  BriefcaseIcon,
  DocumentTextIcon,
  UserCircleIcon,
  UsersIcon,
  ChartBarIcon,
  MapPinIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  UserGroupIcon,
  EyeIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  BellIcon,
  CheckCircleIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const BACKEND_URL = api.defaults.baseURL?.replace(/\/api$/, '') || 'http://192.168.1.44:8083';

// Animations fluides
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] as [number, number, number, number] } }
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [latestAgents, setLatestAgents] = useState<Agent[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await statisticsService.getDashboard();
        setStats(data);
      } catch (err) {
        console.error(err);
        setError('Impossible de charger les statistiques.');
      } finally {
        setLoadingStats(false);
      }
    };

    const fetchLatestAgents = async () => {
      try {
        const allAgents = await agentService.getAllAgents();
        setLatestAgents(allAgents.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAgents(false);
      }
    };

    fetchStats();
    fetchLatestAgents();
  }, []);

  if (loadingStats || loadingAgents) {
    return <DashboardSkeleton />;
  }

  if (error || !stats) {
    return (
      <div className="bg-rose-50 border border-rose-100/80 text-rose-800 p-5 rounded-2xl flex items-center space-x-3 shadow-sm max-w-2xl mx-auto mt-12">
        <XCircleIcon className="h-6 w-6 text-rose-500 shrink-0" />
        <div className="flex flex-col">
          <span className="text-sm font-bold">Erreur système</span>
          <span className="text-xs text-rose-600/90 mt-0.5">{error || 'Échec de la synchronisation avec le serveur.'}</span>
        </div>
      </div>
    );
  }

  // Configuration Premium des Cartes KPI (Couleurs injectées de façon sécurisée pour Tailwind)
  const statBoxes = [
    { label: 'Effectif Global', value: stats.totalAgents, subtitle: 'Agents enregistrés', icon: UsersIcon, theme: 'from-blue-500/10 to-indigo-500/5 text-blue-600 ring-blue-500/10' },
    { label: 'Personnel Actif', value: stats.activeAgents, subtitle: 'En poste actuellement', icon: UserCircleIcon, theme: 'from-emerald-500/10 to-teal-500/5 text-emerald-600 ring-emerald-500/10' },
    { label: 'Directions', value: stats.totalDirections, subtitle: 'Structures internes', icon: BriefcaseIcon, theme: 'from-amber-500/10 to-orange-500/5 text-amber-600 ring-amber-500/10' },
    { label: 'Grades Indexés', value: stats.totalGrades, subtitle: 'Niveaux hiérarchiques', icon: DocumentTextIcon, theme: 'from-rose-500/10 to-red-500/5 text-rose-600 ring-rose-500/10' },
  ];

  const gradeData = Object.entries(stats.agentsByGrade || {});
  const directionData = Object.entries(stats.agentsByDirection || {});
  const hireData = stats.hireEvolution || [];
  const birthdayData = stats.birthdaysThisYear || [];
  const sexeData = Object.entries(stats.agentsBySexe || {});

  const totalAgents = stats.totalAgents || 0;
  const safePercent = (count: number) => (totalAgents > 0 ? (count / totalAgents) * 100 : 0);
  const maleCount = sexeData.find(([sexe]) => sexe === 'M' || sexe === 'Homme')?.[1] || 0;
  const femaleCount = sexeData.find(([sexe]) => sexe === 'F' || sexe === 'Femme')?.[1] || 0;
  const malePercent = totalAgents ? (maleCount / totalAgents) * 100 : 0;
  const femalePercent = totalAgents ? (femaleCount / totalAgents) * 100 : 0;

  const getMonthName = (month: number) => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    return months[month - 1];
  };

  const getPhotoUrl = (photoPath: string | undefined): string | undefined => {
    if (!photoPath) return undefined;
    return photoPath.startsWith('http') ? photoPath : `${BACKEND_URL}${photoPath}`;
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-8 max-w-[1600px] mx-auto p-1">
      
      {/* --- EN-TÊTE DU DASHBOARD --- */}
      <motion.div variants={itemVariants} className="flex flex-col space-y-1.5">
        <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
      </motion.div>

      {/* --- BLOCS KPI --- */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statBoxes.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.15 } }}
              className={`relative overflow-hidden bg-gradient-to-br ${stat.theme.split(' text-')[0]} bg-white border border-gray-200/60 rounded-2xl p-6 ring-1 ${stat.theme.split(' text-')[2]} shadow-sm hover:shadow-md transition-all duration-200`}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                  <p className="text-xs font-bold tracking-wider uppercase text-gray-400/90">{stat.label}</p>
                  <h3 className="text-4xl font-extrabold text-gray-900 tracking-tight">{stat.value}</h3>
                  <p className="text-xs text-gray-500 font-medium">{stat.subtitle}</p>
                </div>
                <div className={`p-3 rounded-xl bg-white shadow-sm ring-1 ring-gray-100 ${stat.theme.split(' ')[2]}`}>
                  <Icon className="h-5 w-5 stroke-[2]" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* --- GRAPHIQUE GENDER & REPARTITIONS --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Genre */}
        {sexeData.length > 0 && (
          <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm xl:col-span-1 flex flex-col justify-between">
            <div className="flex items-center space-x-2 pb-4 border-b border-gray-100">
              <UserGroupIcon className="h-4 w-4 text-gray-400" />
              <h2 className="text-sm font-bold tracking-tight text-gray-800 uppercase">Répartition par Genre</h2>
            </div>
            
            <div className="flex flex-col sm:flex-row xl:flex-col gap-6 justify-center items-center py-6">
              {/* Hommes */}
              <div className="flex items-center space-x-4 bg-gray-50/70 p-4 rounded-xl border border-gray-100 w-full max-w-[240px]">
                <div className="relative w-16 h-16 shrink-0">
                  <svg className="w-full h-full" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="16" fill="none" stroke="#E2E8F0" strokeWidth="4" />
                    <circle cx="20" cy="20" r="16" fill="none" stroke="#2563EB" strokeWidth="4" strokeDasharray={`${malePercent}, 100`} strokeLinecap="round" transform="rotate(-90 20 20)" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-gray-800">{malePercent.toFixed(0)}%</div>
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-800 block">Hommes</span>
                  <span className="text-xs font-semibold text-gray-400">{maleCount} agents</span>
                </div>
              </div>

              {/* Femmes */}
              <div className="flex items-center space-x-4 bg-gray-50/70 p-4 rounded-xl border border-gray-100 w-full max-w-[240px]">
                <div className="relative w-16 h-16 shrink-0">
                  <svg className="w-full h-full" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="16" fill="none" stroke="#E2E8F0" strokeWidth="4" />
                    <circle cx="20" cy="20" r="16" fill="none" stroke="#DB2777" strokeWidth="4" strokeDasharray={`${femalePercent}, 100`} strokeLinecap="round" transform="rotate(-90 20 20)" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-gray-800">{femalePercent.toFixed(0)}%</div>
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-800 block">Femmes</span>
                  <span className="text-xs font-semibold text-gray-400">{femaleCount} agentes</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Grades */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm xl:col-span-1">
          <div className="flex items-center space-x-2 pb-4 border-b border-gray-100 mb-5">
            <ChartBarIcon className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-bold tracking-tight text-gray-800 uppercase">Volume par Grades</h2>
          </div>
          <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
            {gradeData.map(([grade, count]) => (
              <div key={grade} className="group">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">{grade}</span>
                  <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">{count}</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gray-900 transition-all duration-500" style={{ width: `${safePercent(count)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Directions */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm xl:col-span-1">
          <div className="flex items-center space-x-2 pb-4 border-b border-gray-100 mb-5">
            <MapPinIcon className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-bold tracking-tight text-gray-800 uppercase">Volume par Directions</h2>
          </div>
          <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
            {directionData.map(([dir, count]) => (
              <div key={dir} className="group">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-gray-600 group-hover:text-gray-900 transition-colors truncate max-w-[200px]">{dir}</span>
                  <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{count}</span>
                </div>
                <div className="w-full bg-indigo-50 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-600 transition-all duration-500" style={{ width: `${safePercent(count)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* --- EVOLUTION & CALENDRIER --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recrutements */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm">
          <div className="flex items-center space-x-2 pb-4 border-b border-gray-100 mb-5">
            <ArrowTrendingUpIcon className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-bold tracking-tight text-gray-800 uppercase">Courbe d'engagements</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {hireData.map(({ year, count }) => (
              <div key={year} className="bg-gray-50/60 border border-gray-100 p-4 rounded-xl text-center">
                <span className="text-xs font-semibold text-gray-400 block mb-1">Année {year}</span>
                <span className="text-2xl font-black text-gray-800">{count}</span>
                <span className="text-[10px] text-gray-400 font-medium block mt-0.5">nouveaux agents</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Naissances */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm">
          <div className="flex items-center space-x-2 pb-4 border-b border-gray-100 mb-5">
            <CalendarIcon className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-bold tracking-tight text-gray-800 uppercase">Anniversaires à fêter</h2>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {birthdayData.map(({ month, count }) => (
              <div key={month} className="flex flex-col items-center bg-gray-50/50 min-w-[70px] py-3 rounded-xl border border-gray-100 shrink-0">
                <span className="text-xs font-bold text-gray-500 uppercase">{getMonthName(month)}</span>
                <span className={`mt-2 h-7 w-7 rounded-full text-xs font-bold flex items-center justify-center ${count > 0 ? 'bg-amber-500 text-white shadow-sm' : 'bg-gray-100 text-gray-400'}`}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* --- BARRE D'ALERTE RAPIDE --- */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="flex items-center space-x-3 bg-amber-50 border border-amber-200/60 rounded-xl p-4">
          <ClockIcon className="h-5 w-5 text-amber-500 shrink-0" />
          <div>
            <p className="text-lg font-black text-amber-700">{stats.pendingConges}</p>
            <p className="text-[10px] font-bold text-amber-500 uppercase">Congés en attente</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 bg-rose-50 border border-rose-200/60 rounded-xl p-4">
          <ExclamationTriangleIcon className="h-5 w-5 text-rose-500 shrink-0" />
          <div>
            <p className="text-lg font-black text-rose-700">{stats.todayAbsences}</p>
            <p className="text-[10px] font-bold text-rose-500 uppercase">Absences aujourd'hui</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 bg-emerald-50 border border-emerald-200/60 rounded-xl p-4">
          <CheckCircleIcon className="h-5 w-5 text-emerald-500 shrink-0" />
          <div>
            <p className="text-lg font-black text-emerald-700">{stats.todayPresences} <span className="text-xs font-bold text-emerald-500">({stats.todayPresencesRate}%)</span></p>
            <p className="text-[10px] font-bold text-emerald-500 uppercase">Présents aujourd'hui</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 bg-purple-50 border border-purple-200/60 rounded-xl p-4">
          <ExclamationTriangleIcon className="h-5 w-5 text-purple-500 shrink-0" />
          <div>
            <p className="text-lg font-black text-purple-700">{stats.totalSanctions}</p>
            <p className="text-[10px] font-bold text-purple-500 uppercase">Sanctions totales</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 bg-blue-50 border border-blue-200/60 rounded-xl p-4">
          <BellIcon className="h-5 w-5 text-blue-500 shrink-0" />
          <div>
            <p className="text-lg font-black text-blue-700">{stats.unreadNotifications}</p>
            <p className="text-[10px] font-bold text-blue-500 uppercase">Notifications non lues</p>
          </div>
        </div>
      </motion.div>

      {/* --- TABLEAU CORPORATE DES AGENTS --- */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/40 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></div>
            <h3 className="text-sm font-bold tracking-tight text-gray-800 uppercase">Dernières Inscriptions</h3>
          </div>
          <span className="text-xs font-bold text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-200/60">Flux récents</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/20 text-gray-400/90 text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left">Code Matricule</th>
                <th className="px-6 py-4 text-left">Agent & Identité</th>
                <th className="px-6 py-4 text-left">Grade</th>
                <th className="px-6 py-4 text-left">Fonction assignée</th>
                <th className="px-6 py-4 text-left">Statut</th>
                <th className="px-6 py-4 text-left">Prise de fonction</th>
                <th className="px-6 py-4 text-right w-20">Fiche</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-600 text-xs">
              {latestAgents.map((agent) => (
                <tr key={agent.id} className="hover:bg-gray-50/40 transition-colors duration-150 group">
                  <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-gray-400 group-hover:text-gray-600 transition-colors">{agent.matricule}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {agent.photo ? (
                        <img
                          src={getPhotoUrl(agent.photo)}
                          alt=""
                          className="h-9 w-9 rounded-xl object-cover mr-3 ring-1 ring-gray-100 shadow-sm"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.parentElement?.querySelector('.fallback-avatar');
                            if (fallback) fallback.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`h-9 w-9 rounded-xl bg-gradient-to-br from-gray-800 to-gray-950 text-white flex items-center justify-center font-bold text-xs tracking-wider mr-3 shadow-sm ${agent.photo ? 'fallback-avatar hidden' : ''}`}>
                        {(agent.nom?.[0] || '?')}{(agent.prenom?.[0] || '')}
                      </div>
                      <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{agent.nom} {agent.prenom}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-500">{agent.grade?.sigle || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-medium truncate max-w-[220px]">{agent.fonction?.nom || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {agent.statut ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/30">
                        Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-500">
                        Inactif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400 font-medium">
                    {new Date(agent.dateEngagement).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="text-gray-400 hover:text-gray-900 bg-gray-50 group-hover:bg-white p-2 rounded-xl ring-1 ring-gray-200/50 hover:ring-gray-300 shadow-sm transition-all duration-150">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {latestAgents.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 font-semibold uppercase tracking-wide bg-gray-50/10">Aucun enregistrement disponible</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* --- CONGÉS, ABSENCES & NOTIFICATIONS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Derniers congés */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/40 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-4 w-4 text-amber-500" />
              <h3 className="text-xs font-bold tracking-tight text-gray-800 uppercase">Derniers Congés</h3>
            </div>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{stats.pendingConges} en attente</span>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentConges && stats.recentConges.length > 0 ? stats.recentConges.map((c) => (
              <div key={c.id} className="px-5 py-3 hover:bg-gray-50/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-800">{c.agentNom} {c.agentPrenom}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{c.typeCongeNom} · {c.nombreJours}j</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    c.statut === 'ACCEPTE' ? 'bg-emerald-50 text-emerald-600' :
                    c.statut === 'REFUSE' ? 'bg-red-50 text-red-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>{c.statut === 'EN_ATTENTE' ? 'EN ATTENTE' : c.statut}</span>
                </div>
              </div>
            )) : (
              <div className="px-5 py-8 text-center">
                <InboxIcon className="h-8 w-8 text-gray-200 mx-auto" />
                <p className="text-[10px] font-semibold text-gray-300 mt-2 uppercase">Aucun congé récent</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Dernières absences */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/40 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-4 w-4 text-rose-500" />
              <h3 className="text-xs font-bold tracking-tight text-gray-800 uppercase">Dernières Absences</h3>
            </div>
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">{stats.todayAbsences} aujourd'hui</span>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentAbsences && stats.recentAbsences.length > 0 ? stats.recentAbsences.map((a) => (
              <div key={a.id} className="px-5 py-3 hover:bg-gray-50/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-800">{a.agentNom} {a.agentPrenom}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{a.dateDebut} → {a.dateFin}</p>
                  </div>
                  {a.motif && <span className="text-[9px] font-medium text-gray-400 max-w-[120px] truncate">{a.motif}</span>}
                </div>
              </div>
            )) : (
              <div className="px-5 py-8 text-center">
                <InboxIcon className="h-8 w-8 text-gray-200 mx-auto" />
                <p className="text-[10px] font-semibold text-gray-300 mt-2 uppercase">Aucune absence récente</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Dernières notifications */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/40 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BellIcon className="h-4 w-4 text-blue-500" />
              <h3 className="text-xs font-bold tracking-tight text-gray-800 uppercase">Notifications Récentes</h3>
            </div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{stats.unreadNotifications} non lues</span>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentNotifications && stats.recentNotifications.length > 0 ? stats.recentNotifications.map((n) => (
              <div key={n.id} className={`px-5 py-3 transition-colors ${n.lu ? 'bg-white hover:bg-gray-50/40' : 'bg-blue-50/30 hover:bg-blue-50/50'}`}>
                <div className="flex items-start justify-between space-x-2">
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-relaxed ${n.lu ? 'text-gray-500' : 'text-gray-800 font-semibold'}`}>{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{n.dateNotification}</p>
                  </div>
                  {!n.lu && <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1" />}
                </div>
              </div>
            )) : (
              <div className="px-5 py-8 text-center">
                <InboxIcon className="h-8 w-8 text-gray-200 mx-auto" />
                <p className="text-[10px] font-semibold text-gray-300 mt-2 uppercase">Aucune notification</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;