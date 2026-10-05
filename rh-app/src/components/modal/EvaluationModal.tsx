// src/components/modal/EvaluationModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../Button';
import SearchableSelect from '../SearchableSelect';
import type { EvaluationPayload } from '../../services/evaluations.service';
import { agentService } from '../../services/agents.service';
import { debounce } from 'lodash';

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EvaluationPayload) => Promise<void>;
  evaluation?: {
    id?: number;
    idAgent?: number;
    dateEvaluation?: string;
    note?: number;
    appreciation?: string;
    evaluateur?: string;
  } | null;
}

const EvaluationModal: React.FC<EvaluationModalProps> = ({ isOpen, onClose, onSave, evaluation }) => {
  const [form, setForm] = useState({
    idAgent: evaluation?.idAgent?.toString() || '',
    dateEvaluation: evaluation?.dateEvaluation || '',
    note: evaluation?.note !== undefined ? evaluation.note.toString() : '',
    appreciation: evaluation?.appreciation || '',
    evaluateur: evaluation?.evaluateur || '',
  });

  const [agentOptions, setAgentOptions] = useState<{ value: number; label: string }[]>([]);
  const [, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Charger la liste initiale des agents à l'ouverture
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

  // S'assurer que l'agent sélectionné (en édition) apparaît dans les options
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
        // Si un agent est déjà sélectionné, on l'ajoute aux options s'il manque
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
    if (!form.dateEvaluation) errors.dateEvaluation = 'La date est obligatoire';
    if (!form.note) errors.note = 'La note est obligatoire';
    if (!form.evaluateur) errors.evaluateur = 'L’évaluateur est obligatoire';
    const noteNum = Number(form.note);
    if (form.note && (isNaN(noteNum) || noteNum < 0 || noteNum > 20)) {
      errors.note = 'La note doit être comprise entre 0 et 20';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const payload: EvaluationPayload = {
        idAgent: Number(form.idAgent),
        dateEvaluation: form.dateEvaluation,
        note: Number(form.note),
        appreciation: form.appreciation,
        evaluateur: form.evaluateur,
      };
      await onSave(payload);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={evaluation?.id ? 'Modifier évaluation' : 'Ajouter évaluation'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <SearchableSelect
          label="Agent"
          options={agentOptions}
          value={form.idAgent ? Number(form.idAgent) : null}
          onChange={(val) => handleChange('idAgent', val ? String(val) : '')}
          onInputChange={(val) => searchAgents(val)}
          placeholder="Tapez au moins 2 lettres..."
          required
          error={fieldErrors.idAgent}
        />
        <Input
          label="Date évaluation"
          type="date"
          value={form.dateEvaluation}
          onChange={(e) => handleChange('dateEvaluation', e.target.value)}
          required
          error={fieldErrors.dateEvaluation}
        />
        <Input
          label="Note (0-20)"
          type="number"
          step="0.01"
          value={form.note}
          onChange={(e) => handleChange('note', e.target.value)}
          required
          error={fieldErrors.note}
        />
        <Input
          label="Appréciation"
          value={form.appreciation}
          onChange={(e) => handleChange('appreciation', e.target.value)}
        />
        <Input
          label="Évaluateur"
          value={form.evaluateur}
          onChange={(e) => handleChange('evaluateur', e.target.value)}
          required
          error={fieldErrors.evaluateur}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="primary" isLoading={submitting}>Enregistrer</Button>
        </div>
      </form>
    </Modal>
  );
};

export default EvaluationModal;