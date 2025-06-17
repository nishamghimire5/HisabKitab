
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Calculator } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const EmailConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');

      if (token && type === 'signup') {
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          });          if (error) {
            // Email confirmation error
            setStatus('error');
            setMessage('Email confirmation failed. The link may be expired or invalid.');
            toast.error('Email confirmation failed');
          } else {
            setStatus('success');
            setMessage('Your email has been confirmed! You can now sign in to your account.');
            toast.success('Email confirmed successfully!');
            
            // Redirect to home after a short delay
            setTimeout(() => {
              navigate('/');
            }, 2000);
          }        } catch (error) {
          // Unexpected error during email confirmation
          setStatus('error');
          setMessage('An unexpected error occurred during email confirmation.');
          toast.error('Confirmation failed');
        }
      } else {
        // No token or wrong type, redirect to auth
        navigate('/auth');
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            {status === 'loading' && <Calculator className="w-8 h-8 text-blue-500 animate-spin" />}
            {status === 'success' && <CheckCircle className="w-8 h-8 text-green-500" />}
            {status === 'error' && <XCircle className="w-8 h-8 text-red-500" />}
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Email Confirmation
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <div>
              <p className="text-gray-600">Confirming your email...</p>
            </div>
          )}
          
          {status === 'success' && (
            <div>
              <p className="text-green-600 font-medium mb-4">{message}</p>
              <p className="text-sm text-gray-500">Redirecting you to the app...</p>
            </div>
          )}
          
          {status === 'error' && (
            <div>
              <p className="text-red-600 mb-4">{message}</p>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                Go to Sign In
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmation;
