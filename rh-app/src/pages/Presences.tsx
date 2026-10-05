import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import pointagesService from '../services/pointages.service';
import type { PresenceDuJour } from '../services/pointages.service';
import Table from '../components/ui/Table';
import type { Column } from '../components/ui/Table';
import Button from '../components/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import Toast from '../components/Toast';
import { FaSearch, FaSync, FaMapMarkerAlt, FaClock, FaMobileAlt, FaEye } from 'react-icons/fa';
import { TableSkeleton } from '../components/ui/Skeleton';

const Presences: React.FC = () => {
  const navigate = useNavigate();
  const [presences, setPresences] = useState<PresenceDuJour[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadPresences = async () => {
    setLoading(true);
    try {
      const data = await pointagesService.getPresencesDuJour(selectedDate);
      setPresences(data);
    } catch (error) {
      console.error(error);
      showToast('Erreur lors du chargement des présences', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPresences();
  }, [selectedDate]);

  const filteredPresences = presences.filter(p => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      p.agentNom?.toLowerCase().includes(search) ||
      p.agentPostnom?.toLowerCase().includes(search) ||
      p.agentPrenom?.toLowerCase().includes(search) ||
      p.agentMatricule?.toLowerCase().includes(search)
    );
  });

  const stats = {
    total: presences.length,
    presents: presences.filter(p => p.statut === 'PRESENT').length,
    retards: presences.filter(p => p.statut === 'RETARD').length,
    horsZone: presences.filter(p => p.statut === 'HORS_ZONE').length,
  };

  const getStatutBadge = (statut: string) => {
    const colors: Record<string, string> = {
      PRESENT: 'bg-green-100 text-green-800',
      RETARD: 'bg-yellow-100 text-yellow-800',
      HORS_ZONE: 'bg-orange-100 text-orange-800',
      ABSENT: 'bg-red-100 text-red-800',
      VALIDE: 'bg-green-100 text-green-800',
      REFUSE: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[statut] || 'bg-gray-100 text-gray-800'}`}>{statut}</span>;
  };

  const columns: Column<PresenceDuJour>[] = [
    { key: 'agentId', header: '#', render: (_, _row, index) => index !== undefined ? index + 1 : '' },
    {
      key: 'agent',
      header: 'Agent',
      render: (_, row) => (
        <div>
          <div className="font-medium text-gray-900">{row.agentNom} {row.agentPostnom}</div>
          <div className="text-sm text-gray-500">{row.agentPrenom}</div>
        </div>
      ),
    },
    { key: 'agentMatricule', header: 'Matricule', render: (m) => <span className="font-mono text-sm">{m || '-'}</span> },
    {
      key: 'heureArrivee',
      header: 'Arrivée',
      render: (h, row) => (
        <div className="flex items-center gap-2">
          {h ? (
            <>
              <FaClock className="text-blue-500 text-xs" />
              <span className="font-medium">{h}</span>
              {row.minutesRetard > 0 && (
                <span className="text-xs text-red-500">(+{row.minutesRetard}min)</span>
              )}
            </>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'heureDepart',
      header: 'Départ',
      render: (h) => (
        <div className="flex items-center gap-2">
          {h ? (
            <>
              <FaClock className="text-orange-500 text-xs" />
              <span className="font-medium">{h}</span>
            </>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    { key: 'statut', header: 'Statut', render: (statut) => getStatutBadge(statut as string) },
    {
      key: 'zone',
      header: 'Zone',
      render: (zone) => (
        <div className="flex items-center gap-1">
          <FaMapMarkerAlt className="text-xs text-gray-400" />
          <span className="text-sm">{zone || '-'}</span>
        </div>
      ),
    },
    {
      key: 'pointageArrivee',
      header: 'Source',
      render: (pa) => (
        pa ? (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
            <FaMobileAlt className="h-3 w-3" /> Mobile
          </span>
        ) : (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">Manuel</span>
        )
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (_, row) => (
        <button
          onClick={() => navigate(`/presences/detail/${row.agentId}?date=${selectedDate}`)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Voir les détails"
        >
          <FaEye className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Présences du jour</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pointages enregistrés via l'application mobile
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <Button variant="outline" onClick={loadPresences} icon={<FaSync />}>
            Actualiser
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Total agents</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Présents</div>
          <div className="text-2xl font-bold text-green-600">{stats.presents}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500">En retard</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.retards}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Hors zone</div>
          <div className="text-2xl font-bold text-orange-600">{stats.horsZone}</div>
        </div>
      </div>

      {/* Recherche */}
      <div className="mb-4 flex justify-end">
        <div className="relative w-64">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par agent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Liste des présences</h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <TableSkeleton rows={5} />
          ) : filteredPresences.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FaSearch className="mx-auto h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">Aucune présence enregistrée pour cette date</p>
            </div>
          ) : (
            <Table columns={columns} data={filteredPresences} bordered className="w-full" />
          )}
        </CardBody>
      </Card>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} duration={4000} />}
    </div>
  );
};

export default Presences;
