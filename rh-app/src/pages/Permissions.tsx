// src/pages/Permissions.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { permissionsService } from '../services/permissions.service';
import type { Permission } from '../services/permissions.service';
import type{ PageResponse } from '../services/permissions.service';
import Table from '../components/ui/Table';
import type { Column } from '../components/ui/Table';
import Button from '../components/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import PermissionModal from '../components/modal/PermissionModal';
import Toast from '../components/Toast';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { format } from 'date-fns';
import { debounce } from 'lodash';
import { TableSkeleton } from '../components/ui/Skeleton';

const Permissions: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; label: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadPermissions = async (page: number = 0, agentName: string = '') => {
    setLoading(true);
    try {
      const response: PageResponse<Permission> = await permissionsService.getAllPaginated(page, pageSize, agentName);
      setPermissions(response.content);
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
      loadPermissions(0, keyword);
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
    loadPermissions(0, '');
  }, []);

  const openAddModal = () => {
    setSelectedPermission(null);
    setIsModalOpen(true);
  };

  const openEditModal = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsModalOpen(true);
  };

  const handleSave = async (data: any) => {
    if (selectedPermission) {
      await permissionsService.update(selectedPermission.id, data);
      showToast('Permission modifiée avec succès', 'success');
    } else {
      await permissionsService.create(data);
      showToast('Permission ajoutée avec succès', 'success');
    }
    setIsModalOpen(false);
    await loadPermissions(currentPage, searchTerm);
  };

  const handleDeleteClick = (id: number, label: string) => {
    setDeleteConfirm({ id, label });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await permissionsService.delete(deleteConfirm.id);
      showToast('Permission supprimée avec succès', 'success');
      await loadPermissions(currentPage, searchTerm);
    } catch (error) {
      showToast('Erreur lors de la suppression', 'error');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      loadPermissions(newPage, searchTerm);
    }
  };

  const getStatutBadge = (statut: string) => {
    const colors: Record<string, string> = {
      EN_ATTENTE: 'bg-yellow-100 text-yellow-800',
      ACCEPTE: 'bg-green-100 text-green-800',
      REFUSE: 'bg-red-100 text-red-800',
      ANNULE: 'bg-gray-100 text-gray-800',
    };
    return <span className={`px-2 py-1 text-xs rounded-full ${colors[statut] || 'bg-gray-100'}`}>{statut}</span>;
  };

  const columns: Column<Permission>[] = [
    { key: 'id', header: '#', render: (_, _row, index) => index !== undefined ? index + 1 : '' },
    { key: 'agent', header: 'Agent', render: (_, row) => `${row.agentNom} ${row.agentPrenom}` },
    { key: 'datePermission', header: 'Date', render: (date) => format(new Date(date), 'dd/MM/yyyy') },
    { key: 'heureSortie', header: 'Sortie', render: (h) => h || '-' },
    { key: 'heureRetour', header: 'Retour', render: (h) => h || '-' },
    { key: 'motif', header: 'Motif', render: (m) => m || '-' },
    { key: 'statut', header: 'Statut', render: (statut) => getStatutBadge(statut) },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="ghost" onClick={() => openEditModal(row)}>
            <FaEdit className="text-amber-600" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDeleteClick(row.id, `${row.agentNom} ${row.agentPrenom}`)}>
            <FaTrash className="text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Permissions</h1>
          <p className="text-sm text-gray-500 mt-1">{totalElements} permission(s)</p>
        </div>
        <Button variant="primary" onClick={openAddModal} icon={<FaPlus />}>
          Nouvelle permission
        </Button>
      </div>

      {/* Barre de recherche */}
      <div className="mb-4 flex justify-end">
        <div className="relative w-64">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par agent..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {searching && <div className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin h-4 w-4 border-b-2 border-blue-600 rounded-full" />}
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Liste des permissions</h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <TableSkeleton rows={5} />
          ) : (
            <>
              <Table columns={columns} data={permissions} bordered className="w-full" />
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}>Précédent</Button>
                  <span className="text-sm text-gray-600">Page {currentPage + 1} / {totalPages}</span>
                  <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage + 1 >= totalPages}>Suivant</Button>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      <PermissionModal
        key={selectedPermission?.id || 'new'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        permission={selectedPermission}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">Supprimer la permission de <strong>{deleteConfirm.label}</strong> ?</p>
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

export default Permissions;