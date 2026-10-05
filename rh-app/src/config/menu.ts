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
} from '@heroicons/react/24/outline';
import { FaGraduationCap, FaRegCalendarAlt, FaUserCheck, FaGavel, FaChalkboardTeacher, FaFileContract, FaStar, FaPlane } from 'react-icons/fa';

export interface MenuItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  droits: string[];
  children?: MenuItem[];
}

export const menuConfig: MenuItem[] = [
  {
    name: 'Tableau de bord',
    href: '/',
    icon: HomeIcon,
    droits: ['ADMIN', 'ALL_DASHBOARD']
  },
  {
    name: 'Gestion RH',
    icon: UsersIcon,
    droits: ['VIEW_AGENTS', 'CREATE_AGENT', 'UPDATE_AGENT', 'DELETE_AGENT', 'MANAGE_GRADES', 'MANAGE_FONCTIONS', 'MANAGE_DIRECTIONS'],
    children: [
      { name: 'Agents & Carrière', href: '/agents', icon: UsersIcon, droits: ['VIEW_AGENTS', 'CREATE_AGENT', 'UPDATE_AGENT', 'DELETE_AGENT'] },
      { name: 'Grades', href: '/grades', icon: FaGraduationCap, droits: ['MANAGE_GRADES'] },
      { name: 'Fonctions', href: '/fonctions', icon: BriefcaseIcon, droits: ['MANAGE_FONCTIONS'] },
      { name: 'Directions', href: '/directions', icon: DocumentTextIcon, droits: ['MANAGE_DIRECTIONS'] },
    ]
  },
  {
    name: 'Absences & Congés',
    icon: CalendarIcon,
    droits: ['VIEW_CONGES', 'CREATE_CONGE', 'VALIDATE_CONGES', 'VIEW_PRESENCES', 'MANAGE_PRESENCES', 'VIEW_ABSENCES', 'MANAGE_ABSENCES', 'VIEW_PERMISSIONS', 'MANAGE_PERMISSIONS', 'MANAGE_ZONES', 'MANAGE_HORAIRES', 'MANAGE_JOURS_FERIES'],
    children: [
      { name: 'Demandes de congé', href: '/conges', icon: FaRegCalendarAlt, droits: ['VIEW_CONGES', 'CREATE_CONGE', 'VALIDATE_CONGES'] },
      { name: 'Présences', href: '/presences', icon: ClockIcon, droits: ['VIEW_PRESENCES', 'MANAGE_PRESENCES'] },
      { name: 'Absences', href: '/absences', icon: ExclamationTriangleIcon, droits: ['VIEW_ABSENCES', 'MANAGE_ABSENCES'] },
      { name: 'Permissions', href: '/permissions', icon: FaUserCheck, droits: ['VIEW_PERMISSIONS', 'MANAGE_PERMISSIONS'] },
      { name: 'Configuration pointage', href: '/configuration', icon: Cog8ToothIcon, droits: ['MANAGE_ZONES', 'MANAGE_HORAIRES', 'MANAGE_JOURS_FERIES', 'ADMIN'] },
    ]
  },
  {
    name: 'Discipline & Sanctions',
    icon: FaGavel,
    droits: ['VIEW_SANCTIONS', 'MANAGE_SANCTIONS'],
    children: [
      { name: 'Sanctions', href: '/sanctions', icon: FaGavel, droits: ['VIEW_SANCTIONS', 'MANAGE_SANCTIONS'] },
    ]
  },
  {
    name: 'Formations',
    icon: AcademicCapIcon,
    droits: ['VIEW_FORMATIONS', 'MANAGE_FORMATIONS', 'VIEW_CATALOGUE_FORMATIONS', 'MANAGE_INSCRIPTIONS'],
    children: [
      { name: 'Catalogue formations', href: '/formations', icon: FaChalkboardTeacher,
        droits: ['VIEW_CATALOGUE_FORMATIONS', 'MANAGE_FORMATIONS'] },
      { name: 'Inscriptions', href: '/inscriptions', icon: FaChalkboardTeacher,
        droits: ['MANAGE_INSCRIPTIONS', 'MANAGE_FORMATIONS'] },
      { name: 'Mes formations', href: '/mes-formations', icon: FaChalkboardTeacher,
        droits: ['VIEW_FORMATIONS'] },
    ]
  },
  {
    name: 'Contrats & Évaluations',
    icon: DocumentTextIcon,
    droits: ['VIEW_CONTRATS', 'MANAGE_CONTRATS', 'VIEW_EVALUATIONS', 'MANAGE_EVALUATIONS'],
    children: [
      { name: 'Contrats', href: '/contrats', icon: FaFileContract, droits: ['VIEW_CONTRATS', 'MANAGE_CONTRATS'] },
      { name: 'Évaluations', href: '/evaluations', icon: FaStar, droits: ['VIEW_EVALUATIONS', 'MANAGE_EVALUATIONS'] },
    ]
  },
  {
    name: 'Missions & Primes',
    icon: TruckIcon,
    droits: ['VIEW_MISSIONS', 'MANAGE_MISSIONS', 'VIEW_PRIMES', 'MANAGE_PRIMES', 'VIEW_RETRAITES', 'MANAGE_RETRAITES'],
    children: [
      { name: 'Missions', href: '/missions', icon: FaPlane, droits: ['VIEW_MISSIONS', 'MANAGE_MISSIONS'] },
      { name: 'Primes', href: '/primes', icon: CurrencyDollarIcon, droits: ['VIEW_PRIMES', 'MANAGE_PRIMES'] },
      { name: 'Retraites', href: '/retraites', icon: HeartIcon, droits: ['VIEW_RETRAITES', 'MANAGE_RETRAITES'] },
    ]
  },
  {
    name: 'Notifications',
    href: '/notifications',
    icon: BellIcon,
    droits: ['VIEW_NOTIFICATIONS', 'MANAGE_NOTIFICATIONS']
  },
  {
    name: 'Paramètres',
    icon: Cog6ToothIcon,
    droits: ['VIEW_UTILISATEURS', 'MANAGE_UTILISATEURS', 'VIEW_ROLES', 'MANAGE_ROLES', 'VIEW_DROITS', 'MANAGE_DROITS', 'VIEW_LOGS'],
    children: [
      { name: 'Utilisateurs', href: '/users', icon: UserGroupIcon, droits: ['VIEW_UTILISATEURS', 'MANAGE_UTILISATEURS'] },
      { name: 'Rôles', href: '/roles', icon: ShieldCheckIcon, droits: ['VIEW_ROLES', 'MANAGE_ROLES'] },
      { name: 'Droits', href: '/droits', icon: KeyIcon, droits: ['VIEW_DROITS', 'MANAGE_DROITS'] },
      { name: 'Gestion des logs', href: '/logs', icon: ClipboardDocumentListIcon, droits: ['VIEW_LOGS'] },
    ]
  }
];
