import type { InputHTMLAttributes } from 'react';

export default function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} style={{ padding: '8px 10px', border: '1px solid #ccc', borderRadius: 6 }} />
  );
}
