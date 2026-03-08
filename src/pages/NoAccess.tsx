import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const NoAccess: React.FC = () => {
  const navigate = useNavigate();
  const { signOut, session } = useAuth();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason');

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  // Determine message based on reason
  const isNoRole = reason === 'no-role';
  const title = isNoRole ? 'Account Not Configured' : 'No Access';
  const message = isNoRole
    ? 'Your account has been authenticated but you do not have a dashboard role assigned. Please contact your administrator to grant you access.'
    : 'You do not have permission to access this resource. Please contact your administrator if you believe this is an error.';

  return (
    <div className="flex flex-col gap-6 w-full h-screen justify-center items-center bg-gray-50">
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-5xl font-bold text-gray-900">403</h1>
        <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
        <p className="text-gray-600 max-w-md">{message}</p>
      </div>
      <div className="flex gap-3">
        {session && (
          <Button
            label="Sign Out"
            onClick={handleSignOut}
          />
        )}
        <Button
          label="Back to Login"
          onClick={() => {
            navigate('/login', { replace: true });
          }}
        />
      </div>
    </div>
  );
};

export default NoAccess;
