import React, { useState, useEffect, useCallback } from 'react';
import { agentFormationsService } from '../services/agentFormations.service';
import type { AgentFormation, AgentFormationPayload, PageResponse } from '../services/agentFormations.service';
import Table from '../components/ui/Table';
import type { Column } from '../components/ui/Table';
import Button from '../components/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import InscriptionModal from '../components/modal/InscriptionModal';
import Toast from '../components/Toast';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { debounce } from 'lodash';
import { useAuth } from '../hooks/useAuth';
import { TableSkeleton } from '../components/ui/Skeleton';

const Inscriptions: React.FC = () => {
  const { user } = useAuth();
  const isAgent = user?.roles?.includes('AGENT') ?? false;
  const isAdminOrRH = user?.roles?.some(r => r === 'ADMIN' || r === 'RH') ?? false;
  const [inscriptions, setInscriptions] = useState<AgentFormation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInscription, setSelectedInscription] = useState<AgentFormation | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; label: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadInscriptions = async (page: number = 0, keyword: string = '') => {
    setLoading(true);
    try {
      let response: PageResponse<AgentFormation>;
      if (isAgent && user?.agentId) {
        response = await agentFormationsService.getByAgent(user.agentId, page, pageSize, keyword);
      } else {
        response = await agentFormationsService.getAll(page, pageSize, keyword);
      }
      setInscriptions(response.content);
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

  const debouncedSearch = useCallback(
    debounce((keyword: string) => {
      loadInscriptions(0, keyword);
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSearching(true);
    debouncedSearch(value);
    setSearching(false);
  };

  useEffect(() => {
    loadInscriptions(0, '');
  }, []);

  const openAddModal = () => {
    setSelectedInscription(null);
    setIsModalOpen(true);
  };

  const openEditModal = (inscription: AgentFormation) => {
    setSelectedInscription(inscription);
    setIsModalOpen(true);
  };

  const handleSave = async (data: AgentFormationPayload) => {
    if (selectedInscription) {
      await agentFormationsService.update(selectedInscription.id, data);
      showToast('Inscription modifiée avec succès', 'success');
    } else {
      await agentFormationsService.create(data);
      showToast('Inscription ajoutée avec succès', 'success');
    }
    setIsModalOpen(false);
    await loadInscriptions(currentPage, searchTerm);
  };

  const handleDeleteClick = (id: number, label: string) => {
    setDeleteConfirm({ id, label });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await agentFormationsService.delete(deleteConfirm.id);
      showToast('Inscription supprimée avec succès', 'success');
      await loadInscriptions(currentPage, searchTerm);
    } catch (error) {
      showToast('Erreur lors de la suppression', 'error');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      loadInscriptions(newPage, searchTerm);
    }
  };

  const columns: Column<AgentFormation>[] = [
    { key: 'id', header: '#', render: (_, _row, index) => index !== undefined ? index + 1 : '' },
    { key: 'agent', header: 'Agent', render: (_, row) => `${row.agentNom} ${row.agentPrenom}` },
    { key: 'formationIntitule', header: 'Formation' },
    { key: 'resultat', header: 'Résultat', render: (r) => r || '-' },
    { key: 'observation', header: 'Observation', render: (o) => o || '-' },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => isAdminOrRH ? (
        <div className="flex space-x-2">
          <Button size="sm" variant="ghost" onClick={() => openEditModal(row)}>
            <FaEdit className="text-amber-600" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDeleteClick(row.id, `${row.agentNom} ${row.agentPrenom} - ${row.formationIntitule}`)}>
            <FaTrash className="text-red-600" />
          </Button>
        </div>
      ) : <span className="text-gray-300 text-xs">-</span>
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{isAgent ? 'Mes inscriptions' : 'Gestion des inscriptions'}</h1>
          <p className="text-sm text-gray-500 mt-1">{totalElements} inscription(s)</p>
        </div>
        <Button variant="primary" onClick={openAddModal} icon={<FaPlus />}>
          Nouvelle inscription
        </Button>
      </div>

      <div className="mb-4 flex justify-end">
        <div className="relative w-64">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par agent ou formation..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {searching && <div className="absolute right-3 top-1/2 animate-spin h-4 w-4 border-b-2 border-blue-600 rounded-full" />}
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Liste des inscriptions</h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <TableSkeleton rows={5} />
          ) : (
            <>
              <Table columns={columns} data={inscriptions} bordered className="w-full" />
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

      <InscriptionModal
        key={selectedInscription?.id || 'new'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        inscription={selectedInscription}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md">
            <h3 className="text-lg font-semibold mb-2">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">Supprimer l’inscription de <strong>{deleteConfirm.label}</strong> ? Cette action est irréversible.</p>
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

export default Inscriptions;