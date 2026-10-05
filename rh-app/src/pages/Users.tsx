import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { userAdminService } from '../services/userAdmin.service';
import UserModal from '../components/modal/UserModal';
import Button from '../components/Button';
import Input from '../components/ui/Input';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { debounce } from 'lodash';
import Toast from '../components/Toast';
import Table from '../components/ui/Table';
import type { Column } from '../components/ui/Table';
import type { UserResponse } from '../types/User';
import { FaChevronLeft, FaChevronRight, FaArrowRight } from 'react-icons/fa';
import { TableSkeleton } from '../components/ui/Skeleton';

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; label: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [goToPageInput, setGoToPageInput] = useState('');
  const { user } = useAuth();

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchUsers = async (keyword = searchKeyword, pageNum = page) => {
    setLoading(true);
    try {
      const response = await userAdminService.getUsers({
        page: pageNum,
        size: pageSize,
        keyword: keyword || undefined,
      });
      if (response && typeof response === 'object' && 'content' in response) {
        setUsers(response.content || []);
        setTotalElements(response.totalElements || 0);
        setTotalPages(response.totalPages || 0);
      } else {
        setUsers([]);
        setTotalElements(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Erreur fetchUsers:', error);
      showToast('Erreur lors du chargement des utilisateurs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((keyword: string) => {
      setPage(0);
      fetchUsers(keyword, 0);
    }, 400),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
    debouncedSearch(e.target.value);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
      fetchUsers(searchKeyword, newPage);
    }
  };

  const toggleUserStatus = async (userData: UserResponse) => {
    try {
      await userAdminService.updateUser(userData.id, { actif: !userData.actif });
      showToast(`Utilisateur ${userData.actif ? 'désactivé' : 'activé'} avec succès`, 'success');
      fetchUsers(searchKeyword, page);
    } catch (error) {
      showToast('Erreur lors du changement de statut', 'error');
    }
  };

  const handleSave = async (payload: any) => {
    try {
      if (editingUser) {
        await userAdminService.updateUser(editingUser.id, payload);
        showToast('Utilisateur modifié avec succès', 'success');
      } else {
        await userAdminService.createUser(payload);
        showToast('Utilisateur créé avec succès', 'success');
      }
      setModalOpen(false);
      setEditingUser(null);
      fetchUsers(searchKeyword, page);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Une erreur est survenue';
      showToast(message, 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await userAdminService.deleteUser(deleteConfirm.id);
      showToast('Utilisateur supprimé avec succès', 'success');
      fetchUsers(searchKeyword, page);
    } catch (error) {
      showToast('Erreur lors de la suppression', 'error');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const isAdmin = user?.roles?.includes('ADMIN') ?? false;

  const columns: Column<UserResponse>[] = [
    {
      key: 'rowNum', header: '#',
      render: (_: any, __: any, index?: number) => (
        <span className="text-gray-500">{page * pageSize + (index ?? 0) + 1}</span>
      ),
    },
    {
      key: 'username', header: 'Nom d\'utilisateur', sortable: true,
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'agentNom', header: 'Agent', sortable: true,
      render: (_: any, row: UserResponse) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
            {(row.agentNom?.[0] || '') + (row.agentPrenom?.[0] || '')}
          </div>
          <div>
            <span className="font-medium text-gray-800">{row.agentNom} {row.agentPrenom}</span>
            {row.agentMatricule && <p className="text-xs text-gray-400">{row.agentMatricule}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'roles', header: 'Rôles',
      render: (_: any, row: UserResponse) => (
        <span>{row.roles && row.roles.length > 0 ? row.roles.map(r => r.nomRole).join(', ') : '-'}</span>
      ),
    },
    {
      key: 'actif', header: 'Statut', sortable: true,
      render: (value: boolean) =>
        value ? (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Actif</span>
        ) : (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Inactif</span>
        ),
    },
    {
      key: 'dateCreation', header: 'Créé le', sortable: true,
      render: (value: string) => (
        <span className="text-gray-500">{value ? new Date(value).toLocaleDateString() : '-'}</span>
      ),
    },
  ];

  if (isAdmin) {
    columns.push({
      key: 'id', header: '', width: '120px',
      render: (_: any, row: UserResponse) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => toggleUserStatus(row)}
            className={`p-1.5 rounded-lg transition-colors ${
              row.actif ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            title={row.actif ? 'Désactiver' : 'Activer'}>
            {row.actif ? <CheckCircleIcon className="h-4 w-4" /> : <XCircleIcon className="h-4 w-4" />}
          </button>
          <button onClick={() => { setEditingUser(row); setModalOpen(true); }}
            className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors" title="Modifier">
            <PencilIcon className="h-4 w-4" />
          </button>
          <button onClick={() => setDeleteConfirm({ id: row.id, label: row.username })}
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
          <h1 className="text-2xl font-bold text-gray-800">Gestion des utilisateurs</h1>
          <p className="text-sm text-gray-500 mt-1">{totalElements} utilisateur(s)</p>
        </div>
        {isAdmin && (
          <Button variant="primary" onClick={() => { setEditingUser(null); setModalOpen(true); }} icon={<PlusIcon className="h-4 w-4" />}>
            Ajouter un utilisateur
          </Button>
        )}
      </div>

      <Card className="shadow-md border-0">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-semibold">Liste des utilisateurs</h2>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input type="text" placeholder="Rechercher par email ou nom..." value={searchKeyword}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64" />
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <TableSkeleton rows={5} />
          ) : (
            <>
              <Table columns={columns} data={users} bordered className="w-full" />

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

      <UserModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingUser(null); }}
        onSave={handleSave}
        initialData={editingUser ? { id: editingUser.id, agentId: editingUser.agentId, roleIds: editingUser.roles.map(r => r.id), actif: editingUser.actif } : undefined}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md">
            <h3 className="text-lg font-semibold mb-2">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Supprimer l'utilisateur <strong>{deleteConfirm.label}</strong> ? Cette action est irréversible.
            </p>
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

export default Users;
