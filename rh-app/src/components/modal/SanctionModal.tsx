// src/components/modal/SanctionModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../Button';
import SearchableSelect from '../SearchableSelect';
import type  { SanctionPayload } from '../../services/sanctions.service';
import { agentService } from '../../services/agents.service';
import { debounce } from 'lodash';

interface SanctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SanctionPayload) => Promise<void>;
  sanction?: {
    id?: number;
    idAgent?: number;
    typeSanction?: string;
    motif?: string;
    dateSanction?: string;
    reference?: string;
  } | null;
}

interface FormData {
  idAgent: number | null;
  typeSanction: string;
  motif: string;
  dateSanction: string;
  reference: string;
}

const SanctionModal: React.FC<SanctionModalProps> = ({ isOpen, onClose, onSave, sanction }) => {
  const [form, setForm] = useState<FormData>({
    idAgent: sanction?.idAgent || null,
    typeSanction: sanction?.typeSanction || '',
    motif: sanction?.motif || '',
    dateSanction: sanction?.dateSanction || '',
    reference: sanction?.reference || '',
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
    if (!form.typeSanction) errors.typeSanction = 'Le type de sanction est obligatoire';
    if (!form.motif) errors.motif = 'Le motif est obligatoire';
    if (!form.dateSanction) errors.dateSanction = 'La date est obligatoire';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload: SanctionPayload = {
        idAgent: form.idAgent!,
        typeSanction: form.typeSanction,
        motif: form.motif,
        dateSanction: form.dateSanction,
        reference: form.reference || undefined,
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

  const typeOptions = [
    { value: '', label: 'Veuillez sélectionner le type de sanction' },
    { value: 'AVERTISSEMENT', label: 'Avertissement' },
    { value: 'BLAME', label: 'Blâme' },
    { value: 'SUSPENSION', label: 'Suspension' },
    { value: 'LICENCIEMENT', label: 'Licenciement' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={sanction?.id ? 'Modifier sanction' : 'Ajouter sanction'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {fieldErrors._global && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">{fieldErrors._global}</div>}

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

        <Select
          label="Type de sanction"
          options={typeOptions}
          value={form.typeSanction}
          onChange={(e) => handleChange('typeSanction', e.target.value)}
          required
          error={fieldErrors.typeSanction}
        />

        <Input
          label="Motif"
          value={form.motif}
          onChange={(e) => handleChange('motif', e.target.value)}
          required
          error={fieldErrors.motif}
        />

        <Input
          label="Date"
          type="date"
          value={form.dateSanction}
          onChange={(e) => handleChange('dateSanction', e.target.value)}
          required
          error={fieldErrors.dateSanction}
        />

        <Input
          label="Référence"
          value={form.reference}
          onChange={(e) => handleChange('reference', e.target.value)}
          placeholder="Optionnel"
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="primary" isLoading={submitting}>Enregistrer</Button>
        </div>
      </form>
    </Modal>
  );
};

export default SanctionModal;