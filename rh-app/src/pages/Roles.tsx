import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, KeyIcon } from '@heroicons/react/24/outline';
import { roleService } from '../services/roles.service';
import type { Role } from '../types/role';
import RoleModal from '../components/modal/RoleModal';
import RolesDroitsModal from '../components/modal/RolesDroitsModal';
import Button from '../components/Button';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import Table from '../components/ui/Table';
import type { Column } from '../components/ui/Table';
import { useAuth } from '../hooks/useAuth';
import Toast from '../components/Toast';
import { FaChevronLeft, FaChevronRight, FaArrowRight } from 'react-icons/fa';
import { TableSkeleton } from '../components/ui/Skeleton';

const Roles: React.FC = () => {
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [droitsModalOpen, setDroitsModalOpen] = useState(false);
  const [selectedRoleForDroits, setSelectedRoleForDroits] = useState<Role | null>(null);
  const [goToPageInput, setGoToPageInput] = useState('');
  const { user } = useAuth();

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const loadRoles = async () => {
      setLoading(true);
      try {
        const data = await roleService.getAllRoles();
        setAllRoles(data || []);
        applyFilters(data || [], searchKeyword, 0);
      } catch (error) {
        console.error('Erreur de chargement des rôles', error);
        showToast('Erreur lors du chargement des rôles', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadRoles();
  }, []);

  const applyFilters = (roles: Role[], keyword: string, pageNum: number) => {
    const filtered = roles.filter(role =>
      role.nomRole.toLowerCase().includes(keyword.toLowerCase())
    );
    setTotalElements(filtered.length);
    const totalPagesCalc = Math.ceil(filtered.length / pageSize) || 1;
    setTotalPages(totalPagesCalc);
    const safePage = Math.min(pageNum, totalPagesCalc - 1);
    setPage(safePage);
    const start = safePage * pageSize;
    setFilteredRoles(filtered.slice(start, start + pageSize));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchKeyword(value);
    applyFilters(allRoles, value, 0);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      applyFilters(allRoles, searchKeyword, newPage);
    }
  };

  const handleSave = async (data: { nomRole: string; description?: string }) => {
    try {
      if (editingRole) {
        await roleService.updateRole(editingRole.id, data);
        showToast('Rôle modifié avec succès', 'success');
      } else {
        await roleService.createRole(data);
        showToast('Rôle créé avec succès', 'success');
      }
      setModalOpen(false);
      setEditingRole(null);
      const freshData = await roleService.getAllRoles();
      setAllRoles(freshData);
      applyFilters(freshData, searchKeyword, page);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Une erreur est survenue';
      showToast(message, 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await roleService.deleteRole(deleteConfirm.id);
      showToast('Rôle supprimé avec succès', 'success');
      const freshData = await roleService.getAllRoles();
      setAllRoles(freshData);
      applyFilters(freshData, searchKeyword, page);
    } catch (error) {
      showToast('Impossible de supprimer ce rôle car il est encore attribué à des utilisateurs.', 'error');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const isAdmin = user?.roles?.includes('ADMIN') ?? false;

  const columns: Column<Role>[] = [
    { key: 'id', header: '#', render: (_, _row, index) => index !== undefined ? index + 1 : '' },
    { key: 'nomRole', header: 'Nom', sortable: true,
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    { key: 'description', header: 'Description',
      render: (value: string) => <span className="text-gray-500">{value || '-'}</span>,
    },
    { key: 'dateCreation', header: 'Créé le', sortable: true,
      render: (value: string) => <span className="text-gray-500">{new Date(value).toLocaleDateString()}</span>,
    },
  ];

  if (isAdmin) {
    columns.push({
      key: 'id', header: '', width: '120px',
      render: (_: any, row: Role) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => { setSelectedRoleForDroits(row); setDroitsModalOpen(true); }}
            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Gérer les droits">
            <KeyIcon className="h-4 w-4" />
          </button>
          <button onClick={() => { setEditingRole(row); setModalOpen(true); }}
            className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors" title="Modifier">
            <PencilIcon className="h-4 w-4" />
          </button>
          <button onClick={() => setDeleteConfirm({ id: row.id, name: row.nomRole })}
            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Supprimer">
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    });
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des rôles</h1>
          <p className="text-sm text-gray-500 mt-1">{totalElements} rôle(s)</p>
        </div>
        {isAdmin && (
          <Button variant="primary" onClick={() => { setEditingRole(null); setModalOpen(true); }} icon={<PlusIcon className="h-4 w-4" />}>
            Ajouter un rôle
          </Button>
        )}
      </div>

      <Card className="shadow-md border-0">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-semibold">Liste des rôles</h2>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input type="text" placeholder="Rechercher par nom..." value={searchKeyword}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64" />
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <TableSkeleton rows={5} />
          ) : (
            <>
              <Table columns={columns} data={filteredRoles} bordered className="w-full" />

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-gray-100 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Lignes par page :</span>
                    <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                      className="px-2 py-1 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
                    </select>
                    <span className="text-sm text-gray-500 ml-2">
                      {page * pageSize + 1}-{Math.min((page + 1) * pageSize, totalElements)} sur {totalElements}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handlePageChange(0)} disabled={page === 0}
                      className="px-2 py-1 text-xs rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                      {'<<'}
                    </button>
                    <button onClick={() => handlePageChange(page - 1)} disabled={page === 0}
                      className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                      <FaChevronLeft className="h-3 w-3 text-gray-600" />
                    </button>
                    {totalPages <= 7 ? (
                      Array.from({ length: totalPages }, (_, i) => (
                        <button key={i} onClick={() => handlePageChange(i)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition ${page === i ? 'bg-blue-600 text-white shadow' : 'hover:bg-gray-100 text-gray-600'}`}>
                          {i + 1}
                        </button>
                      ))
                    ) : (
                      <>
                        {page > 2 && <span className="px-1 text-gray-400">...</span>}
                        {Array.from({ length: 5 }, (_, i) => {
                          let pageIdx: number;
                          if (page < 3) pageIdx = i;
                          else if (page > totalPages - 4) pageIdx = totalPages - 5 + i;
                          else pageIdx = page - 2 + i;
                          return (
                            <button key={pageIdx} onClick={() => handlePageChange(pageIdx)}
                              className={`w-8 h-8 rounded-lg text-sm font-medium transition ${page === pageIdx ? 'bg-blue-600 text-white shadow' : 'hover:bg-gray-100 text-gray-600'}`}>
                              {pageIdx + 1}
                            </button>
                          );
                        })}
                        {page < totalPages - 3 && <span className="px-1 text-gray-400">...</span>}
                      </>
                    )}
                    <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages - 1}
                      className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                      <FaChevronRight className="h-3 w-3 text-gray-600" />
                    </button>
                    <button onClick={() => handlePageChange(totalPages - 1)} disabled={page >= totalPages - 1}
                      className="px-2 py-1 text-xs rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                      {'>>'}
                    </button>
                    <div className="flex items-center gap-1 ml-2">
                      <input type="number" min={1} max={totalPages} value={goToPageInput}
                        onChange={(e) => setGoToPageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const p = parseInt(goToPageInput, 10);
                            if (p >= 1 && p <= totalPages) { handlePageChange(p - 1); setGoToPageInput(''); }
                          }
                        }}
                        placeholder="Page"
                        className="w-16 px-2 py-1 text-sm border rounded-lg text-center focus:ring-2 focus:ring-blue-500 outline-none" />
                      <button onClick={() => {
                        const p = parseInt(goToPageInput, 10);
                        if (p >= 1 && p <= totalPages) { handlePageChange(p - 1); setGoToPageInput(''); }
                      }} className="p-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                        <FaArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      <RoleModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingRole(null); }}
        onSave={handleSave}
        initialData={editingRole ? { id: editingRole.id, nomRole: editingRole.nomRole, description: editingRole.description } : undefined}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md">
            <h3 className="text-lg font-semibold mb-2">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Supprimer le rôle <strong>{deleteConfirm.name}</strong> ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
              <Button variant="danger" onClick={confirmDelete}>Supprimer</Button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} duration={4000} />}

      <RolesDroitsModal
        isOpen={droitsModalOpen}
        onClose={() => { setDroitsModalOpen(false); setSelectedRoleForDroits(null); }}
        role={selectedRoleForDroits}
      />
    </div>
  );
};

export default Roles;
