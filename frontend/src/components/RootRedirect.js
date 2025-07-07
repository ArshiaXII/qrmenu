import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RootRedirect = () => {
  const { authUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // If user is authenticated, redirect to dashboard
  // If not authenticated, redirect to login
  return authUser ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

export default RootRedirect;
