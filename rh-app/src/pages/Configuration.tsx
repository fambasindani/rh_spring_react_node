import React, { useState, useEffect } from 'react';
import pointagesService from '../services/pointages.service';
import type { ZoneTravail, HoraireTravail, JourFerie } from '../services/pointages.service';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import Button from '../components/Button';
import Toast from '../components/Toast';
import Tabs from '../components/ui/Tabs';
import {
  FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaClock, FaCalendarAlt,
} from 'react-icons/fa';
import { TableSkeleton } from '../components/ui/Skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const JOURS_SEMAINE = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const Configuration: React.FC = () => {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Configuration du pointage</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configurez les horaires, zones géographiques et jours fériés
        </p>
      </div>

      <Tabs
        tabs={[
          { id: 'horaires', label: 'Horaires de travail', icon: FaClock, content: <HorairesTab showToast={showToast} /> },
          { id: 'zones', label: 'Zones géographiques', icon: FaMapMarkerAlt, content: <ZonesTab showToast={showToast} /> },
          { id: 'feries', label: 'Jours fériés', icon: FaCalendarAlt, content: <JoursFeriesTab showToast={showToast} /> },
        ]}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} duration={4000} />}
    </div>
  );
};

// ==================== HORAIRES ====================
const HorairesTab: React.FC<{ showToast: (msg: string, type: 'success' | 'error' | 'info') => void }> = ({ showToast }) => {
  const [horaires, setHoraires] = useState<HoraireTravail[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<HoraireTravail | null>(null);
  const [form, setForm] = useState({
    jourSemaine: 1,
    heureDebut: '08:00',
    heureFin: '16:30',
    debutFenetrePointage: '07:30',
    finFenetrePointage: '09:00',
    actif: true,
  });

  const load = async () => {
    setLoading(true);
    try {
      setHoraires(await pointagesService.getHoraires());
    } catch { showToast('Erreur chargement horaires', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    try {
      if (selected) {
        await pointagesService.updateHoraire(selected.id, form);
        showToast('Horaire modifié', 'success');
      } else {
        await pointagesService.createHoraire(form);
        showToast('Horaire créé', 'success');
      }
      setShowModal(false);
      setSelected(null);
      load();
    } catch { showToast('Erreur sauvegarde', 'error'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cet horaire ?')) return;
    try {
      await pointagesService.deleteHoraire(id);
      showToast('Horaire supprimé', 'success');
      load();
    } catch { showToast('Erreur suppression', 'error'); }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FaClock className="text-blue-600" /> Horaires de travail
          </h2>
          <Button onClick={() => { setSelected(null); setForm({ jourSemaine: 1, heureDebut: '08:00', heureFin: '16:30', debutFenetrePointage: '07:30', finFenetrePointage: '09:00', actif: true }); setShowModal(true); }} icon={<FaPlus />}>
            Ajouter
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        {loading ? <TableSkeleton rows={5} /> : (
          <div className="space-y-3">
            {horaires.map(h => (
              <div key={h.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div>
                  <div className="font-medium">{JOURS_SEMAINE[h.jourSemaine - 1]}</div>
                  <div className="text-sm text-gray-500">
                    {h.heureDebut} - {h.heureFin} | Fenêtre: {h.debutFenetrePointage} - {h.finFenetrePointage}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${h.actif ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {h.actif ? 'Actif' : 'Inactif'}
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => { setSelected(h); setForm({ jourSemaine: h.jourSemaine, heureDebut: h.heureDebut, heureFin: h.heureFin, debutFenetrePointage: h.debutFenetrePointage, finFenetrePointage: h.finFenetrePointage, actif: h.actif }); setShowModal(true); }}>
                    <FaEdit className="text-amber-600" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(h.id)}>
                    <FaTrash className="text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">{selected ? 'Modifier' : 'Ajouter'} un horaire</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jour de la semaine</label>
                <select value={form.jourSemaine} onChange={e => setForm({ ...form, jourSemaine: +e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                  {JOURS_SEMAINE.map((j, i) => <option key={i} value={i + 1}>{j}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure d'arrivée</label>
                  <input type="time" value={form.heureDebut} onChange={e => setForm({ ...form, heureDebut: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure de départ</label>
                  <input type="time" value={form.heureFin} onChange={e => setForm({ ...form, heureFin: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Début fenêtre pointage</label>
                  <input type="time" value={form.debutFenetrePointage} onChange={e => setForm({ ...form, debutFenetrePointage: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fin fenêtre pointage</label>
                  <input type="time" value={form.finFenetrePointage} onChange={e => setForm({ ...form, finFenetrePointage: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.actif} onChange={e => setForm({ ...form, actif: e.target.checked })}
                  className="h-4 w-4 text-blue-600 rounded" />
                <label className="text-sm text-gray-700">Actif</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowModal(false)}>Annuler</Button>
              <Button onClick={handleSave}>{selected ? 'Modifier' : 'Créer'}</Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

// ==================== ZONES ====================
const ZonesTab: React.FC<{ showToast: (msg: string, type: 'success' | 'error' | 'info') => void }> = ({ showToast }) => {
  const [zones, setZones] = useState<ZoneTravail[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<ZoneTravail | null>(null);
  const [form, setForm] = useState({ nom: '', adresse: '', latitude: 0, longitude: 0, rayon: 120, actif: true });

  const load = async () => {
    setLoading(true);
    try { setZones(await pointagesService.getZones()); }
    catch { showToast('Erreur chargement zones', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    try {
      if (selected) {
        await pointagesService.updateZone(selected.id, form);
        showToast('Zone modifiée', 'success');
      } else {
        await pointagesService.createZone(form);
        showToast('Zone créée', 'success');
      }
      setShowModal(false); setSelected(null); load();
    } catch { showToast('Erreur sauvegarde', 'error'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette zone ?')) return;
    try { await pointagesService.deleteZone(id); showToast('Zone supprimée', 'success'); load(); }
    catch { showToast('Erreur suppression', 'error'); }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FaMapMarkerAlt className="text-red-600" /> Zones géographiques
          </h2>
          <Button onClick={() => { setSelected(null); setForm({ nom: '', adresse: '', latitude: 0, longitude: 0, rayon: 120, actif: true }); setShowModal(true); }} icon={<FaPlus />}>
            Ajouter
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        {loading ? <TableSkeleton rows={3} /> : (
          <div className="space-y-3">
            {zones.map(z => (
              <div key={z.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div>
                  <div className="font-medium">{z.nom}</div>
                  <div className="text-sm text-gray-500">{z.adresse}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Lat: {z.latitude} | Lng: {z.longitude} | Rayon: {z.rayon}m
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${z.actif ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {z.actif ? 'Actif' : 'Inactif'}
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => { setSelected(z); setForm({ nom: z.nom, adresse: z.adresse, latitude: z.latitude, longitude: z.longitude, rayon: z.rayon, actif: z.actif }); setShowModal(true); }}>
                    <FaEdit className="text-amber-600" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(z.id)}>
                    <FaTrash className="text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">{selected ? 'Modifier' : 'Ajouter'} une zone</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la zone</label>
                <input type="text" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" placeholder="Ex: Bureau principal" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <input type="text" value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" placeholder="Ex: 123 Avenue de la Paix" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input type="number" step="any" value={form.latitude} onChange={e => setForm({ ...form, latitude: +e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" placeholder="-1.234567" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input type="number" step="any" value={form.longitude} onChange={e => setForm({ ...form, longitude: +e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" placeholder="23.456789" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rayon (mètres)</label>
                <input type="number" value={form.rayon} onChange={e => setForm({ ...form, rayon: +e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                <p className="text-xs text-gray-500 mt-1">L'agent doit être à moins de {form.rayon}m pour pouvoir pointer</p>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.actif} onChange={e => setForm({ ...form, actif: e.target.checked })}
                  className="h-4 w-4 text-blue-600 rounded" />
                <label className="text-sm text-gray-700">Zone active</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowModal(false)}>Annuler</Button>
              <Button onClick={handleSave}>{selected ? 'Modifier' : 'Créer'}</Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

// ==================== JOURS FÉRIÉS ====================
const JoursFeriesTab: React.FC<{ showToast: (msg: string, type: 'success' | 'error' | 'info') => void }> = ({ showToast }) => {
  const [jours, setJours] = useState<JourFerie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<JourFerie | null>(null);
  const [form, setForm] = useState({ nom: '', date: '', actif: true });

  const load = async () => {
    setLoading(true);
    try { setJours(await pointagesService.getJoursFeries()); }
    catch { showToast('Erreur chargement jours fériés', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    try {
      if (selected) {
        await pointagesService.updateJourFerie(selected.id, form);
        showToast('Jour férié modifié', 'success');
      } else {
        await pointagesService.createJourFerie(form);
        showToast('Jour férié créé', 'success');
      }
      setShowModal(false); setSelected(null); load();
    } catch { showToast('Erreur sauvegarde', 'error'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce jour férié ?')) return;
    try { await pointagesService.deleteJourFerie(id); showToast('Jour férié supprimé', 'success'); load(); }
    catch { showToast('Erreur suppression', 'error'); }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FaCalendarAlt className="text-purple-600" /> Jours fériés
          </h2>
          <Button onClick={() => { setSelected(null); setForm({ nom: '', date: '', actif: true }); setShowModal(true); }} icon={<FaPlus />}>
            Ajouter
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        {loading ? <TableSkeleton rows={3} /> : (
          <div className="space-y-3">
            {jours.map(j => (
              <div key={j.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div>
                  <div className="font-medium">{j.nom}</div>
                  <div className="text-sm text-gray-500">{format(new Date(j.date), 'EEEE d MMMM yyyy', { locale: fr })}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${j.actif ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {j.actif ? 'Actif' : 'Inactif'}
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => { setSelected(j); setForm({ nom: j.nom, date: j.date, actif: j.actif }); setShowModal(true); }}>
                    <FaEdit className="text-amber-600" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(j.id)}>
                    <FaTrash className="text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">{selected ? 'Modifier' : 'Ajouter'} un jour férié</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input type="text" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" placeholder="Ex: Fête nationale" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.actif} onChange={e => setForm({ ...form, actif: e.target.checked })}
                  className="h-4 w-4 text-blue-600 rounded" />
                <label className="text-sm text-gray-700">Actif</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowModal(false)}>Annuler</Button>
              <Button onClick={handleSave}>{selected ? 'Modifier' : 'Créer'}</Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default Configuration;
