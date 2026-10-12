import type { InputHTMLAttributes } from "react";
type Props = InputHTMLAttributes<HTMLInputElement> & { label?: string };
export default function Input({ label, placeholder, id, name, type = "text", ...props }: Props) {
  const inputId = id || (name ? `field-${name.replaceAll('.', '-')}` : undefined);
  return <label className="fb-field" htmlFor={inputId}><span>{label || placeholder || name}</span><input {...props} id={inputId} name={name} type={type} placeholder={placeholder} className="fb-input" /></label>;
}
