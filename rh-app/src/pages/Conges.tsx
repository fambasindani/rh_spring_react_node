// src/pages/Conges.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { congesService, type Conge, type PageResponse } from '../services/conges.service';
import Table from '../components/ui/Table';
import type { Column } from '../components/ui/Table';
import Button from '../components/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import CongeModal from '../components/modal/CongeModal';
import Toast from '../components/Toast';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaClock, FaSearch } from 'react-icons/fa';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { debounce } from 'lodash';
import { useAuth } from '../hooks/useAuth';
import { TableSkeleton } from '../components/ui/Skeleton';

const Conges: React.FC = () => {
    const { user } = useAuth();
    const userRole = user?.roles?.[0] || '';

    const isAgent = userRole === 'AGENT';
    const isRHorAdmin = userRole === 'RH' || userRole === 'ADMIN';

    const [conges, setConges] = useState<Conge[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedConge, setSelectedConge] = useState<Conge | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; label: string } | null>(null);
    const [statusConfirm, setStatusConfirm] = useState<{ id: number; newStatus: string; label: string } | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searching, setSearching] = useState(false);

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const loadConges = async (page: number = 0, agentName: string = '') => {
        setLoading(true);
        try {
            const response: PageResponse<Conge> = await congesService.getAll(page, pageSize, agentName);
            // Filtrer côté front pour les agents (ils ne voient que leurs propres demandes)
            let filtered = response.content;
            if (isAgent && user?.agentId) {
                filtered = filtered.filter(c => c.idAgent === user.agentId);
            }
            setConges(filtered);
            // Pour la pagination, on garde les infos de la réponse brute (on pourrait recalculer)
            setCurrentPage(response.pageNumber);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (error) {
            console.error(error);
            showToast('Erreur lors du chargement des demandes', 'error');
        } finally {
            setLoading(false);
        }
    };

    const debouncedSearch = useCallback(
        debounce((keyword: string) => {
            loadConges(0, keyword);
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
        loadConges(0, '');
    }, []);

    const openAddModal = () => {
        setSelectedConge(null);
        setIsModalOpen(true);
    };

    const openEditModal = (conge: Conge) => {
        setSelectedConge(conge);
        setIsModalOpen(true);
    };

    const handleSave = async (data: any) => {
        if (selectedConge) {
            await congesService.update(selectedConge.id, data);
            showToast('Demande modifiée avec succès', 'success');
        } else {
            await congesService.create(data);
            showToast('Demande créée avec succès', 'success');
        }
        setIsModalOpen(false);
        await loadConges(currentPage, searchTerm);
    };

    const handleStatusConfirm = (id: number, newStatus: string, agentLabel: string) => {
        setStatusConfirm({ id, newStatus, label: agentLabel });
    };
    const confirmStatusChange = async () => {
        if (!statusConfirm) return;
        try {
            await congesService.updateStatus(statusConfirm.id, statusConfirm.newStatus);
            showToast(`Demande ${statusConfirm.newStatus === 'ACCEPTE' ? 'acceptée' : statusConfirm.newStatus === 'REFUSE' ? 'refusée' : 'annulée'} avec succès`, 'success');
            await loadConges(currentPage, searchTerm);
        } catch (error: any) {
            if (error.response?.status === 403) {
                showToast('Action non autorisée – vous n’avez pas les droits nécessaires', 'error');
            } else {
                showToast('Erreur lors du changement de statut', 'error');
            }
        } finally {
            setStatusConfirm(null);
        }
    };

    const handleDeleteClick = (id: number, label: string) => {
        setDeleteConfirm({ id, label });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;
        try {
            await congesService.delete(deleteConfirm.id);
            showToast('Demande supprimée avec succès', 'success');
            await loadConges(currentPage, searchTerm);
        } catch (error) {
            showToast('Erreur lors de la suppression', 'error');
        } finally {
            setDeleteConfirm(null);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            loadConges(newPage, searchTerm);
        }
    };

    const getStatutBadge = (statut: string) => {
        const upperStatut = statut?.toUpperCase();
        switch (upperStatut) {
            case 'ACCEPTE':
                return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center gap-1"><FaCheck className="h-3 w-3" /> Accepté</span>;
            case 'REFUSE':
                return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 flex items-center gap-1"><FaTimes className="h-3 w-3" /> Refusé</span>;
            case 'ANNULE':
                return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 flex items-center gap-1"><FaTimes className="h-3 w-3" /> Annulé</span>;
            default:
                return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1"><FaClock className="h-3 w-3" /> En attente</span>;
        }
    };

    // 🔥 Fonction qui détermine si l'utilisateur peut modifier/supprimer une demande
    const canModify = (conge: Conge) => {
        if (isAgent) {
            // L'agent ne peut modifier/supprimer que ses propres demandes en attente
            return conge.idAgent === user?.agentId && conge.statut?.toUpperCase() === 'EN_ATTENTE';
        }
        if (isRHorAdmin) {
            return true; // Admin/RH peuvent tout modifier/supprimer
        }
        return false;
    };

    const columns: Column<Conge>[] = [
        { key: 'id', header: '#', render: (_, _row, index) => index !== undefined ? index + 1 : '' },
        {
            key: 'agent',
            header: 'Agent',
            render: (_, row) => `${row.agentNom} ${row.agentPrenom}`
        },
        {
            key: 'typeConge',
            header: 'Type',
            render: (_, row) => row.typeCongeNom || '-'
        },
        {
            key: 'period',
            header: 'Période',
            render: (_, row) => `${format(new Date(row.dateDebut), 'dd/MM/yyyy')} → ${format(new Date(row.dateFin), 'dd/MM/yyyy')}`
        },
        { key: 'nombreJours', header: 'Jours' },
        { key: 'motif', header: 'Motif' },
        {
            key: 'statut',
            header: 'Statut',
            render: (statut) => getStatutBadge(statut)
        },
        {
            key: 'dateDemande',
            header: 'Date demande',
            render: (date) => date ? format(new Date(date), 'dd/MM/yyyy', { locale: fr }) : '-'
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (_, row) => {
                const statutUpper = row.statut?.toUpperCase() || '';
                const isPending = statutUpper === 'EN_ATTENTE';
                const isAccepted = statutUpper === 'ACCEPTE';
                const canAct = canModify(row);

                if (!canAct && !(isRHorAdmin && (isPending || isAccepted))) return <span className="text-gray-300 text-xs">-</span>;

                return (
                    <div className="flex items-center gap-1">
                        {isRHorAdmin && isPending && (
                            <>
                                <button
                                    onClick={() => handleStatusConfirm(row.id, 'ACCEPTE', `${row.agentNom} ${row.agentPrenom}`)}
                                    className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                    title="Accepter"
                                >
                                    <FaCheck className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={() => handleStatusConfirm(row.id, 'REFUSE', `${row.agentNom} ${row.agentPrenom}`)}
                                    className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                    title="Refuser"
                                >
                                    <FaTimes className="h-3.5 w-3.5" />
                                </button>
                            </>
                        )}
                        {isRHorAdmin && isAccepted && (
                            <button
                                onClick={() => handleStatusConfirm(row.id, 'ANNULE', `${row.agentNom} ${row.agentPrenom}`)}
                                className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                title="Annuler"
                            >
                                <FaTimes className="h-3.5 w-3.5" />
                            </button>
                        )}
                        {canAct && (
                            <>
                                <button
                                    onClick={() => openEditModal(row)}
                                    className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                                    title="Modifier"
                                >
                                    <FaEdit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(row.id, `${row.agentNom} ${row.agentPrenom}`)}
                                    className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                    title="Supprimer"
                                >
                                    <FaTrash className="h-3.5 w-3.5" />
                                </button>
                            </>
                        )}
                    </div>
                );
            }
        }
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Demandes de congé</h1>
                    <p className="text-sm text-gray-500 mt-1">{totalElements} demande(s) au total</p>
                </div>
                {(isAgent || isRHorAdmin) && (
                    <Button variant="primary" onClick={openAddModal} icon={<FaPlus />}>
                        Nouvelle demande
                    </Button>
                )}
            </div>

            <div className="mb-4 flex justify-end">
                <div className="relative w-64">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par agent..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {searching && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <h2 className="text-lg font-semibold">Liste des demandes</h2>
                </CardHeader>
                <CardBody>
                    {loading ? (
                        <TableSkeleton rows={5} />
                    ) : (
                        <>
                            <Table columns={columns} data={conges} bordered className="w-full" />
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

            <CongeModal
                key={selectedConge?.id || 'new'}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                conge={selectedConge}
                currentUser={user}
            />

            {statusConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmer l’action</h3>
                        <p className="text-gray-600 mb-6">
                            Voulez-vous vraiment {statusConfirm.newStatus === 'ACCEPTE' ? 'accepter' : statusConfirm.newStatus === 'REFUSE' ? 'refuser' : 'annuler'} la demande de congé de <strong>"{statusConfirm.label}"</strong> ?
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setStatusConfirm(null)}>Annuler</Button>
                            <Button variant="primary" onClick={confirmStatusChange}>Confirmer</Button>
                        </div>
                    </div>
                </div>
            )}

            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmer la suppression</h3>
                        <p className="text-gray-600 mb-6">
                            Voulez-vous vraiment supprimer la demande de congé de <strong>"{deleteConfirm.label}"</strong> ?<br />
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

export default Conges;