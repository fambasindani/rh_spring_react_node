import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../Button';
import SearchableSelect from '../SearchableSelect';
import type {AgentFormationPayload } from '../../services/agentFormations.service';
import { formationsService } from '../../services/formations.service';
import type{ Formation } from '../../services/formations.service';
import { agentService } from '../../services/agents.service';
import { debounce } from 'lodash';




interface InscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AgentFormationPayload) => Promise<void>;
  inscription?: {
    id?: number;
    idAgent?: number;
    idFormation?: number;
    resultat?: string;
    observation?: string;
  } | null;
}

const InscriptionModal: React.FC<InscriptionModalProps> = ({ isOpen, onClose, onSave, inscription }) => {
  const [form, setForm] = useState({
    idAgent: inscription?.idAgent?.toString() || '',
    idFormation: inscription?.idFormation?.toString() || '',
    resultat: inscription?.resultat || '',
    observation: inscription?.observation || '',
  });

  const [agentOptions, setAgentOptions] = useState<{ value: number; label: string }[]>([]);
  const [formationOptions, setFormationOptions] = useState<{ value: string; label: string }[]>([]);
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
  }, [isOpen, agentOptions.length]);

  // Charger la liste des formations avec une option vide par défaut
  useEffect(() => {
    if (isOpen && formationOptions.length === 0) {
      formationsService.getAll(0, 100).then(response => {
        const opts = [
          { value: '', label: 'Veuillez sélectionner la formation' },
          ...response.content.map((f: Formation) => ({
            value: f.id.toString(),
            label: f.intitule,
          })),
        ];
        setFormationOptions(opts);
      }).catch(console.error);
    }
  }, [isOpen, formationOptions.length]);

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
    if (!form.idFormation) errors.idFormation = 'La formation est obligatoire';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const payload: AgentFormationPayload = {
        idAgent: Number(form.idAgent),
        idFormation: Number(form.idFormation),
        resultat: form.resultat || undefined,
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
    <Modal isOpen={isOpen} onClose={onClose} title={inscription?.id ? 'Modifier inscription' : 'Ajouter inscription'} size="lg">
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
        <Select
          label="Formation"
          options={formationOptions}
          value={form.idFormation}
          onChange={(e) => {
            const val = e.target.value;
            handleChange('idFormation', val);
          }}
          required
          error={fieldErrors.idFormation}
        />
        <Input
          label="Résultat"
          value={form.resultat}
          onChange={(e) => handleChange('resultat', e.target.value)}
          placeholder="Ex: Excellent, Réussi, En cours..."
        />
        <Input
          label="Observation"
          value={form.observation}
          onChange={(e) => handleChange('observation', e.target.value)}
          placeholder="Remarque éventuelle"
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="primary" isLoading={submitting}>Enregistrer</Button>
        </div>
      </form>
    </Modal>
  );
};

export default InscriptionModal;