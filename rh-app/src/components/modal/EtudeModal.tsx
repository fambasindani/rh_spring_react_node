import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../Button';
import { AxiosError } from 'axios';
import type { Etude, EtudePayload } from '../../services/etude.service';

interface EtudeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EtudePayload & { id?: number }) => Promise<void>;
  etude?: Etude;
  agentId: number;
}

interface BackendError {
  message?: string;
  errors?: Record<string, string>;
}

const EtudeModal: React.FC<EtudeModalProps> = ({ isOpen, onClose, onSave, etude, agentId }) => {
  const [nombreAnnee, setNombreAnnee] = useState<number | ''>('');
  const [lieu, setLieu] = useState('');
  const [etablissement, setEtablissement] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setNombreAnnee(etude?.nombre_annee ?? '');
    setLieu(etude?.lieu ?? '');
    setEtablissement(etude?.etablissement ?? '');
    setFieldErrors({});
    setGlobalError('');
  }, [isOpen, etude]);

  const handleChange = (field: 'nombreAnnee' | 'lieu' | 'etablissement', value: string | number) => {
    if (field === 'nombreAnnee') setNombreAnnee(value === '' ? '' : Number(value));
    if (field === 'lieu') setLieu(value as string);
    if (field === 'etablissement') setEtablissement(value as string);
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
    if (!nombreAnnee) errors.nombreAnnee = 'Le nombre d’années est obligatoire';
    else if (nombreAnnee < 1) errors.nombreAnnee = 'Le nombre d’années doit être ≥ 1';
    if (!lieu.trim()) errors.lieu = 'Le lieu est obligatoire';
    if (!etablissement.trim()) errors.etablissement = "L'établissement est obligatoire";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setFieldErrors({});
    setGlobalError('');

    const data: EtudePayload & { id?: number } = {
      id: etude?.id,
      id_agent: agentId,           // ← snake_case
      nombre_annee: Number(nombreAnnee), // ← snake_case
      lieu: lieu.trim(),
      etablissement: etablissement.trim(),
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
      key={etude?.id || 'new'}
      isOpen={isOpen}
      onClose={onClose}
      title={etude ? 'Modifier étude' : 'Ajouter étude'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {globalError && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
            {globalError}
          </div>
        )}


        <Input
          label="Établissement"
          value={etablissement}
          onChange={(e) => handleChange('etablissement', e.target.value)}
          error={fieldErrors.etablissement}
          required
        />

        <Input
          label="Lieu"
          value={lieu}
          onChange={(e) => handleChange('lieu', e.target.value)}
          error={fieldErrors.lieu}
          required
        />

        <Input
          label="Nombre d'années"
          type="number"
          value={nombreAnnee === '' ? '' : nombreAnnee.toString()}
          onChange={(e) => handleChange('nombreAnnee', e.target.value)}
          error={fieldErrors.nombreAnnee}
          required
        />





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

export default EtudeModal;