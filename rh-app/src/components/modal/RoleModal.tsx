// src/components/modal/RoleModal.tsx
import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../Button';
import type { RolePayload } from '../../types/role';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: RolePayload) => Promise<void>;
  initialData?: {
    id?: number;
    nomRole?: string;
    description?: string;
  };
}

const RoleModal: React.FC<RoleModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [nomRole, setNomRole] = useState(initialData?.nomRole || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ nomRole?: string; _global?: string }>({});

  useEffect(() => {
    if (isOpen) {
      setNomRole(initialData?.nomRole || '');
      setDescription(initialData?.description || '');
      setErrors({});
    }
  }, [isOpen, initialData]);

  const validate = (): boolean => {
    const newErrors: { nomRole?: string } = {};
    if (!nomRole.trim()) newErrors.nomRole = 'Le nom du rôle est obligatoire';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSave({ nomRole: nomRole.trim(), description: description.trim() || undefined });
      onClose();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setErrors({ _global: err.response?.data?.message || 'Une erreur est survenue' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData?.id ? 'Modifier un rôle' : 'Ajouter un rôle'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors._global && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
            {errors._global}
          </div>
        )}

        <Input
          label="Nom du rôle"
          value={nomRole}
          onChange={(e) => setNomRole(e.target.value)}
          required
          error={errors.nomRole}
          placeholder="Ex: ADMIN, RH, AGENT"
        />

        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description facultative"
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="primary" isLoading={submitting}>
            {initialData?.id ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RoleModal;