import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../Button';
import { directionService } from '../../services/direction.service';
import type { Direction } from '../../services/direction.service';

export interface AffectationDto {
  id: number;
  idDirection: number;
  directionSigle: string;
  directionNom: string;
  dateDebut: string;
  dateFin: string | null;
}

export interface AffectationPayload {
  id_agent: number;
  id_direction: number;
  date_debut: string;
  date_fin: string | null;
}

interface AffectationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AffectationPayload) => void;
  affectation?: AffectationDto;
  agentId: number;
}

const AffectationModal: React.FC<AffectationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  affectation,
  agentId
}) => {

  const [directions, setDirections] = useState<Direction[]>([]);

  const [form, setForm] = useState({
    id_direction: affectation?.idDirection?.toString() || '',
    date_debut: affectation?.dateDebut || '',
    date_fin: affectation?.dateFin || '',
  });

  const [errors, setErrors] = useState<{
    id_direction?: string;
    date_debut?: string;
    date_fin?: string;
    _global?: string;
  }>({});

  // Charger directions
  useEffect(() => {
    const fetchDirections = async () => {
      try {
        const data = await directionService.getAll();
        setDirections(data);
      } catch {
        setErrors(prev => ({ ...prev, _global: 'Erreur de chargement des directions' }));
      }
    };
    fetchDirections();
  }, []);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));

    // clear error du champ
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!form.id_direction) {
      newErrors.id_direction = 'La direction est obligatoire';
    }

    if (!form.date_debut) {
      newErrors.date_debut = 'La date de début est obligatoire';
    }

    if (form.date_fin && form.date_fin < form.date_debut) {
      newErrors.date_fin = 'La date de fin doit être supérieure à la date de début';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const payload: AffectationPayload = {
      id_agent: agentId,
      id_direction: parseInt(form.id_direction),
      date_debut: form.date_debut,
      date_fin: form.date_fin || null,
    };

    onSave(payload);
    onClose();
  };

  const directionOptions = [{ value: '', label: 'Veuillez sélectionner la direction' }, ...directions.map(d => ({
    value: d.id.toString(),
    label: `${d.sigle} - ${d.nom}`,
  }))];

  return (
    <Modal
      key={affectation?.id || 'new'}
      isOpen={isOpen}
      onClose={onClose}
      title={affectation ? 'Modifier affectation' : 'Ajouter affectation'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        {errors._global && (
          <div className="text-red-600 text-sm border border-red-300 bg-red-50 p-2 rounded">
            {errors._global}
          </div>
        )}

        {/* Direction */}
        <div>
          <Select
            label="Direction"
            options={directionOptions}
            value={form.id_direction}
            onChange={e => handleChange('id_direction', e.target.value)}
            className={errors.id_direction ? 'border border-red-500' : ''}
            required
          />
          {errors.id_direction && (
            <p className="text-red-500 text-sm">{errors.id_direction}</p>
          )}
        </div>

        {/* Date début */}
        <div>
          <Input
            label="Date début"
            type="date"
            value={form.date_debut}
            onChange={e => handleChange('date_debut', e.target.value)}
            className={errors.date_debut ? 'border border-red-500' : ''}
            required
          />
          {errors.date_debut && (
            <p className="text-red-500 text-sm">{errors.date_debut}</p>
          )}
        </div>

        {/* Date fin */}
        <div>
          <Input
            label="Date fin (optionnelle)"
            type="date"
            value={form.date_fin}
            onChange={e => handleChange('date_fin', e.target.value)}
            className={errors.date_fin ? 'border border-red-500' : ''}
          />
          {errors.date_fin && (
            <p className="text-red-500 text-sm">{errors.date_fin}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="primary">
            Enregistrer
          </Button>
        </div>

      </form>
    </Modal>
  );
};

export default AffectationModal;