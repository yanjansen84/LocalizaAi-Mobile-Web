import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = () => {
  const { user } = useAuth();

  // Se não estiver autenticado, redireciona para a página de login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Se estiver autenticado, renderiza o componente filho
  return <Outlet />;
};

export default PrivateRoute;
