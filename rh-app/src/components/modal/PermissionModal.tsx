// src/components/modal/PermissionModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../Button';
import SearchableSelect from '../SearchableSelect';
import type{ PermissionPayload } from '../../services/permissions.service';
import { agentService } from '../../services/agents.service';
import { debounce } from 'lodash';

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PermissionPayload) => Promise<void>;
  permission?: {
    id?: number;
    idAgent?: number;
    datePermission?: string;
    heureSortie?: string;
    heureRetour?: string;
    motif?: string;
    statut?: string;
  } | null;
}

interface FormData {
  idAgent: number | null;
  datePermission: string;
  heureSortie: string;
  heureRetour: string;
  motif: string;
  statut: string;
}

const PermissionModal: React.FC<PermissionModalProps> = ({ isOpen, onClose, onSave, permission }) => {
  const [form, setForm] = useState<FormData>({
    idAgent: permission?.idAgent || null,
    datePermission: permission?.datePermission || '',
    heureSortie: permission?.heureSortie || '',
    heureRetour: permission?.heureRetour || '',
    motif: permission?.motif || '',
    statut: permission?.statut || 'EN_ATTENTE',
  });

  const [agentOptions, setAgentOptions] = useState<{ value: number; label: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && agentOptions.length === 0) {
      agentService.searchAgents({ page: 0, size: 20 }).then(response => {
        const opts = response.content.map(a => ({
          value: a.id,
          label: `${a.nom} ${a.prenom} (${a.matricule})`,
        }));
        setAgentOptions(opts);
      }).catch(console.error);
    }
  }, [isOpen]);

  const searchAgents = useCallback(
    debounce(async (keyword: string) => {
      if (!keyword || keyword.length < 2) {
        return;
      }
      setSearching(true);
      try {
        const response = await agentService.searchAgents({ keyword, page: 0, size: 20 });
        const opts = response.content.map(a => ({
          value: a.id,
          label: `${a.nom} ${a.prenom} (${a.matricule})`,
        }));
        setAgentOptions(opts);
      } catch (error) {
        console.error(error);
      } finally {
        setSearching(false);
      }
    }, 500),
    []
  );

  const onSearchInputChange = (inputValue: string) => {
    searchAgents(inputValue);
  };

  const handleChange = (field: keyof FormData, value: any) => {
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
    if (!form.idAgent) errors.idAgent = 'L’agent est obligatoire';
    if (!form.datePermission) errors.datePermission = 'La date est obligatoire';
    if (!form.statut) errors.statut = 'Le statut est obligatoire';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload: PermissionPayload = {
        idAgent: form.idAgent!,
        datePermission: form.datePermission,
        heureSortie: form.heureSortie || undefined,
        heureRetour: form.heureRetour || undefined,
        motif: form.motif || undefined,
        statut: form.statut,
      };
      await onSave(payload);
      onClose();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Une erreur est survenue';
      setFieldErrors({ _global: message });
    } finally {
      setSubmitting(false);
    }
  };

  const statutOptions = [
    { value: '', label: 'Veuillez sélectionner le statut' },
    { value: 'EN_ATTENTE', label: 'En attente' },
    { value: 'ACCEPTE', label: 'Accepté' },
    { value: 'REFUSE', label: 'Refusé' },
    { value: 'ANNULE', label: 'Annulé' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={permission?.id ? 'Modifier permission' : 'Ajouter permission'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {fieldErrors._global && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
            {fieldErrors._global}
          </div>
        )}

        <SearchableSelect
          label="Agent"
          options={agentOptions}
          value={form.idAgent}
          onChange={(val) => handleChange('idAgent', val)}
          isLoading={searching}
          required
          error={fieldErrors.idAgent}
          placeholder="Tapez au moins 2 lettres..."
          onInputChange={onSearchInputChange}
        />

        <Input
          label="Date"
          type="date"
          value={form.datePermission}
          onChange={(e) => handleChange('datePermission', e.target.value)}
          required
          error={fieldErrors.datePermission}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Heure sortie"
            type="time"
            value={form.heureSortie}
            onChange={(e) => handleChange('heureSortie', e.target.value)}
          />
          <Input
            label="Heure retour"
            type="time"
            value={form.heureRetour}
            onChange={(e) => handleChange('heureRetour', e.target.value)}
          />
        </div>

        <Input
          label="Motif"
          value={form.motif}
          onChange={(e) => handleChange('motif', e.target.value)}
          placeholder="Raison de la permission"
        />

        <Select
          label="Statut"
          options={statutOptions}
          value={form.statut}
          onChange={(e) => handleChange('statut', e.target.value)}
          required
          error={fieldErrors.statut}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="primary" isLoading={submitting}>Enregistrer</Button>
        </div>
      </form>
    </Modal>
  );
};

export default PermissionModal;