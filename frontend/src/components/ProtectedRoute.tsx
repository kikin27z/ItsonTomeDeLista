import React from 'react'
import { useAuth } from '../hooks/auth-data';
import { Navigate } from 'react-router';
interface Props{
    children: React.ReactNode;
}
const ProtectedRoute = ({children}: Props) => {
  const { isAuthenticated,  } = useAuth();
  
//   if (isLoading) return <div>Cargando...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return <>{children}</>;
}

export default ProtectedRoute