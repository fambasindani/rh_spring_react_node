// src/components/modal/RetraiteModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../Button';
import SearchableSelect from '../SearchableSelect';
import type {RetraitePayload } from '../../services/retraites.service';
import { agentService } from '../../services/agents.service';
import { debounce } from 'lodash';

interface RetraiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: RetraitePayload) => Promise<void>;
  retraite?: {
    id?: number;
    idAgent?: number;
    dateRetraite?: string;
    reference?: string;
    observation?: string;
  } | null;
}

const RetraiteModal: React.FC<RetraiteModalProps> = ({ isOpen, onClose, onSave, retraite }) => {
  const [form, setForm] = useState({
    idAgent: retraite?.idAgent?.toString() || '',
    dateRetraite: retraite?.dateRetraite || '',
    reference: retraite?.reference || '',
    observation: retraite?.observation || '',
  });

  const [agentOptions, setAgentOptions] = useState<{ value: number; label: string }[]>([]);
  const [, setSearching] = useState(false);
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

  useEffect(() => {
    if (isOpen && form.idAgent && !agentOptions.some(opt => opt.value === Number(form.idAgent))) {
      agentService.getAgentById(Number(form.idAgent)).then(agent => {
        const newOption = {
          value: agent.id,
          label: `${agent.nom} ${agent.prenom} (${agent.matricule})`,
        };
        setAgentOptions(prev => [...prev, newOption]);
      }).catch(console.error);
    }
  }, [isOpen, form.idAgent, agentOptions]);

  const searchAgents = useCallback(
    debounce(async (keyword: string) => {
      if (!keyword || keyword.length < 2) return;
      setSearching(true);
      try {
        const response = await agentService.searchAgents({ keyword, page: 0, size: 20 });
        let opts = response.content.map(a => ({
          value: a.id,
          label: `${a.nom} ${a.prenom} (${a.matricule})`,
        }));
        if (form.idAgent && !opts.some(opt => opt.value === Number(form.idAgent))) {
          const selectedAgent = await agentService.getAgentById(Number(form.idAgent));
          const selectedOpt = {
            value: selectedAgent.id,
            label: `${selectedAgent.nom} ${selectedAgent.prenom} (${selectedAgent.matricule})`,
          };
          opts = [selectedOpt, ...opts];
        }
        setAgentOptions(opts);
      } catch (error) {
        console.error(error);
      } finally {
        setSearching(false);
      }
    }, 500),
    [form.idAgent]
  );

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
    if (!form.idAgent) errors.idAgent = 'L’agent est obligatoire';
    if (!form.dateRetraite) errors.dateRetraite = 'La date de retraite est obligatoire';
    if (!form.reference) errors.reference = 'La référence est obligatoire';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const payload: RetraitePayload = {
        idAgent: Number(form.idAgent),
        dateRetraite: form.dateRetraite,
        reference: form.reference,
        observation: form.observation || undefined,
      };
      await onSave(payload);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

    const onSearchInputChange = (inputValue: string, { action }: any) => {
    if (action === 'input-change') {
      const safeValue = typeof inputValue === 'string' ? inputValue : '';
      searchAgents(safeValue);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={retraite?.id ? 'Modifier retraite' : 'Ajouter retraite'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <SearchableSelect
          label="Agent"
          options={agentOptions}
          value={form.idAgent ? Number(form.idAgent) : null}
          onChange={(val) => handleChange('idAgent', val ? String(val) : '')}
           onInputChange={onSearchInputChange} 
          placeholder="Tapez au moins 2 lettres..."
          required
          error={fieldErrors.idAgent}
        />
        <Input
          label="Date retraite"
          type="date"
          value={form.dateRetraite}
          onChange={(e) => handleChange('dateRetraite', e.target.value)}
          required
          error={fieldErrors.dateRetraite}
        />
        <Input
          label="Référence"
          value={form.reference}
          onChange={(e) => handleChange('reference', e.target.value)}
          required
          error={fieldErrors.reference}
        />
        <Input
          label="Observation"
          value={form.observation}
          onChange={(e) => handleChange('observation', e.target.value)}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="primary" isLoading={submitting}>Enregistrer</Button>
        </div>
      </form>
    </Modal>
  );
};

export default RetraiteModal;