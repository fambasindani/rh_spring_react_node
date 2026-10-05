// src/components/modal/NotificationModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../Button';
import SearchableSelect from '../SearchableSelect';
import type { NotificationPayload } from '../../services/notifications.service';
import { agentService } from '../../services/agents.service';
import { debounce } from 'lodash';

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: NotificationPayload) => Promise<void>;
    notification?: {
        id?: number;
        agentId?: number;
        message?: string;
    };
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, onSave, notification }) => {
    const [form, setForm] = useState({
        agentId: notification?.agentId?.toString() || '',
        message: notification?.message || '',
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
    }, [isOpen, agentOptions.length]);

    // S'assurer que l'agent sélectionné (en édition) apparaît dans les options
    useEffect(() => {
        if (isOpen && form.agentId && !agentOptions.some(opt => opt.value === Number(form.agentId))) {
            agentService.getAgentById(Number(form.agentId)).then(agent => {
                const newOption = {
                    value: agent.id,
                    label: `${agent.nom} ${agent.prenom} (${agent.matricule})`,
                };
                setAgentOptions(prev => [...prev, newOption]);
            }).catch(console.error);
        }
    }, [isOpen, form.agentId, agentOptions]);

    const searchAgents = useCallback(
        debounce(async (keyword: string) => {
            if (!keyword || keyword.length < 2) {
                if (agentOptions.length === 0) {
                    const response = await agentService.searchAgents({ page: 0, size: 20 });
                    const opts = response.content.map(a => ({
                        value: a.id,
                        label: `${a.nom} ${a.prenom} (${a.matricule})`,
                    }));
                    setAgentOptions(opts);
                }
                return;
            }
            setSearching(true);
            try {
                const response = await agentService.searchAgents({ keyword, page: 0, size: 20 });
                let opts = response.content.map(a => ({
                    value: a.id,
                    label: `${a.nom} ${a.prenom} (${a.matricule})`,
                }));
                if (form.agentId && !opts.some(opt => opt.value === Number(form.agentId))) {
                    const selectedAgent = await agentService.getAgentById(Number(form.agentId));
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
        [form.agentId, agentOptions.length]
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
        if (!form.message) errors.message = 'Le message est obligatoire';
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setSubmitting(true);
        try {
            const payload: NotificationPayload = {
                agentId: form.agentId ? Number(form.agentId) : undefined,
                message: form.message,
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
        <Modal isOpen={isOpen} onClose={onClose} title={notification?.id ? 'Modifier notification' : 'Ajouter notification'} size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <SearchableSelect
                    label="Destinataire (optionnel)"
                    options={agentOptions}
                    value={form.agentId ? Number(form.agentId) : null}
                    onChange={(val) => handleChange('agentId', val ? String(val) : '')}
                    onInputChange={onSearchInputChange}
                    placeholder="Tapez au moins 2 lettres..."
                />
                <Input
                    label="Message"
                    value={form.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    required
                    error={fieldErrors.message}
                />
                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
                    <Button type="submit" variant="primary" isLoading={submitting}>Enregistrer</Button>
                </div>
            </form>
        </Modal>
    );
};

export default NotificationModal;