import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../Button';
import type { Direction } from '../../services/direction.service';
import { AxiosError } from 'axios';

interface DirectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (direction: Direction) => Promise<void>;
  direction?: Direction;
}

interface BackendError {
  message?: string;
  errors?: Record<string, string>;
}

const DirectionModal: React.FC<DirectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  direction,
}) => {
  const [sigle, setSigle] = useState('');
  const [nom, setNom] = useState('');
  const [statut, setStatut] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setSigle(direction?.sigle || '');
    setNom(direction?.nom || '');
    setStatut(direction?.statut ?? true);
    setFieldErrors({});
    setGlobalError('');
  }, [isOpen, direction]);

  const handleChange = (field: 'sigle' | 'nom', value: string) => {
    if (field === 'sigle') setSigle(value);
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
    if (!sigle.trim()) errors.sigle = 'Le sigle est obligatoire';
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

    const data: Direction = {
      id: direction?.id ?? 0,
      sigle: sigle.trim(),
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
      key={direction?.id || 'new'}
      isOpen={isOpen}
      onClose={onClose}
      title={direction ? 'Modifier direction' : 'Ajouter direction'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {globalError && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
            {globalError}
          </div>
        )}

        <Input
          label="Sigle"
          value={sigle}
          onChange={(e) => handleChange('sigle', e.target.value)}
          error={fieldErrors.sigle}
          required
        />

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

export default DirectionModal;