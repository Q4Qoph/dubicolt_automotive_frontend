'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { FileUploadField } from '@/components/sourcing/file-upload-field';
import { useCreateSourcingRequestMutation } from '@/lib/api/hooks';
import * as api from '@/lib/api/services';
import { BRAND } from '@/lib/dubicolt/mappers';

type FormState = {
  make: string;
  model: string;
  year: string;
  partName: string;
  description: string;
  vin: string;
  photoUrls: string[];
};

const initialForm: FormState = {
  make: 'Toyota',
  model: 'Hilux',
  year: '2018',
  partName: '',
  description: '',
  vin: '',
  photoUrls: [],
};

export default function RequestPartPage() {
  const router = useRouter();
  const mutation = useCreateSourcingRequestMutation();
  const [form, setForm] = useState<FormState>(initialForm);
  const [uploading, setUploading] = useState(false);

  const valid =
    form.partName.trim() &&
    form.description.trim() &&
    form.make.trim() &&
    form.model.trim() &&
    Number(form.year) > 1980;

  async function handleUpload(files: File[] | FileList | null) {
    if (!files || (Array.isArray(files) ? files.length === 0 : !files.length)) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const res = await api.apiUploadImage(file);
        urls.push(res.url);
      }
      setForm((f) => ({ ...f, photoUrls: [...f.photoUrls, ...urls] }));
      toast.success('Photo uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    mutation.mutate(
      {
        vehicle: {
          make: form.make.trim(),
          model: form.model.trim(),
          year: Number(form.year),
        },
        partName: form.partName.trim(),
        description: form.description.trim(),
        vin: form.vin.trim() || undefined,
        photoUrls: form.photoUrls.length ? form.photoUrls : undefined,
      },
      {
        onSuccess: (item) => {
          toast.success('Part request submitted');
          router.push(`/dashboard/sourcing/${item.id}`);
        },
        onError: () => toast.error('Could not submit request'),
      },
    );
  }

  return (
    <div className="p-6 lg:p-8 min-h-full" style={{ backgroundColor: BRAND.lightIce }}>
      <Toaster position="top-center" />
      <Link
        href="/dashboard/sourcing"
        className="inline-flex items-center gap-1 text-sm font-semibold mb-6 hover:opacity-80"
        style={{ color: BRAND.deepBlue }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to requests
      </Link>

      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-2" style={{ color: BRAND.deepBlue }}>
          Request a part
        </h1>
        <p className="text-sm text-dubicolt-on-surface/70 mb-6">
          Part unavailable in catalog? Tell us your vehicle and what you need. We&apos;ll source it,
          send a quotation, and track fulfilment after you pay.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg border border-dubicolt-outline-variant p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-dubicolt-on-surface/50 mb-1">
                Make *
              </label>
              <input
                value={form.make}
                onChange={(e) => setForm({ ...form, make: e.target.value })}
                className="w-full px-3 py-2 border border-dubicolt-outline-variant rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-dubicolt-on-surface/50 mb-1">
                Model *
              </label>
              <input
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                className="w-full px-3 py-2 border border-dubicolt-outline-variant rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-dubicolt-on-surface/50 mb-1">
                Year *
              </label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="w-full px-3 py-2 border border-dubicolt-outline-variant rounded text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-dubicolt-on-surface/50 mb-1">
              Part name *
            </label>
            <input
              value={form.partName}
              onChange={(e) => setForm({ ...form, partName: e.target.value })}
              placeholder="e.g. Front brake pad set"
              className="w-full px-3 py-2 border border-dubicolt-outline-variant rounded text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-dubicolt-on-surface/50 mb-1">
              Description *
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="OEM number, side (L/R), urgency, any fitment notes…"
              className="w-full px-3 py-2 border border-dubicolt-outline-variant rounded text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-dubicolt-on-surface/50 mb-1">
              VIN / Chassis (optional)
            </label>
            <input
              value={form.vin}
              onChange={(e) => setForm({ ...form, vin: e.target.value })}
              className="w-full px-3 py-2 border border-dubicolt-outline-variant rounded text-sm"
            />
          </div>

          <div>
            <p className="text-xs font-bold uppercase text-dubicolt-on-surface/50 mb-1">
              Photos (optional)
            </p>
            <FileUploadField
              onFilesChange={(files) => {
                if (files.length) void handleUpload(files);
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!valid || mutation.isPending || uploading}
            className="w-full py-3 rounded-lg text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 inline-flex items-center justify-center gap-2"
            style={{ backgroundColor: BRAND.coldGreen }}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting…
              </>
            ) : (
              'Submit request'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
