import React, { useState, useRef, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../Button';
import { FaFile, FaImage, FaFilePdf, FaTrash, FaSpinner, FaCamera } from 'react-icons/fa';

const SCANNER_SERVER_URL = import.meta.env.VITE_SCANNER_URL || 'http://localhost:3001';

export interface DocumentDto {
  id: number;
  intitule: string;
  cheminFichier: string;
}

export interface DocumentPayload {
  idAgent: number;
  intitule: string;
  fichier?: File;
}

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DocumentPayload) => void | Promise<void>;
  document?: DocumentDto;
  agentId: number;
}

const DocumentModal: React.FC<DocumentModalProps> = ({ isOpen, onClose, onSave, document, agentId }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [intitule, setIntitule] = useState<string>(document?.intitule || '');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ intitule?: string; fichier?: string }>({});
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [isOpen]);

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  const applyFile = (selectedFile: File) => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(selectedFile);
    setPreview(
      selectedFile.type.startsWith('image/') || selectedFile.type === 'application/pdf'
        ? URL.createObjectURL(selectedFile)
        : null
    );
    setErrors(prev => ({ ...prev, fichier: undefined }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith('image/') && selectedFile.type !== 'application/pdf') {
      setErrors(prev => ({ ...prev, fichier: 'Seuls les images et PDF sont autorises' }));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    applyFile(selectedFile);
  };

  const handleRemoveFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setErrors(prev => ({ ...prev, fichier: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleScan = async () => {
    setScanning(true);
    setScanError(null);
    setScanProgress('Demarrage du scan...');
    try {
      const response = await fetch(SCANNER_SERVER_URL + '/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dpi: 200 }),
      });
      const result = await response.json();
      if (!result.success) {
        const msg = [result.error || result.message || 'Erreur lors du scan', result.hint]
          .filter(Boolean)
          .join('\n');
        setScanError(msg);
        setScanProgress('');
        return;
      }

      setScanProgress('Recuperation du document scanne...');
      const filename: string = result.filename || (result.url || '').split('/').pop();
      const fileResponse = await fetch(SCANNER_SERVER_URL + '/files/' + encodeURIComponent(filename));
      if (!fileResponse.ok) {
        throw new Error('Fichier scanne introuvable sur le pont scanner');
      }
      const blob = await fileResponse.blob();
      const scannedFile = new File([blob], filename || `scan_${Date.now()}.pdf`, { type: 'application/pdf' });
      applyFile(scannedFile);
      setScanProgress('Scan termine : ' + (filename || 'document.pdf'));
    } catch (err: any) {
      if (err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError')) {
        setScanError('Pont scanner non demarre. Lancez "npm start" dans scanner-server/');
      } else {
        setScanError('Erreur: ' + (err?.message || 'Impossible de scanner'));
      }
      setScanProgress('');
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!intitule.trim()) newErrors.intitule = "L'intitule est obligatoire";
    if (!document && !file) newErrors.fichier = 'Veuillez selectionner un fichier';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);
    setSubmitError(null);
    try {
      await onSave({ idAgent: agentId, intitule, fichier: file || undefined });
      onClose();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Erreur lors de l'enregistrement du document";
      setSubmitError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal key={document?.id || 'new'} isOpen={isOpen} onClose={onClose} closeOnBackdrop={false} title={document ? 'Modifier document' : 'Ajouter document'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input label="Intitule" value={intitule} onChange={(e) => setIntitule(e.target.value)} required className={errors.intitule ? 'border border-red-500' : ''} />
          {errors.intitule && <p className="text-red-500 text-sm mt-1">{errors.intitule}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Fichier</label>
          <div className="flex items-center space-x-2">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,.pdf"
              className={"block w-full text-sm text-gray-500 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 " + (errors.fichier ? 'border border-red-500' : '')} />
            {file && (
              <Button type="button" variant="secondary" size="sm" onClick={handleRemoveFile}>
                <FaTrash className="text-red-500" />
              </Button>
            )}
          </div>

          <div className="mt-3">
            <Button type="button" variant="outline" size="sm" onClick={handleScan} disabled={scanning}
              className="inline-flex items-center gap-2 text-blue-600 border-blue-300 hover:bg-blue-50">
              {scanning ? (<><FaSpinner className="animate-spin" /> Scan en cours...</>) : (<><FaCamera className="h-4 w-4" /> Scanner via imprimante</>)}
            </Button>
          </div>

          {scanProgress && !scanError && <p className="text-blue-600 text-sm mt-2 bg-blue-50 dark:bg-blue-950/40 p-2 rounded">{scanProgress}</p>}
          {scanError && <p className="text-red-500 text-sm mt-2 bg-red-50 dark:bg-red-950/40 p-2 rounded whitespace-pre-line">{scanError}</p>}
          {errors.fichier && <p className="text-red-500 text-sm mt-1">{errors.fichier}</p>}
        </div>

        {file && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-800 p-2 rounded">
            {file.type === 'application/pdf' ? <FaFilePdf className="text-red-500" /> : file.type.startsWith('image/') ? <FaImage className="text-blue-500" /> : <FaFile />}
            <span className="truncate">{file.name}</span>
            <span className="text-gray-400 ml-auto">{Math.round(file.size / 1024)} Ko</span>
          </div>
        )}

        {preview && file?.type === 'application/pdf' && (
          <div className="mt-2">
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Apercu PDF :</p>
            <embed src={preview} type="application/pdf" width="100%" height="300" className="rounded-lg border border-gray-200 dark:border-slate-700" />
          </div>
        )}

        {preview && file?.type.startsWith('image/') && (
          <div className="mt-2">
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Apercu :</p>
            <img src={preview} alt="Apercu" className="max-h-40 rounded-lg border border-gray-200 dark:border-slate-700" />
          </div>
        )}

        {submitError && (
          <p className="text-red-500 text-sm bg-red-50 dark:bg-red-950/40 p-2 rounded">{submitError}</p>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Annuler</Button>
          <Button type="submit" variant="primary" isLoading={saving} disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DocumentModal;
