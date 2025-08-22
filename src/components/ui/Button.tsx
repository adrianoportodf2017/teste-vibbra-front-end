import type { ButtonHTMLAttributes } from 'react';


interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  // adicione disabled se não existir na interface
  disabled?: boolean;
}
export default function Button({ disabled, ...props }: ButtonProps) {

  return (
    <button {...props} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6 }}>
      {props.children}
    </button>
  );
}
