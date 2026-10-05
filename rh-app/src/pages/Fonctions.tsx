import React, { useState, useEffect } from 'react';
import { fonctionService } from '../services/fonction.service';
import type{ Fonction } from '../services/fonction.service';
import Table from '../components/ui/Table';
import type { Column } from '../components/ui/Table';
import Button from '../components/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import FonctionModal from '../components/modal/FonctionModal';
import Toast from '../components/Toast';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { TableSkeleton } from '../components/ui/Skeleton';

interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  last: boolean;
}

const Fonctions: React.FC = () => {
  const [fonctions, setFonctions] = useState<Fonction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFonction, setSelectedFonction] = useState<Fonction | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; nom: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadFonctions = async (page: number = 0) => {
    setLoading(true);
    try {
      let response: PageResponse<Fonction>;
      if (debouncedSearch) {
        response = await fonctionService.search(debouncedSearch, page, pageSize);
      } else {
        response = await fonctionService.getAllPaginated(page, pageSize);
      }
      setFonctions(response.content || []);
      setCurrentPage(response.pageNumber ?? 0);
      setTotalPages(response.totalPages ?? 0);
      setTotalElements(response.totalElements ?? 0);
    } catch (error) {
      console.error(error);
      showToast('Erreur lors du chargement des fonctions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFonctions(0);
  }, [debouncedSearch]);

  const openAddModal = () => {
    setSelectedFonction(null);
    setIsModalOpen(true);
  };

  const openEditModal = (fonction: Fonction) => {
    setSelectedFonction(fonction);
    setIsModalOpen(true);
  };

  const handleSave = async (fonctionData: Fonction) => {
    if (selectedFonction) {
      await fonctionService.update(selectedFonction.id, {
        nom: fonctionData.nom,
        statut: fonctionData.statut,
      });
      showToast('Fonction modifiée avec succès', 'success');
    } else {
      await fonctionService.create({
        nom: fonctionData.nom,
        statut: fonctionData.statut,
      });
      showToast('Fonction ajoutée avec succès', 'success');
    }
    setIsModalOpen(false);
    await loadFonctions(currentPage);
  };

  const handleDeleteClick = (id: number, nom: string) => {
    setDeleteConfirm({ id, nom });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await fonctionService.delete(deleteConfirm.id);
      showToast('Fonction supprimée avec succès', 'success');
      await loadFonctions(currentPage);
    } catch (error) {
      showToast('Erreur lors de la suppression', 'error');
      console.error(error);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      loadFonctions(newPage);
    }
  };

  const columns: Column<Fonction>[] = [
    { key: 'id', header: '#', render: (_, _row, index) => index !== undefined ? index + 1 : '' },
    { key: 'nom', header: 'Nom', sortable: true },
    {
      key: 'statut',
      header: 'Statut',
      sortable: true,
      render: (statut) => (
        <span className={`px-2 py-1 text-xs rounded-full ${statut ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {statut ? 'Actif' : 'Inactif'}
        </span>
      )
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="ghost" onClick={() => openEditModal(row)}>
            <FaEdit className="text-amber-600" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDeleteClick(row.id, row.nom)}>
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
          <h1 className="text-2xl font-bold text-gray-800">Gestion des fonctions</h1>
          <p className="text-sm text-gray-500 mt-1">{totalElements} fonction(s) au total</p>
        </div>
        <Button variant="primary" onClick={openAddModal} icon={<FaPlus />}>
          Nouvelle fonction
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-semibold">Liste des fonctions</h2>
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Rechercher une fonction..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64" />
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <TableSkeleton rows={5} />
          ) : (
            <>
              <Table columns={columns} data={fonctions} bordered className="w-full" />
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    Précédent
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage + 1 >= totalPages}
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      <FonctionModal
        key={selectedFonction?.id || 'new'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        fonction={selectedFonction || undefined}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Voulez-vous vraiment supprimer la fonction <strong>"{deleteConfirm.nom}"</strong> ?<br />
              Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
              <Button variant="danger" onClick={confirmDelete}>Supprimer</Button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}
    </div>
  );
};

export default Fonctions;