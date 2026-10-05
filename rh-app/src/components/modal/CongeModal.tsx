// src/components/modal/CongeModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../Button';
import SearchableSelect from '../SearchableSelect';
import { congesService, type CongePayload, type TypeConge } from '../../services/conges.service';
import { agentService } from '../../services/agents.service';
import { debounce } from 'lodash';

interface User {
  id?: number;
  userId?: number;
  roles?: string[];
  agentId?: number;
  nom?: string;
  prenom?: string;
}

interface CongeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CongePayload) => Promise<void>;
  conge?: {
    id?: number;
    idAgent?: number;
    idTypeConge?: number;
    dateDebut?: string;
    dateFin?: string;
    motif?: string;
  } | null;
  currentUser?: User | null;
}

interface FormData {
  idAgent: number | null;
  idTypeConge: number | null;
  dateDebut: string;
  dateFin: string;
  motif: string;
}

const CongeModal: React.FC<CongeModalProps> = ({ isOpen, onClose, onSave, conge, currentUser }) => {
  const userRole = currentUser?.roles?.[0] || '';
  const isAgent = userRole === 'AGENT';

  // 🔥 Pour un agent, on force l'ID de l'agent (agentId), pas l'ID de l'utilisateur
  const defaultAgentId = isAgent ? currentUser?.agentId ?? null : null;

  const [form, setForm] = useState<FormData>({
    idAgent: conge?.idAgent ?? defaultAgentId,
    idTypeConge: conge?.idTypeConge ?? null,
    dateDebut: conge?.dateDebut ?? '',
    dateFin: conge?.dateFin ?? '',
    motif: conge?.motif ?? '',
  });

  const [agentOptions, setAgentOptions] = useState<{ value: number; label: string }[]>([]);
  const [typesConge, setTypesConge] = useState<TypeConge[]>([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && typesConge.length === 0) {
      congesService.getTypesConge()
        .then(setTypesConge)
        .catch(console.error);
    }
  }, [isOpen, typesConge.length]);

  useEffect(() => {
    if (!isOpen) return;
    if (isAgent) {
      if (currentUser?.agentId) {
        const label = `${currentUser.nom ?? ''} ${currentUser.prenom ?? ''}`.trim() || 'Moi';
        setAgentOptions([{ value: currentUser.agentId, label }]);
      }
      return;
    }
    if (agentOptions.length === 0) {
      agentService.searchAgents({ page: 0, size: 20 }).then(response => {
        const opts = response.content.map(a => ({
          value: a.id,
          label: `${a.nom} ${a.prenom} (${a.matricule})`,
        }));
        setAgentOptions(opts);
      }).catch(console.error);
    }
  }, [isOpen, isAgent, currentUser, agentOptions.length]);

  const searchAgents = useCallback(
    debounce(async (keyword: string) => {
      if (!keyword || keyword.length < 2 || isAgent) return;
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
    [isAgent]
  );

  const onSearchInputChange = (inputValue: string) => {
    if (!isAgent) searchAgents(inputValue);
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
    if (!isAgent && !form.idAgent) errors.idAgent = 'L’agent est obligatoire';
    if (!form.idTypeConge) errors.idTypeConge = 'Le type de congé est obligatoire';
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
      let payloadAgentId = form.idAgent;
      if (isAgent && currentUser?.agentId) {
        payloadAgentId = currentUser.agentId;
      }
      if (!payloadAgentId) {
        setFieldErrors({ _global: 'Impossible de déterminer l’agent' });
        return;
      }
      const payload: CongePayload = {
        idAgent: payloadAgentId,
        idTypeConge: form.idTypeConge!,
        dateDebut: form.dateDebut,
        dateFin: form.dateFin,
        motif: form.motif || undefined,
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
    { value: '', label: 'Veuillez sélectionner le type de congé' },
    ...typesConge.map(t => ({
      value: t.id.toString(),
      label: `${t.nom} (${t.nombreJours} jours)`,
    })),
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={conge?.id ? 'Modifier la demande' : 'Nouvelle demande de congé'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {fieldErrors._global && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
            {fieldErrors._global}
          </div>
        )}

        {!isAgent && (
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
        )}

        {isAgent && (
          <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-200">
            Vous allez créer une demande de congé pour vous‑même.
          </div>
        )}

        <Select
          label="Type de congé"
          options={typeOptions}
          value={form.idTypeConge?.toString() ?? ''}
          onChange={(e) => {
            const val = e.target.value;
            if (val === '') {
              handleChange('idTypeConge', null);
            } else {
              handleChange('idTypeConge', Number(val));
            }
          }}
          required
          error={fieldErrors.idTypeConge}
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
          label="Motif (optionnel)"
          value={form.motif}
          onChange={(e) => handleChange('motif', e.target.value)}
          placeholder="Raison du congé"
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="primary" isLoading={submitting}>Enregistrer</Button>
        </div>
      </form>
    </Modal>
  );
};

export default CongeModal;