import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../Button';
import SearchableSelect from '../SearchableSelect';
import type { ContratPayload } from '../../services/contrats.service';
import { agentService } from '../../services/agents.service';
import { debounce } from 'lodash';

interface ContratModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ContratPayload) => Promise<void>;
  contrat?: {
    id?: number;
    idAgent?: number;
    typeContrat?: string;
    reference?: string;
    dateDebut?: string;
    dateFin?: string;
    statut?: string;
  } | null;
}

const ContratModal: React.FC<ContratModalProps> = ({ isOpen, onClose, onSave, contrat }) => {
  const [form, setForm] = useState({
    idAgent: contrat?.idAgent?.toString() || '',
    typeContrat: contrat?.typeContrat || '',
    reference: contrat?.reference || '',
    dateDebut: contrat?.dateDebut || '',
    dateFin: contrat?.dateFin || '',
    statut: contrat?.statut || '',
  });

  const [agentOptions, setAgentOptions] = useState<{ value: number; label: string }[]>([]);
  const [, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Chargement initial
  useEffect(() => {
    if (isOpen && agentOptions.length === 0) {
      agentService.searchAgents({ page: 0, size: 20 })
        .then(response => {
          const opts = response.content.map(a => ({
            value: a.id,
            label: `${a.nom} ${a.prenom} (${a.matricule})`,
          }));
          setAgentOptions(opts);
        })
        .catch(console.error);
    }
  }, [isOpen, agentOptions.length]);

  // Recherche avec debounce
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

  // Gestion sécurisée du changement de saisie dans le champ de recherche
  const onSearchInputChange = (inputValue: string, { action }: any) => {
    if (action === 'input-change') {
      const safeValue = typeof inputValue === 'string' ? inputValue : '';
      searchAgents(safeValue);
    }
  };

  const typeOptions = [
    { value: '', label: 'Veuillez sélectionner le type' },
    { value: 'CDI', label: 'CDI' },
    { value: 'CDD', label: 'CDD' },
    { value: 'STAGE', label: 'Stage' },
    { value: 'CONSULTANCE', label: 'Consultance' },
  ];

  const statutOptions = [
    { value: '', label: 'Veuillez sélectionner le statut' },
    { value: 'ACTIF', label: 'Actif' },
    { value: 'EXPIRE', label: 'Expiré' },
    { value: 'RESILIE', label: 'Résilié' },
  ];

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
    if (!form.typeContrat) errors.typeContrat = 'Le type de contrat est obligatoire';
    if (!form.reference) errors.reference = 'La référence est obligatoire';
    if (!form.dateDebut) errors.dateDebut = 'La date de début est obligatoire';
    if (!form.statut) errors.statut = 'Le statut est obligatoire';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const payload: ContratPayload = {
        idAgent: Number(form.idAgent),
        typeContrat: form.typeContrat,
        reference: form.reference,
        dateDebut: form.dateDebut,
        dateFin: form.dateFin || undefined,
        statut: form.statut,
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
    <Modal isOpen={isOpen} onClose={onClose} title={contrat?.id ? 'Modifier contrat' : 'Ajouter contrat'} size="lg">
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
        {/* Le reste du formulaire inchangé */}
        <Select
          label="Type de contrat"
          options={typeOptions}
          value={form.typeContrat}
          onChange={(e) => handleChange('typeContrat', e.target.value)}
          required
          error={fieldErrors.typeContrat}
        />
        <Input
          label="Référence"
          value={form.reference}
          onChange={(e) => handleChange('reference', e.target.value)}
          required
          error={fieldErrors.reference}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Date début"
            type="date"
            value={form.dateDebut}
            onChange={(e) => handleChange('dateDebut', e.target.value)}
            required
            error={fieldErrors.dateDebut}
          />
          <Input
            label="Date fin"
            type="date"
            value={form.dateFin}
            onChange={(e) => handleChange('dateFin', e.target.value)}
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
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="primary" isLoading={submitting}>Enregistrer</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ContratModal;