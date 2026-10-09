import { 
  HomeIcon, 
  UsersIcon, 
  BriefcaseIcon, 
  DocumentTextIcon,
  Cog6ToothIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  TruckIcon,
  HeartIcon,
  BellIcon,
  KeyIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  Cog8ToothIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { FaGraduationCap, FaRegCalendarAlt, FaUserCheck, FaGavel, FaChalkboardTeacher, FaFileContract, FaStar, FaPlane, FaIdCard } from 'react-icons/fa';

// NOTE: le champ "name" contient une clé de traduction (voir src/i18n/fr.json / en.json).
export interface MenuItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  droits: string[];
  children?: MenuItem[];
}

export const menuConfig: MenuItem[] = [
  {
    name: 'nav.dashboard',
    href: '/',
    icon: HomeIcon,
    droits: ['ADMIN', 'ALL_DASHBOARD']
  },
  {
    name: 'nav.gestionRh',
    icon: UsersIcon,
    droits: ['VIEW_AGENTS', 'CREATE_AGENT', 'UPDATE_AGENT', 'DELETE_AGENT', 'MANAGE_GRADES', 'MANAGE_FONCTIONS', 'MANAGE_DIRECTIONS'],
    children: [
      { name: 'nav.agents', href: '/agents', icon: UsersIcon, droits: ['VIEW_AGENTS', 'CREATE_AGENT', 'UPDATE_AGENT', 'DELETE_AGENT'] },
      { name: 'nav.grades', href: '/grades', icon: FaGraduationCap, droits: ['MANAGE_GRADES'] },
      { name: 'nav.fonctions', href: '/fonctions', icon: BriefcaseIcon, droits: ['MANAGE_FONCTIONS'] },
      { name: 'nav.directions', href: '/directions', icon: DocumentTextIcon, droits: ['MANAGE_DIRECTIONS'] },
    ]
  },
  {
    name: 'nav.cartes',
    href: '/cartes',
    icon: FaIdCard,
    droits: ['VIEW_CARTES', 'MANAGE_CARTES', 'ADMIN'],
  },
  {
    name: 'nav.absencesConges',
    icon: CalendarIcon,
    droits: ['VIEW_CONGES', 'CREATE_CONGE', 'VALIDATE_CONGES', 'VIEW_PRESENCES', 'MANAGE_PRESENCES', 'VIEW_ABSENCES', 'MANAGE_ABSENCES', 'VIEW_PERMISSIONS', 'MANAGE_PERMISSIONS', 'MANAGE_ZONES', 'MANAGE_HORAIRES', 'MANAGE_JOURS_FERIES'],
    children: [
      { name: 'nav.suivi', href: '/suivi-presences', icon: ChartBarIcon, droits: ['VIEW_PRESENCES', 'MANAGE_PRESENCES', 'VIEW_ABSENCES', 'MANAGE_ABSENCES'] },
      { name: 'nav.conges', href: '/conges', icon: FaRegCalendarAlt, droits: ['VIEW_CONGES', 'CREATE_CONGE', 'VALIDATE_CONGES'] },
      { name: 'nav.presences', href: '/presences', icon: ClockIcon, droits: ['VIEW_PRESENCES', 'MANAGE_PRESENCES'] },
      { name: 'nav.absences', href: '/absences', icon: ExclamationTriangleIcon, droits: ['VIEW_ABSENCES', 'MANAGE_ABSENCES'] },
      { name: 'nav.permissions', href: '/permissions', icon: FaUserCheck, droits: ['VIEW_PERMISSIONS', 'MANAGE_PERMISSIONS'] },
      { name: 'nav.configuration', href: '/configuration', icon: Cog8ToothIcon, droits: ['MANAGE_ZONES', 'MANAGE_HORAIRES', 'MANAGE_JOURS_FERIES', 'ADMIN'] },
    ]
  },
  {
    name: 'nav.discipline',
    icon: FaGavel,
    droits: ['VIEW_SANCTIONS', 'MANAGE_SANCTIONS'],
    children: [
      { name: 'nav.sanctions', href: '/sanctions', icon: FaGavel, droits: ['VIEW_SANCTIONS', 'MANAGE_SANCTIONS'] },
    ]
  },
  {
    name: 'nav.formations',
    icon: AcademicCapIcon,
    droits: ['VIEW_FORMATIONS', 'MANAGE_FORMATIONS', 'VIEW_CATALOGUE_FORMATIONS', 'MANAGE_INSCRIPTIONS'],
    children: [
      { name: 'nav.catalogue', href: '/formations', icon: FaChalkboardTeacher,
        droits: ['VIEW_CATALOGUE_FORMATIONS', 'MANAGE_FORMATIONS'] },
      { name: 'nav.inscriptions', href: '/inscriptions', icon: FaChalkboardTeacher,
        droits: ['MANAGE_INSCRIPTIONS', 'MANAGE_FORMATIONS'] },
      { name: 'nav.mesFormations', href: '/mes-formations', icon: FaChalkboardTeacher,
        droits: ['VIEW_FORMATIONS'] },
    ]
  },
  {
    name: 'nav.contratsEvaluations',
    icon: DocumentTextIcon,
    droits: ['VIEW_CONTRATS', 'MANAGE_CONTRATS', 'VIEW_EVALUATIONS', 'MANAGE_EVALUATIONS'],
    children: [
      { name: 'nav.contrats', href: '/contrats', icon: FaFileContract, droits: ['VIEW_CONTRATS', 'MANAGE_CONTRATS'] },
      { name: 'nav.evaluations', href: '/evaluations', icon: FaStar, droits: ['VIEW_EVALUATIONS', 'MANAGE_EVALUATIONS'] },
    ]
  },
  {
    name: 'nav.missionsPrimes',
    icon: TruckIcon,
    droits: ['VIEW_MISSIONS', 'MANAGE_MISSIONS', 'VIEW_PRIMES', 'MANAGE_PRIMES', 'VIEW_RETRAITES', 'MANAGE_RETRAITES'],
    children: [
      { name: 'nav.missions', href: '/missions', icon: FaPlane, droits: ['VIEW_MISSIONS', 'MANAGE_MISSIONS'] },
      { name: 'nav.primes', href: '/primes', icon: CurrencyDollarIcon, droits: ['VIEW_PRIMES', 'MANAGE_PRIMES'] },
      { name: 'nav.retraites', href: '/retraites', icon: HeartIcon, droits: ['VIEW_RETRAITES', 'MANAGE_RETRAITES'] },
    ]
  },
  {
    name: 'nav.notifications',
    href: '/notifications',
    icon: BellIcon,
    droits: ['VIEW_NOTIFICATIONS', 'MANAGE_NOTIFICATIONS']
  },
  {
    name: 'nav.parametres',
    icon: Cog6ToothIcon,
    droits: ['VIEW_UTILISATEURS', 'MANAGE_UTILISATEURS', 'VIEW_ROLES', 'MANAGE_ROLES', 'VIEW_DROITS', 'MANAGE_DROITS', 'VIEW_LOGS'],
    children: [
      { name: 'nav.utilisateurs', href: '/users', icon: UserGroupIcon, droits: ['VIEW_UTILISATEURS', 'MANAGE_UTILISATEURS'] },
      { name: 'nav.roles', href: '/roles', icon: ShieldCheckIcon, droits: ['VIEW_ROLES', 'MANAGE_ROLES'] },
      { name: 'nav.droits', href: '/droits', icon: KeyIcon, droits: ['VIEW_DROITS', 'MANAGE_DROITS'] },
      { name: 'nav.logs', href: '/logs', icon: ClipboardDocumentListIcon, droits: ['VIEW_LOGS'] },
    ]
  }
];
