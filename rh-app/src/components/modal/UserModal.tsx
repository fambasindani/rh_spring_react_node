// src/components/modal/UserModal.tsx
import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../Button';
import SearchableSelect from '../SearchableSelect';
import { agentService } from '../../services/agents.service';
import { roleService } from '../../services/roles.service';
import type { Role } from '../../types/role';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserPayload) => Promise<void>;
  initialData?: {
    id?: number;
    agentId?: number;
    roleIds?: number[];
    actif?: boolean;
  };
}

interface UserPayload {
  agentId: number;
  roleIds: number[];
  actif: boolean;
  password?: string;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [agentId, setAgentId] = useState<number | null>(initialData?.agentId || null);
  const [roleIds, setRoleIds] = useState<number[]>(initialData?.roleIds || []);
  const [actif, setActif] = useState<boolean>(initialData?.actif ?? true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agentOptions, setAgentOptions] = useState<{ value: number; label: string }[]>([]);
  const [roleOptions, setRoleOptions] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    setAgentOptions([]);
    setAgentId(initialData?.agentId || null);
    setRoleIds(initialData?.roleIds || []);
    setActif(initialData?.actif ?? true);
    setPassword('');
    setConfirmPassword('');
    setFieldErrors({});
    setLoading(true);

    Promise.all([
      agentService.getAllAgents(),
      roleService.getAllRoles()
    ]).then(([agents, roles]) => {
      setAgentOptions(agents.map(a => ({
        value: a.id,
        label: `${a.nom} ${a.prenom} (${a.matricule})`
      })));
      setRoleOptions(roles);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [isOpen, initialData]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!agentId) errors.agentId = 'L\'agent est obligatoire';
    if (roleIds.length === 0) errors.roleIds = 'Au moins un rôle est requis';
    if (!initialData?.id && !password) errors.password = 'Le mot de passe est obligatoire pour la création';
    if (password && password.length < 6) errors.password = 'Le mot de passe doit faire au moins 6 caractères';
    if (!initialData?.id && password !== confirmPassword) errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload: UserPayload = {
        agentId: agentId!,
        roleIds,
        actif,
        password: password || undefined,
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

  const handleRoleToggle = (roleId: number) => {
    setRoleIds(prev =>
      prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? 'Modifier utilisateur' : 'Ajouter utilisateur'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {fieldErrors._global && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
            {fieldErrors._global}
          </div>
        )}

        <SearchableSelect
          label="Agent"
          options={agentOptions}
          value={agentId}
          onChange={(val) => setAgentId(val)}
          isLoading={loading}
          required
          error={fieldErrors.agentId}
          placeholder="Rechercher un agent..."
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rôles <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg border-gray-200 bg-gray-50">
            {roleOptions.map(role => (
              <label
                key={role.id}
                className={`flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer transition-all ${
                  roleIds.includes(role.id)
                    ? 'bg-blue-50 border border-blue-200 shadow-sm'
                    : 'bg-white border border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={roleIds.includes(role.id)}
                  onChange={() => handleRoleToggle(role.id)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-800">{role.nomRole}</span>
                  {role.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{role.description}</p>
                  )}
                </div>
              </label>
            ))}
          </div>
          {fieldErrors.roleIds && <p className="mt-1 text-sm text-red-600">{fieldErrors.roleIds}</p>}
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="actif"
            checked={actif}
            onChange={(e) => setActif(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="actif" className="text-sm font-medium text-gray-700">Compte actif</label>
        </div>

        <Input
          label={initialData?.id ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!initialData?.id}
          error={fieldErrors.password}
          placeholder="••••••••"
        />

        {!initialData?.id && (
          <Input
            label="Confirmer le mot de passe"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            error={fieldErrors.confirmPassword}
            placeholder="••••••••"
          />
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="primary" isLoading={submitting}>
            {initialData?.id ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UserModal;