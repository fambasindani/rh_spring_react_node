import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../Button';
import { droitService } from '../../services/droit.service';
import type { Droit } from '../../types/droit';
import type { Role } from '../../types/role';
import Toast from '../Toast';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface RolesDroitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
}

const RolesDroitsModal: React.FC<RolesDroitsModalProps> = ({ isOpen, onClose, role }) => {
  const [allDroits, setAllDroits] = useState<Droit[]>([]);
  const [assignedDroits, setAssignedDroits] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (isOpen && role) {
      loadData();
    }
  }, [isOpen, role]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [all, assigned] = await Promise.all([
        droitService.getAllDroits(),
        droitService.getByRoleId(role!.id),
      ]);
      setAllDroits(all);
      setAssignedDroits(new Set(assigned.map((d) => d.id)));
    } catch (error) {
      showToast('Erreur lors du chargement des droits', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleDroit = (droitId: number) => {
    setAssignedDroits((prev) => {
      const next = new Set(prev);
      if (next.has(droitId)) {
        next.delete(droitId);
      } else {
        next.add(droitId);
      }
      return next;
    });
  };

  const toggleModule = (module: string) => {
    const moduleDroits = allDroits.filter((d) => d.module === module);
    const allAssigned = moduleDroits.every((d) => assignedDroits.has(d.id));
    setAssignedDroits((prev) => {
      const next = new Set(prev);
      moduleDroits.forEach((d) => {
        if (allAssigned) {
          next.delete(d.id);
        } else {
          next.add(d.id);
        }
      });
      return next;
    });
  };

  const allAssigned = allDroits.length > 0 && allDroits.every((d) => assignedDroits.has(d.id));

  const toggleAll = () => {
    if (allAssigned) {
      setAssignedDroits(new Set());
    } else {
      setAssignedDroits(new Set(allDroits.map((d) => d.id)));
    }
  };

  const handleSave = async () => {
    if (!role) return;
    setSaving(true);
    try {
      await droitService.bulkAssignToRole(role.id, Array.from(assignedDroits));
      showToast('Droits mis à jour avec succès', 'success');
      onClose();
    } catch (error) {
      showToast('Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredDroits = allDroits.filter(
    (d) =>
      d.nomDroit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.description && d.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const modules = [...new Set(allDroits.map((d) => d.module).filter(Boolean))];

  const getModuleDroits = (module: string) => filteredDroits.filter((d) => d.module === module);
  const isModuleFullyAssigned = (module: string) => {
    const md = getModuleDroits(module);
    return md.length > 0 && md.every((d) => assignedDroits.has(d.id));
  };
  const isModulePartiallyAssigned = (module: string) => {
    const md = getModuleDroits(module);
    return md.some((d) => assignedDroits.has(d.id)) && !md.every((d) => assignedDroits.has(d.id));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Droits du rôle : ${role?.nomRole || ''}`} size="lg">
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <input
              type="text"
              placeholder="Rechercher un droit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                <input
                  type="checkbox"
                  checked={allAssigned}
                  ref={(el) => {
                    if (el) {
                      const some = allDroits.some((d) => assignedDroits.has(d.id));
                      el.indeterminate = some && !allAssigned;
                    }
                  }}
                  onChange={toggleAll}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                {allAssigned ? 'Tout décocher' : 'Tout cocher'}
              </label>
              <div className="text-sm text-gray-500">
                {assignedDroits.size} / {allDroits.length} droit(s) assigné(s)
              </div>
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto border border-gray-200 rounded-lg">
            {modules.map((module) => {
              const moduleDroits = getModuleDroits(module);
              if (moduleDroits.length === 0) return null;
              return (
                <div key={module} className="border-b border-gray-100 last:border-b-0">
                  <div
                    className="flex items-center gap-3 px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleModule(module)}
                  >
                    <input
                      type="checkbox"
                      checked={isModuleFullyAssigned(module)}
                      ref={(el) => { if (el) el.indeterminate = isModulePartiallyAssigned(module); }}
                      onChange={() => toggleModule(module)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-sm text-gray-800 uppercase tracking-wide">{module}</span>
                    <span className="text-xs text-gray-400">({moduleDroits.length})</span>
                  </div>
                  <div className="pl-8 pr-4 py-2 space-y-1">
                    {moduleDroits.map((droit) => (
                      <label
                        key={droit.id}
                        className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={assignedDroits.has(droit.id)}
                          onChange={() => toggleDroit(droit.id)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-700">{droit.nomDroit}</span>
                          {droit.description && (
                            <span className="text-xs text-gray-400 ml-2">- {droit.description}</span>
                          )}
                        </div>
                        {assignedDroits.has(droit.id) ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <XCircleIcon className="h-4 w-4 text-gray-300 flex-shrink-0" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t">
            <Button variant="outline" onClick={onClose}>Annuler</Button>
            <Button variant="primary" onClick={handleSave} isLoading={saving}>Enregistrer</Button>
          </div>
        </div>
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} duration={4000} />}
    </Modal>
  );
};

export default RolesDroitsModal;
