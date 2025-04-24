import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthService } from '../../services/auth.service';

const PrivateRoute: React.FC = () => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null); 

  useEffect(() => {
    const checkAuthStatus = async () => {
      const res = await AuthService.isAuthenticated();
      setIsAuth(res);
    };

    checkAuthStatus();
  }, []);

  if (isAuth === null) {
    return <div>Loading...</div>;
  }

  return isAuth ? (
    <Outlet />
  ) : (
    <Navigate to="/sign-up" /> 
  );
};

export default PrivateRoute;
