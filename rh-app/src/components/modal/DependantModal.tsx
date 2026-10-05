import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../Button';

export interface AffiliationDto {
  id: number;
  nom: string;
  postnom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  relation: string;
  etat: string;
  statut: boolean;
}

export interface AffiliationPayload {
  id?: number; // ✅ pour update
  idAgent: number;
  nom: string;
  postnom: string;
  prenom: string;
  date_naissance: string;
  lieu_naissance: string;
  relation: string;
  etat: string;
  statut: boolean;
}

interface ApiErrorResponse {
  status: number;
  message: string;
  errors?: Record<string, string>;
}

interface DependantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AffiliationPayload) => Promise<void>;
  dependant?: AffiliationDto;
  agentId: number;
}

const DependantModal: React.FC<DependantModalProps> = ({
  isOpen,
  onClose,
  onSave,
  dependant,
  agentId,
}) => {
  const [form, setForm] = useState({
    nom: '',
    postnom: '',
    prenom: '',
    date_naissance: '',
    lieu_naissance: '',
    relation: '',
    etat: 'vivant',
    statut: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setForm({
        nom: dependant?.nom || '',
        postnom: dependant?.postnom || '',
        prenom: dependant?.prenom || '',
        date_naissance: dependant?.dateNaissance || '',
        lieu_naissance: dependant?.lieuNaissance || '',
        relation: dependant?.relation || '',
        etat: dependant?.etat || 'vivant',
        statut: dependant?.statut ?? true,
      });
      setFieldErrors({});
    }
  }, [isOpen, dependant]);

  const relationOptions = [
    { value: '', label: 'Veuillez sélectionner la relation' },
    { value: 'epouse', label: 'Épouse' },
    { value: 'epoux', label: 'Époux' },
    { value: 'enfant', label: 'Enfant' },
    { value: 'pere', label: 'Père' },
    { value: 'mere', label: 'Mère' },
  ];

  const etatOptions = [
    { value: '', label: "Veuillez sélectionner l'état" },
    { value: 'vivant', label: 'Vivant' },
    { value: 'mort', label: 'Décédé' },
  ];

  const statutOptions = [
    { value: '', label: 'Veuillez sélectionner le statut' },
    { value: 'true', label: 'Actif' },
    { value: 'false', label: 'Inactif' },
  ];

  const handleChange = (field: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFieldErrors({});

    const payload: AffiliationPayload = {
      id: dependant?.id, // ✅ update auto
      idAgent: agentId,
      nom: form.nom,
      postnom: form.postnom,
      prenom: form.prenom,
      date_naissance: form.date_naissance,
      lieu_naissance: form.lieu_naissance,
      relation: form.relation,
      etat: form.etat,
      statut: form.statut,
    };

    try {
      await onSave(payload);
    } catch (error: unknown) {
      const err = error as {
        response?: { status: number; data: ApiErrorResponse };
      };

      if (err.response?.status === 400 || err.response?.status === 422) {
        const data = err.response.data;

        if (data.errors) {
          setFieldErrors(data.errors);
        } else {
          setFieldErrors({ _global: data.message });
        }
      } else {
        setFieldErrors({ _global: 'Erreur réseau. Veuillez réessayer.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={dependant ? 'Modifier dépendant' : 'Ajouter dépendant'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        {fieldErrors._global && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
            {fieldErrors._global}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <Input
            label="Nom"
            value={form.nom}
            onChange={(e) => handleChange('nom', e.target.value)}
            error={fieldErrors.nom}
            required
          />

          <Input
            label="Postnom"
            value={form.postnom}
            onChange={(e) => handleChange('postnom', e.target.value)}
            error={fieldErrors.postnom}
            required
          />

          <Input
            label="Prénom"
            value={form.prenom}
            onChange={(e) => handleChange('prenom', e.target.value)}
            error={fieldErrors.prenom}
          />

          <Input
            label="Date naissance"
            type="date"
            value={form.date_naissance}
            onChange={(e) => handleChange('date_naissance', e.target.value)}
            error={fieldErrors.date_naissance}
            required
          />

          <Input
            label="Lieu naissance"
            value={form.lieu_naissance}
            onChange={(e) => handleChange('lieu_naissance', e.target.value)}
            error={fieldErrors.lieu_naissance}
            required
          />

          <Select
            label="Relation"
            options={relationOptions}
            value={form.relation}
            onChange={(e) => handleChange('relation', e.target.value)}
            error={fieldErrors.relation}
            required
          />

          <Select
            label="État"
            options={etatOptions}
            value={form.etat}
            onChange={(e) => handleChange('etat', e.target.value)}
            error={fieldErrors.etat}
            required
          />

          <Select
            label="Statut"
            options={statutOptions}
            value={form.statut.toString()}
            onChange={(e) => handleChange('statut', e.target.value === 'true')}
            error={fieldErrors.statut}
            required
          />

        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>

          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>

      </form>
    </Modal>
  );
};

export default DependantModal;