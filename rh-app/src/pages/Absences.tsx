import React, { useState, useEffect } from 'react';
import pointagesService from '../services/pointages.service';
import type { AbsenceDuJour } from '../services/pointages.service';
import Table from '../components/ui/Table';
import type { Column } from '../components/ui/Table';
import Button from '../components/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import Toast from '../components/Toast';
import { FaSearch, FaSync, FaUserTimes } from 'react-icons/fa';
import { TableSkeleton } from '../components/ui/Skeleton';

const Absences: React.FC = () => {
  const [absences, setAbsences] = useState<AbsenceDuJour[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadAbsences = async () => {
    setLoading(true);
    try {
      const data = await pointagesService.getAbsencesDuJour(selectedDate);
      setAbsences(data);
    } catch (error) {
      console.error(error);
      showToast('Erreur lors du chargement des absences', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAbsences();
  }, [selectedDate]);

  const filteredAbsences = absences.filter(a => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      a.agentNom?.toLowerCase().includes(search) ||
      a.agentPostnom?.toLowerCase().includes(search) ||
      a.agentPrenom?.toLowerCase().includes(search) ||
      a.agentMatricule?.toLowerCase().includes(search)
    );
  });

  const columns: Column<AbsenceDuJour>[] = [
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
    { key: 'direction', header: 'Direction', render: (d) => d || '-' },
    { key: 'grade', header: 'Grade', render: (g) => g || '-' },
    { key: 'fonction', header: 'Fonction', render: (f) => f || '-' },
    {
      key: 'statut',
      header: 'Statut',
      render: () => (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 flex items-center gap-1">
          <FaUserTimes className="h-3 w-3" /> ABSENT
        </span>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Absences du jour</h1>
          <p className="text-sm text-gray-500 mt-1">
            Agents qui n'ont pas effectué de pointage
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <Button variant="outline" onClick={loadAbsences} icon={<FaSync />}>
            Actualiser
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <FaUserTimes className="text-red-600 text-xl" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Total absents</div>
            <div className="text-2xl font-bold text-red-600">{filteredAbsences.length}</div>
          </div>
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
          <h2 className="text-lg font-semibold">Liste des absences</h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <TableSkeleton rows={5} />
          ) : filteredAbsences.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FaUserTimes className="mx-auto h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">Aucune absence enregistrée pour cette date</p>
            </div>
          ) : (
            <Table columns={columns} data={filteredAbsences} bordered className="w-full" />
          )}
        </CardBody>
      </Card>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} duration={4000} />}
    </div>
  );
};

export default Absences;
