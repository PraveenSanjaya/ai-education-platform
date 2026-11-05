import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

export const inputClass =
  'w-full rounded border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500';

export function Field({
  label,
  children,
  htmlFor,
}: {
  label: string;
  children: ReactNode;
  htmlFor: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ''}`} />;
}

export function Button({
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }) {
  const styles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }[variant];
  return (
    <button
      {...props}
      className={`rounded px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 ${styles} ${props.className ?? ''}`}
    />
  );
}

export function ErrorMessage({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">
      {message}
    </p>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border bg-white p-4 shadow-sm ${className}`}>
      {children}
    </section>
  );
}
