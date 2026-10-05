import React, { useState, useEffect, useCallback } from 'react';
import { formationsService } from '../services/formations.service';
import type { Formation } from '../services/formations.service';
import type { PageResponse } from '../services/formations.service';
import Table from '../components/ui/Table';
import type { Column } from '../components/ui/Table';
import Button from '../components/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import FormationModal from '../components/modal/FormationModal';
import Toast from '../components/Toast';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { format } from 'date-fns';
import { debounce } from 'lodash';
import { useAuth } from '../hooks/useAuth';
import { agentFormationsService } from '../services/agentFormations.service'; // supposé exister
import { TableSkeleton } from '../components/ui/Skeleton';

const Formations: React.FC = () => {
  const { user } = useAuth();
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; intitule: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);

  const isAgent = user?.roles?.includes('AGENT') ?? false;
  const isAdminOrRH = user?.roles?.some(r => r === 'ADMIN' || r === 'RH') ?? false;

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadFormations = async (page: number = 0, keyword: string = '') => {
    setLoading(true);
    try {
      let response: PageResponse<Formation>;
      if (isAgent && user?.agentId) {
        // Si agent : récupérer ses formations (via service agentFormations)
        const agentFormations = await agentFormationsService.getByAgent(user.agentId, page, pageSize, keyword);
        // adapter la réponse pour qu'elle ressemble à PageResponse<Formation>
        response = {
          content: agentFormations.content as any,
          totalElements: agentFormations.totalElements,
          totalPages: agentFormations.totalPages,
          pageNumber: agentFormations.pageNumber,
          pageSize: pageSize,
          last: agentFormations.last ?? false
        };
      } else {
        // Admin/RH : toutes les formations
        response = await formationsService.getAll(page, pageSize, keyword);
      }
      setFormations(response.content);
      setCurrentPage(response.pageNumber);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error(error);
      showToast('Erreur lors du chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Redéclencher le chargement si le rôle change (par ex. après login)
  useEffect(() => {
    loadFormations(0, '');
  }, [user?.agentId]); // dépend de l'agentId pour recharge si changement

  const debouncedSearch = useCallback(
    debounce((keyword: string) => {
      loadFormations(0, keyword);
    }, 500),
    [user?.agentId] // dépend de l'agentId
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSearching(true);
    debouncedSearch(value);
    setSearching(false);
  };

  const openAddModal = () => {
    setSelectedFormation(null);
    setIsModalOpen(true);
  };

  const openEditModal = (formation: Formation) => {
    setSelectedFormation(formation);
    setIsModalOpen(true);
  };

  const handleSave = async (data: any) => {
    if (selectedFormation) {
      await formationsService.update(selectedFormation.id, data);
      showToast('Formation modifiée avec succès', 'success');
    } else {
      await formationsService.create(data);
      showToast('Formation ajoutée avec succès', 'success');
    }
    setIsModalOpen(false);
    await loadFormations(currentPage, searchTerm);
  };

  const handleDeleteClick = (id: number, intitule: string) => {
    setDeleteConfirm({ id, intitule });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await formationsService.delete(deleteConfirm.id);
      showToast('Formation supprimée avec succès', 'success');
      await loadFormations(currentPage, searchTerm);
    } catch (error) {
      showToast('Erreur lors de la suppression', 'error');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      loadFormations(newPage, searchTerm);
    }
  };

  const columns: Column<Formation>[] = [
    { key: 'id', header: '#', render: (_, _row, index) => index !== undefined ? index + 1 : '' },
    { key: 'intitule', header: 'Intitulé' },
    { key: 'organisme', header: 'Organisme', render: (o) => o || '-' },
    { key: 'lieu', header: 'Lieu', render: (l) => l || '-' },
    {
      key: 'dateDebut',
      header: 'Date début',
      render: (date) => date ? format(new Date(date as string), 'dd/MM/yyyy') : '-'
    },
    {
      key: 'dateFin',
      header: 'Date fin',
      render: (date) => date ? format(new Date(date as string), 'dd/MM/yyyy') : '-'
    },
    { key: 'description', header: 'Description', render: (d) => d || '-' },
    {
      key: 'statut',
      header: 'Statut',
      render: (statut) => (
        <span className={`px-2 py-1 text-xs rounded-full ${statut ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {statut ? 'Actif' : 'Inactif'}
        </span>
      )
    },
    {
      key: 'actions',
      header: '',
      render: (_, row) => (
        <div className="flex space-x-2">
          {isAdminOrRH && (
            <>
              <Button size="sm" variant="ghost" onClick={() => openEditModal(row)}>
                <FaEdit className="text-amber-600" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleDeleteClick(row.id, row.intitule)}>
                <FaTrash className="text-red-600" />
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isAgent ? 'Mes formations' : 'Catalogue des formations'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{totalElements} formation(s)</p>
        </div>
        {isAdminOrRH && (
          <Button variant="primary" onClick={openAddModal} icon={<FaPlus />}>
            Nouvelle formation
          </Button>
        )}
      </div>

      <div className="mb-4 flex justify-end">
        <div className="relative w-64">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par intitulé..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {searching && <div className="absolute right-3 top-1/2 animate-spin h-4 w-4 border-b-2 border-blue-600 rounded-full" />}
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Liste des formations</h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <TableSkeleton rows={5} />
          ) : (
            <>
              <Table columns={columns} data={formations} bordered className="w-full" />
              {totalPages > 1 && (
                <div className="flex justify-center gap-4 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}>Précédent</Button>
                  <span className="text-sm text-gray-600">Page {currentPage + 1} / {totalPages}</span>
                  <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage + 1 >= totalPages}>Suivant</Button>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      <FormationModal
        key={selectedFormation?.id || 'new'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        formation={selectedFormation}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md">
            <h3 className="text-lg font-semibold mb-2">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">Supprimer la formation <strong>"{deleteConfirm.intitule}"</strong> ? Cette action est irréversible.</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
              <Button variant="danger" onClick={confirmDelete}>Supprimer</Button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} duration={4000} />}
    </div>
  );
};

export default Formations;