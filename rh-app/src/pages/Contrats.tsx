// src/pages/Contrats.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { contratsService } from '../services/contrats.service';
import type { Contrat, PageResponse } from '../services/contrats.service';
import Table from '../components/ui/Table';
import type { Column } from '../components/ui/Table';
import Button from '../components/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import ContratModal from '../components/modal/ContratModal';
import Toast from '../components/Toast';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { format } from 'date-fns';
import { debounce } from 'lodash';
import { TableSkeleton } from '../components/ui/Skeleton';

const Contrats: React.FC = () => {
  const [contrats, setContrats] = useState<Contrat[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContrat, setSelectedContrat] = useState<Contrat | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; label: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadContrats = async (page: number = 0, keyword: string = '') => {
    setLoading(true);
    try {
      const response: PageResponse<Contrat> = await contratsService.getAll(page, pageSize, keyword);
      setContrats(response.content);
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
      loadContrats(0, keyword);
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
    loadContrats(0, '');
  }, []);

  const openAddModal = () => {
    setSelectedContrat(null);
    setIsModalOpen(true);
  };

  const openEditModal = (contrat: Contrat) => {
    setSelectedContrat(contrat);
    setIsModalOpen(true);
  };

  const handleSave = async (data: any) => {
    if (selectedContrat) {
      await contratsService.update(selectedContrat.id, data);
      showToast('Contrat modifié avec succès', 'success');
    } else {
      await contratsService.create(data);
      showToast('Contrat ajouté avec succès', 'success');
    }
    setIsModalOpen(false);
    await loadContrats(currentPage, searchTerm);
  };

  const handleDeleteClick = (id: number, label: string) => {
    setDeleteConfirm({ id, label });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await contratsService.delete(deleteConfirm.id);
      showToast('Contrat supprimé avec succès', 'success');
      await loadContrats(currentPage, searchTerm);
    } catch (error) {
      showToast('Erreur lors de la suppression', 'error');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      loadContrats(newPage, searchTerm);
    }
  };

  const getStatutBadge = (statut: string) => {
    const colors: Record<string, string> = {
      ACTIF: 'bg-green-100 text-green-800',
      EXPIRE: 'bg-red-100 text-red-800',
      RESILIE: 'bg-gray-100 text-gray-800',
    };
    return <span className={`px-2 py-1 text-xs rounded-full ${colors[statut] || 'bg-gray-100'}`}>{statut}</span>;
  };

  const columns: Column<Contrat>[] = [
    { key: 'id', header: '#', render: (_, _row, index) => index !== undefined ? index + 1 : '' },
    { key: 'agent', header: 'Agent', render: (_, row) => `${row.agentNom} ${row.agentPrenom}` },
    { key: 'typeContrat', header: 'Type' },
    { key: 'reference', header: 'Référence' },
    { key: 'dateDebut', header: 'Date début', render: (date) => format(new Date(date), 'dd/MM/yyyy') },
    { key: 'dateFin', header: 'Date fin', render: (date) => date ? format(new Date(date), 'dd/MM/yyyy') : '-' },
    { key: 'statut', header: 'Statut', render: (statut) => getStatutBadge(statut) },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="ghost" onClick={() => openEditModal(row)}>
            <FaEdit className="text-amber-600" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDeleteClick(row.id, `${row.agentNom} ${row.agentPrenom} - ${row.reference}`)}>
            <FaTrash className="text-red-600" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des contrats</h1>
          <p className="text-sm text-gray-500 mt-1">{totalElements} contrat(s)</p>
        </div>
        <Button variant="primary" onClick={openAddModal} icon={<FaPlus />}>
          Nouveau contrat
        </Button>
      </div>

      <div className="mb-4 flex justify-end">
        <div className="relative w-64">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par agent ou référence..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {searching && <div className="absolute right-3 top-1/2 animate-spin h-4 w-4 border-b-2 border-blue-600 rounded-full" />}
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Liste des contrats</h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <TableSkeleton rows={5} />
          ) : (
            <>
              <Table columns={columns} data={contrats} bordered className="w-full" />
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

      <ContratModal
        key={selectedContrat?.id || 'new'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        contrat={selectedContrat}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md">
            <h3 className="text-lg font-semibold mb-2">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">Supprimer le contrat <strong>{deleteConfirm.label}</strong> ? Cette action est irréversible.</p>
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

export default Contrats;