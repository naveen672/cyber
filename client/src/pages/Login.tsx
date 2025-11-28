import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface User {
  username: string;
  email: string;
  password: string;
}

const Login = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [, setLocation] = useLocation();

  // Load registered users from localStorage on component mount
  useEffect(() => {
    const storedUsers = localStorage.getItem('registeredUsers');
    if (storedUsers) {
      try {
        setRegisteredUsers(JSON.parse(storedUsers));
      } catch (e) {
        console.error('Error loading registered users:', e);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Check admin credentials
    if (username === 'admin' && password === 'admin') {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('username', username);
      localStorage.setItem('userEmail', 'admin@cybershield.ai');
      setLocation('/dashboard');
      setIsLoading(false);
      return;
    }

    // Check registered users
    const user = registeredUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('username', user.username);
      localStorage.setItem('userEmail', user.email);
      setLocation('/dashboard');
    } else {
      setError('Invalid username or password.');
    }

    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      setIsLoading(false);
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters long.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    // Check if username already exists
    if (registeredUsers.some((u) => u.username === username)) {
      setError('Username already exists. Choose a different username.');
      setIsLoading(false);
      return;
    }

    // Check if email already exists
    if (registeredUsers.some((u) => u.email === email)) {
      setError('Email already registered. Use a different email.');
      setIsLoading(false);
      return;
    }

    // Add new user to registered users
    const newUser: User = { username, email, password };
    const updatedUsers = [...registeredUsers, newUser];

    // Store in localStorage
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    setRegisteredUsers(updatedUsers);

    setSuccess(`✓ Account created successfully! You can now login as "${username}".`);

    // Reset form and switch to login after 2 seconds
    setTimeout(() => {
      setMode('login');
      setUsername(username); // Pre-fill username for convenience
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setSuccess('');
    }, 2000);

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(59, 130, 246, 0.05) 25%, rgba(59, 130, 246, 0.05) 26%, transparent 27%, transparent 74%, rgba(59, 130, 246, 0.05) 75%, rgba(59, 130, 246, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(59, 130, 246, 0.05) 25%, rgba(59, 130, 246, 0.05) 26%, transparent 27%, transparent 74%, rgba(59, 130, 246, 0.05) 75%, rgba(59, 130, 246, 0.05) 76%, transparent 77%, transparent)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Floating Particles */}
        <div className="absolute top-10 left-10 w-2 h-2 bg-cyan-400 rounded-full animate-float opacity-70" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-20 right-20 w-1.5 h-1.5 bg-blue-400 rounded-full animate-float opacity-60" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-20 w-2.5 h-2.5 bg-purple-400 rounded-full animate-float opacity-50" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-40 right-40 w-1 h-1 bg-green-400 rounded-full animate-float opacity-60" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-40 right-32 w-2 h-2 bg-cyan-300 rounded-full animate-float opacity-70" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/3 left-1/4 w-1.5 h-1.5 bg-blue-300 rounded-full animate-float opacity-50" style={{ animationDelay: '2.5s' }}></div>

        {/* Connecting Lines - Animated */}
        <svg className="absolute inset-0 w-full h-full opacity-20" style={{ pointerEvents: 'none' }}>
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          {/* Network lines */}
          <line x1="10%" y1="20%" x2="30%" y2="40%" stroke="url(#lineGradient)" strokeWidth="1" className="animate-pulse" />
          <line x1="70%" y1="30%" x2="90%" y2="50%" stroke="url(#lineGradient)" strokeWidth="1" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
          <line x1="20%" y1="70%" x2="40%" y2="85%" stroke="url(#lineGradient)" strokeWidth="1" className="animate-pulse" style={{ animationDelay: '1s' }} />
          <line x1="60%" y1="60%" x2="80%" y2="75%" stroke="url(#lineGradient)" strokeWidth="1" className="animate-pulse" style={{ animationDelay: '1.5s' }} />
        </svg>

        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-1/2 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '4s' }}></div>

        {/* Scan Line */}
        <div className="absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30 animate-scan-line"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
      <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm shadow-2xl border-0 relative z-20">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
              <span className="material-icons text-white text-4xl">security</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            CyberShield AI
          </CardTitle>
          <p className="text-gray-600 text-sm mt-2">
            Advanced Threat Detection & Security Platform
          </p>

          {/* Mode Toggle Tabs */}
          <div className="flex gap-2 mt-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {
                setMode('login');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="material-icons text-sm mr-1 inline">login</span>
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="material-icons text-sm mr-1 inline">person_add</span>
              Sign Up
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username" className="text-sm font-medium text-gray-700">
                  Username
                </Label>
                <Input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <span className="material-icons text-red-500 text-sm">error</span>
                  <AlertDescription className="text-red-700 ml-2">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="material-icons animate-spin text-sm mr-2">refresh</span>
                    Signing In...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <span className="material-icons text-sm mr-2">login</span>
                    Sign In
                  </span>
                )}
              </Button>

              <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs font-medium text-blue-900 mb-2">Demo Account:</p>
                <p className="text-xs text-blue-800">
                  <strong>Username:</strong> admin
                </p>
                <p className="text-xs text-blue-800">
                  <strong>Password:</strong> admin
                </p>
              </div>
            </form>
          )}

          {/* Sign Up Form */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-username" className="text-sm font-medium text-gray-700">
                  Username
                </Label>
                <Input
                  id="signup-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password (min 6 characters)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </Label>
                <Input
                  id="signup-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <span className="material-icons text-red-500 text-sm">error</span>
                  <AlertDescription className="text-red-700 ml-2">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <span className="material-icons text-green-600 text-sm">check_circle</span>
                  <AlertDescription className="text-green-700 ml-2">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="material-icons animate-spin text-sm mr-2">refresh</span>
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <span className="material-icons text-sm mr-2">person_add</span>
                    Create Account
                  </span>
                )}
              </Button>

              <div className="text-center mt-6">
                <p className="text-xs text-gray-500">
                  Your account details will be saved securely
                </p>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default Login;
