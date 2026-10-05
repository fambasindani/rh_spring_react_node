import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../Button';
import type { DroitPayload } from '../../types/droit';

interface DroitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DroitPayload) => Promise<void>;
  initialData?: {
    id?: number;
    nomDroit?: string;
    description?: string;
    module?: string;
  };
}

const DroitModal: React.FC<DroitModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [nomDroit, setNomDroit] = useState(initialData?.nomDroit || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [module, setModule] = useState(initialData?.module || '');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ nomDroit?: string; _global?: string }>({});

  useEffect(() => {
    if (isOpen) {
      setNomDroit(initialData?.nomDroit || '');
      setDescription(initialData?.description || '');
      setModule(initialData?.module || '');
      setErrors({});
    }
  }, [isOpen, initialData]);

  const validate = (): boolean => {
    const newErrors: { nomDroit?: string } = {};
    if (!nomDroit.trim()) newErrors.nomDroit = 'Le nom du droit est obligatoire';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSave({
        nomDroit: nomDroit.trim(),
        description: description.trim() || undefined,
        module: module.trim() || undefined,
      });
      onClose();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setErrors({ _global: err.response?.data?.message || 'Une erreur est survenue' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? 'Modifier le droit' : 'Ajouter un droit'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors._global && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">{errors._global}</div>
        )}
        <Input label="Nom du droit" value={nomDroit} onChange={(e) => setNomDroit(e.target.value)} required error={errors.nomDroit} placeholder="Ex: CREATE_AGENT, VIEW_USERS" />
        <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description du droit" />
        <Input label="Module" value={module} onChange={(e) => setModule(e.target.value)} placeholder="Ex: AGENTS, CONGES, UTILISATEURS" />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="primary" isLoading={submitting}>{initialData?.id ? 'Mettre à jour' : 'Créer'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default DroitModal;
