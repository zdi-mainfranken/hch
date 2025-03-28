import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface PatientLoginProps {
  onLogin: (patient: any) => void;
}

const PatientLogin = ({ onLogin }: PatientLoginProps) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [passphrase, setPassphrase] = useState('');
  const [loading, setLoading] = useState(false);

  // Create a reference to the form element
  const formRef = useRef<HTMLFormElement | null>(null);

  // Effect hook to handle URL parameter extraction and auto-filling
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    
    if (id) {
      setPassphrase(id.trim());  // Trim the passphrase immediately
    }
  }, []);

  // Tigger form submission when passphrase is set
  useEffect(() => {
    if (passphrase) {
      setTimeout(() => {
        handleLogin();
      }, 500);
    }
  }, [passphrase]);  // Trigger on passphrase change

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!passphrase.trim()) {
      toast({
        title: "Error",
        description: "Please enter your passphrase",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await apiRequest('POST', '/api/patient-login', { passphrase });
      const patient = await response.json();
      
      onLogin(patient);
      navigate('/patient-dashboard');
      
      toast({
        title: "Login successful",
        description: "Welcome back to your aftercare dashboard!",
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid passphrase. Please try again.",
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
          <CardTitle className="text-2xl font-bold">Patient Login</CardTitle>
          <CardDescription>
            Enter your secure passphrase to access your questionnaires
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="passphrase" className="text-sm font-medium">
                  Passphrase
                </label>
                <Input
                  id="passphrase"
                  placeholder="e.g., Baum-Katze-Wasser"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Your passphrase consists of three German words separated by hyphens.
                </p>
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            <p>Lost your passphrase? Please contact your healthcare provider.</p>
          </div>
          <div className="text-sm text-muted-foreground text-center">
            <p>
              <Button variant="link" onClick={() => navigate("/")}>
                Doctor Login
              </Button>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PatientLogin;
