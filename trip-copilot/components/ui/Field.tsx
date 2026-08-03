'use client';

import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

const base =
  'w-full h-12 rounded-2xl border border-line bg-bg px-3.5 text-[16px] text-ink placeholder:text-muted/70 focus:border-sea outline-none';

export function TextField({
  label,
  hint,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="block">
      <span className="eyebrow block mb-1.5">{label}</span>
      <input className={base} {...rest} />
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function SelectField({
  label,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className="block">
      <span className="eyebrow block mb-1.5">{label}</span>
      <select className={base} {...rest}>
        {children}
      </select>
    </label>
  );
}

export function TextAreaField({
  label,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="block">
      <span className="eyebrow block mb-1.5">{label}</span>
      <textarea
        className="w-full min-h-[88px] rounded-2xl border border-line bg-bg p-3.5 text-[16px] text-ink placeholder:text-muted/70 focus:border-sea outline-none"
        {...rest}
      />
    </label>
  );
}

export function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 py-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-6 w-6 accent-[rgb(var(--c-sea))]"
      />
      <span className="text-[15px]">{label}</span>
    </label>
  );
}
