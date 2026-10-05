// src/components/modal/PresenceModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../Button';
import SearchableSelect from '../SearchableSelect';
import type { PresencePayload } from '../../services/presences.service';
import { agentService } from '../../services/agents.service';
import { debounce } from 'lodash';

interface PresenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PresencePayload) => Promise<void>;
  presence?: {
    id?: number;
    idAgent?: number;
    datePresence?: string;
    heureArrivee?: string;
    heureDepart?: string;
    statut?: string;
    observation?: string;
  } | null;
}

interface FormData {
  idAgent: number | null;
  datePresence: string;
  heureArrivee: string;
  heureDepart: string;
  statut: string;
  observation: string;
}

const PresenceModal: React.FC<PresenceModalProps> = ({ isOpen, onClose, onSave, presence }) => {
  const [form, setForm] = useState<FormData>({
    idAgent: presence?.idAgent || null,
    datePresence: presence?.datePresence || '',
    heureArrivee: presence?.heureArrivee || '',
    heureDepart: presence?.heureDepart || '',
    statut: presence?.statut || 'PRESENT',
    observation: presence?.observation || '',
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
    if (!form.datePresence) errors.datePresence = 'La date est obligatoire';
    if (!form.statut) errors.statut = 'Le statut est obligatoire';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload: PresencePayload = {
        idAgent: form.idAgent!,
        datePresence: form.datePresence,
        heureArrivee: form.heureArrivee || undefined,
        heureDepart: form.heureDepart || undefined,
        statut: form.statut,
        observation: form.observation || undefined,
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
    { value: 'PRESENT', label: 'Présent' },
    { value: 'ABSENT', label: 'Absent' },
    { value: 'RETARD', label: 'Retard' },
    { value: 'MISSION', label: 'Mission' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={presence?.id ? 'Modifier présence' : 'Ajouter présence'} size="lg">
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

        <Input
          label="Date"
          type="date"
          value={form.datePresence}
          onChange={(e) => handleChange('datePresence', e.target.value)}
          required
          error={fieldErrors.datePresence}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Heure arrivée"
            type="time"
            value={form.heureArrivee}
            onChange={(e) => handleChange('heureArrivee', e.target.value)}
          />
          <Input
            label="Heure départ"
            type="time"
            value={form.heureDepart}
            onChange={(e) => handleChange('heureDepart', e.target.value)}
          />
        </div>

        <Select
          label="Statut"
          options={statutOptions}
          value={form.statut}
          onChange={(e) => handleChange('statut', e.target.value)}
          required
          error={fieldErrors.statut}
        />

        <Input
          label="Observation"
          value={form.observation}
          onChange={(e) => handleChange('observation', e.target.value)}
          placeholder="Note (optionnel)"
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="primary" isLoading={submitting}>Enregistrer</Button>
        </div>
      </form>
    </Modal>
  );
};

export default PresenceModal;