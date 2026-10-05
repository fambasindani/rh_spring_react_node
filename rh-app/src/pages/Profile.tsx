// src/pages/Profile.tsx
import React, { useState, useEffect, useRef } from 'react';
import { userService, type UpdateProfileData } from '../services/user.service';
import { agentService } from '../services/agents.service';
import type { AgentDetailsResponse } from '../types/agent';
import Button from '../components/Button';
import Input from '../components/ui/Input';
import { FaCamera, FaPencilAlt, FaLock, FaSave, FaTimes, FaBriefcase, FaMapMarkerAlt, FaEnvelope, FaPhone, FaBirthdayCake, FaTransgender } from 'react-icons/fa';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AxiosError } from 'axios';
import { BACKEND_BASE_URL } from '../config/constants';
import { TableSkeleton } from '../components/ui/Skeleton';

interface ErrorResponse {
  message: string;
}

const Profile: React.FC = () => {
  const [agent, setAgent] = useState<AgentDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileData>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
  });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Changement de mot de passe
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Upload photo
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [, setUploadingCover] = useState(false);
  const [photoVersion, setPhotoVersion] = useState(0);

  // Modal d'erreur
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userService.getProfile();
        setAgent(data);
        setFormData({
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          telephone: data.telephone || '',
        });
      } catch (error) {
        console.error(error);
        setProfileError('Impossible de charger le profil');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleEditClick = () => {
    setEditMode(true);
    setFormData({
      nom: agent?.nom || '',
      prenom: agent?.prenom || '',
      email: agent?.email || '',
      telephone: agent?.telephone || '',
    });
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setProfileError('');
    setProfileSuccess('');
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setIsSubmitting(true);
    try {
      const updated = await userService.updateProfile(formData);
      setAgent(prev => prev ? { ...prev, ...updated } : updated);
      setProfileSuccess('Profil mis à jour avec succès');
      setEditMode(false);
    } catch (error) {
      const axiosError = error as AxiosError;
      const data = axiosError.response?.data as ErrorResponse;
      setProfileError(data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = async (file: File, type: 'photo' | 'cover') => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      if (type === 'photo') setUploadingPhoto(true);
      else setUploadingCover(true);
      const response = await agentService.updatePhoto(formData);
      setAgent(prev => prev ? { ...prev, photo: response.photo } : prev);
      setPhotoVersion(v => v + 1);
    } catch (error) {
      console.error(error);
      setErrorMessage('Erreur lors du téléchargement de la photo');
      setShowErrorModal(true);
    } finally {
      if (type === 'photo') setUploadingPhoto(false);
      else setUploadingCover(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) handlePhotoUpload(file, type);
    e.target.value = '';
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setIsSubmittingPassword(true);
    try {
      await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });
      setPasswordSuccess('Mot de passe modifié avec succès');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setShowPasswordModal(false), 1500);
    } catch (error) {
      const axiosError = error as AxiosError;
      const data = axiosError.response?.data as ErrorResponse;
      setPasswordError(data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <TableSkeleton rows={3} />
      </div>
    );
  }

  if (!agent) {
    return <div className="p-6 text-center text-red-600">Impossible de charger le profil</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Bannière de couverture */}
      <div className="relative h-64 md:h-80 bg-gradient-to-r from-blue-800 to-indigo-800">
        {agent.photo ? (
          <img
            src={`${BACKEND_BASE_URL}${agent.photo}?v=${photoVersion}`}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        ) : null}
        <div className="absolute inset-0 bg-black/20"></div>
        <button
          onClick={() => coverInputRef.current?.click()}
          className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
          title="Changer la couverture"
        >
          <FaCamera />
        </button>
        <input
          type="file"
          ref={coverInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => handleFileChange(e, 'cover')}
        />
      </div>

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        {/* Carte de profil */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Section photo de profil */}
          <div className="relative flex flex-col items-center pt-16 pb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200">
                {agent.photo ? (
                  <img
                    src={`${BACKEND_BASE_URL}${agent.photo}?v=${photoVersion}`}
                    alt="Photo de profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-500 bg-gray-200">
                    {agent.nom?.[0]}{agent.prenom?.[0]}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition"
                disabled={uploadingPhoto}
              >
                {uploadingPhoto ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FaCamera />}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'photo')}
              />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">{agent.nom} {agent.prenom}</h1>
            <p className="text-gray-500">{agent.fonctionNom} • {agent.directionSigle}</p>
            <div className="flex gap-2 mt-4">
              {!editMode ? (
                <Button variant="outline" onClick={handleEditClick} icon={<FaPencilAlt />}>
                  Modifier le profil
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={handleCancelEdit} icon={<FaTimes />}>
                    Annuler
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleProfileSubmit}
                    isLoading={isSubmitting}
                    icon={<FaSave />}
                  >
                    Enregistrer
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => setShowPasswordModal(true)} icon={<FaLock />}>
                Changer mot de passe
              </Button>
            </div>
          </div>

          {/* Formulaire d'édition (si mode édition) */}
          {editMode && (
            <div className="border-t border-gray-200 p-6">
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Nom" name="nom" value={formData.nom} onChange={handleProfileChange} required />
                  <Input label="Prénom" name="prenom" value={formData.prenom} onChange={handleProfileChange} required />
                  <Input label="Email" type="email" name="email" value={formData.email} onChange={handleProfileChange} required />
                  <Input label="Téléphone" name="telephone" value={formData.telephone} onChange={handleProfileChange} />
                </div>
                {profileError && <div className="text-red-600 text-sm">{profileError}</div>}
                {profileSuccess && <div className="text-green-600 text-sm">{profileSuccess}</div>}
              </form>
            </div>
          )}

          {/* Informations détaillées */}
          <div className="border-t border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 text-gray-700">
                <FaEnvelope className="text-gray-400" />
                <span>{agent.email}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <FaPhone className="text-gray-400" />
                <span>{agent.telephone || 'Non renseigné'}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <FaBirthdayCake className="text-gray-400" />
                <span>{format(new Date(agent.dateNaissance), 'dd MMMM yyyy', { locale: fr })}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <FaTransgender className="text-gray-400" />
                <span>{agent.sexe === 'M' ? 'Masculin' : 'Féminin'}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <FaBriefcase className="text-gray-400" />
                <span>{agent.gradeSigle} - {agent.gradeNom}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <FaMapMarkerAlt className="text-gray-400" />
                <span>{agent.village}, {agent.territoire}, {agent.province}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal changement de mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Changer le mot de passe</h2>
                <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-600">
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <Input
                  label="Mot de passe actuel"
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <Input
                  label="Nouveau mot de passe"
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <Input
                  label="Confirmer le nouveau mot de passe"
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
                {passwordError && <div className="text-red-600 text-sm">{passwordError}</div>}
                {passwordSuccess && <div className="text-green-600 text-sm">{passwordSuccess}</div>}
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowPasswordModal(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" variant="primary" isLoading={isSubmittingPassword}>
                    Changer
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Modal d'erreur */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full">
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <FaTimes className="text-red-600 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur</h3>
              <p className="text-gray-600 mb-6">{errorMessage}</p>
              <button
                onClick={() => setShowErrorModal(false)}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;