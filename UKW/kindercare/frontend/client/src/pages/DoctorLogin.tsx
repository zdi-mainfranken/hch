import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface DoctorLoginProps {
  onLogin: (user: any) => void;
}

const DoctorLogin = ({ onLogin }: DoctorLoginProps) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Username and password are required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await apiRequest('POST', '/api/login', { username, password });
      const user = await response.json();
      
      onLogin(user);
      navigate('/doctor');
      
      toast({
        title: "Login successful",
        description: `Welcome, ${user.fullName}!`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">KinderCare</CardTitle>
          <CardDescription>
            Log in to access the ICU aftercare management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <Input
                  id="username"
                  placeholder="e.g., doctor"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            <p>This is a demo version of KinderCare.</p>
            <p className="mt-1">
              <Button variant="link" className="text-xs p-0 h-auto" 
                onClick={() => {
                  setUsername('doctor');
                  setPassword('password');
                }}>
                Use demo credentials
              </Button>
            </p>
          </div>
          <div className="text-sm text-muted-foreground text-center">
            <p>
              <Button variant="link" onClick={() => navigate("/patient-login")}>
                Patient Login
              </Button>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DoctorLogin;