import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import pointagesService from '../services/pointages.service';
import type { PresenceDuJour } from '../services/pointages.service';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import Button from '../components/Button';
import Toast from '../components/Toast';
import { FaArrowLeft, FaClock, FaMapMarkerAlt, FaUser, FaMobileAlt, FaCalendarAlt } from 'react-icons/fa';
import { TableSkeleton } from '../components/ui/Skeleton';

const PresenceDetail: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const [presence, setPresence] = useState<PresenceDuJour | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const selectedDate = new URLSearchParams(window.location.search).get('date') || new Date().toISOString().split('T')[0];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatHorodatage = (horodatage: string) => {
    if (!horodatage) return '-';
    const [datePart, timePart] = horodatage.split('T');
    if (!datePart || !timePart) return horodatage;
    const [year, month, day] = datePart.split('-');
    const time = timePart.substring(0, 5);
    return `${day}/${month}/${year} ${time}`;
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await pointagesService.getPresencesDuJour(selectedDate);
        const found = data.find(p => p.agentId === Number(agentId));
        setPresence(found || null);
      } catch (error) {
        console.error(error);
        showToast('Erreur lors du chargement', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [agentId, selectedDate]);

  const getStatutBadge = (statut: string) => {
    const colors: Record<string, string> = {
      PRESENT: 'bg-green-100 text-green-800',
      RETARD: 'bg-yellow-100 text-yellow-800',
      HORS_ZONE: 'bg-orange-100 text-orange-800',
      ABSENT: 'bg-red-100 text-red-800',
      VALIDE: 'bg-green-100 text-green-800',
      REFUSE: 'bg-red-100 text-red-800',
    };
    return <span className={`px-3 py-1 text-sm font-medium rounded-full ${colors[statut] || 'bg-gray-100 text-gray-800'}`}>{statut}</span>;
  };

  if (loading) {
    return (
      <div className="p-6">
        <TableSkeleton rows={3} />
      </div>
    );
  }

  if (!presence) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Aucune présence trouvée pour cet agent à cette date.</p>
          <Button variant="primary" onClick={() => navigate('/presences')} className="mt-4">
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/presences')}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FaArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Détail de présence</h1>
          <p className="text-sm text-gray-500 mt-1">Informations complètes du pointage</p>
        </div>
      </div>

      {/* Agent Info */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <FaUser className="text-blue-600 text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {presence.agentNom} {presence.agentPostnom} {presence.agentPrenom}
              </h2>
              <p className="text-sm text-gray-500">Matricule : {presence.agentMatricule || '-'}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <FaCalendarAlt className="text-xs" /> Date
          </div>
          <div className="text-lg font-bold text-gray-900 mt-1">{formatDate(presence.datePresence)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Statut</div>
          <div className="mt-1">{getStatutBadge(presence.statut)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <FaMapMarkerAlt className="text-xs" /> Zone
          </div>
          <div className="text-lg font-bold text-gray-900 mt-1">{presence.zone || '-'}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Retard</div>
          <div className="text-lg font-bold text-gray-900 mt-1">
            {presence.minutesRetard > 0 ? `+${presence.minutesRetard} min` : 'Aucun'}
          </div>
        </div>
      </div>

      {/* Pointage Arrivée */}
      <Card className="mb-6">
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FaClock className="text-blue-500" /> Pointage Arrivée
          </h3>
        </CardHeader>
        <CardBody>
          {presence.pointageArrivee ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Heure</span>
                  <span className="font-semibold">{presence.heureArrivee}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Horodatage</span>
                  <span className="font-semibold">{formatHorodatage(presence.pointageArrivee.horodatage)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Statut</span>
                  {getStatutBadge(presence.pointageArrivee.statut)}
                </div>
                {presence.minutesRetard > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Retard</span>
                    <span className="font-semibold text-red-600">+{presence.minutesRetard} min</span>
                  </div>
                )}
                {presence.pointageArrivee.justification && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Justification</span>
                    <span className="font-semibold text-orange-600">{presence.pointageArrivee.justification}</span>
                  </div>
                )}
                {presence.pointageArrivee.motifRejet && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Motif rejet</span>
                    <span className="font-semibold text-red-600">{presence.pointageArrivee.motifRejet}</span>
                  </div>
                )}
              </div>
              {presence.pointageArrivee.photoPath && (
                <div className="flex flex-col items-center">
                  <span className="text-sm text-gray-500 mb-2">Photo</span>
                  <img
                    src={`http://192.168.1.44:8083${presence.pointageArrivee.photoPath}`}
                    alt="Photo pointage arrivée"
                    className="w-40 h-40 object-cover rounded-xl border"
                  />
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-400 italic">Aucun pointage d'arrivée enregistré</p>
          )}
        </CardBody>
      </Card>

      {/* Pointage Départ */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FaClock className="text-orange-500" /> Pointage Départ
          </h3>
        </CardHeader>
        <CardBody>
          {presence.pointageDepart ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Heure</span>
                  <span className="font-semibold">{presence.heureDepart}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Horodatage</span>
                  <span className="font-semibold">{formatHorodatage(presence.pointageDepart.horodatage)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Statut</span>
                  {getStatutBadge(presence.pointageDepart.statut)}
                </div>
                {presence.pointageDepart.justification && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Justification</span>
                    <span className="font-semibold text-orange-600">{presence.pointageDepart.justification}</span>
                  </div>
                )}
                {presence.pointageDepart.motifRejet && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Motif rejet</span>
                    <span className="font-semibold text-red-600">{presence.pointageDepart.motifRejet}</span>
                  </div>
                )}
              </div>
              {presence.pointageDepart.photoPath && (
                <div className="flex flex-col items-center">
                  <span className="text-sm text-gray-500 mb-2">Photo</span>
                  <img
                    src={`http://192.168.1.44:8083${presence.pointageDepart.photoPath}`}
                    alt="Photo pointage départ"
                    className="w-40 h-40 object-cover rounded-xl border"
                  />
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-400 italic">Aucun pointage de départ enregistré</p>
          )}
        </CardBody>
      </Card>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} duration={4000} />}
    </div>
  );
};

export default PresenceDetail;
