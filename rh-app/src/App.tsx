import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import { ThemeProvider } from './contexts/ThemeContext';
import { useAuth } from './hooks/useAuth';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import FormAgent from './pages/FormAgent';
import AgentDetails from './pages/AgentDetail';
import AgentEdit from './pages/AgentEdit';
import Fonctions from './pages/Fonctions';
import Directions from './pages/Directions';
import Grades from './pages/Grades';
import { useIdleTimeout } from './hooks/useIdleTimeout';
import Profile from './pages/Profile';
import Conges from './pages/Conges';
import Presences from './pages/Presences';
import Permissions from './pages/Permissions';
import Absences from './pages/Absences';
import Sanctions from './pages/Sanctions';
import Formations from './pages/Formations';
import MesFormations from './pages/MesFormations';
import Inscriptions from './pages/Inscriptions';
import Contrats from './pages/Contrats';
import Evaluations from './pages/Evaluations';
import Missions from './pages/Missions';
import Primes from './pages/Primes';
import Retraites from './pages/Retraites';
import Notifications from './pages/Notifications';
import Roles from './pages/Roles';
import Users from './pages/Users';
import Logs from './pages/Logs';
import Droits from './pages/Droits';
import Configuration from './pages/Configuration';
import PresenceDetail from './pages/PresenceDetail';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

function AppContent() {
  useIdleTimeout(10);
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="agents" element={<Agents />} />
        <Route path="formagent" element={<FormAgent />} />
        <Route path="agents/:id" element={<AgentDetails />} />
        <Route path="agents/edit/:id" element={<AgentEdit />} />
        <Route path="fonctions" element={<Fonctions />} />
        <Route path="directions" element={<Directions />} />
        <Route path="grades" element={<Grades />} />
        <Route path="profile" element={<Profile />} />

        <Route path="conges" element={<Conges />} />
        <Route path="presences" element={<Presences />} />
        <Route path="presences/detail/:agentId" element={<PresenceDetail />} />
        <Route path="permissions" element={<Permissions />} />
        <Route path="absences" element={<Absences />} />
        <Route path="sanctions" element={<Sanctions />} />
        <Route path="formations" element={<Formations />} />
        <Route path="mes-formations" element={<MesFormations />} />
        <Route path="inscriptions" element={<Inscriptions />} />
        <Route path="contrats" element={<Contrats />} />
        <Route path="evaluations" element={<Evaluations />} />
        <Route path="missions" element={<Missions />} />
        <Route path="primes" element={<Primes />} />
        <Route path="retraites" element={<Retraites />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="roles" element={<Roles />} />
        <Route path="users" element={<Users />} />
         <Route path="logs" element={<Logs />} />
         <Route path="droits" element={<Droits />} />
         <Route path="configuration" element={<Configuration />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter basename="/rh">
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;