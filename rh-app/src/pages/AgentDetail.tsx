import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pdf } from '@react-pdf/renderer';
import { agentService } from '../services/agents.service';
import type { AgentDetailsResponse } from '../types/agent';
import Button from '../components/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import Tabs from '../components/ui/Tabs';
import FicheAgentPDF from '../components/pdf/FicheAgentPDF';
import {
    FaEye, FaUsers, FaFilePdf, FaExchangeAlt,
    FaArrowLeft, FaPlus, FaPrint,
    FaDownload, FaCalendarAlt, FaMapMarkerAlt,
    FaPhone, FaEnvelope, FaTransgender, FaRing,
    FaTrash, FaImage, FaGraduationCap, FaEdit,
    FaHistory
} from 'react-icons/fa';
import { format } from 'date-fns';
import api from '../types/api';
import { BACKEND_BASE_URL } from '../config/constants';
import { affiliationService } from '../services/affiliation.service';
import { documentService } from '../services/document.service';
import { affectationService } from '../services/affectation.service';
import { promotionService } from '../services/promotion.service';
import { etudeService, type Etude, type EtudePayload } from '../services/etude.service';
import Toast from '../components/Toast';
import { AgentDetailSkeleton } from '../components/ui/Skeleton';

// Modales
import AffectationModal from '../components/modal/AffectationModal';
import type { AffectationDto, AffectationPayload } from '../components/modal/AffectationModal';
import PromotionModal from '../components/modal/PromotionModal';
import type { PromotionDto, PromotionPayload } from '../components/modal/PromotionModal';
import DocumentModal from '../components/modal/DocumentModal';
import type { DocumentDto, DocumentPayload } from '../components/modal/DocumentModal';
import DependantModal from '../components/modal/DependantModal';
import type { AffiliationDto, AffiliationPayload } from '../components/modal/DependantModal';
import EtudeModal from '../components/modal/EtudeModal';

const BACKEND_URL = api.defaults.baseURL?.replace(/\/api$/, '') || 'http://localhost:8083';
type ModalType = 'dependant' | 'document' | 'affectation' | 'promotion' | 'etude' | null;

// Composants d'affichage
const InfoItem = ({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) => (
    <div className="flex items-start">
        {icon && <div className="text-gray-400 mr-2 mt-0.5">{icon}</div>}
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-sm font-medium text-gray-900">{value}</p>
        </div>
    </div>
);

const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-500">{message}</p>
    </div>
);

const AgentDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [agent, setAgent] = useState<AgentDetailsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [etudes, setEtudes] = useState<Etude[]>([]);

    // États pour les modales
    const [modalType, setModalType] = useState<ModalType>(null);
    type SelectedItem =
        | AgentDetailsResponse['affiliations'][0]
        | AgentDetailsResponse['documents'][0]
        | AgentDetailsResponse['affectations'][0]
        | AgentDetailsResponse['promotions'][0]
        | Etude
        | undefined;
    const [selectedItem, setSelectedItem] = useState<SelectedItem>(undefined);

    const openModal = (type: ModalType, item?: SelectedItem) => {
        setModalType(type);
        setSelectedItem(item);
    };
    const closeModal = () => {
        setModalType(null);
        setSelectedItem(undefined);
    };

    const refreshAgent = async () => {
        if (id) {
            const fetched = await agentService.getAgentDetails(parseInt(id));
            setAgent(fetched);
        }
    };

    const loadEtudes = async () => {
        if (!agent) return;
        try {
            const data = await etudeService.getByAgentId(agent.id);
            setEtudes(data);
        } catch (error) {
            console.error('Erreur chargement études', error);
        }
    };

    const handleSaveAffectation = async (data: AffectationPayload) => {
        if ((selectedItem as AffectationDto)?.id) {
            await affectationService.update((selectedItem as AffectationDto).id, data);
        } else {
            await affectationService.create(data);
        }
        closeModal();
        await refreshAgent();
    };

    const handleSavePromotion = async (data: PromotionPayload) => {
        if ((selectedItem as PromotionDto)?.id) {
            await promotionService.update((selectedItem as PromotionDto).id, data);
        } else {
            await promotionService.create(data);
        }
        closeModal();
        await refreshAgent();
    };

    const handleSaveDependant = async (data: AffiliationPayload) => {
        if ((selectedItem as AffiliationDto)?.id) {
            await affiliationService.update((selectedItem as AffiliationDto).id, data);
        } else {
            await affiliationService.create(data);
        }
        closeModal();
        await refreshAgent();
    };

    const handleSaveDocument = async (data: DocumentPayload) => {
        if (selectedItem?.id) {
            await documentService.update(selectedItem.id, data);
        } else {
            await documentService.create(data);
        }
        closeModal();
        await refreshAgent();
    };

const handleSaveEtude = async (data: EtudePayload & { id?: number }) => {
  if (data.id) {
    // Pour la mise à jour, envoyer aussi id_agent
    await etudeService.update(data.id, {
      id_agent: data.id_agent,
      nombre_annee: data.nombre_annee,
      lieu: data.lieu,
      etablissement: data.etablissement,
    });
    showToast('Étude modifiée avec succès', 'success');
  } else {
    // Pour la création
    await etudeService.create({
      id_agent: data.id_agent,
      nombre_annee: data.nombre_annee,
      lieu: data.lieu,
      etablissement: data.etablissement,
    });
    showToast('Étude ajoutée avec succès', 'success');
  }
  closeModal();
  await loadEtudes();
};

    // Toast
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const showToast = (message: string, type: 'success' | 'error' | 'info') => setToast({ message, type });
    const hideToast = () => setToast(null);

    // Suppressions
    const [deleteConfirm, setDeleteConfirm] = useState<{
        type: 'dependant' | 'document' | 'affectation' | 'promotion' | 'etude';
        id: number;
        name: string;
    } | null>(null);

    const confirmDelete = (type: 'dependant' | 'document' | 'affectation' | 'promotion' | 'etude', id: number, name: string) => {
        setDeleteConfirm({ type, id, name });
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        try {
            switch (deleteConfirm.type) {
                case 'dependant':
                    await affiliationService.delete(deleteConfirm.id);
                    break;
                case 'document':
                    await documentService.delete(deleteConfirm.id);
                    break;
                case 'affectation':
                    await affectationService.delete(deleteConfirm.id);
                    break;
                case 'promotion':
                    await promotionService.delete(deleteConfirm.id);
                    break;
                case 'etude':
                    await etudeService.delete(deleteConfirm.id);
                    break;
            }
            showToast(`${getTypeLabel(deleteConfirm.type)} supprimé avec succès`, 'success');
            if (deleteConfirm.type === 'etude') {
                await loadEtudes();
            } else {
                await refreshAgent();
            }
        } catch (error) {
            showToast(`Erreur lors de la suppression de ${getTypeLabel(deleteConfirm.type)}`, 'error');
            console.error(error);
        } finally {
            setDeleteConfirm(null);
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'dependant': return 'Le dépendant';
            case 'document': return 'Le document';
            case 'affectation': return "L'affectation";
            case 'promotion': return 'La promotion';
            case 'etude': return "L'étude";
            default: return "L'élément";
        }
    };

    useEffect(() => {
        const loadAgent = async () => {
            if (id) {
                try {
                    const fetched = await agentService.getAgentDetails(parseInt(id));
                    setAgent(fetched);
                    const etudesData = await etudeService.getByAgentId(parseInt(id));
                    setEtudes(etudesData);
                } catch (error) {
                    console.error('Erreur lors du chargement de l\'agent', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadAgent();
    }, [id]);

    const photoToBase64 = async (photoPath: string): Promise<string> => {
        const url = photoPath.startsWith('http') ? photoPath : `${BACKEND_BASE_URL}${photoPath}`;
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const handlePrint = async () => {
        if (!agent) return;
        let photoBase64: string | undefined;
        if (agent.photo) {
            try { photoBase64 = await photoToBase64(agent.photo); } catch (e) { /* ignore */ }
        }
        const blob = await pdf(<FicheAgentPDF agent={agent} photoBase64={photoBase64} />).toBlob();
        const url = URL.createObjectURL(blob);
        const newWindow = window.open(url, '_blank');
        if (!newWindow) {
            const link = document.createElement('a');
            link.href = url;
            link.download = `Fiche_${agent.matricule}.pdf`;
            link.click();
        }
    };

    if (loading) return <AgentDetailSkeleton />;
    if (!agent) return (
        <div className="p-6 text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
                <p className="text-red-600 text-lg font-semibold mb-4">Agent non trouvé</p>
                <Button variant="primary" onClick={() => navigate('/agents')}>Retour à la liste</Button>
            </div>
        </div>
    );

    const tabs = [
        {
            id: 'info',
            label: 'Informations',
            icon: FaEye,
            content: (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 border-b">
                                <h3 className="font-semibold text-gray-800 flex items-center"><FaEye className="mr-2 text-blue-600" /> Identité</h3>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoItem icon={<FaRing />} label="Matricule" value={agent.matricule} />
                                <InfoItem icon={<FaUsers />} label="Nom complet" value={`${agent.nom} ${agent.postnom} ${agent.prenom}`} />
                                <InfoItem icon={<FaTransgender />} label="Sexe" value={agent.sexe === 'M' ? 'Masculin' : 'Féminin'} />
                                <InfoItem icon={<FaCalendarAlt />} label="Date naissance" value={format(new Date(agent.dateNaissance), 'dd/MM/yyyy')} />
                                <InfoItem icon={<FaEnvelope />} label="Email" value={agent.email} />
                                <InfoItem icon={<FaPhone />} label="Téléphone" value={agent.telephone} />
                                <InfoItem icon={<FaRing />} label="État civil" value={agent.etatCivil} />
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-3 border-b">
                                <h3 className="font-semibold text-gray-800 flex items-center"><FaExchangeAlt className="mr-2 text-green-600" /> Carrière</h3>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoItem label="Grade" value={`${agent.gradeSigle} - ${agent.gradeNom}`} />
                                <InfoItem label="Fonction" value={agent.fonctionNom} />
                                <InfoItem label="Direction" value={`${agent.directionSigle} - ${agent.directionNom}`} />
                                <InfoItem label="Date engagement" value={format(new Date(agent.dateEngagement), 'dd/MM/yyyy')} />
                                <InfoItem label="Réf. engagement" value={agent.referenceEngagement} />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        {agent.photo && (
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 px-6 py-3 border-b">
                                    <h3 className="font-semibold text-gray-800 flex items-center"><FaEye className="mr-2 text-purple-600" /> Photo</h3>
                                </div>
                                <div className="p-6 flex justify-center">
                                    <img src={`${BACKEND_URL}${agent.photo}`} alt="Agent" className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200 shadow-md" />
                                </div>
                            </div>
                        )}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-3 border-b">
                                <h3 className="font-semibold text-gray-800 flex items-center"><FaMapMarkerAlt className="mr-2 text-amber-600" /> ORIGINE</h3>
                            </div>
                            <div className="p-6 space-y-2">
                                <p className="text-gray-700"><span className="font-medium">Province :</span> {agent.province}</p>
                                <p className="text-gray-700"><span className="font-medium">Territoire :</span> {agent.territoire}</p>
                                <p className="text-gray-700"><span className="font-medium">Village :</span> {agent.village}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'dependants',
            label: 'Affiliations',
            icon: FaUsers,
            content: (
                <div className="p-4">
                    {agent.affiliations.length === 0 ? (
                        <EmptyState message="Aucun dépendant" />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {agent.affiliations.map((d) => (
                                <div key={d.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{d.nom} {d.postnom} {d.prenom}</h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full mr-2">{d.relation}</span>
                                            </p>
                                            <p className="text-sm text-gray-600 mt-2">
                                                <FaCalendarAlt className="inline mr-1 text-gray-400" />
                                                Né le {format(new Date(d.dateNaissance), 'dd/MM/yyyy')} à {d.lieuNaissance}
                                            </p>
                                            <p className="text-sm text-gray-600">Statut: {d.statut ? 'Actif' : 'Inactif'}</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button size="sm" variant="ghost" onClick={() => openModal('dependant', d)}>Modifier</Button>
                                            <Button size="sm" variant="ghost" onClick={() => confirmDelete('dependant', d.id, `${d.nom} ${d.postnom} ${d.prenom}`)} icon={<FaTrash className="text-red-500" />}>
                                                Supprimer
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="mt-6">
                        <Button variant="outline" onClick={() => openModal('dependant')}><FaPlus className="mr-2" /> Ajouter un dépendant</Button>
                    </div>
                </div>
            )
        },
        {
            id: 'documents',
            label: 'Documents',
            icon: FaFilePdf,
            content: (
                <div className="p-4">
                    {agent.documents.length === 0 ? (
                        <EmptyState message="Aucun document" />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {agent.documents.map((doc) => {
                                const ext = doc.cheminFichier.split('.').pop()?.toLowerCase();
                                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
                                return (
                                    <div key={doc.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition flex items-center">
                                        {isImage ? (
                                            <FaImage className="text-blue-500 w-8 h-8 mr-3" />
                                        ) : (
                                            <FaFilePdf className="text-red-500 w-8 h-8 mr-3" />
                                        )}
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{doc.intitule}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <a href={`${BACKEND_URL}${doc.cheminFichier}`} target="_blank" rel="noreferrer" className="text-primary-600 hover:text-primary-800">
                                                <FaDownload />
                                            </a>
                                            <Button size="sm" variant="ghost" onClick={() => confirmDelete('document', doc.id, doc.intitule)} icon={<FaTrash className="text-red-500" />}>
                                                Supprimer
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <div className="mt-6">
                        <Button variant="outline" onClick={() => openModal('document')}><FaPlus className="mr-2" /> Ajouter un document</Button>
                    </div>
                </div>
            )
        },
        {
            id: 'affectations',
            label: 'Affectations',
            icon: FaExchangeAlt,
            content: (
                <div className="p-4">
                    {agent.affectations.length === 0 ? (
                        <EmptyState message="Aucune affectation" />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Direction</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date début</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date fin</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {agent.affectations.map((a) => (
                                        <tr key={a.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{a.directionSigle} - {a.directionNom}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{format(new Date(a.dateDebut), 'dd/MM/yyyy')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {a.dateFin ? format(new Date(a.dateFin), 'dd/MM/yyyy') : <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">En cours</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex space-x-2">
                                                    <Button size="sm" variant="ghost" onClick={() => openModal('affectation', a)}>Modifier</Button>
                                                    <Button size="sm" variant="ghost" onClick={() => confirmDelete('affectation', a.id, `${a.directionSigle} - ${a.directionNom}`)} icon={<FaTrash className="text-red-500" />}>Supprimer</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div className="mt-6">
                        <Button variant="outline" onClick={() => openModal('affectation')}><FaPlus className="mr-2" /> Nouvelle affectation</Button>
                    </div>
                </div>
            )
        },
        {
            id: 'promotions',
            label: 'Promotions',
            icon: FaHistory,
            content: (
                <div className="p-4">
                    {agent.promotions.length === 0 ? (
                        <EmptyState message="Aucune promotion" />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date début</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date fin</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Référence</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {agent.promotions.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.gradeSigle} - {p.gradeNom}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{format(new Date(p.dateDebut), 'dd/MM/yyyy')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {p.dateFin ? format(new Date(p.dateFin), 'dd/MM/yyyy') : <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Actuel</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.reference}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex space-x-2">
                                                    <Button size="sm" variant="ghost" onClick={() => openModal('promotion', p)}>Modifier</Button>
                                                    <Button size="sm" variant="ghost" onClick={() => confirmDelete('promotion', p.id, `${p.gradeSigle} - ${p.gradeNom}`)} icon={<FaTrash className="text-red-500" />}>Supprimer</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div className="mt-6">
                        <Button variant="outline" onClick={() => openModal('promotion')}><FaPlus className="mr-2" /> Ajouter une promotion</Button>
                    </div>
                </div>
            )
        },
        {
            id: 'etudes',
            label: 'Études',
            icon: FaGraduationCap,
            content: (
                <div className="p-4">
                    {etudes.length === 0 ? (
                        <EmptyState message="Aucune étude" />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {etudes.map((e) => (
                                <div key={e.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-900">{e.etablissement}</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {e.nombre_annee} an(s) – {e.lieu}
                                            </p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button size="sm" variant="ghost" onClick={() => openModal('etude', e)}>
                                                <FaEdit className="text-amber-600" />
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => confirmDelete('etude', e.id, e.etablissement)} icon={<FaTrash className="text-red-500" />}>
                                                Supprimer
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="mt-6">
                        <Button variant="outline" onClick={() => openModal('etude')}>
                            <FaPlus className="mr-2" /> Ajouter une étude
                        </Button>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center">
                        <Button variant="ghost" onClick={() => navigate('/agents')} className="mr-4"><FaArrowLeft className="mr-2" /> Retour</Button>
                        <h1 className="text-2xl font-bold text-gray-800">{agent.nom} {agent.prenom}</h1>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" onClick={handlePrint} icon={<FaPrint />}>Imprimer la fiche</Button>
                        <Button variant="outline" onClick={() => navigate(`/agents/edit/${agent.id}`)}>Modifier</Button>
                    </div>
                </div>

                <Card className="shadow-lg border-0">
                    <CardHeader className="bg-white border-b border-gray-200"><h2 className="text-lg font-semibold text-gray-800">Détails de l'agent</h2></CardHeader>
                    <CardBody className="p-0"><Tabs tabs={tabs} defaultTab="info" /></CardBody>
                </Card>

                {/* Modales d'édition */}
                {modalType === 'affectation' && (
                    <AffectationModal isOpen onClose={closeModal} onSave={handleSaveAffectation} affectation={selectedItem as AffectationDto | undefined} agentId={agent.id} />
                )}
                {modalType === 'promotion' && (
                    <PromotionModal isOpen onClose={closeModal} onSave={handleSavePromotion} promotion={selectedItem as PromotionDto | undefined} agentId={agent.id} />
                )}
                {modalType === 'dependant' && (
                    <DependantModal isOpen onClose={closeModal} onSave={handleSaveDependant} dependant={selectedItem as AffiliationDto | undefined} agentId={agent.id} />
                )}
                {modalType === 'document' && (
                    <DocumentModal isOpen onClose={closeModal} onSave={handleSaveDocument} document={selectedItem as DocumentDto | undefined} agentId={agent.id} />
                )}
                {modalType === 'etude' && (
                    <EtudeModal
                        isOpen
                        onClose={closeModal}
                        onSave={handleSaveEtude}
                        etude={selectedItem as Etude | undefined}
                        agentId={agent.id}
                    />
                )}

                {/* Modal de confirmation de suppression */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmer la suppression</h3>
                            <p className="text-gray-600 mb-6">
                                Voulez-vous vraiment supprimer {deleteConfirm.name} ?<br />
                                Cette action est irréversible.
                            </p>
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
                                <Button variant="danger" onClick={handleDelete}>Supprimer</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Toast */}
                {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} duration={4000} />}
            </div>
        </div>
    );
};

export default AgentDetails;