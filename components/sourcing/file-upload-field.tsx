'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { FileText, Upload, X } from 'lucide-react';

const BLUE = '#081F3F';

type PreviewFile = {
  id: string;
  file: File;
  previewUrl: string | null;
};

function isImageFile(file: File) {
  return file.type.startsWith('image/');
}

type FileUploadFieldProps = {
  onFilesChange?: (files: File[]) => void;
};

export function FileUploadField({ onFilesChange }: FileUploadFieldProps = {}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const filesRef = useRef<PreviewFile[]>([]);
  filesRef.current = files;

  useEffect(() => {
    return () => {
      filesRef.current.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, []);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming?.length) {
      return;
    }

    const next = Array.from(incoming).map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
      file,
      previewUrl: isImageFile(file) ? URL.createObjectURL(file) : null,
    }));

    setFiles((current) => {
      const merged = [...current, ...next];
      onFilesChange?.(merged.map((item) => item.file));
      return merged;
    });
  };

  const removeFile = (id: string) => {
    setFiles((current) => {
      const target = current.find((item) => item.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      const merged = current.filter((item) => item.id !== id);
      onFilesChange?.(merged.map((item) => item.file));
      return merged;
    });
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        className="sr-only"
        multiple
        accept="image/*,.pdf"
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = '';
        }}
      />

      <label
        htmlFor={inputId}
        className="flex flex-col items-center justify-center border-2 border-dashed border-[#C5D4DC] rounded-lg p-10 cursor-pointer hover:border-[#081F3F] transition-colors bg-white"
      >
        <Upload className="w-10 h-10 text-[#5A6B7D] mb-3" />
        <p className="text-sm text-[#243247] text-center">
          Click to select files or drag them here
        </p>
        <p className="text-xs text-[#5A6B7D] mt-1">Images or PDF, multiple files allowed</p>
        <span
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg text-white"
          style={{ backgroundColor: BLUE }}
        >
          Browse files
        </span>
      </label>

      {files.length > 0 && (
        <div className="rounded-lg border border-[#EFF8F9] bg-white p-4 space-y-3">
          <p className="text-xs font-bold text-[#243247]">
            Selected files ({files.length})
          </p>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {files.map((item) => (
              <li
                key={item.id}
                className="relative rounded-lg border border-[#EFF8F9] bg-[#EFF8F9] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => removeFile(item.id)}
                  className="absolute top-1.5 right-1.5 z-10 p-1 rounded-full bg-white border border-[#C5D4DC] text-[#243247] hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  aria-label={`Remove ${item.file.name}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                {item.previewUrl ? (
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="w-full aspect-square object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center aspect-square p-3 text-center">
                    <FileText className="w-8 h-8 text-[#5A6B7D] mb-2" />
                    <p className="text-[10px] font-bold text-[#243247] line-clamp-2">
                      {item.file.name}
                    </p>
                  </div>
                )}
                <p className="px-2 py-1.5 text-[10px] text-[#5A6B7D] truncate border-t border-[#EFF8F9] bg-white">
                  {item.file.name}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
