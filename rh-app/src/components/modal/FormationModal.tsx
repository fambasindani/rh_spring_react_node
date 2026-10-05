// src/components/modal/FormationModal.tsx
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../Button';
import type { FormationPayload } from '../../services/formations.service';

interface FormationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormationPayload) => Promise<void>;
  formation?: {
    id?: number;
    intitule?: string;
    organisme?: string;
    lieu?: string;
    dateDebut?: string;
    dateFin?: string;
    description?: string;
    statut?: boolean;
  } | null;
}

const FormationModal: React.FC<FormationModalProps> = ({ isOpen, onClose, onSave, formation }) => {
  const [form, setForm] = useState({
    intitule: formation?.intitule || '',
    organisme: formation?.organisme || '',
    lieu: formation?.lieu || '',
    dateDebut: formation?.dateDebut || '',
    dateFin: formation?.dateFin || '',
    description: formation?.description || '',
    statut: formation?.statut !== undefined ? formation.statut : true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.intitule) errors.intitule = 'L’intitulé est obligatoire';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await onSave(form);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={formation?.id ? 'Modifier formation' : 'Ajouter formation'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Intitulé"
          value={form.intitule}
          onChange={(e) => handleChange('intitule', e.target.value)}
          required
          error={fieldErrors.intitule}
        />
        <Input label="Organisme" value={form.organisme} onChange={(e) => handleChange('organisme', e.target.value)} />
        <Input label="Lieu" value={form.lieu} onChange={(e) => handleChange('lieu', e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Date début" type="date" value={form.dateDebut} onChange={(e) => handleChange('dateDebut', e.target.value)} />
          <Input label="Date fin" type="date" value={form.dateFin} onChange={(e) => handleChange('dateFin', e.target.value)} />
        </div>
        <Input label="Description" value={form.description} onChange={(e) => handleChange('description', e.target.value)} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select
            value={form.statut ? 'actif' : 'inactif'}
            onChange={(e) => handleChange('statut', e.target.value === 'actif')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          >
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
          </select>
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="primary" isLoading={submitting}>Enregistrer</Button>
        </div>
      </form>
    </Modal>
  );
};

export default FormationModal;