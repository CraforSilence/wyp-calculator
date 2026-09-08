'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { decodeShareCode, getSharePreview, SHARE_TYPE_LABELS } from '@/lib/share';
import type { ShareType, ShareResult } from '@/lib/share';

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  expectedType?: ShareType;
  onImport: (result: ShareResult) => void;
}

export function ImportModal({ open, onClose, expectedType, onImport }: ImportModalProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<ShareResult | null>(null);

  const handleCodeChange = (value: string) => {
    setCode(value);
    setError('');
    setPreview(null);

    if (!value.trim()) return;

    const result = decodeShareCode(value);
    if (!result) {
      setError('Codigo invalido o corrupto');
      return;
    }

    if (expectedType && result.type !== expectedType) {
      setError(`Este codigo es de tipo "${SHARE_TYPE_LABELS[result.type]}", pero esta pagina espera "${SHARE_TYPE_LABELS[expectedType]}"`);
      return;
    }

    setPreview(result);
  };

  const handleImport = () => {
    if (!preview) return;
    onImport(preview);
    setCode('');
    setError('');
    setPreview(null);
    onClose();
  };

  const handleClose = () => {
    setCode('');
    setError('');
    setPreview(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Importar">
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Pega el codigo de compartir</label>
          <textarea
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            placeholder="WYP-W:..."
            rows={4}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 font-mono resize-none"
          />
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-900/20 border border-red-800/50 rounded px-3 py-2">
            {error}
          </div>
        )}

        {preview && (
          <div className="text-sm text-emerald-400 bg-emerald-900/20 border border-emerald-800/50 rounded px-3 py-2">
            {getSharePreview(preview)}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={handleClose}>Cancelar</Button>
          <Button size="sm" onClick={handleImport} disabled={!preview}>Importar</Button>
        </div>
      </div>
    </Modal>
  );
}
