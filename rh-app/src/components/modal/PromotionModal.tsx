import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../Button';
import { gradeService } from '../../services/grades.service';
import type { GradeResponse } from '../../services/grades.service';

export interface PromotionDto {
  id: number;
  idGrade: number;
  gradeSigle: string;
  gradeNom: string;
  dateDebut: string;
  dateFin: string | null;
  reference: string;
}

export interface PromotionPayload {
  idAgent: number;
  idGrade: number;
  dateDebut: string;
  dateFin: string | null;
  reference: string;
}

type PromotionErrors = {
  idGrade?: string;
  dateDebut?: string;
  dateFin?: string;
  reference?: string;
  _global?: string;
};

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PromotionPayload) => void;
  promotion?: PromotionDto;
  agentId: number;
}

const PromotionModal: React.FC<PromotionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  promotion,
  agentId
}) => {

  const [grades, setGrades] = useState<GradeResponse[]>([]);
  const [errors, setErrors] = useState<PromotionErrors>({});

  // ✅ Initialisation du form (sans useEffect)
  const [form, setForm] = useState({
    idGrade: promotion?.idGrade?.toString() || '',
    dateDebut: promotion?.dateDebut || '',
    dateFin: promotion?.dateFin || '',
    reference: promotion?.reference || '',
  });

  // Charger les grades
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const data = await gradeService.getAll();
        setGrades(data);
      } catch {
        setErrors(prev => ({
          ...prev,
          _global: 'Erreur lors du chargement des grades'
        }));
      }
    };
    fetchGrades();
  }, []);

  // Gestion changement
  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));

    // Supprimer l'erreur du champ modifié
    if (errors[field as keyof PromotionErrors]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[field as keyof PromotionErrors];
        return copy;
      });
    }
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: PromotionErrors = {};

    if (!form.idGrade) {
      newErrors.idGrade = 'Le grade est obligatoire';
    }

    if (!form.dateDebut) {
      newErrors.dateDebut = 'La date de début est obligatoire';
    }

    if (!form.reference.trim()) {
      newErrors.reference = 'La référence est obligatoire';
    }

    if (form.dateFin && form.dateDebut && form.dateFin < form.dateDebut) {
      newErrors.dateFin = 'La date de fin doit être après la date de début';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const payload: PromotionPayload = {
      idAgent: agentId,
      idGrade: parseInt(form.idGrade),
      dateDebut: form.dateDebut,
      dateFin: form.dateFin || null,
      reference: form.reference,
    };

    onSave(payload);
    onClose();
  };

  const gradeOptions = [{ value: '', label: 'Veuillez sélectionner le grade' }, ...grades.map(g => ({
    value: g.id.toString(),
    label: `${g.sigle} - ${g.nom}`,
  }))];

  return (
    <Modal
      key={promotion?.id || 'new'} // ✅ force reset du composant
      isOpen={isOpen}
      onClose={onClose}
      title={promotion ? 'Modifier promotion' : 'Ajouter promotion'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Erreur globale */}
        {errors._global && (
          <div className="text-red-600 text-sm border border-red-300 bg-red-50 p-2 rounded">
            {errors._global}
          </div>
        )}

        {/* Grade */}
        <div>
          <Select
            label="Grade"
            options={gradeOptions}
            value={form.idGrade}
            onChange={e => handleChange('idGrade', e.target.value)}
            className={errors.idGrade ? 'border border-red-500' : ''}
            required
          />
          {errors.idGrade && (
            <p className="text-red-500 text-sm">{errors.idGrade}</p>
          )}
        </div>

        {/* Date début */}
        <div>
          <Input
            label="Date début"
            type="date"
            value={form.dateDebut}
            onChange={e => handleChange('dateDebut', e.target.value)}
            className={errors.dateDebut ? 'border border-red-500' : ''}
            required
          />
          {errors.dateDebut && (
            <p className="text-red-500 text-sm">{errors.dateDebut}</p>
          )}
        </div>

        {/* Date fin */}
        <div>
          <Input
            label="Date fin (optionnelle)"
            type="date"
            value={form.dateFin}
            onChange={e => handleChange('dateFin', e.target.value)}
            className={errors.dateFin ? 'border border-red-500' : ''}
          />
          {errors.dateFin && (
            <p className="text-red-500 text-sm">{errors.dateFin}</p>
          )}
        </div>

        {/* Référence */}
        <div>
          <Input
            label="Référence"
            value={form.reference}
            onChange={e => handleChange('reference', e.target.value)}
            className={errors.reference ? 'border border-red-500' : ''}
            required
          />
          {errors.reference && (
            <p className="text-red-500 text-sm">{errors.reference}</p>
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

export default PromotionModal;