import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      localStorage.removeItem('token');
      // se você guarda mais coisas, limpe aqui:
      // localStorage.removeItem('user');
      // sessionStorage.clear();
    } finally {
      navigate('/login');
    }
  }, [navigate]);

  // pode retornar um loader simples se quiser
  return null;
}
