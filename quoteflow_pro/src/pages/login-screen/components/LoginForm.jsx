import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Mock credentials for authentication
  const mockCredentials = {
    username: 'procurement.manager',
    password: 'QuoteFlow2025!'
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.username?.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData?.password?.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      if (formData?.username === mockCredentials?.username && 
          formData?.password === mockCredentials?.password) {
        
        // Store authentication token and user data
        const userData = {
          id: 1,
          name: 'Sarah Johnson',
          email: 'sarah.johnson@company.com',
          role: 'Procurement Manager',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          loginTime: new Date()?.toISOString()
        };

        localStorage.setItem('authToken', userData?.token);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        if (formData?.rememberMe) {
          localStorage.setItem('rememberLogin', 'true');
        }

        setIsLoading(false);
        navigate('/procurement-dashboard');
      } else {
        setIsLoading(false);
        setErrors({
          general: 'Invalid username or password. Please check your credentials and try again.'
        });
      }
    }, 1500);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username Field */}
        <Input
          label="Username"
          type="text"
          name="username"
          placeholder="Enter your username"
          value={formData?.username}
          onChange={handleInputChange}
          error={errors?.username}
          required
          disabled={isLoading}
          className="w-full"
        />

        {/* Password Field */}
        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData?.password}
          onChange={handleInputChange}
          error={errors?.password}
          required
          disabled={isLoading}
          className="w-full"
        />

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between">
          <Checkbox
            label="Remember me"
            name="rememberMe"
            checked={formData?.rememberMe}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <button
            type="button"
            className="text-sm text-primary hover:text-primary/80 transition-smooth"
            disabled={isLoading}
          >
            Forgot password?
          </button>
        </div>

        {/* General Error Message */}
        {errors?.general && (
          <div className="flex items-center space-x-2 p-3 bg-error/10 border border-error/20 rounded-lg">
            <Icon name="AlertCircle" size={16} className="text-error" />
            <span className="text-sm text-error">{errors?.general}</span>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="default"
          size="lg"
          fullWidth
          loading={isLoading}
          iconName="LogIn"
          iconPosition="right"
          disabled={isLoading}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>

        {/* Demo Credentials Helper */}
        <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Info" size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">Demo Credentials</span>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div><strong>Username:</strong> procurement.manager</div>
            <div><strong>Password:</strong> QuoteFlow2025!</div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;