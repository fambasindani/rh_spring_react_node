import React, { useState, useRef, useEffect, useMemo } from 'react';
import Webcam from 'react-webcam';
import {
  FaCamera, FaTrash, FaPlus, FaUser, FaBriefcase,
  FaMapMarkerAlt, FaCameraRetro, FaUsers, FaSave, FaArrowLeft
} from 'react-icons/fa';
import Button from '../components/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { gradeService } from '../services/grades.service';
import type { GradeResponse } from '../services/grades.service';
import { fonctionService } from '../services/fonction.service';
import type {Fonction } from '../services/fonction.service';
import { directionService} from '../services/direction.service';
import type { Direction } from '../services/direction.service';
import { agentService } from '../services/agents.service';
import { AxiosError } from 'axios';
import api from '../types/api';
import {  useNavigate } from 'react-router-dom';
import { FormAgentSkeleton } from '../components/ui/Skeleton';





// URL de base du backend (sans /api)
const BACKEND_URL = api.defaults.baseURL?.replace(/\/api$/, '') || 'http://192.168.1.44:8083';

// Types internes
interface Dependant {
  nom: string;
  postnom: string;
  prenom: string;
  date_naissance: string;
  lieu_naissance: string;
  relation: string;
  etat: 'vivant' | 'mort';
  statut: boolean;
}

interface AgentPayload {
  matricule?: string;
  id_grade: number;
  id_fonction: number;
  id_direction: number;
  nom: string;
  postnom: string;
  prenom: string;
  sexe: string;
  date_naissance: string;
  email: string;
  telephone: string;
  etat_civil: string;
  statut: boolean;
  reference_engagement: string;
  date_engagement: string;
  province: string;
  territoire: string;
  village: string;
  photo?: string;
}

interface FormData {
  matricule: string;
  nom: string;
  postnom: string;
  prenom: string;
  sexe: 'M' | 'F';
  date_naissance: string;
  email: string;
  telephone: string;
  etat_civil: 'celibataire' | 'marie' | 'divorce' | 'veuf';
  date_engagement: string;
  reference_engagement: string;
  id_grade: string;
  id_fonction: string;
  id_direction: string;
  province: string;
  territoire: string;
  village: string;
  dependants: Dependant[];
  photo: File | null;
}

interface FormAgentProps {
  initialValues?: {
    id?: number;
    matricule?: string;
    nom?: string;
    postnom?: string;
    prenom?: string;
    sexe?: 'M' | 'F';
    date_naissance?: string;
    email?: string;
    telephone?: string;
    etat_civil?: string;
    date_engagement?: string;
    reference_engagement?: string;
    id_grade?: number;
    id_fonction?: number;
    id_direction?: number;
    province?: { id: number; nom: string };
    territoire?: { id: number; nom: string };
    village?: { id: number; nom: string };
    photo?: string;
    dependants?: Dependant[];
  };
  onSuccess?: () => void;
  onCancel?: () => void;
  isOwnProfile?: boolean;
}

interface ErrorResponse {
  message: string;
}

const FormAgent: React.FC<FormAgentProps> = ({ initialValues, onSuccess, isOwnProfile = false }) => {
  const [grades, setGrades] = useState<GradeResponse[]>([]);
  const [fonctions, setFonctions] = useState<Fonction[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    matricule: initialValues?.matricule || '',
    nom: initialValues?.nom || '',
    postnom: initialValues?.postnom || '',
    prenom: initialValues?.prenom || '',
    sexe: (initialValues?.sexe as 'M' | 'F') || '',
    date_naissance: initialValues?.date_naissance || '',
    email: initialValues?.email || '',
    telephone: initialValues?.telephone || '',
    etat_civil: (initialValues?.etat_civil as FormData['etat_civil']) || '',
    date_engagement: initialValues?.date_engagement || '',
    reference_engagement: initialValues?.reference_engagement || '',
    id_grade: '',
    id_fonction: '',
    id_direction: '',
    province: initialValues?.province?.nom || '',
    territoire: initialValues?.territoire?.nom || '',
    village: initialValues?.village?.nom || '',
    dependants: initialValues?.dependants || [],
    photo: null,
  });

  
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [affiliationErrors, setAffiliationErrors] = useState<Record<number, Partial<Record<keyof Dependant, string>>>>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showWebcam, setShowWebcam] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const isEdit = !!initialValues?.id;

  // Chargement initial des listes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gradesData, fonctionsData, directionsData] = await Promise.all([
          gradeService.getAll(),
          fonctionService.getAll(),
          directionService.getAll()
        ]);
        setGrades(gradesData);
        setFonctions(fonctionsData);
        setDirections(directionsData);
        setFormData(prev => ({
          ...prev,
          id_grade: initialValues?.id_grade?.toString() || '',
          id_fonction: initialValues?.id_fonction?.toString() || '',
          id_direction: initialValues?.id_direction?.toString() || '',
        }));
      } catch (error) {
        console.error(error);
        setToastMessage('Impossible de charger les grades, fonctions et directions.');
        setToastType('error');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [initialValues]);

  // Réinitialisation du formulaire (création)
  const resetForm = () => {
    setFormData({
      matricule: '',
      nom: '',
      postnom: '',
      prenom: '',
      sexe: '' as any,
      date_naissance: '',
      email: '',
      telephone: '',
      etat_civil: '' as any,
      date_engagement: '',
      reference_engagement: '',
      id_grade: '',
      id_fonction: '',
      id_direction: '',
      province: '',
      territoire: '',
      village: '',
      dependants: [],
      photo: null,
    });
    setFieldErrors({});
    setAffiliationErrors({});
    setShowWebcam(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const capturePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        const byteString = atob(imageSrc.split(',')[1]);
        const mimeString = imageSrc.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        const file = new File([blob], 'webcam_photo.jpg', { type: mimeString });
        setFormData(prev => ({ ...prev, photo: file }));
        setFieldErrors(prev => ({ ...prev, photo: '' }));
      }
      setShowWebcam(false);
    }
  };

  const addDependant = () => {
    setFormData(prev => ({
      ...prev,
      dependants: [
        ...prev.dependants,
        {
          nom: '',
          postnom: '',
          prenom: '',
          date_naissance: '',
          lieu_naissance: '',
          relation: '',
          etat: 'vivant',
          statut: true,
        },
      ],
    }));
    setAffiliationErrors(prev => ({ ...prev, [formData.dependants.length]: {} }));
  };

  const updateDependant = (index: number, field: keyof Dependant, value: string | boolean) => {
    const updated = [...formData.dependants];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, dependants: updated }));
    if (affiliationErrors[index]?.[field]) {
      setAffiliationErrors(prev => ({
        ...prev,
        [index]: { ...prev[index], [field]: '' },
      }));
    }
  };

  const removeDependant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      dependants: prev.dependants.filter((_, i) => i !== index),
    }));
    setAffiliationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });
  };

  const validateAffiliations = (): boolean => {
    let valid = true;
    const newErrors: typeof affiliationErrors = {};
    formData.dependants.forEach((dep, idx) => {
      const err: Partial<Record<keyof Dependant, string>> = {};
      if (!dep.nom.trim()) {
        err.nom = 'Le nom est obligatoire';
        valid = false;
      }
      if (!dep.postnom.trim()) {
        err.postnom = 'Le postnom est obligatoire';
        valid = false;
      }
      if (!dep.date_naissance) {
        err.date_naissance = 'La date de naissance est obligatoire';
        valid = false;
      }
      if (!dep.lieu_naissance.trim()) {
        err.lieu_naissance = 'Le lieu de naissance est obligatoire';
        valid = false;
      }
      if (!dep.relation.trim()) {
        err.relation = 'La relation est obligatoire';
        valid = false;
      }
      if (!dep.etat) {
        err.etat = "L'état est obligatoire";
        valid = false;
      }
      if (Object.keys(err).length > 0) newErrors[idx] = err;
    });
    setAffiliationErrors(newErrors);
    return valid;
  };

  const parseValidationErrors = (errorMessage: string): Record<string, string> => {
    const errors: Record<string, string> = {};
    const match = errorMessage.match(/\{([^}]+)\}/);
    if (match) {
      const parts = match[1].split(',').map(p => p.trim());
      parts.forEach(part => {
        const [field, message] = part.split('=');
        if (field && message) errors[field] = message;
      });
    }
    return errors;
  };

  // Aperçu photo
  const photoPreview = useMemo(() => {
    if (formData.photo instanceof File) {
      return URL.createObjectURL(formData.photo);
    }
    if (initialValues?.photo) {
      return `${BACKEND_URL}${initialValues.photo}`;
    }
    return undefined;
  }, [formData.photo, initialValues?.photo]);

  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validation frontale des champs de l'agent
    const requiredFields: { name: keyof FormData; label: string }[] = [
      { name: 'matricule', label: 'Matricule' },
      { name: 'nom', label: 'Nom' },
      { name: 'postnom', label: 'Postnom' },
      { name: 'prenom', label: 'Prénom' },
      { name: 'sexe', label: 'Sexe' },
      { name: 'date_naissance', label: 'Date de naissance' },
      { name: 'email', label: 'Email' },
      { name: 'telephone', label: 'Téléphone' },
      { name: 'etat_civil', label: 'État civil' },
      { name: 'reference_engagement', label: 'Référence engagement' },
      { name: 'date_engagement', label: "Date d'engagement" },
      { name: 'province', label: 'Province' },
      { name: 'territoire', label: 'Territoire' },
      { name: 'village', label: 'Village' },
    ];

    const frontErrors: Record<string, string> = {};
    for (const field of requiredFields) {
      const value = formData[field.name];
      if (value === undefined || value === '' || (field.name === 'date_naissance' && !value) || (field.name === 'date_engagement' && !value)) {
        frontErrors[field.name] = `Le champ ${field.label} est obligatoire.`;
      }
    }

    // 2. Validation des IDs
    const gradeId = Number(formData.id_grade);
    const fonctionId = Number(formData.id_fonction);
    const directionId = Number(formData.id_direction);
    if (gradeId <= 0) frontErrors.id_grade = 'Le grade est obligatoire.';
    if (fonctionId <= 0) frontErrors.id_fonction = 'La fonction est obligatoire.';
    if (directionId <= 0) frontErrors.id_direction = 'La direction est obligatoire.';

    // 3. Validation photo (obligatoire en création)
    if (!isEdit && !formData.photo) {
      frontErrors.photo = 'La photo est obligatoire.';
    }

    // 4. Validation des affiliations (uniquement en création)
    let affiliationsValid = true;
    if (!isEdit) {
      affiliationsValid = validateAffiliations();
    }

    if (Object.keys(frontErrors).length > 0 || (!isEdit && !affiliationsValid)) {
      setFieldErrors(frontErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const agentPayload: any = {
        matricule: formData.matricule,
        idGrade: gradeId,
        idFonction: fonctionId,
        idDirection: directionId,
        nom: formData.nom,
        postnom: formData.postnom,
        prenom: formData.prenom,
        sexe: formData.sexe,
        dateNaissance: formData.date_naissance,
        email: formData.email,
        telephone: formData.telephone,
        etatCivil: formData.etat_civil,
        statut: true,
        referenceEngagement: formData.reference_engagement,
        dateEngagement: formData.date_engagement,
        province: formData.province,
        territoire: formData.territoire,
        village: formData.village,
      };

      // En modification, si aucune nouvelle photo, on conserve l'ancienne
      if (isEdit && !formData.photo && initialValues?.photo) {
        agentPayload.photo = initialValues.photo;
      }

      // Supprimer les champs vides
      Object.keys(agentPayload).forEach(key => {
        const value = agentPayload[key as keyof AgentPayload];
        if (value === undefined || value === '') {
          delete agentPayload[key as keyof AgentPayload];
        }
      });

      const affiliationsData = formData.dependants.map(dep => ({
        nom: dep.nom,
        postnom: dep.postnom,
        prenom: dep.prenom,
        date_naissance: dep.date_naissance,
        lieu_naissance: dep.lieu_naissance,
        etat: dep.etat,
        relation: dep.relation,
        statut: dep.statut,
      }));

      const formDataToSend = new FormData();
      formDataToSend.append('agent', new Blob([JSON.stringify(agentPayload)], { type: 'application/json' }));
      if (!isEdit && affiliationsData.length > 0) {
        formDataToSend.append('affiliations', new Blob([JSON.stringify(affiliationsData)], { type: 'application/json' }));
      }
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }

      if (isEdit && initialValues?.id) {
        if (isOwnProfile) {
          await agentService.updateOwnProfile(formDataToSend);
        } else {
          await agentService.updateAgentWithAffiliations(initialValues.id, formDataToSend);
        }
        setToastMessage('Agent modifié avec succès !');
      } else {
        await agentService.createAgentWithAffiliations(formDataToSend);
        setToastMessage('Agent créé avec succès !');
      }

      setToastType('success');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      if (!isEdit) {
        resetForm();
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 400 && axiosError.response?.data) {
        const data = axiosError.response.data as ErrorResponse & { errors?: Record<string, string> };
        if (data.errors && typeof data.errors === 'object') {
          setFieldErrors({ ...data.errors });
          setToastMessage('Veuillez corriger les champs en erreur.');
          setToastType('error');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 4000);
          return;
        }
        if (data.message && typeof data.message === 'string') {
          const errors = parseValidationErrors(data.message);
          if (Object.keys(errors).length === 0) {
            const match = data.message.match(/(?:Le|La|L')\s*([\w\séèêëàâäôöûüç-]+?)\s+est obligatoire/);
            if (match && match[1]) {
              let fieldRaw = match[1].trim().toLowerCase();
              if (fieldRaw.startsWith("l'")) fieldRaw = fieldRaw.substring(2);
              const fieldMap: Record<string, string> = {
                'matricule': 'matricule',
                'nom': 'nom',
                'postnom': 'postnom',
                'prenom': 'prenom',
                'prénom': 'prenom',
                'sexe': 'sexe',
                'date de naissance': 'date_naissance',
                'email': 'email',
                'téléphone': 'telephone',
                'état civil': 'etat_civil',
                'référence engagement': 'reference_engagement',
                "date d'engagement": 'date_engagement',
                'province': 'province',
                'territoire': 'territoire',
                'village': 'village',
                'grade': 'id_grade',
                'fonction': 'id_fonction',
                'direction': 'id_direction',
                'photo': 'photo',
              };
              const mappedField = fieldMap[fieldRaw];
              if (mappedField) {
                errors[mappedField] = data.message;
              } else {
                setToastMessage(data.message);
                setToastType('error');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
                return;
              }
            } else {
              setToastMessage(data.message);
              setToastType('error');
              setShowToast(true);
              setTimeout(() => setShowToast(false), 3000);
              return;
            }
          }
          setFieldErrors(errors);
          return;
        }
      }
      setToastMessage(isEdit ? "Une erreur est survenue lors de la modification." : 'Une erreur est survenue lors de la création.');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const gradeOptions = [{ value: '', label: 'Veuillez sélectionner le grade' }, ...grades.map(g => ({ value: g.id.toString(), label: `${g.sigle} - ${g.nom}` }))];
  const fonctionOptions = [{ value: '', label: 'Veuillez sélectionner la fonction' }, ...fonctions.map(f => ({ value: f.id.toString(), label: f.nom }))];
  const directionOptions = [{ value: '', label: 'Veuillez sélectionner la direction' }, ...directions.map(d => ({ value: d.id.toString(), label: `${d.sigle} - ${d.nom}` }))];

  if (loading) {
    return <FormAgentSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8 relative">
      {/* Toast notification */}
      {showToast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg transition-all duration-300 ${
          toastType === 'success' ? 'bg-green-50 text-green-800 border-l-4 border-green-500' : 'bg-red-50 text-red-800 border-l-4 border-red-500'
        }`}>
          <div className="flex items-center space-x-2">
            {toastType === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate('/agents')} className="mr-4"><FaArrowLeft className="mr-2" /> Retour</Button>
            <h1 className="text-2xl font-bold text-gray-800">
              {isEdit ? 'Modifier agent' : 'Ajouter un agent'}
            </h1>
          </div>
        </div>

        <form id="agent-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Informations personnelles */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <FaUser className="mr-2 text-blue-600" /> Informations personnelles
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Input
                  label="Matricule"
                  name="matricule"
                  value={formData.matricule}
                  onChange={handleChange}
                  required
                  error={fieldErrors.matricule}
                />
                <Input
                  label="Nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  error={fieldErrors.nom}
                />
                <Input
                  label="Postnom"
                  name="postnom"
                  value={formData.postnom}
                  onChange={handleChange}
                  required
                  error={fieldErrors.postnom}
                />
                <Input
                  label="Prénom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                  error={fieldErrors.prenom}
                />
                <Select
                  label="Sexe"
                  name="sexe"
                  value={formData.sexe}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Veuillez sélectionner le sexe' },
                    { value: 'M', label: 'Masculin' },
                    { value: 'F', label: 'Féminin' },
                  ]}
                  required
                  error={fieldErrors.sexe}
                />
                <Input
                  label="Date de naissance"
                  type="date"
                  name="date_naissance"
                  value={formData.date_naissance}
                  onChange={handleChange}
                  required
                  error={fieldErrors.date_naissance}
                />
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  error={fieldErrors.email}
                />
                <Input
                  label="Téléphone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  required
                  error={fieldErrors.telephone}
                />
                <Select
                  label="État civil"
                  name="etat_civil"
                  value={formData.etat_civil}
                  onChange={handleChange}
                  options={[
                    { value: '', label: "Veuillez sélectionner l'état civil" },
                    { value: 'celibataire', label: 'Célibataire' },
                    { value: 'marie', label: 'Marié(e)' },
                    { value: 'divorce', label: 'Divorcé(e)' },
                    { value: 'veuf', label: 'Veuf/Veuve' },
                  ]}
                  required
                  error={fieldErrors.etat_civil}
                />
              </div>
            </div>
          </section>

          {/* Carrière */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <FaBriefcase className="mr-2 text-green-600" /> Carrière
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Select
                  label="Grade"
                  name="id_grade"
                  value={formData.id_grade}
                  onChange={handleChange}
                  options={gradeOptions}
                  required
                  error={fieldErrors.id_grade}
                />
                <Select
                  label="Fonction"
                  name="id_fonction"
                  value={formData.id_fonction}
                  onChange={handleChange}
                  options={fonctionOptions}
                  required
                  error={fieldErrors.id_fonction}
                />
                <Select
                  label="Direction"
                  name="id_direction"
                  value={formData.id_direction}
                  onChange={handleChange}
                  options={directionOptions}
                  required
                  error={fieldErrors.id_direction}
                />
                <Input
                  label="Date d'engagement"
                  type="date"
                  name="date_engagement"
                  value={formData.date_engagement}
                  onChange={handleChange}
                  required
                  error={fieldErrors.date_engagement}
                />
                <Input
                  label="Référence engagement"
                  name="reference_engagement"
                  value={formData.reference_engagement}
                  onChange={handleChange}
                  required
                  error={fieldErrors.reference_engagement}
                />
              </div>
            </div>
          </section>

          {/* Localisation */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-amber-600" /> ORIGINE
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  label="Province"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  required
                  error={fieldErrors.province}
                />
                <Input
                  label="Territoire"
                  name="territoire"
                  value={formData.territoire}
                  onChange={handleChange}
                  required
                  error={fieldErrors.territoire}
                />
                <Input
                  label="Village"
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  required
                  error={fieldErrors.village}
                />
              </div>
            </div>
          </section>

          {/* Photo */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <FaCameraRetro className="mr-2 text-purple-600" /> Photo
              </h3>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Agent"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                      <FaCamera className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  {!showWebcam ? (
                    <Button type="button" variant="outline" onClick={() => setShowWebcam(true)}>
                      <FaCamera className="mr-2" /> Prendre une photo
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        width={320}
                        height={240}
                        className="rounded-lg border border-gray-300"
                      />
                      <div className="flex gap-2">
                        <Button type="button" variant="primary" onClick={capturePhoto}>
                          Capturer
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowWebcam(false)}>
                          Annuler
                        </Button>
                      </div>
                    </div>
                  )}
                  {fieldErrors.photo && <p className="mt-2 text-sm text-red-600">{fieldErrors.photo}</p>}
                </div>
              </div>
            </div>
          </section>

          {/* Affiliations (uniquement en création) */}
          {!isEdit && (
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaUsers className="mr-2 text-pink-600" /> Affiliations
                  </h3>
                  <Button type="button" variant="outline" size="sm" onClick={addDependant}>
                    <FaPlus className="mr-2" /> Ajouter
                  </Button>
                </div>
              </div>
              <div className="p-6">
                {formData.dependants.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Aucun dépendant ajouté.</p>
                ) : (
                  <div className="space-y-4">
                    {formData.dependants.map((dep, index) => (
                      <div key={index} className="relative border border-gray-200 rounded-lg p-5 bg-gray-50">
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          className="absolute top-3 right-3"
                          onClick={() => removeDependant(index)}
                        >
                          <FaTrash />
                        </Button>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <Input
                            label="Nom"
                            value={dep.nom}
                            onChange={(e) => updateDependant(index, 'nom', e.target.value)}
                            required
                            error={affiliationErrors[index]?.nom}
                          />
                          <Input
                            label="Postnom"
                            value={dep.postnom}
                            onChange={(e) => updateDependant(index, 'postnom', e.target.value)}
                            required
                            error={affiliationErrors[index]?.postnom}
                          />
                          <Input
                            label="Prénom"
                            value={dep.prenom}
                            onChange={(e) => updateDependant(index, 'prenom', e.target.value)}
                          />
                          <Input
                            label="Date naissance"
                            type="date"
                            value={dep.date_naissance}
                            onChange={(e) => updateDependant(index, 'date_naissance', e.target.value)}
                            required
                            error={affiliationErrors[index]?.date_naissance}
                          />
                          <Input
                            label="Lieu naissance"
                            value={dep.lieu_naissance}
                            onChange={(e) => updateDependant(index, 'lieu_naissance', e.target.value)}
                            required
                            error={affiliationErrors[index]?.lieu_naissance}
                          />
                          <Select
                            label="Relation"
                            value={dep.relation}
                            onChange={(e) => updateDependant(index, 'relation', e.target.value)}
                            options={[
                              { value: '', label: 'Veuillez sélectionner la relation' },
                              { value: 'epouse', label: 'Épouse' },
                              { value: 'epoux', label: 'Époux' },
                              { value: 'enfant', label: 'Enfant' },
                              { value: 'pere', label: 'Père' },
                              { value: 'mere', label: 'Mère' },
                            ]}
                            required
                            error={affiliationErrors[index]?.relation}
                          />
                          <Select
                            label="État"
                            value={dep.etat}
                            onChange={(e) => updateDependant(index, 'etat', e.target.value)}
                            options={[
                              { value: '', label: "Veuillez sélectionner l'état" },
                              { value: 'vivant', label: 'Vivant' },
                              { value: 'mort', label: 'Décédé' },
                            ]}
                            required
                            error={affiliationErrors[index]?.etat}
                          />
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                            <select
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              value={dep.statut ? 'actif' : 'inactif'}
                              onChange={(e) => updateDependant(index, 'statut', e.target.value === 'actif')}
                            >
                              <option value="actif">Actif</option>
                              <option value="inactif">Inactif</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4">
                  <Button type="button" variant="outline" size="sm" onClick={addDependant}>
                    <FaPlus className="mr-2" /> Ajouter
                  </Button>
                </div>
              </div>
            </section>
          )}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/agents')}>
              Annuler
            </Button>
            <Button
              type="submit"
              form="agent-form"
              variant="primary"
              icon={<FaSave />}
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isEdit ? 'Mettre à jour' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormAgent;