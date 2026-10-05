// src/pages/Notifications.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { notificationsService } from '../services/notifications.service';
import type { Notification } from '../services/notifications.service';
import Table from '../components/ui/Table';
import type { Column } from '../components/ui/Table';
import Button from '../components/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import NotificationModal from '../components/modal/NotificationModal';
import Toast from '../components/Toast';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaCheckCircle } from 'react-icons/fa';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; label: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const isAgent = user?.roles?.includes('AGENT') ?? false;
  const isAdmin = user?.roles?.includes('ADMIN') ?? false;

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        let data;
        if (isAgent) {
          // L'agent récupère uniquement ses propres notifications
          if (!user?.agentId) {
            setNotifications([]);
            setLoading(false);
            return;
          }
          data = await notificationsService.getByAgent(user.agentId);
        } else {
          // Admin voit tout
          data = await notificationsService.getAllNotifications();
        }
        setNotifications(data || []);
      } catch (err) {
        console.error(err);
        setError('Impossible de charger les notifications.');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [isAgent, user?.agentId]);

  // Filtrer par recherche (message ou email)
  const filteredNotifications = notifications.filter(n =>
    n.message.toLowerCase().includes(search.toLowerCase()) ||
    (n.agentEmail?.toLowerCase() || '').includes(search.toLowerCase())
  );

  const openAddModal = () => {
    if (!isAdmin) return;
    setSelectedNotification(null);
    setIsModalOpen(true);
  };

  const openEditModal = (notification: Notification) => {
    if (!isAdmin) return;
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };

  const handleSave = async (data: any) => {
    if (!isAdmin) return;
    try {
      if (selectedNotification) {
        await notificationsService.update(selectedNotification.id, data);
        showToast('Notification modifiée', 'success');
      } else {
        await notificationsService.create(data);
        showToast('Notification ajoutée', 'success');
      }
      setIsModalOpen(false);
      // Recharger la liste selon le rôle
      const freshData = isAgent
        ? await notificationsService.getByAgent(user!.agentId)
        : await notificationsService.getAllNotifications();
      setNotifications(freshData);
    } catch (error) {
      showToast('Erreur lors de l’enregistrement', 'error');
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsService.markAsRead(id);
      showToast('Marquée comme lue', 'success');
      const freshData = isAgent
        ? await notificationsService.getByAgent(user!.agentId)
        : await notificationsService.getAllNotifications();
      setNotifications(freshData);
    } catch (error) {
      showToast('Erreur', 'error');
    }
  };

  const handleDeleteClick = (id: number, label: string) => {
    if (!isAdmin) return;
    setDeleteConfirm({ id, label });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm || !isAdmin) return;
    try {
      await notificationsService.delete(deleteConfirm.id);
      showToast('Supprimée', 'success');
      const freshData = isAgent
        ? await notificationsService.getByAgent(user!.agentId)
        : await notificationsService.getAllNotifications();
      setNotifications(freshData);
    } catch (error) {
      showToast('Erreur lors de la suppression', 'error');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const columns: Column<Notification>[] = [
    { key: 'id', header: '#', render: (_, _row, index) => index !== undefined ? index + 1 : '' },
    { key: 'agentEmail', header: 'Destinataire', render: (email) => email || 'Tous' },
    { key: 'message', header: 'Message' },
    {
      key: 'dateNotification',
      header: 'Date',
      render: (date) => format(new Date(date as string), 'dd/MM/yyyy HH:mm', { locale: fr })
    },
    {
      key: 'lu',
      header: 'Lu',
      render: (lu) => lu ? 'Oui' : 'Non'
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => {
        const isRecipient = row.agentId && row.agentId === user?.agentId;
        const canMarkAsRead = !row.lu && isRecipient;
        return (
          <div className="flex space-x-2">
            {canMarkAsRead && (
              <Button size="sm" variant="success" onClick={() => handleMarkAsRead(row.id)} title="Marquer comme lue">
                <FaCheckCircle />
              </Button>
            )}
            {isAdmin && (
              <>
                <Button size="sm" variant="ghost" onClick={() => openEditModal(row)}>
                  <FaEdit className="text-amber-600" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDeleteClick(row.id, row.message.substring(0, 30))}>
                  <FaTrash className="text-red-500" />
                </Button>
              </>
            )}
          </div>
        );
      }
    }
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="h-10 w-44 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="flex justify-end">
          <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="bg-white rounded-xl shadow-md border-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="p-4 space-y-3">
            <div className="h-10 bg-gray-100 rounded animate-pulse" />
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex space-x-4">
                <div className="h-4 w-8 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 flex-1 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-28 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-10 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          <p className="text-sm text-gray-500">{filteredNotifications.length} notification(s)</p>
        </div>
        {isAdmin && (
          <Button variant="primary" onClick={openAddModal} icon={<FaPlus />}>
            Nouvelle notification
          </Button>
        )}
      </div>

      <div className="flex justify-end">
        <div className="relative w-64">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Liste des notifications</h2>
        </CardHeader>
        <CardBody>
          <Table columns={columns} data={filteredNotifications} bordered className="w-full" />
        </CardBody>
      </Card>

      <NotificationModal
        key={selectedNotification?.id || 'new'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        notification={selectedNotification ? { id: selectedNotification.id, agentId: selectedNotification.agentId, message: selectedNotification.message } : undefined}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md">
            <h3 className="text-lg font-semibold mb-2">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">Supprimer cette notification ?</p>
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

export default Notifications;