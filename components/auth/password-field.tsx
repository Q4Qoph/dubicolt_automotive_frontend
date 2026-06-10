'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

type PasswordFieldProps = {
  id: string;
  name?: string;
  autoComplete?: string;
  placeholder?: string;
  className?: string;
};

export default function PasswordField({
  id,
  name = 'password',
  autoComplete = 'current-password',
  placeholder = '••••••••',
  className,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-lg border border-[#C5D4DC] bg-white px-4 py-3 pr-11 text-sm text-[#243247] placeholder:text-[#5A6B7D] focus:border-[#00BC94] focus:outline-none focus:ring-2 focus:ring-[#00BC94]/30 transition-all',
          className,
        )}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-[#5A6B7D] hover:text-[#081F3F]"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
      </button>
    </div>
  );
}
