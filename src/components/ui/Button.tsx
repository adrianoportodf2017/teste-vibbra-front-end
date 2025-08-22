import { ButtonHTMLAttributes } from 'react';

export default function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6 }}>
      {props.children}
    </button>
  );
}
