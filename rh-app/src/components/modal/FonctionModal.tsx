import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../Button';
import type { Fonction } from '../../services/fonction.service';
import { AxiosError } from 'axios';

interface FonctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fonction: Fonction) => Promise<void>;
  fonction?: Fonction;
}

interface BackendError {
  message?: string;
  errors?: Record<string, string>;
}

const FonctionModal: React.FC<FonctionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  fonction,
}) => {
  const [nom, setNom] = useState('');
  const [statut, setStatut] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setNom(fonction?.nom || '');
    setStatut(fonction?.statut ?? true);
    setFieldErrors({});
    setGlobalError('');
  }, [isOpen, fonction]);

  const handleChange = (field: 'nom', value: string) => {
    if (field === 'nom') setNom(value);
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!nom.trim()) errors.nom = 'Le nom est obligatoire';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setFieldErrors({});
    setGlobalError('');

    const data: Fonction = {
      id: fonction?.id ?? 0,
      nom: nom.trim(),
      statut,
    };

    try {
      await onSave(data);
    } catch (err) {
      const error = err as AxiosError<BackendError>;
      if (error.response?.status === 400 || error.response?.status === 422) {
        const backendData = error.response.data;
        if (backendData?.errors) {
          setFieldErrors(backendData.errors);
        } else if (backendData?.message) {
          setGlobalError(backendData.message);
        } else {
          setGlobalError('Erreur de validation.');
        }
      } else {
        setGlobalError('Erreur réseau. Veuillez réessayer.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      key={fonction?.id || 'new'}
      isOpen={isOpen}
      onClose={onClose}
      title={fonction ? 'Modifier fonction' : 'Ajouter fonction'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {globalError && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
            {globalError}
          </div>
        )}

        <Input
          label="Nom"
          value={nom}
          onChange={(e) => handleChange('nom', e.target.value)}
          error={fieldErrors.nom}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select
            value={statut ? 'true' : 'false'}
            onChange={(e) => setStatut(e.target.value === 'true')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          >
            <option value="true">Actif</option>
            <option value="false">Inactif</option>
          </select>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default FonctionModal;