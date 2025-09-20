import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Icon from "../../components/AppIcon";

const LoginScreen = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    userType: "user",
  });

  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const userTypeOptions = [
    { value: "user", label: "User" },
    { value: "admin", label: "Administrator" },
    { value: "super_admin", label: "Super Admin" },
    { value: "pricing_team", label: "Pricing Team" },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear field-specific error
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    // Clear general login error
    if (loginError) {
      setLoginError("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.userType) {
      newErrors.userType = "Please select user type";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoggingIn(true);
    setLoginError("");

    try {
      const result = await login(
        formData.username,
        formData.password,
        formData.userType
      );

      if (result.success) {
        console.log("Login successful", result);
        // Redirect based on user type
        if (
          formData.userType === "admin" ||
          formData.userType === "super_admin" ||
          formData.userType === "pricing_team"
        ) {
          navigate("/procurement-dashboard");
        } else {
          navigate("/user-dashboard");
        }
      } else {
        setLoginError(result.error);
      }
    } catch (error) {
      setLoginError("Login failed. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDemoLogin = async (type) => {
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const credentials =
        type === "admin"
          ? { username: "admin", password: "admin123" }
          : { username: "user", password: "user123" };

      console.log("🚀 Demo login attempt:", { type, credentials });
      const result = await login(
        credentials.username,
        credentials.password,
        type
      );
      console.log("🚀 Demo login result:", result);

      if (result.success) {
        if (type === "admin") {
          navigate("/procurement-dashboard");
        } else {
          navigate("/user-dashboard");
        }
      } else {
        setLoginError(result.error);
      }
    } catch (error) {
      console.error("Demo login failed:", error);
      setLoginError("Demo login failed. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const testAuth = () => {
    console.log("🧪 Testing authentication...");
    console.log("Form data:", formData);
    console.log("Form errors:", errors);
    console.log("User type options:", userTypeOptions);

    // Test the exact credentials
    console.log("🧪 Testing admin credentials: admin/admin123");
    console.log("🧪 Testing user credentials: user/user123");

    // Test localStorage
    console.log("🧪 localStorage test:");
    console.log("user:", localStorage.getItem("user"));
    console.log("userType:", localStorage.getItem("userType"));
    console.log("isAuthenticated:", localStorage.getItem("isAuthenticated"));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-4">
        {/* Simple Header */}
        <div className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Icon name="Zap" size={24} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-foreground tracking-tight">
                QuoteFlow Pro
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                Enterprise Procurement
              </span>
            </div>
          </div>
        </div>

        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full space-y-8">
            {/* Login Header */}
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-primary rounded-full flex items-center justify-center mb-6">
                <Icon name="Shield" size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Welcome Back
              </h2>
              <p className="text-muted-foreground">
                Sign in to your account to continue
              </p>
            </div>

            {/* Login Form */}
            <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* User Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    User Type
                  </label>
                  <Select
                    options={userTypeOptions}
                    value={formData.userType}
                    onChange={(value) => handleInputChange("userType", value)}
                    placeholder="Select user type"
                    className="w-full"
                  />
                  {errors.userType && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.userType}
                    </p>
                  )}
                </div>

                {/* Username Field */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Username
                  </label>
                  <Input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    placeholder="Enter your username"
                    className="w-full"
                    error={errors.username}
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.username}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    placeholder="Enter your password"
                    className="w-full"
                    error={errors.password}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Login Error */}
                {loginError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Icon
                        name="AlertCircle"
                        size={16}
                        className="text-red-600"
                      />
                      <p className="text-sm text-red-800">{loginError}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="default"
                  className="w-full"
                  disabled={isLoggingIn || isLoading}
                  iconName={isLoggingIn ? "Loader" : "LogIn"}
                  iconPosition="left"
                >
                  {isLoggingIn ? "Signing In..." : "Sign In"}
                </Button>
              </form>

              {/* Demo Login Buttons */}
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Quick Demo Access
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleDemoLogin("user")}
                    disabled={isLoggingIn}
                    className="text-sm"
                  >
                    Demo User
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDemoLogin("admin")}
                    disabled={isLoggingIn}
                    className="text-sm"
                  >
                    Demo Admin
                  </Button>
                </div>
                <div className="mt-3">
                  <Button
                    variant="outline"
                    onClick={testAuth}
                    className="w-full text-sm text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    🧪 Test Authentication
                  </Button>
                </div>
              </div>

              {/* Demo Credentials Info */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Icon
                    name="Info"
                    size={16}
                    className="text-blue-600 mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-1">
                      Demo Credentials
                    </p>
                    <div className="text-xs text-blue-700 space-y-1">
                      <p>
                        <strong>User:</strong> username: user, password: user123
                      </p>
                      <p>
                        <strong>Admin:</strong> username: admin, password:
                        admin123
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
