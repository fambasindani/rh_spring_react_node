import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { agentFormationsService } from '../services/agentFormations.service';
import type { AgentFormation } from '../services/agentFormations.service';
import Table from '../components/ui/Table';
import type { Column } from '../components/ui/Table';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import { FaSearch } from 'react-icons/fa';
import { TableSkeleton } from '../components/ui/Skeleton';

const MesFormations: React.FC = () => {
  const { user } = useAuth();
  const [inscriptions, setInscriptions] = useState<AgentFormation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const isAgent = user?.roles?.includes('AGENT') ?? false;
  const isAdminOrRH = user?.roles?.some(r => r === 'ADMIN' || r === 'RH') ?? false;

  useEffect(() => {
    const fetchInscriptions = async () => {
      try {
        const data = await agentFormationsService.getAllFormations();
        setInscriptions(data);
      } catch (err) {
        console.error(err);
        setError('Impossible de charger vos formations.');
      } finally {
        setLoading(false);
      }
    };
    fetchInscriptions();
  }, []);

  // Filtrage par recherche + restriction selon le rôle
  const filteredInscriptions = inscriptions
    .filter(ins =>
      (ins.formationIntitule || '')
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (ins.resultat || '')
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (ins.agentNom || '')
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .filter(ins => {
      if (isAgent) {
        // L'agent ne voit que ses propres inscriptions
        return ins.idAgent === user?.agentId;
      }
      return true; // Admin/RH voient tout
    });

  const columns: Column<AgentFormation>[] = [
    { key: 'id', header: '#', render: (_, _row, index) => index !== undefined ? index + 1 : '' },
    {
      key: 'formationIntitule',
      header: 'Formation',
      render: (_, row) => (
        <div>
          <p className="font-medium text-gray-900">{row.formationIntitule || '-'}</p>
          {isAdminOrRH && row.agentNom && (
            <p className="text-xs text-gray-500">
              Agent : {row.agentNom} {row.agentPrenom || ''}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'resultat',
      header: 'Résultat',
      render: (r) => r || '-'
    },
    {
      key: 'observation',
      header: 'Observation',
      render: (o) => o || '-'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <TableSkeleton rows={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mes formations</h1>
          <p className="text-sm text-gray-500">
            {filteredInscriptions.length} inscription(s)
          </p>
        </div>
      </div>

      <Card className="shadow-md border-0">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Liste de mes formations
          </h2>
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par formation, résultat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
            />
          </div>
        </CardHeader>
        <CardBody>
          <Table
            columns={columns}
            data={filteredInscriptions}
            bordered
            className="w-full"
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default MesFormations;