import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginBackground from './components/LoginBackground';
import CompanyLogo from './components/CompanyLogo';
import LoginForm from './components/LoginForm';
import SecurityFooter from './components/SecurityFooter';

const LoginScreen = () => {
  const navigate = useNavigate();

  // Check if user is already authenticated
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (authToken && userData) {
      try {
        const user = JSON.parse(userData);
        // Verify token is still valid (in real app, this would be an API call)
        if (user?.token === authToken) {
          navigate('/procurement-dashboard');
        }
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
  }, [navigate]);

  // Set page title
  useEffect(() => {
    document.title = 'Sign In - QuoteFlow Pro';
  }, []);

  return (
    <LoginBackground>
      <div className="w-full">
        {/* Company Logo and Branding */}
        <CompanyLogo />
        
        {/* Login Form */}
        <LoginForm />
        
        {/* Security Footer */}
        <SecurityFooter />
      </div>
    </LoginBackground>
  );
};

export default LoginScreen;