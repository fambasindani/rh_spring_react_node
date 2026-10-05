// src/components/modal/AbsenceModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../Button';
import SearchableSelect from '../SearchableSelect';
import type{ AbsencePayload } from '../../services/absences.service';
import { agentService } from '../../services/agents.service';
import { debounce } from 'lodash';

interface AbsenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AbsencePayload) => Promise<void>;
  absence?: {
    id?: number;
    idAgent?: number;
    dateDebut?: string;
    dateFin?: string;
    motif?: string;
    justification?: string;
    statut?: boolean;
  } | null;
}

interface FormData {
  idAgent: number | null;
  dateDebut: string;
  dateFin: string;
  motif: string;
  justification: string;
  statut: boolean;
}

const AbsenceModal: React.FC<AbsenceModalProps> = ({ isOpen, onClose, onSave, absence }) => {
  const [form, setForm] = useState<FormData>({
    idAgent: absence?.idAgent || null,
    dateDebut: absence?.dateDebut || '',
    dateFin: absence?.dateFin || '',
    motif: absence?.motif || '',
    justification: absence?.justification || '',
    statut: absence?.statut ?? true,
  });

  const [agentOptions, setAgentOptions] = useState<{ value: number; label: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Charger une liste initiale d'agents à l'ouverture
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
  }, [isOpen, agentOptions.length]);

  const searchAgents = useCallback(
    debounce(async (keyword: string) => {
      if (!keyword || keyword.length < 2) return;
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
    if (!form.dateDebut) errors.dateDebut = 'La date de début est obligatoire';
    if (!form.dateFin) errors.dateFin = 'La date de fin est obligatoire';
    if (form.dateDebut && form.dateFin && new Date(form.dateDebut) > new Date(form.dateFin)) {
      errors.dateFin = 'La date de fin doit être postérieure à la date de début';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload: AbsencePayload = {
        idAgent: form.idAgent!,
        dateDebut: form.dateDebut,
        dateFin: form.dateFin,
        motif: form.motif || undefined,
        justification: form.justification || undefined,
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={absence?.id ? 'Modifier absence' : 'Ajouter absence'} size="lg">
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
          placeholder="Tapez au moins 2 lettres pour rechercher..."
          
          onInputChange={onSearchInputChange}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Date de début"
            type="date"
            value={form.dateDebut}
            onChange={(e) => handleChange('dateDebut', e.target.value)}
            required
            error={fieldErrors.dateDebut}
          />
          <Input
            label="Date de fin"
            type="date"
            value={form.dateFin}
            onChange={(e) => handleChange('dateFin', e.target.value)}
            required
            error={fieldErrors.dateFin}
          />
        </div>

        <Input
          label="Motif"
          value={form.motif}
          onChange={(e) => handleChange('motif', e.target.value)}
          placeholder="Raison de l'absence"
        />

        <Input
          label="Justification"
          value={form.justification}
          onChange={(e) => handleChange('justification', e.target.value)}
          placeholder="Justification (optionnelle)"
        />

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

export default AbsenceModal;